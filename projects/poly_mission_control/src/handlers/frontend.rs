use axum::http::{header, StatusCode, Uri};
use axum::response::{IntoResponse, Response};
use rust_embed::RustEmbed;
use std::path::Path;

#[derive(RustEmbed)]
#[folder = "web_frontend/dist/"]
struct Asset;

pub async fn serve_static_asset(uri: Uri) -> Response {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
    }

    // 1. 优先从本地磁盘 dist 目录读取（支持前端热更新，编译后无需重编或重启 Rust 二进制）
    let disk_base = Path::new("/Users/hi/niuma/niuma1-main/projects/poly_mission_control/web_frontend/dist");
    let disk_file = disk_base.join(&path);
    if disk_file.is_file() {
        if let Ok(bytes) = tokio::fs::read(&disk_file).await {
            let mime = mime_guess::from_path(&path).first_or_octet_stream();
            return (
                [
                    (header::CONTENT_TYPE, mime.as_ref()),
                    (header::CACHE_CONTROL, "no-cache, no-store, must-revalidate"),
                ],
                bytes,
            )
                .into_response();
        }
    }

    match Asset::get(&path) {
        Some(content) => {
            let mime = mime_guess::from_path(&path).first_or_octet_stream();
            (
                [
                    (header::CONTENT_TYPE, mime.as_ref()),
                    (header::CACHE_CONTROL, "no-cache, no-store, must-revalidate"),
                ],
                content.data,
            )
                .into_response()
        }
        None => {
            // 严禁对 /api/ 请求执行 SPA fallback，必须返回标准 JSON 404
            if uri.path().starts_with("/api/") {
                return (
                    StatusCode::NOT_FOUND,
                    [(header::CONTENT_TYPE, "application/json; charset=utf-8")],
                    serde_json::json!({
                        "error": "API route not found",
                        "status": 404,
                        "path": uri.path()
                    }).to_string(),
                ).into_response();
            }

            // SPA fallback to index.html (磁盘优先)
            let disk_index = disk_base.join("index.html");
            if disk_index.is_file() {
                if let Ok(bytes) = tokio::fs::read(&disk_index).await {
                    return (
                        [
                            (header::CONTENT_TYPE, "text/html; charset=utf-8"),
                            (header::CACHE_CONTROL, "no-cache, no-store, must-revalidate"),
                        ],
                        bytes,
                    )
                        .into_response();
                }
            }

            // SPA fallback to index.html (内嵌回退)
            match Asset::get("index.html") {
                Some(content) => (
                    [
                        (header::CONTENT_TYPE, "text/html; charset=utf-8"),
                        (header::CACHE_CONTROL, "no-cache, no-store, must-revalidate"),
                    ],
                    content.data,
                )
                    .into_response(),
                None => (StatusCode::NOT_FOUND, "404 Not Found").into_response(),
            }
        }
    }
}

pub async fn serve_dashboard(uri: Uri) -> Response {
    serve_static_asset(uri).await
}

