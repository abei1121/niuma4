use axum::{
    extract::Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::process::Command;

const TASKS_FILE: &str = "/Users/hi/niuma/video_workspace/tasks.json";
const LIB_DIR: &str = "/Users/hi/niuma/video_workspace/library";
const OUT_DIR: &str = "/Users/hi/niuma/video_workspace/outputs";

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VideoTask {
    pub id: String,
    pub name: String,
    pub task_type: String, // "extract_audio", "convert_vertical", "compress_vaapi", "cut_clip"
    pub input_file: String,
    pub output_file: String,
    pub status: String,    // "queued", "processing", "completed", "failed"
    pub progress: u8,
    pub created_at: String,
    pub error: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateTaskReq {
    pub name: String,
    pub task_type: String,
    pub input_file: String,
    pub params: Option<serde_json::Value>,
}

fn load_tasks() -> Vec<VideoTask> {
    if let Ok(data) = fs::read_to_string(TASKS_FILE) {
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        Vec::new()
    }
}

fn save_tasks(tasks: &[VideoTask]) {
    let _ = fs::write(TASKS_FILE, serde_json::to_string_pretty(tasks).unwrap_or_default());
}

pub async fn get_video_engine_status() -> impl IntoResponse {
    let ffmpeg_installed = Command::new("which").arg("ffmpeg").output().map(|o| o.status.success()).unwrap_or(false);
    let videotoolbox_available = if let Ok(out) = Command::new("ffmpeg").args(["-encoders"]).output() {
        String::from_utf8_lossy(&out.stdout).contains("videotoolbox")
    } else {
        false
    };

    let tasks = load_tasks();
    let queued = tasks.iter().filter(|t| t.status == "queued").count();
    let processing = tasks.iter().filter(|t| t.status == "processing").count();
    let completed = tasks.iter().filter(|t| t.status == "completed").count();
    let failed = tasks.iter().filter(|t| t.status == "failed").count();

    Json(json!({
        "status": "online",
        "agent": "牛马4号 (小韭菜牧场剪辑牛马)",
        "hardware": "Apple Silicon M2 (8C) / 8GB Unified Memory",
        "ffmpeg_installed": ffmpeg_installed,
        "vaapi_hardware_acceleration": videotoolbox_available,
        "videotoolbox_acceleration": videotoolbox_available,
        "driver": "Apple VideoToolbox (h264/hevc/prores HWAccel)",
        "tasks": {
            "total": tasks.len(),
            "queued": queued,
            "processing": processing,
            "completed": completed,
            "failed": failed
        }
    }))
}

pub async fn list_video_tasks() -> impl IntoResponse {
    let tasks = load_tasks();
    Json(json!({ "tasks": tasks }))
}

pub async fn create_video_task(Json(payload): Json<CreateTaskReq>) -> impl IntoResponse {
    let mut tasks = load_tasks();
    let task_id = format!("task_{}", chrono::Utc::now().timestamp());
    let ext = match payload.task_type.as_str() {
        "extract_audio" => "mp3",
        _ => "mp4",
    };
    let output_filename = format!("{}_{}.{}", payload.name.replace(' ', "_"), task_id, ext);
    let output_path = format!("{}/{}", OUT_DIR, output_filename);

    let new_task = VideoTask {
        id: task_id.clone(),
        name: payload.name,
        task_type: payload.task_type.clone(),
        input_file: payload.input_file.clone(),
        output_file: output_path.clone(),
        status: "processing".to_string(),
        progress: 10,
        created_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        error: None,
    };

    tasks.insert(0, new_task);
    save_tasks(&tasks);

    // 异步执行 ffmpeg 任务
    let task_id_clone = task_id.clone();
    let input = payload.input_file;
    let task_type = payload.task_type;
    tokio::spawn(async move {
        let mut cmd = Command::new("ffmpeg");
        cmd.arg("-y").arg("-i").arg(&input);

        match task_type.as_str() {
            "extract_audio" => {
                cmd.arg("-vn").arg("-acodec").arg("libmp3lame").arg("-q:a").arg("2");
            }
            "convert_vertical" => {
                #[cfg(target_os = "macos")]
                {
                    cmd.arg("-vf").arg("crop=ih*9/16:ih")
                        .arg("-c:v").arg("h264_videotoolbox")
                        .arg("-b:v").arg("5000k")
                        .arg("-c:a").arg("copy");
                }
                #[cfg(not(target_os = "macos"))]
                {
                    cmd.arg("-vf").arg("crop=ih*9/16:ih").arg("-c:a").arg("copy");
                }
            }
            "compress_vaapi" | "compress_videotoolbox" | "compress_hardware" => {
                #[cfg(target_os = "macos")]
                {
                    cmd.arg("-c:v").arg("h264_videotoolbox")
                        .arg("-b:v").arg("3000k")
                        .arg("-c:a").arg("aac");
                }
                #[cfg(not(target_os = "macos"))]
                {
                    if std::path::Path::new("/dev/dri/renderD128").exists() {
                        cmd.env("LIBVA_DRIVER_NAME", "i965")
                            .arg("-vaapi_device").arg("/dev/dri/renderD128")
                            .arg("-vf").arg("format=nv12,hwupload")
                            .arg("-c:v").arg("h264_vaapi")
                            .arg("-c:a").arg("copy");
                    } else {
                        cmd.arg("-c:v").arg("libx264").arg("-crf").arg("23").arg("-preset").arg("veryfast");
                    }
                }
            }
            _ => {
                cmd.arg("-c").arg("copy");
            }
        }
        cmd.arg(&output_path);

        let res = cmd.output();
        let mut cur_tasks = load_tasks();
        if let Some(t) = cur_tasks.iter_mut().find(|t| t.id == task_id_clone) {
            match res {
                Ok(output) if output.status.success() => {
                    t.status = "completed".to_string();
                    t.progress = 100;
                }
                Ok(output) => {
                    t.status = "failed".to_string();
                    t.error = Some(String::from_utf8_lossy(&output.stderr).to_string());
                }
                Err(e) => {
                    t.status = "failed".to_string();
                    t.error = Some(e.to_string());
                }
            }
        }
        save_tasks(&cur_tasks);
    });

    Json(json!({ "success": true, "task_id": task_id }))
}

pub async fn list_video_library() -> impl IntoResponse {
    let mut files = Vec::new();
    for dir in &[LIB_DIR, OUT_DIR] {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                if let Ok(meta) = entry.metadata() {
                    if meta.is_file() {
                        let name = entry.file_name().to_string_lossy().to_string();
                        let size_mb = meta.len() as f64 / 1024.0 / 1024.0;
                        files.push(json!({
                            "name": name,
                            "path": entry.path().to_string_lossy().to_string(),
                            "size_mb": format!("{:.2} MB", size_mb),
                            "category": if dir.contains("outputs") { "成品" } else { "素材" }
                        }));
                    }
                }
            }
        }
    }
    Json(json!({ "library": files }))
}
