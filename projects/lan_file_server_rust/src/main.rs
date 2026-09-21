use std::fs::File;
use std::path::{Path, PathBuf};
use tiny_http::{Header, Response, Server, StatusCode};

fn sanitize_path(base: &Path, raw_url: &str) -> Option<PathBuf> {
    let path_str = raw_url.split('?').next().unwrap_or("/");
    let decoded = urlencoding::decode(path_str).ok()?;
    let relative = decoded.trim_start_matches('/');
    let target = base.join(relative);

    if let Ok(canonical) = target.canonicalize() {
        if canonical.starts_with(base) {
            return Some(canonical);
        }
    }
    None
}

fn handle_request(req: tiny_http::Request, base_dir: &Path) {
    let url_str = req.url().to_string();
    let target_path = match sanitize_path(base_dir, &url_str) {
        Some(p) => p,
        None => {
            let _ = req.respond(Response::from_string("404 Not Found").with_status_code(StatusCode(404)));
            return;
        }
    };

    if target_path.is_file() {
        match File::open(&target_path) {
            Ok(file) => {
                let _ = req.respond(Response::from_file(file));
            }
            Err(_) => {
                let _ = req.respond(Response::from_string("500 Internal Error").with_status_code(StatusCode(500)));
            }
        }
    } else if target_path.is_dir() {
        let mut html = String::from("<html><head><meta charset='utf-8'><title>Directory Listing</title></head><body>");
        html.push_str(&format!("<h2>Index of {}</h2><hr><ul>", url_str));

        if let Ok(entries) = std::fs::read_dir(&target_path) {
            let mut items: Vec<_> = entries.filter_map(|e| e.ok()).collect();
            items.sort_by_key(|a| a.file_name());

            for entry in items {
                let file_name = entry.file_name().to_string_lossy().to_string();
                let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
                let display = if is_dir { format!("{}/", file_name) } else { file_name.clone() };
                let link = format!("{}/{}", url_str.trim_end_matches('/'), file_name);
                html.push_str(&format!("<li><a href='{}'>{}</a></li>", link, display));
            }
        }
        html.push_str("</ul><hr></body></html>");
        let header = Header::from_bytes(&b"Content-Type"[..], &b"text/html; charset=utf-8"[..]).unwrap();
        let _ = req.respond(Response::from_string(html).with_header(header));
    } else {
        let _ = req.respond(Response::from_string("404 Not Found").with_status_code(StatusCode(404)));
    }
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let base_path_str = if args.len() > 1 {
        args[1].clone()
    } else {
        "/Users/hi/niuma".to_string()
    };
    let base_dir = PathBuf::from(&base_path_str);
    let server = match Server::http("0.0.0.0:8888") {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Failed to bind server on 0.0.0.0:8888: {}", e);
            std::process::exit(1);
        }
    };

    println!("Listening on 0.0.0.0:8888 serving {}...", base_dir.display());

    for req in server.incoming_requests() {
        handle_request(req, &base_dir);
    }
}
