use axum::http::{header, StatusCode, Uri};
use axum::response::{IntoResponse, Response};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "web_frontend/dist/"]
struct Asset;

pub async fn serve_static_asset(uri: Uri) -> Response {
    let mut path = uri.path().trim_start_matches('/').to_string();
    if path.is_empty() {
        path = "index.html".to_string();
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

            // SPA fallback to index.html
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

