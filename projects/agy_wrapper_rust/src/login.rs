// login.rs - 账号初始化登录模块：为指定分身沙盒执行 agy 首次认证

use std::fs;
use std::os::unix::fs::symlink;
use std::path::Path;
use std::process::Command;

use crate::state::{BASE_ACCOUNTS_DIR, ORIGINAL_AGY_PATH};

/// 处理 `agy_wrapper login <acc_num>` 命令
/// 为指定账号沙盒设置共享目录软链接，并启动原生 agy 认证流程
pub fn handle_login_command(args: &[String]) -> anyhow::Result<bool> {
    if args.len() >= 2 && args[0] == "login" {
        let raw_idx = &args[1];
        let num_str = raw_idx.trim().to_lowercase().replace("acc", "");
        if let Ok(idx) = num_str.parse::<usize>() {
            let acc_name = format!("acc{}", idx);
            let base_dir = Path::new(BASE_ACCOUNTS_DIR);
            let target_home = base_dir.join(&acc_name);
            let cli_dir = target_home.join(".gemini").join("antigravity-cli");
            let shared_dir = base_dir.join("shared_data");

            let _ = fs::create_dir_all(&cli_dir);
            let _ = fs::create_dir_all(&shared_dir);

            // 共享 brain、历史记录等数据目录（软链接方式）
            let shared_items = [
                "brain",
                "conversations",
                "conversation_summaries.db",
                "history.jsonl",
                "settings.json",
            ];
            for item in &shared_items {
                let src = shared_dir.join(item);
                let dst = cli_dir.join(item);
                if !src.exists() && dst.exists() {
                    let _ = fs::rename(&dst, &src);
                }
                if src.exists() {
                    let _ = fs::remove_file(&dst);
                    let _ = fs::remove_dir_all(&dst);
                    let _ = symlink(&src, &dst);
                }
            }

            println!("=======================================================");
            println!("  Adding/Logging in Account {} ({})", idx, acc_name);
            println!("=======================================================");
            println!("Launching native agy auth flow in {}...", target_home.display());
            println!("HOME will be set to: {}", target_home.display());

            // 以隔离 HOME 执行 agy 认证
            let status = Command::new(ORIGINAL_AGY_PATH)
                .arg("--dangerously-skip-permissions")
                .arg("--prompt")
                .arg("initialize session")
                .env("HOME", target_home.to_str().unwrap_or("/Users/hi"))
                .status();

            match status {
                Ok(s) => std::process::exit(s.code().unwrap_or(0)),
                Err(e) => {
                    eprintln!("Failed to exec agy: {:?}", e);
                    std::process::exit(1);
                }
            }
        }
    }
    Ok(false)
}
