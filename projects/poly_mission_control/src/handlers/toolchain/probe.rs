use std::path::Path;
use std::process::Command;
use std::time::Instant;
use serde_json::json;

use super::registry::ToolSpec;

pub fn resolve_path(paths: &[&str]) -> Option<String> {
    for p in paths {
        if Path::new(p).exists() {
            return Some(p.to_string());
        }
    }
    None
}

pub fn check_process(pattern: Option<&str>) -> bool {
    let Some(pat) = pattern else { return false; };
    if let Ok(out) = Command::new("pgrep").arg("-f").arg(pat).output() {
        return out.status.success() && !out.stdout.is_empty();
    }
    false
}

pub fn get_version(bin: &str, args: &[&str]) -> String {
    if args.is_empty() {
        return "实体可执行文件就绪".to_string();
    }
    if let Ok(out) = Command::new(bin).args(args).output() {
        let text = if out.status.success() {
            String::from_utf8_lossy(&out.stdout).to_string()
        } else {
            String::from_utf8_lossy(&out.stderr).to_string()
        };
        for line in text.lines() {
            let l = line.trim();
            if !l.is_empty() && !l.starts_with("░") {
                return l.to_string();
            }
        }
    }
    "已安装".to_string()
}

pub fn execute_probe(spec: &ToolSpec) -> serde_json::Value {
    let bin_path = resolve_path(spec.paths).unwrap_or_else(|| spec.paths[0].to_string());
    if !Path::new(&bin_path).exists() {
        return json!({
            "id": spec.id,
            "name": spec.name,
            "success": false,
            "latency_ms": 0,
            "output": "文件不存在",
        });
    }

    let start = Instant::now();
    if spec.probe_args.is_empty() {
        let is_running = check_process(spec.process_pattern);
        let out = Command::new("file").arg("-b").arg(&bin_path).output();
        let file_info = match out {
            Ok(o) => String::from_utf8_lossy(&o.stdout).trim().to_string(),
            Err(_) => format!("实体可执行文件就绪: {}", bin_path),
        };
        let latency_ms = start.elapsed().as_millis();
        return json!({
            "id": spec.id,
            "name": spec.name,
            "success": true,
            "latency_ms": latency_ms,
            "output": format!("实体文件属性: {}\n运行状态: {}", file_info, if is_running { "常驻守护进程运行中 (Active)" } else { "独立 CLI / 待命就绪 (Ready)" }),
        });
    }

    let out = Command::new(&bin_path).args(spec.probe_args).output();
    let latency_ms = start.elapsed().as_millis();

    match out {
        Ok(o) => {
            let stdout = String::from_utf8_lossy(&o.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&o.stderr).trim().to_string();
            let full_output = if !stdout.is_empty() { stdout } else { stderr };
            json!({
                "id": spec.id,
                "name": spec.name,
                "success": o.status.success() || !full_output.is_empty(),
                "latency_ms": latency_ms,
                "output": full_output,
            })
        }
        Err(e) => json!({
            "id": spec.id,
            "name": spec.name,
            "success": false,
            "latency_ms": latency_ms,
            "output": format!("执行出错: {}", e),
        }),
    }
}
