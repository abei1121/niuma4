use axum::extract::Query;
use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;

pub const DEFAULT_ROOT: &str = "/Users/hi/niuma";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size_bytes: u64,
    pub size_human: String,
    pub modified_time: String,
    pub extension: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ListFilesQuery {
    pub path: Option<String>,
}

pub fn sanitize_path(input_path: Option<&str>) -> PathBuf {
    let raw = match input_path {
        Some(p) if !p.trim().is_empty() => p.trim(),
        _ => DEFAULT_ROOT,
    };

    let target = PathBuf::from(raw);
    if target.is_absolute() {
        target
    } else {
        PathBuf::from(DEFAULT_ROOT)
    }
}

pub fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

pub async fn list_files(Query(query): Query<ListFilesQuery>) -> Json<serde_json::Value> {
    let target_dir = sanitize_path(query.path.as_deref());

    if !target_dir.exists() {
        let _ = fs::create_dir_all(&target_dir);
    }

    let mut items = Vec::new();
    if let Ok(entries) = fs::read_dir(&target_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            let is_dir = path.is_dir();
            
            let metadata = entry.metadata().ok();
            let size_bytes = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
            let size_human = if is_dir { "--".to_string() } else { format_bytes(size_bytes) };

            let modified_time = metadata
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                .map(|d| {
                    let dt = chrono::DateTime::from_timestamp(d.as_secs() as i64, 0).unwrap_or_default();
                    dt.format("%Y-%m-%d %H:%M:%S").to_string()
                })
                .unwrap_or_else(|| "--".to_string());

            let extension = path
                .extension()
                .map(|e| e.to_string_lossy().to_string())
                .unwrap_or_default();

            items.push(FileItem {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir,
                size_bytes,
                size_human,
                modified_time,
                extension,
            });
        }
    }

    items.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Json(json!({
        "current_path": target_dir.to_string_lossy().to_string(),
        "parent_path": target_dir.parent().map(|p| p.to_string_lossy().to_string()),
        "items": items
    }))
}
