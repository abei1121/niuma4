use axum::{
    extract::Json,
    response::IntoResponse,
};
use serde::Deserialize;
use serde_json::json;
use std::path::Path;
use std::time::Duration;
use tokio::process::Command;

#[derive(Deserialize)]
pub struct ExportJianyingReq {
    pub clean_file: Option<String>,
    pub project_name: Option<String>,
    pub sector_id: Option<String>,
    pub hook_title: Option<String>,
    pub topic: Option<String>,
    pub director_role: Option<String>,
    pub platform_id: Option<String>,
}

pub async fn export_jianying_draft_handler(Json(req): Json<ExportJianyingReq>) -> impl IntoResponse {
    let clean_file = req.clean_file.unwrap_or_default();
    if clean_file.is_empty() || !Path::new(&clean_file).exists() {
        return Json(json!({
            "success": false,
            "error": "未找到有效视频素材底片，请先在 L0/L1 载入素材"
        }));
    }

    let stem = Path::new(&clean_file).file_stem().and_then(|s| s.to_str()).unwrap_or("proj");
    let proj_name = req.project_name.unwrap_or_else(|| stem.to_string());
    let sector = req.sector_id.unwrap_or_else(|| "canyin".to_string());
    let hook_title = req.hook_title.unwrap_or_default();
    let topic = req.topic.unwrap_or_default();
    let role = req.director_role.unwrap_or_default();

    // 写入专用的动态草稿规范文件，避免命令行过长或乱码
    let spec_path = format!("/tmp/jianying_spec_{}_{}.json", std::process::id(), std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0));
    let spec_data = json!({
        "clean_file": clean_file,
        "project_name": proj_name,
        "sector_id": sector,
        "hook_title": hook_title,
        "topic": topic,
        "director_role": role,
    });

    let _ = tokio::fs::write(&spec_path, spec_data.to_string()).await;

    let child = Command::new("/Users/hi/niuma/video_workspace/venv/bin/python3")
        .args([
            "/Users/hi/niuma/video_workspace/scripts/jianying_draft_injector.py",
            "--spec", &spec_path,
        ])
        .output();

    let res = match tokio::time::timeout(Duration::from_secs(60), child).await {
        Ok(Ok(out)) => out,
        _ => {
            let _ = tokio::fs::remove_file(&spec_path).await;
            return Json(json!({
                "success": false,
                "error": "剪映草稿生成超时"
            }));
        }
    };

    let _ = tokio::fs::remove_file(&spec_path).await;

    if !res.status.success() {
        return Json(json!({
            "success": false,
            "error": String::from_utf8_lossy(&res.stderr).to_string()
        }));
    }

    let stdout_str = String::from_utf8_lossy(&res.stdout);
    for line in stdout_str.lines().rev() {
        let trimmed = line.trim();
        if trimmed.starts_with('{') && trimmed.ends_with('}') {
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(trimmed) {
                return Json(parsed);
            }
        }
    }

    Json(json!({
        "success": true,
        "message": "剪映/CapCut 动态草稿工程已生成并注入系统草稿库，客户端已调起！"
    }))
}
