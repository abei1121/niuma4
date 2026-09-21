use axum::{
    extract::{Json, Query},
    response::IntoResponse,
};
use serde::Deserialize;
use serde_json::json;
use std::path::{Path, PathBuf};
use std::process::Command;

const LIB_DIR: &str = "/Users/hi/niuma/video_workspace/library";

#[derive(Deserialize)]
pub struct FixOrientationReq {
    pub path: String,
    pub manual_degree: Option<i32>,
}

#[derive(Deserialize)]
pub struct DetectReq {
    pub path: String,
}

#[derive(Deserialize)]
pub struct DownloadUrlReq {
    pub urls: Vec<String>,
}

// 毫秒级探测视频旋转参数 (仅读取文件首帧头部，严禁扫描全片)
pub fn probe_video_rotation(file_path: &str) -> i32 {
    let output = Command::new("ffprobe")
        .args([
            "-v", "error",
            "-read_intervals", "%+#1",
            "-select_streams", "v:0",
            "-show_entries", "stream_tags=rotate:side_data=rotation",
            "-of", "default=noprint_wrappers=1:nokey=1",
            file_path,
        ])
        .output();

    if let Ok(out) = output {
        let stdout = String::from_utf8_lossy(&out.stdout);
        for line in stdout.lines() {
            if let Ok(val) = line.trim().parse::<f64>() {
                let rot = (val.round() as i32) % 360;
                let normalized = if rot < 0 { rot + 360 } else { rot };
                if normalized != 0 {
                    return normalized;
                }
            }
        }
    }
    0
}

// 毫秒级方向检测接口 (纯探测不转码)
pub async fn detect_rotation(Query(query): Query<DetectReq>) -> impl IntoResponse {
    let rot = probe_video_rotation(&query.path);
    Json(json!({
        "success": true,
        "path": query.path,
        "rotation": rot,
        "is_upright": rot == 0
    }))
}

// 手动或显式触发物理转置 (仅在用户显式要求时执行)
pub async fn fix_orientation(Json(req): Json<FixOrientationReq>) -> impl IntoResponse {
    let input = Path::new(&req.path);
    if !input.exists() {
        return Json(json!({ "success": false, "error": "输入视频不存在" }));
    }

    let detected = probe_video_rotation(&req.path);
    let degree_to_fix = req.manual_degree.unwrap_or(detected);

    if degree_to_fix == 0 && req.manual_degree.is_none() {
        return Json(json!({
            "success": true,
            "message": "视频方向检测正常 (0度无需纠正)",
            "output_path": req.path,
            "detected_rotation": 0,
            "fixed": false
        }));
    }

    let stem = input.file_stem().and_then(|s| s.to_str()).unwrap_or("video");
    let ext = input.extension().and_then(|s| s.to_str()).unwrap_or("mp4");
    let out_name = format!("{}_rot{}.{}", stem, degree_to_fix, ext);
    let output_path = input.parent().unwrap_or_else(|| Path::new(LIB_DIR)).join(out_name);

    let vf_filter = match degree_to_fix {
        90 => "transpose=1",
        180 => "transpose=2,transpose=2",
        270 => "transpose=2",
        _ => "null",
    };

    let status = Command::new("ffmpeg")
        .args([
            "-y",
            "-i", &req.path,
            "-vf", vf_filter,
            "-metadata:s:v", "rotate=0",
            "-c:a", "copy",
            "-preset", "veryfast",
            output_path.to_str().unwrap_or(""),
        ])
        .status();

    match status {
        Ok(s) if s.success() => Json(json!({
            "success": true,
            "message": format!("方向已矫正 (旋转{}度)", degree_to_fix),
            "output_path": output_path.to_string_lossy(),
            "detected_rotation": detected,
            "fixed": true
        })),
        Ok(_) => Json(json!({ "success": false, "error": "ffmpeg 转码失败" })),
        Err(e) => Json(json!({ "success": false, "error": format!("执行异常: {}", e) })),
    }
}

// 远端 URL 批量拉取
pub async fn download_remote_video(Json(req): Json<DownloadUrlReq>) -> impl IntoResponse {
    let _ = std::fs::create_dir_all(LIB_DIR);
    let mut downloaded = Vec::new();
    let mut errors = Vec::new();

    for url in req.urls {
        let trimmed = url.trim();
        if trimmed.is_empty() { continue; }

        let parsed_name = trimmed.split('?').next().unwrap_or(trimmed);
        let raw_file_name = parsed_name.split('/').last().unwrap_or("downloaded.mp4");
        let safe_name = if raw_file_name.is_empty() || !raw_file_name.contains('.') {
            format!("remote_{}.mp4", chrono::Utc::now().timestamp())
        } else {
            raw_file_name.to_string()
        };

        let target_path = PathBuf::from(LIB_DIR).join(&safe_name);

        let status = Command::new("curl")
            .args(["-L", "-s", "-f", "--connect-timeout", "15", "-o", target_path.to_str().unwrap_or(""), trimmed])
            .status();

        match status {
            Ok(s) if s.success() => {
                let rot = probe_video_rotation(target_path.to_str().unwrap_or(""));
                downloaded.push(json!({
                    "url": trimmed,
                    "path": target_path.to_string_lossy(),
                    "name": safe_name,
                    "detected_rotation": rot
                }));
            }
            Ok(_) => errors.push(format!("下载失败: HTTP状态异常 ({})", trimmed)),
            Err(e) => errors.push(format!("curl 执行失败 {}: {}", trimmed, e)),
        }
    }

    Json(json!({
        "success": !downloaded.is_empty(),
        "downloaded_count": downloaded.len(),
        "downloaded": downloaded,
        "errors": errors
    }))
}
