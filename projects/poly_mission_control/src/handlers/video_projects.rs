use axum::{
    extract::{Json, Query},
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::Path;

const PROJECTS_DIR: &str = "/Users/hi/niuma/video_workspace/projects";

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ProjectPayload {
    pub name: String,
    pub updated_at: Option<String>,
    pub data: serde_json::Value,
}

#[derive(Deserialize)]
pub struct LoadProjectQuery {
    pub name: String,
}

pub async fn list_projects() -> impl IntoResponse {
    let _ = fs::create_dir_all(PROJECTS_DIR);
    let mut list = Vec::new();
    if let Ok(entries) = fs::read_dir(PROJECTS_DIR) {
        for entry in entries.flatten() {
            if let Ok(meta) = entry.metadata() {
                if meta.is_file() && entry.path().extension().and_then(|s| s.to_str()) == Some("json") {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let project_name = file_name.trim_end_matches(".json").to_string();
                    let modified = meta
                        .modified()
                        .ok()
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs())
                        .unwrap_or(0);

                    list.push(json!({
                        "name": project_name,
                        "file": file_name,
                        "modified_secs": modified,
                        "size_bytes": meta.len(),
                    }));
                }
            }
        }
    }
    // 按修改时间倒序排列
    list.sort_by(|a, b| {
        let ma = a.get("modified_secs").and_then(|v| v.as_u64()).unwrap_or(0);
        let mb = b.get("modified_secs").and_then(|v| v.as_u64()).unwrap_or(0);
        mb.cmp(&ma)
    });
    Json(json!({ "projects": list }))
}

pub async fn save_project(Json(payload): Json<ProjectPayload>) -> impl IntoResponse {
    let _ = fs::create_dir_all(PROJECTS_DIR);
    let safe_name = payload.name.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let file_path = Path::new(PROJECTS_DIR).join(format!("{}.json", safe_name));

    let enriched_payload = json!({
        "name": payload.name,
        "updated_at": chrono::Local::now().to_rfc3339(),
        "data": payload.data,
    });

    match fs::write(&file_path, serde_json::to_string_pretty(&enriched_payload).unwrap_or_default()) {
        Ok(_) => Json(json!({ "success": true, "name": payload.name, "path": file_path.to_string_lossy() })),
        Err(e) => Json(json!({ "success": false, "error": e.to_string() })),
    }
}

pub async fn load_project(Query(query): Query<LoadProjectQuery>) -> impl IntoResponse {
    let safe_name = query.name.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let file_path = Path::new(PROJECTS_DIR).join(format!("{}.json", safe_name));

    match fs::read_to_string(&file_path) {
        Ok(content) => match serde_json::from_str::<serde_json::Value>(&content) {
            Ok(json_data) => Json(json!({ "success": true, "project": json_data })),
            Err(e) => Json(json!({ "success": false, "error": format!("解析项目 JSON 失败: {}", e) })),
        },
        Err(e) => Json(json!({ "success": false, "error": format!("找不到项目文件: {}", e) })),
    }
}

#[derive(Deserialize)]
pub struct DeleteProjectQuery {
    pub name: String,
}

pub async fn delete_project(Query(query): Query<DeleteProjectQuery>) -> impl IntoResponse {
    let safe_name = query.name.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let file_path = Path::new(PROJECTS_DIR).join(format!("{}.json", safe_name));

    if file_path.exists() {
        match fs::remove_file(&file_path) {
            Ok(_) => Json(json!({ "success": true, "name": query.name })),
            Err(e) => Json(json!({ "success": false, "error": e.to_string() })),
        }
    } else {
        Json(json!({ "success": false, "error": "工程文件不存在" }))
    }
}

