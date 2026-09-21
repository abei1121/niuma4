use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessStatus {
    pub name: String,
    pub service_name: Option<String>,
    pub pid: Option<u32>,
    pub cpu_pct: f64,
    pub mem_mb: f64,
    pub is_running: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RestartServiceRequest {
    #[serde(alias = "service")]
    pub service_name: String,
}

pub async fn get_daemons_status() -> Json<Vec<ProcessStatus>> {
    let service_map = [
        ("poly_mission_control.service", "poly_mission_control", "自媒体控制中枢 Web 管理引擎 (8999端口)"),
        ("telegram_bot.service", "telegram_bot_rust", "Telegram 手机端双向通信桥接服务"),
        ("system_keeper.service", "system_keeper_rust", "系统机械级常驻守护引擎 (孤儿收割与防卡死)"),
        ("proxy-health-checker.service", "proxy_health_checker", "代理健康监测与网络自愈服务 (自动探活)"),
        ("lan_file_server.service", "lan_file_server", "局域网跨设备高速文件传输服务 (8888端口)"),
        ("hysteria-client.service", "hysteria", "Hysteria 2 高速专线代理隧道 (可选专网)"),
    ];

    let mut results = Vec::new();
    let mut inspected_services = std::collections::HashSet::new();

    for (svc, proc_name, display_name) in service_map {
        let (running, pid, cpu, mem) = inspect_process(proc_name);
        let svc_name = if !svc.is_empty() { Some(svc.to_string()) } else { None };
        if let Some(ref s) = svc_name {
            inspected_services.insert(s.clone());
        }
        results.push(ProcessStatus {
            name: display_name.to_string(),
            service_name: svc_name,
            pid,
            cpu_pct: cpu,
            mem_mb: mem,
            is_running: running,
        });
    }

    if let Ok(entries) = std::fs::read_dir("/etc/systemd/system") {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("service") {
                let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                if inspected_services.contains(&file_name) || file_name.starts_with("multi-user") {
                    continue;
                }
                if let Ok(content) = std::fs::read_to_string(&path) {
                    if content.contains("/Users/hi/niuma") {
                        let mut desc = file_name.trim_end_matches(".service").to_string();
                        for line in content.lines() {
                            if line.starts_with("Description=") {
                                let raw_desc = line.trim_start_matches("Description=").trim();
                                desc = match raw_desc {
                                    "Proxy Health Checker and Self-Healing Service" => "代理健康监测与网络自愈服务".to_string(),
                                    other => other.to_string(),
                                };
                                break;
                            }
                        }
                        let mut svc_running = false;
                        let mut svc_pid = None;
                        let mut svc_cpu = 0.0;
                        let mut svc_mem = 0.0;

                        if let Ok(out) = Command::new("systemctl").arg("is-active").arg(&file_name).output() {
                            let status = String::from_utf8_lossy(&out.stdout).trim().to_string();
                            if status == "active" {
                                svc_running = true;
                                if let Ok(pid_out) = Command::new("systemctl").arg("show").arg("-p").arg("MainPID").arg(&file_name).output() {
                                    let pid_str = String::from_utf8_lossy(&pid_out.stdout);
                                    if let Some(num_str) = pid_str.trim().strip_prefix("MainPID=") {
                                        if let Ok(pid_val) = num_str.parse::<u32>() {
                                            if pid_val > 0 {
                                                svc_pid = Some(pid_val);
                                                let (c, m) = inspect_pid_metrics(pid_val);
                                                svc_cpu = c;
                                                svc_mem = m;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if !svc_running {
                            let base_bin = file_name.trim_end_matches(".service");
                            let (r, p, c, m) = inspect_process(base_bin);
                            svc_running = r;
                            svc_pid = p;
                            svc_cpu = c;
                            svc_mem = m;
                        }

                        results.push(ProcessStatus {
                            name: format!("{} ({})", desc, file_name),
                            service_name: Some(file_name),
                            pid: svc_pid,
                            cpu_pct: svc_cpu,
                            mem_mb: svc_mem,
                            is_running: svc_running,
                        });
                    }
                }
            }
        }
    }

    Json(results)
}

pub async fn restart_service(Json(payload): Json<RestartServiceRequest>) -> Json<serde_json::Value> {
    let raw_name = payload.service_name.trim();

    #[cfg(target_os = "macos")]
    {
        let bin_name = match raw_name {
            "system_keeper" | "system_keeper_rust" | "system_keeper.service" => "system_keeper_rust",
            "telegram_bot" | "telegram_bot_rust" | "telegram_bot.service" => "telegram_bot_rust",
            "proxy_health_checker" | "proxy_health_checker_rust" | "proxy-health-checker.service" => "proxy_health_checker_rust",
            "lan_file_server" | "lan_file_server.service" => "lan_file_server",
            "poly_mission_control" | "mission_control" | "poly_mission_control.service" => "poly_mission_control",
            other => other.trim_end_matches(".service"),
        };

        let bin_path = format!("/Users/hi/niuma/bin/{}", bin_name);
        let log_path = format!("/Users/hi/niuma/{}.log", bin_name);

        if !std::path::Path::new(&bin_path).exists() {
            return Json(json!({"success": false, "error": format!("执行体 {} 不存在", bin_path)}));
        }

        // Kill existing process if running (except self if requested, handled via nohup)
        let _ = Command::new("pkill").arg("-f").arg(bin_name).output();
        std::thread::sleep(std::time::Duration::from_millis(300));

        let res = Command::new("bash")
            .arg("-c")
            .arg(format!("nohup {} >> {} 2>&1 &", bin_path, log_path))
            .spawn();

        return match res {
            Ok(_) => Json(json!({"success": true, "service": bin_name, "message": format!("服务 {} 已重启拉起", bin_name)})),
            Err(e) => Json(json!({"success": false, "error": e.to_string()})),
        };
    }

    #[cfg(not(target_os = "macos"))]
    {
        let service_file = if raw_name.ends_with(".service") {
            raw_name.to_string()
        } else {
            match raw_name {
                "system_keeper" | "system_keeper_rust" => "system_keeper.service".to_string(),
                "telegram_bot" | "telegram_bot_rust" => "telegram_bot.service".to_string(),
                "poly_mission_control" | "mission_control" => "poly_mission_control.service".to_string(),
                "hysteria" => "hysteria-client.service".to_string(),
                "proxy_health_checker" => "proxy-health-checker.service".to_string(),
                other => format!("{}.service", other),
            }
        };

        let out = Command::new("systemctl")
            .arg("restart")
            .arg(&service_file)
            .output();

        match out {
            Ok(o) if o.status.success() => Json(json!({"success": true, "service": service_file})),
            Ok(o) => Json(json!({"success": false, "error": String::from_utf8_lossy(&o.stderr).to_string()})),
            Err(e) => Json(json!({"success": false, "error": e.to_string()})),
        }
    }
}

fn inspect_pid_metrics(pid: u32) -> (f64, f64) {
    if let Ok(output) = Command::new("ps").arg("-p").arg(pid.to_string()).arg("-o").arg("%cpu,rss").output() {
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines().skip(1) {
            let cols: Vec<&str> = line.split_whitespace().collect();
            if cols.len() >= 2 {
                let cpu = cols[0].parse::<f64>().unwrap_or(0.0);
                let mem_rss = cols[1].parse::<f64>().unwrap_or(0.0) / 1024.0;
                return (cpu, mem_rss);
            }
        }
    }
    (0.0, 0.0)
}

fn inspect_process(name: &str) -> (bool, Option<u32>, f64, f64) {
    let name_clean = name.replace('-', "_");
    if let Ok(output) = Command::new("ps").arg("aux").output() {
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines() {
            if (line.contains(name) || line.contains(&name_clean)) && !line.contains("grep") && !line.contains("ps aux") {
                let cols: Vec<&str> = line.split_whitespace().collect();
                if cols.len() >= 11 {
                    let pid = cols[1].parse::<u32>().ok();
                    let cpu = cols[2].parse::<f64>().unwrap_or(0.0);
                    let mem_rss = cols[5].parse::<f64>().unwrap_or(0.0) / 1024.0;
                    return (true, pid, cpu, mem_rss);
                }
            }
        }
    }
    (false, None, 0.0, 0.0)
}
