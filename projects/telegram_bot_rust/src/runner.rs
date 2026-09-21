use std::fs;
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;
use anyhow::{anyhow, Result};
use log::{info, warn};
use nix::sys::signal::{self, Signal};
use nix::unistd::Pid;
use regex::Regex;
use serde_json::Value;
use tokio::process::Command;
use tokio::sync::Mutex;
use tokio::time::timeout;

use crate::config::get_selected_model;
use crate::conv::{clear_reset_flag, reset_conversation_id, should_continue_session};

pub async fn run_agy<F>(
    prompt: &str,
    proxy_url: &str,
    progress_cb: F,
) -> Result<String>
where
    F: Fn() + Send + Sync + 'static,
{
    let is_continue = should_continue_session();
    clear_reset_flag();

    match execute_agy_command(is_continue, prompt, proxy_url, progress_cb).await {
        Ok(out) if !out.trim().is_empty() => Ok(out),
        Err(e) => {
            let err_msg = e.to_string();
            if err_msg.contains("timed out") {
                warn!("agy 执行超时: {}。重置会话并直接返回错误，杜绝二次死等重试。", err_msg);
                reset_conversation_id();
                clear_reset_flag();
                return Err(anyhow!("任务执行超时（耗时超过 15 分钟）。底层已终止该耗时任务并重置会话上下文，请将任务拆分为更小的步骤分段执行。"));
            }
            warn!("agy 执行出错: {:?}。正在重置会话并开启新会话重试...", e);
            reset_conversation_id();
            clear_reset_flag();
            execute_agy_command(false, prompt, proxy_url, move || {}).await
        }
        Ok(_out) => {
            warn!("会话返回输出为空。正在重置会话并开启新会话重试...");
            reset_conversation_id();
            clear_reset_flag();
            execute_agy_command(false, prompt, proxy_url, move || {}).await
        }
    }
}

async fn execute_agy_command<F>(
    is_continue: bool,
    prompt: &str,
    proxy_url: &str,
    progress_cb: F,
) -> Result<String>
where
    F: Fn() + Send + Sync + 'static,
{
    info!("Running agy: is_continue={}, prompt={}", is_continue, prompt);

    let mut clean_prompt = prompt.trim();
    let is_deep = clean_prompt.starts_with("/deep");
    if is_deep {
        clean_prompt = clean_prompt.trim_start_matches("/deep").trim();
    }

    let current_model = get_selected_model();

    let mut args = vec![
        "--add-dir".to_string(),
        "/Users/hi/niuma".to_string(),
        "--dangerously-skip-permissions".to_string(),
        "--model".to_string(),
        current_model,
        "--print-timeout".to_string(),
        "900s".to_string(),
    ];

    if is_deep {
        args.push("--effort".to_string());
        args.push("high".to_string());
    }

    if is_continue {
        args.push("-c".to_string());
    }

    args.push("--print".to_string());
    args.push(clean_prompt.to_string());

    let mut active_home = String::new();
    if let Ok(data) = fs::read_to_string("/Users/hi/.gemini_accounts/status.json") {
        if let Ok(val) = serde_json::from_str::<Value>(&data) {
            if let Some(idx) = val.get("active_index").and_then(|v| v.as_i64()) {
                if idx >= 0 {
                    active_home = format!("/Users/hi/.gemini_accounts/acc{}", idx + 1);
                }
            }
        }
    }
    if active_home.is_empty() {
        active_home = "/Users/hi".to_string();
    }

    let agy_bin = if std::path::Path::new("/Users/hi/.local/bin/agy").exists() {
        "/Users/hi/.local/bin/agy"
    } else {
        "agy"
    };
    let mut cmd = Command::new(agy_bin);
    cmd.args(&args);
    cmd.current_dir("/Users/hi/niuma");

    unsafe {
        cmd.pre_exec(|| {
            nix::unistd::setpgid(Pid::from_raw(0), Pid::from_raw(0))
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
            Ok(())
        });
    }

    cmd.env("PATH", "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/Users/hi/.local/bin:/Users/hi/.cargo/bin:/Users/hi/niuma/bin");
    cmd.env("HOME", active_home);
    cmd.env("ANTIGRAVITY_AUTO_APPROVE", "true");
    cmd.env("MCP_NON_INTERACTIVE", "1");
    cmd.env("HTTP_PROXY", proxy_url);
    cmd.env("HTTPS_PROXY", proxy_url);

    cmd.stdin(Stdio::null());
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let child = cmd.spawn()?;
    let pid = child.id().map(|id| id as i32);

    let progress_cb_arc = Arc::new(progress_cb);
    let progress_done = Arc::new(Mutex::new(false));
    let progress_done_clone = progress_done.clone();
    let progress_cb_clone = progress_cb_arc.clone();

    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(2));
        loop {
            interval.tick().await;
            if *progress_done_clone.lock().await {
                break;
            }
            (progress_cb_clone)();
        }
    });

    let res = timeout(Duration::from_secs(900), child.wait_with_output()).await;

    *progress_done.lock().await = true;

    let output = match res {
        Ok(Ok(out)) => out,
        Ok(Err(e)) => return Err(anyhow!("Command execution error: {}", e)),
        Err(_) => {
            if let Some(p) = pid {
                let _ = signal::killpg(Pid::from_raw(p), Signal::SIGKILL);
            }
            return Err(anyhow!("Task timed out (exceeded 900s limit)"));
        }
    };

    let stdout_raw = String::from_utf8_lossy(&output.stdout);
    let stderr_raw = String::from_utf8_lossy(&output.stderr);

    let clean_out = sanitize_model_output(&stdout_raw);

    if clean_out.is_empty() {
        let clean_err = remove_ansi_codes(&stderr_raw);
        if !clean_err.trim().is_empty() {
            return Err(anyhow!("Execution error: {}", clean_err.trim()));
        }
        if !output.status.success() {
            return Err(anyhow!("进程异常退出 (退出码: {:?})", output.status.code()));
        }
        return Err(anyhow!("模型执行完毕但未返回可见输出"));
    }

    Ok(clean_out)
}

pub fn remove_ansi_codes(input: &str) -> String {
    let re = Regex::new(r"\x1B\[[0-?]*[ -/]*[@-~]").unwrap();
    re.replace_all(input, "").to_string()
}

pub fn sanitize_model_output(input: &str) -> String {
    let no_ansi = remove_ansi_codes(input);

    let re_sys = Regex::new(r"(?is)<SYSTEM_?MESSAGE>.*?</SYSTEM_?MESSAGE>").unwrap();
    let res = re_sys.replace_all(&no_ansi, "");

    let re_meta = Regex::new(r"(?is)<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>").unwrap();
    let res = re_meta.replace_all(&res, "");

    let re_settings = Regex::new(r"(?is)<USER_SETTINGS_CHANGE>.*?</USER_SETTINGS_CHANGE>").unwrap();
    let res = re_settings.replace_all(&res, "");

    let re_tags = Regex::new(r"(?is)<(?:task_notification|system_notification|antigravity_notification|user_rules|user_information|system_info)>.*?</(?:task_notification|system_notification|antigravity_notification|user_rules|user_information|system_info)>").unwrap();
    let res = re_tags.replace_all(&res, "");

    let re_msg = Regex::new(r"(?is)\[Message\]\s+timestamp=[^\n]+\s+sender=[^\n]+\s+priority=[^\n]+\s+content=.*?(\n\n|\z)").unwrap();
    let res = re_msg.replace_all(&res, "");

    res.trim().to_string()
}
