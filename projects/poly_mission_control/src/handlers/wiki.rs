use axum::extract::Query;
use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::Path;

const WIKI_DIR: &str = "/Users/hi/niuma/wiki";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WikiEntry {
    pub relative_path: String,
    pub title: String,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct WikiFileQuery {
    pub path: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct WikiSaveRequest {
    pub path: String,
    pub content: String,
}

pub async fn list_wiki_files() -> Json<Vec<WikiEntry>> {
    let mut files = Vec::new();
    let root = Path::new(WIKI_DIR);
    collect_md_files(root, root, &mut files);
    files.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));
    Json(files)
}

fn get_safe_wiki_path(raw: &str) -> Option<std::path::PathBuf> {
    let clean = raw.trim_start_matches('/');
    let target = Path::new(WIKI_DIR).join(clean);
    let canonical_root = Path::new(WIKI_DIR).canonicalize().ok()?;
    
    if target.exists() {
        let canon = target.canonicalize().ok()?;
        if canon.starts_with(&canonical_root) {
            return Some(canon);
        }
        None
    } else {
        if let Some(parent) = target.parent() {
            let _ = fs::create_dir_all(parent);
            if let Ok(canon_parent) = parent.canonicalize() {
                if canon_parent.starts_with(&canonical_root) {
                    return Some(target);
                }
            }
        }
        None
    }
}

pub async fn get_wiki_file(Query(query): Query<WikiFileQuery>) -> Json<serde_json::Value> {
    if let Some(full_path) = get_safe_wiki_path(&query.path) {
        if let Ok(content) = fs::read_to_string(&full_path) {
            return Json(json!({
                "path": query.path,
                "content": content
            }));
        }
    }
    Json(json!({"error": format!("Wiki file '{}' not found or path invalid", query.path)}))
}

pub async fn save_wiki_file(Json(payload): Json<WikiSaveRequest>) -> Json<serde_json::Value> {
    if let Some(full_path) = get_safe_wiki_path(&payload.path) {
        if let Some(parent) = full_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        if let Ok(_) = fs::write(&full_path, &payload.content) {
            return Json(json!({"success": true, "path": payload.path}));
        }
    }
    Json(json!({"success": false, "error": "Failed to write wiki file or path invalid"}))
}

fn collect_md_files(current: &Path, root: &Path, list: &mut Vec<WikiEntry>) {
    if let Ok(entries) = fs::read_dir(current) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                collect_md_files(&path, root, list);
            } else if path.extension().map(|ext| ext == "md").unwrap_or(false) {
                if let Ok(rel) = path.strip_prefix(root) {
                    let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                    let title = path.file_stem().unwrap_or_default().to_string_lossy().to_string();
                    list.push(WikiEntry {
                        relative_path: rel.to_string_lossy().to_string(),
                        title,
                        size_bytes: size,
                    });
                }
            }
        }
    }
}
