use axum::response::Json;
use serde_json::json;
use std::fs;
use std::path::Path;

pub async fn get_latest_dream_report() -> Json<serde_json::Value> {
    let journal_dir = Path::new("/Users/hi/niuma/wiki/journal");
    if !journal_dir.exists() {
        return Json(json!({
            "success": false,
            "error": "No journal directory found"
        }));
    }

    let mut entries = Vec::new();
    if let Ok(dir_entries) = fs::read_dir(journal_dir) {
        for entry in dir_entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("md") {
                if let Some(file_name) = path.file_stem().and_then(|s| s.to_str()) {
                    entries.push((file_name.to_string(), path));
                }
            }
        }
    }

    entries.sort_by(|a, b| b.0.cmp(&a.0));

    if let Some((date_str, latest_path)) = entries.first() {
        if let Ok(content) = fs::read_to_string(latest_path) {
            return Json(json!({
                "success": true,
                "date": date_str,
                "title": format!("牛马4号 每日剪辑做梦反思 ({})", date_str),
                "reflection": content.lines().take(10).collect::<Vec<_>>().join("\n"),
                "full_content": content,
                "total_entries": entries.len()
            }));
        }
    }

    Json(json!({
        "success": false,
        "error": "暂无做梦反思日志"
    }))
}
