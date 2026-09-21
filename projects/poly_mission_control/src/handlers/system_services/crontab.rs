use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CronJob {
    pub schedule: String,
    pub command: String,
    pub log_path: Option<String>,
    pub raw: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TriggerJobRequest {
    pub command: String,
}

pub async fn get_crontab_jobs() -> Json<Vec<CronJob>> {
    let mut jobs = Vec::new();
    if let Ok(output) = Command::new("crontab").arg("-l").output() {
        let text = String::from_utf8_lossy(&output.stdout);
        for line in text.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            let parts: Vec<&str> = trimmed.split_whitespace().collect();
            if parts.len() >= 6 {
                let schedule = parts[0..5].join(" ");
                let cmd = parts[5..].join(" ");
                let log = if cmd.contains(">>") {
                    cmd.split(">>").nth(1).map(|s| s.split_whitespace().next().unwrap_or("").trim().to_string())
                } else {
                    None
                };
                jobs.push(CronJob {
                    schedule,
                    command: cmd,
                    log_path: log,
                    raw: trimmed.to_string(),
                });
            }
        }
    }
    Json(jobs)
}

pub async fn run_crontab_job_now(Json(payload): Json<TriggerJobRequest>) -> Json<serde_json::Value> {
    let raw_cmd = payload.command;
    let clean_cmd = if raw_cmd.contains(">>") {
        raw_cmd.split(">>").next().unwrap_or(&raw_cmd).trim()
    } else {
        raw_cmd.trim()
    };

    let status = Command::new("bash")
        .arg("-c")
        .arg(format!("{} &", clean_cmd))
        .spawn();

    match status {
        Ok(_) => Json(json!({"success": true, "message": format!("Triggered execution: {}", clean_cmd)})),
        Err(e) => Json(json!({"success": false, "error": format!("Failed to trigger: {}", e)})),
    }
}
