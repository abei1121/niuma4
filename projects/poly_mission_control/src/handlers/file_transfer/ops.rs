use axum::body::Body;
use axum::extract::{Multipart, Query};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Json, Response};
use serde::Deserialize;
use serde_json::json;
use std::fs;
use std::path::PathBuf;
use tokio_util::io::ReaderStream;
use tower::ServiceExt;

use super::list::{format_bytes, sanitize_path, ListFilesQuery};

#[derive(Debug, Clone, Deserialize)]
pub struct FileOpRequest {
    pub path: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateFolderRequest {
    pub parent_path: String,
    pub folder_name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SendToTgRequest {
    pub path: String,
    pub caption: Option<String>,
}

pub async fn upload_file(
    Query(query): Query<ListFilesQuery>,
    mut multipart: Multipart,
) -> Json<serde_json::Value> {
    let target_dir = sanitize_path(query.path.as_deref());
    if !target_dir.exists() {
        let _ = fs::create_dir_all(&target_dir);
    }

    let mut uploaded_files = Vec::new();

    while let Ok(Some(mut field)) = multipart.next_field().await {
        let file_name = field
            .file_name()
            .map(|f| f.to_string())
            .unwrap_or_else(|| format!("upload_{}.bin", chrono::Utc::now().timestamp()));

        let save_path = target_dir.join(&file_name);
        match tokio::fs::File::create(&save_path).await {
            Ok(mut file) => {
                let mut bytes_len = 0u64;
                let mut write_err = false;
                while let Ok(Some(chunk)) = field.chunk().await {
                    bytes_len += chunk.len() as u64;
                    if let Err(e) = tokio::io::AsyncWriteExt::write_all(&mut file, &chunk).await {
                        eprintln!("写入文件异常: {}", e);
                        write_err = true;
                        break;
                    }
                }
                if !write_err {
                    uploaded_files.push(json!({
                        "name": file_name,
                        "path": save_path.to_string_lossy().to_string(),
                        "size_bytes": bytes_len,
                        "size_human": format_bytes(bytes_len)
                    }));
                }
            }
            Err(e) => {
                eprintln!("创建上传文件失败 {}: {}", save_path.display(), e);
            }
        }
    }

    Json(json!({
        "success": true,
        "uploaded_count": uploaded_files.len(),
        "files": uploaded_files
    }))
}

pub async fn download_file(Query(query): Query<FileOpRequest>) -> Response {
    let file_path = sanitize_path(Some(&query.path));
    if !file_path.exists() || file_path.is_dir() {
        return (StatusCode::NOT_FOUND, "文件不存在或为目录").into_response();
    }

    let file_name = file_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "download.bin".to_string());

    match tokio::fs::File::open(&file_path).await {
        Ok(file) => {
            let stream = ReaderStream::new(file);
            let body = Body::from_stream(stream);
            let disposition = format!("attachment; filename=\"{}\"", file_name);
            (
                [
                    (header::CONTENT_TYPE, "application/octet-stream"),
                    (header::CONTENT_DISPOSITION, &disposition),
                ],
                body,
            )
                .into_response()
        }
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("读取文件失败: {}", e)).into_response(),
    }
}

pub async fn delete_file(Json(payload): Json<FileOpRequest>) -> Json<serde_json::Value> {
    let p = sanitize_path(Some(&payload.path));
    if !p.exists() || p == PathBuf::from("/") || p == PathBuf::from("/home") || p == PathBuf::from("/root") {
        return Json(json!({"success": false, "error": "文件不存在或禁止删除系统级根目录"}));
    }

    let res = if p.is_dir() {
        fs::remove_dir_all(&p)
    } else {
        fs::remove_file(&p)
    };

    match res {
        Ok(_) => Json(json!({"success": true})),
        Err(e) => Json(json!({"success": false, "error": e.to_string()})),
    }
}

pub async fn create_folder(Json(payload): Json<CreateFolderRequest>) -> Json<serde_json::Value> {
    let parent = sanitize_path(Some(&payload.parent_path));
    let new_folder = parent.join(&payload.folder_name.trim());

    match fs::create_dir_all(&new_folder) {
        Ok(_) => Json(json!({"success": true, "path": new_folder.to_string_lossy().to_string()})),
        Err(e) => Json(json!({"success": false, "error": e.to_string()})),
    }
}

pub async fn send_file_to_tg(Json(payload): Json<SendToTgRequest>) -> Json<serde_json::Value> {
    let p = PathBuf::from(&payload.path);
    if !p.exists() || p.is_dir() {
        return Json(json!({"success": false, "error": "文件不存在或为目录，无法发送"}));
    }

    let caption = payload.caption.unwrap_or_else(|| format!("全网跨端文件传输: {}", p.file_name().unwrap_or_default().to_string_lossy()));

    let output = std::process::Command::new("/Users/hi/niuma/tg_send")
        .arg("--file")
        .arg(&payload.path)
        .arg("--caption")
        .arg(&caption)
        .output();

    match output {
        Ok(out) if out.status.success() => Json(json!({
            "success": true,
            "message": "文件已成功推送到 Telegram",
            "output": String::from_utf8_lossy(&out.stdout).trim().to_string()
        })),
        Ok(out) => Json(json!({
            "success": false,
            "error": format!("发送失败: {}", String::from_utf8_lossy(&out.stderr).trim())
        })),
        Err(e) => Json(json!({
            "success": false,
            "error": format!("执行 tg_send 异常: {}", e)
        })),
    }
}

pub async fn stream_media(
    Query(query): Query<FileOpRequest>,
    req: axum::extract::Request,
) -> Response {
    let file_path = sanitize_path(Some(&query.path));
    if !file_path.exists() || file_path.is_dir() {
        return (StatusCode::NOT_FOUND, "媒体文件不存在或为目录").into_response();
    }
    use tower::ServiceExt;
    let serve_file = tower_http::services::fs::ServeFile::new(&file_path);
    match serve_file.oneshot(req).await {
        Ok(res) => res.into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("媒体流式加载失败: {}", err),
        )
            .into_response(),
    }
}
