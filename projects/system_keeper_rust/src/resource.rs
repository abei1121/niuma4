use std::fs::{self, File};
use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use std::time::Duration;
use sysinfo::Disks;
use log::{info, warn};

use crate::notify::send_tg_alert_throttled;

pub fn check_system_resources_and_rotate_logs() {
    // 1. 检查磁盘空间
    let disks = Disks::new_with_refreshed_list();
    for disk in &disks {
        if disk.mount_point() == Path::new("/") {
            let total = disk.total_space();
            let available = disk.available_space();
            if total > 0 {
                let used_percent = ((total - available) as f64 / total as f64) * 100.0;
                if used_percent > 90.0 {
                    let alert_msg = format!(
                        "🚨 硬件告警：服务器磁盘使用率过高 (当前: {:.1}%)！请及时清理日志！",
                        used_percent
                    );
                    send_tg_alert_throttled(
                        "disk_alert",
                        &alert_msg,
                        Duration::from_secs(1800),
                    );
                }
            }
        }
    }

    // 2. 日志截断 (>10MB 保留最后 2000 行)
    let log_files = vec![
        "/Users/hi/niuma/poly_mission_control.log",
        "/Users/hi/niuma/system_keeper.log",
        "/Users/hi/niuma/telegram_bot.log",
        "/Users/hi/niuma/proxy_health_checker.log",
        "/Users/hi/niuma/hysteria.log",
        "/Users/hi/niuma/lan_file_server.log",
        "/Users/hi/niuma/launchd_boot.log",
    ];

    const MAX_SIZE: u64 = 10 * 1024 * 1024; // 10MB

    for log_path in log_files {
        if let Ok(metadata) = fs::metadata(log_path) {
            if metadata.len() > MAX_SIZE {
                warn!("日志 {} 超过 10MB，执行截断处理...", log_path);
                let _ = truncate_log_file(log_path, 2000);
            }
        }
    }
}

fn truncate_log_file(filepath: &str, keep_lines: usize) -> std::io::Result<()> {
    let file = File::open(filepath)?;
    let reader = BufReader::new(file);

    let lines: Vec<String> = reader.lines().filter_map(Result::ok).collect();
    let start_idx = if lines.len() > keep_lines {
        lines.len() - keep_lines
    } else {
        0
    };

    let truncated_content = lines[start_idx..].join("\n");
    let tmp_path = format!("{}.tmp", filepath);

    let mut tmp_file = File::create(&tmp_path)?;
    tmp_file.write_all(truncated_content.as_bytes())?;

    fs::rename(tmp_path, filepath)?;
    Ok(())
}
