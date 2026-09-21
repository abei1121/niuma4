use std::fs;
use std::process::Command;
use log::{info, warn};
use crate::notify::send_tg_alert;

pub fn check_and_restore_crontab() {
    #[cfg(target_os = "macos")]
    {
        return;
    }
    let master_path = "/Users/hi/niuma/niuma1-main/scripts/system_crontab.master";
    if !fs::metadata(master_path).is_ok() {
        return;
    }

    let output = Command::new("crontab")
        .arg("-l")
        .output();

    let current_cron = match output {
        Ok(out) => String::from_utf8_lossy(&out.stdout).to_string(),
        Err(_) => String::new(),
    };

    if !current_cron.contains("send_daily_report.sh") {
        warn!("检测到 Crontab 定时任务遗失，从 master 自动静默恢复...");
        let restore_res = Command::new("crontab")
            .arg(master_path)
            .status();

        if let Ok(status) = restore_res {
            if status.success() {
                send_tg_alert("⚠️ 系统检测到 Crontab 定时任务意外遗失，已自动静默自愈恢复！");
            }
        }
    }
}
