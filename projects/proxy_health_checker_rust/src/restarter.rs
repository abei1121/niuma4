use std::process::Command;
use log::{error, info};

pub fn restart_hysteria() {
    info!("[ProxyChecker] 连续多次失败，正在重启 hysteria-client.service ...");
    let hy2_path = "/Users/hi/niuma/bin/hy2_switch";
    if std::path::Path::new(hy2_path).exists() {
        info!("[ProxyChecker] 连续多次失败，正在调用 hy2_switch auto 进行故障切换...");
        let _ = Command::new(hy2_path).arg("auto").output();
        return;
    }

    info!("[ProxyChecker] 连续多次失败，尝试重启 hysteria-client.service ...");
    if let Ok(out) = Command::new("systemctl").args(["restart", "hysteria-client.service"]).output() {
        if out.status.success() {
            info!("[ProxyChecker] 重启指令已成功发送");
        } else {
            error!("[ProxyChecker] 重启失败: {}", String::from_utf8_lossy(&out.stderr));
        }
    } else {
        log::warn!("[ProxyChecker] 当前系统未检测到 systemctl 或 hysteria 服务，跳过自动重启");
    }
}
