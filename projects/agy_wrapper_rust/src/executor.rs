// executor.rs - 核心轮换执行器：HOME 隔离、stderr 捕获、429 触发轮换

use chrono::Utc;
use std::fs;
use std::io::{self, Read, Write};
use std::path::Path;
use std::process::{Command, Stdio};
use std::thread::sleep;
use std::time::Duration as StdDuration;

use crate::retry::{is_network_error, is_quota_exhausted, parse_reset_duration};
use crate::state::{
    account_has_gemini_config, get_account_list, is_account_blocked, load_state, save_state,
    BASE_ACCOUNTS_DIR, ORIGINAL_AGY_PATH,
};

/// 主入口：带账号自动轮换的 agy 执行器
pub fn run_with_account_rotation(cmd_args: &[String]) {
    let mut state = load_state();
    let acc_list = get_account_list();
    let total_accounts = acc_list.len();

    if total_accounts == 0 {
        eprintln!("No accounts configured in {}", BASE_ACCOUNTS_DIR);
        std::process::exit(1);
    }

    // 遍历账号池，从当前激活账号开始轮换
    for attempt in 0..total_accounts {
        let test_idx = (state.active_index + attempt) % total_accounts;
        let acc_name = &acc_list[test_idx];
        let acc_status = state
            .accounts
            .get(acc_name)
            .cloned()
            .unwrap_or_default();

        // 跳过冷却中的账号（若还有其他账号可用）
        if is_account_blocked(&acc_status) && attempt + 1 < total_accounts {
            eprintln!(
                "[agy_wrapper] 账号 {} 冷却中，跳过...",
                acc_name
            );
            continue;
        }

        let target_home = Path::new(BASE_ACCOUNTS_DIR).join(acc_name);
        let _ = fs::create_dir_all(&target_home);

        // 跳过未配置凭据的账号（若还有其他账号可用）
        if !account_has_gemini_config(acc_name) && attempt + 1 < total_accounts {
            eprintln!(
                "[agy_wrapper] 账号 {} 无 .gemini 配置，跳过...",
                acc_name
            );
            continue;
        }


        // 持久化当前激活账号
        state.active_index = test_idx;
        let _ = save_state(&state);

        let mut exit_code = 1;
        let mut err_str = String::new();

        // 网络瞬断最多重试 3 次
        for network_retry in 0..3 {
            let mut cmd = Command::new(ORIGINAL_AGY_PATH);
            cmd.args(cmd_args);
            // 关键：通过 HOME 环境变量隔离账号沙盒
            cmd.env("HOME", target_home.to_str().unwrap_or("/Users/hi"));
            cmd.stdin(Stdio::inherit());
            cmd.stdout(Stdio::inherit());
            cmd.stderr(Stdio::piped());

            let mut child = match cmd.spawn() {
                Ok(c) => c,
                Err(e) => {
                    eprintln!("Failed to spawn {}: {}", ORIGINAL_AGY_PATH, e);
                    std::process::exit(1);
                }
            };

            // 实时透传 stderr 同时捕获内容用于错误识别
            let mut stderr_bytes = Vec::new();
            if let Some(mut stderr_pipe) = child.stderr.take() {
                let mut buffer = [0u8; 1024];
                loop {
                    match stderr_pipe.read(&mut buffer) {
                        Ok(0) => break,
                        Ok(n) => {
                            stderr_bytes.extend_from_slice(&buffer[..n]);
                            let _ = io::stderr().write_all(&buffer[..n]);
                        }
                        Err(_) => break,
                    }
                }
            }

            let status = child.wait().unwrap_or_else(|_| std::process::exit(1));
            if status.success() {
                std::process::exit(0);
            }

            exit_code = status.code().unwrap_or(1);
            err_str = String::from_utf8_lossy(&stderr_bytes).to_string();
            let err_lower = err_str.to_lowercase();

            // 网络错误重试（最多 3 次，间隔 3 秒）
            if is_network_error(&err_lower) {
                eprintln!(
                    "\n[agy_wrapper] 网络波动或超时 (第 {}/3 次)，等待 3 秒后重试...\n",
                    network_retry + 1
                );
                sleep(StdDuration::from_secs(3));
                continue;
            }

            break;
        }

        // 检测是否为 429 / 限流错误 → 触发账号轮换
        let err_lower = err_str.to_lowercase();
        if is_quota_exhausted(&err_lower) {
            let dur = parse_reset_duration(&err_str);
            // 未解析到时长则默认冷却 10 分钟，解析到则加 30 秒缓冲
            let total_dur = if dur.is_zero() {
                chrono::Duration::minutes(10)
            } else {
                dur + chrono::Duration::seconds(30)
            };

            let blocked_until = Utc::now() + total_dur;
            let status = state.accounts.entry(acc_name.clone()).or_default();
            status.blocked_until = Some(blocked_until.to_rfc3339());

            // 切换到下一账号
            state.active_index = (test_idx + 1) % total_accounts;
            let _ = save_state(&state);

            eprintln!(
                "\n[agy_wrapper] 账号 {} ({}) 触发限流 (冷却约 {} 秒)，正在自动轮换至下一账号...\n",
                test_idx + 1,
                acc_name,
                total_dur.num_seconds()
            );
            continue;
        }

        std::process::exit(exit_code);
    }

    // 全部账号均限流或不可用
    eprintln!("\n[agy_wrapper] 全部账号均不可用（限流或未配置凭据），退出。\n");
    std::process::exit(1);
}
