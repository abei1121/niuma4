use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::Duration;
use sysinfo::System;
use log::warn;

use crate::notify::send_tg_alert;

pub struct ServiceSpec {
    pub name: &'static str,
    pub match_pattern: &'static str,
    pub work_dir: &'static str,
    pub start_cmd: &'static str,
    pub alert_msg: &'static str,
    pub wait_secs: u64,
    pub bin_check: Option<&'static str>,
}

pub fn check_and_guard_services(sys: &mut System) {
    let services = vec![
        ServiceSpec {
            name: "poly_mission_control",
            match_pattern: "poly_mission_control",
            work_dir: "/Users/hi/niuma",
            start_cmd: "nohup /Users/hi/niuma/bin/poly_mission_control >> /Users/hi/niuma/poly_mission_control.log 2>&1 &",
            alert_msg: "🚨 致命告警：自媒体控制台 poly_mission_control 自动拉起失败！",
            wait_secs: 2,
            bin_check: Some("/Users/hi/niuma/bin/poly_mission_control"),
        },
        ServiceSpec {
            name: "telegram_bot",
            match_pattern: "telegram_bot_rust",
            work_dir: "/Users/hi/niuma",
            start_cmd: "nohup /Users/hi/niuma/bin/telegram_bot_rust >> /Users/hi/niuma/telegram_bot.log 2>&1 &",
            alert_msg: "🚨 致命告警：Telegram 通信桥梁 telegram_bot 自动拉起失败！",
            wait_secs: 2,
            bin_check: Some("/Users/hi/niuma/bin/telegram_bot_rust"),
        },
        ServiceSpec {
            name: "proxy_health_checker",
            match_pattern: "proxy_health_checker_rust",
            work_dir: "/Users/hi/niuma",
            start_cmd: "nohup /Users/hi/niuma/bin/proxy_health_checker_rust >> /Users/hi/niuma/proxy_health_checker.log 2>&1 &",
            alert_msg: "🚨 致命告警：代理健康检测 proxy_health_checker 自动修复失败！",
            wait_secs: 2,
            bin_check: Some("/Users/hi/niuma/bin/proxy_health_checker_rust"),
        },
        ServiceSpec {
            name: "lan_file_server",
            match_pattern: "lan_file_server",
            work_dir: "/Users/hi/niuma",
            start_cmd: "nohup /Users/hi/niuma/bin/lan_file_server /Users/hi/niuma >> /Users/hi/niuma/lan_file_server.log 2>&1 &",
            alert_msg: "🚨 致命告警：局域网文件服务 lan_file_server 自动修复失败！",
            wait_secs: 2,
            bin_check: Some("/Users/hi/niuma/bin/lan_file_server"),
        },
        ServiceSpec {
            name: "hysteria",
            match_pattern: "hysteria client",
            work_dir: "/Users/hi/niuma",
            start_cmd: "nohup /Users/hi/niuma/bin/hysteria client --config /Users/hi/niuma/hysteria.yaml >> /Users/hi/niuma/hysteria.log 2>&1 &",
            alert_msg: "🚨 致命告警：Hysteria 2 专线代理自动拉起失败！",
            wait_secs: 2,
            bin_check: Some("/Users/hi/niuma/bin/hysteria"),
        },
    ];

    for spec in services {
        if let Some(bin_path) = spec.bin_check {
            if !Path::new(bin_path).exists() {
                continue;
            }
        }

        if !is_process_running(sys, spec.match_pattern) {
            warn!("⚠️ 检测到 {} 宕机，正在自动静默拉起...", spec.name);
            let _ = Command::new("bash")
                .arg("-c")
                .arg(format!("cd {} && {}", spec.work_dir, spec.start_cmd))
                .status();

            thread::sleep(Duration::from_secs(spec.wait_secs));

            sys.refresh_processes();
            if !is_process_running(sys, spec.match_pattern) {
                send_tg_alert(spec.alert_msg);
            }
        }
    }
}

fn is_process_running(_sys: &System, pattern: &str) -> bool {
    // 1. 对于 pm_sidecar，直接发起 8088 HTTP 探针，若返回 200 则 100% 存活
    if pattern == "pm_sidecar.js" {
        if let Ok(status) = Command::new("curl")
            .arg("-s")
            .arg("-f")
            .arg("http://127.0.0.1:8088/health")
            .status()
        {
            if status.success() {
                return true;
            }
        }
    }

    // 2. 采用系统内核级 pgrep -f 匹配命令行，彻底避免 sysinfo 缓存遗漏
    if let Ok(output) = Command::new("pgrep").arg("-f").arg(pattern).output() {
        if output.status.success() && !output.stdout.is_empty() {
            return true;
        }
    }

    false
}
