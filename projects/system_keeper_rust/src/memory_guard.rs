use std::process::Command;
use std::time::Instant;
use log::{error, info};

static mut LAST_CHECK: Option<Instant> = None;

pub fn check_and_auto_heal_memory() {
    let now = Instant::now();
    unsafe {
        if let Some(last) = LAST_CHECK {
            if now.duration_since(last).as_secs() < 300 {
                // 每 5 分钟深度巡检并自愈一次记忆系统
                return;
            }
        }
        LAST_CHECK = Some(now);
    }

    let tool_path = "/Users/hi/niuma/bin/memory_tool";
    if !std::path::Path::new(tool_path).exists() {
        return;
    }
    info!("[MemoryGuard] 正在执行周期性记忆体系完整性巡检与自愈...");
    match Command::new(tool_path)
        .arg("all")
        .output()
    {
        Ok(out) => {
            if out.status.success() {
                info!("[MemoryGuard] 记忆体系自愈巡检通过 (0 死链, 0 孤立, 0 悬空链接)");
            } else {
                error!(
                    "[MemoryGuard] 记忆巡检发现异常: {}",
                    String::from_utf8_lossy(&out.stderr)
                );
            }
        }
        Err(e) => {
            error!("[MemoryGuard] 调用 memory_tool 失败: {}", e);
        }
    }
}
