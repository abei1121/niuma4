use crate::types::LogResponse;
use axum::extract::Query;
use axum::response::Json;
use serde::Deserialize;
use std::fs::File;
use std::io::{BufRead, BufReader};

#[derive(Deserialize)]
pub struct LogQuery {
    pub name: Option<String>,
    pub limit: Option<usize>,
}

pub async fn get_logs(Query(query): Query<LogQuery>) -> Json<LogResponse> {
    let log_type = query.name.unwrap_or_else(|| "mc".to_string());
    let limit = query.limit.unwrap_or(120);

    let file_path = match log_type.as_str() {
        "tg" | "telegram" => "/Users/hi/niuma/telegram_bot.log",
        "keeper" | "system_keeper" => "/Users/hi/niuma/system_keeper.log",
        "proxy" | "proxy_health" => "/Users/hi/niuma/proxy_health_checker.log",
        "lan" | "lan_file_server" => "/Users/hi/niuma/lan_file_server.log",
        "mc" | "mission_control" => "/Users/hi/niuma/poly_mission_control.log",
        _ => "/Users/hi/niuma/poly_mission_control.log",
    };

    let mut lines = Vec::new();
    if let Ok(file) = File::open(file_path) {
        let reader = BufReader::new(file);
        let all_lines: Vec<String> = reader.lines().filter_map(|l| l.ok()).collect();
        let start = if all_lines.len() > limit {
            all_lines.len() - limit
        } else {
            0
        };
        lines = all_lines[start..].to_vec();
    }

    Json(LogResponse {
        log_name: log_type,
        lines,
    })
}
