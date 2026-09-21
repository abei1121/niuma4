use axum::{
    extract::Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::Path;
use std::process::Command;

const LIB_DIR: &str = "/Users/hi/niuma/video_workspace/library";
const PROJECTS_DIR: &str = "/Users/hi/niuma/video_workspace/projects";

#[derive(Deserialize)]
pub struct AutoWorkflowReq {
    pub file_name: String,
    pub director_id: Option<String>,
    pub platform_id: Option<String>,
    pub ratio: Option<String>,
    pub auto_wash: Option<bool>,
    pub topic: Option<String>,
}

#[derive(Serialize)]
pub struct AutoWorkflowResp {
    pub success: bool,
    pub message: String,
    pub original_file: String,
    pub clean_file: Option<String>,
    pub director_id: String,
    pub platform_id: String,
    pub project_name: String,
}

pub async fn run_auto_workflow(Json(req): Json<AutoWorkflowReq>) -> impl IntoResponse {
    let raw_path = if req.file_name.starts_with('/') {
        req.file_name.clone()
    } else {
        format!("{}/{}", LIB_DIR, req.file_name)
    };

    if !Path::new(&raw_path).exists() {
        return Json(json!({
            "success": false,
            "error": format!("素材文件不存在: {}", raw_path)
        }));
    }

    let director = req.director_id.unwrap_or_else(|| "dir_hook_master".to_string());
    let platform = req.platform_id.unwrap_or_else(|| "douyin".to_string());
    let ratio = req.ratio.unwrap_or_else(|| "9:16".to_string());
    let topic = req.topic.unwrap_or_else(|| "自媒体爆款实战".to_string());
    let auto_wash = req.auto_wash.unwrap_or(true);

    let mut clean_file_path = None;

    if auto_wash {
        let stem = Path::new(&raw_path)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("video");
        let out_name = format!("{}_clean_master.mp4", stem);
        let out_path = Path::new(LIB_DIR).join(&out_name);

        let af = "silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-35dB";
        let mut cmd = Command::new("ffmpeg");
        cmd.args(["-y", "-i", &raw_path, "-af", af, "-c:v", "copy", out_path.to_str().unwrap_or("")]);

        if let Ok(st) = cmd.status() {
            if st.success() {
                clean_file_path = Some(out_path.to_string_lossy().to_string());
            }
        }
    }

    // 组装并保存工程状态
    let _ = fs::create_dir_all(PROJECTS_DIR);
    let project_name = format!("Agent_Auto_{}", chrono::Local::now().format("%Y%m%d_%H%M%S"));
    let project_file = Path::new(PROJECTS_DIR).join(format!("{}.json", project_name));

    let project_data = json!({
        "name": project_name,
        "ratio": ratio,
        "files": vec![&raw_path],
        "cleanFile": clean_file_path,
        "directorId": director,
        "platformId": platform,
        "topic": topic,
        "createdAt": chrono::Local::now().to_rfc3339(),
    });

    let _ = fs::write(&project_file, serde_json::to_string_pretty(&project_data).unwrap_or_default());

    Json(json!({
        "success": true,
        "message": "牛马4号 Agent Bridge 已完成全自动流水线驱动",
        "project_name": project_name,
        "original_file": raw_path,
        "clean_file": clean_file_path,
        "director_id": director,
        "platform_id": platform,
        "ratio": ratio,
    }))
}
