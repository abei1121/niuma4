use std::path::Path;
use std::process::Command;
use std::thread::sleep;
use std::time::Duration;
use log::{error, info, warn};

pub fn restart_hysteria() {
    let hy2_path = "/Users/hi/niuma/bin/hy2_switch";
    if Path::new(hy2_path).exists() {
        info!("[ProxyChecker] 连续多次失败，正在调用 hy2_switch auto 进行故障切换...");
        let _ = Command::new(hy2_path).arg("auto").output();
        return;
    }

    #[cfg(target_os = "macos")]
    {
        info!("[ProxyChecker] 连续多次失败，macOS 正在重启 Hysteria 2 客户端...");
        let conf_path = "/Users/hi/niuma/hysteria.yaml";
        let bin_path = "/Users/hi/niuma/bin/hysteria";

        if !Path::new(bin_path).exists() || !Path::new(conf_path).exists() {
            error!("[ProxyChecker] 未找到 hysteria 二进制或 hysteria.yaml 配置，跳过重启");
            return;
        }

        // 停止旧进程
        let _ = Command::new("pkill").args(["-f", "hysteria client"]).output();
        sleep(Duration::from_millis(800));

        // 静默后台启动
        let status = Command::new("bash")
            .arg("-c")
            .arg("nohup /Users/hi/niuma/bin/hysteria client --config /Users/hi/niuma/hysteria.yaml >> /Users/hi/niuma/hysteria.log 2>&1 &")
            .status();

        match status {
            Ok(s) if s.success() => {
                info!("[ProxyChecker] Hysteria 2 客户端已成功拉起");
            }
            Ok(s) => {
                error!("[ProxyChecker] 拉起 Hysteria 2 异常退出码: {:?}", s.code());
            }
            Err(e) => {
                error!("[ProxyChecker] 拉起 Hysteria 2 失败: {}", e);
            }
        }
        return;
    }

    #[cfg(not(target_os = "macos"))]
    {
        info!("[ProxyChecker] 连续多次失败，尝试重启 hysteria-client.service ...");
        if let Ok(out) = Command::new("systemctl").args(["restart", "hysteria-client.service"]).output() {
            if out.status.success() {
                info!("[ProxyChecker] 重启指令已成功发送");
            } else {
                error!("[ProxyChecker] 重启失败: {}", String::from_utf8_lossy(&out.stderr));
            }
        } else {
            warn!("[ProxyChecker] 当前系统未检测到 systemctl，跳过自动重启");
        }
    }
}
