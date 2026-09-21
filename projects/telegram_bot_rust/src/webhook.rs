use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::time::{timeout, Duration};
use log::{error, info, warn};

use crate::media::send_local_file_to_tg;
use crate::telegram::TgClient;

pub async fn start_proactive_webhook(tg_client: TgClient, allowed_user_id: i64) {
    let addr = "127.0.0.1:8090";
    let listener = match TcpListener::bind(addr).await {
        Ok(l) => {
            info!("Starting local proactive webhook on {}", addr);
            l
        }
        Err(e) => {
            error!("Failed to bind proactive webhook on {}: {}", addr, e);
            return;
        }
    };

    let client_arc = Arc::new(tg_client);

    loop {
        if let Ok((mut socket, _)) = listener.accept().await {
            let client = client_arc.clone();
            tokio::spawn(async move {
                let mut buf = Vec::new();
                let mut temp = [0u8; 4096];

                // 读取完整 HTTP 请求
                let read_res = timeout(Duration::from_secs(5), async {
                    loop {
                        let n = socket.read(&mut temp).await.unwrap_or(0);
                        if n == 0 {
                            break;
                        }
                        buf.extend_from_slice(&temp[..n]);
                        if let Some(pos) = find_header_end(&buf) {
                            let headers_str = String::from_utf8_lossy(&buf[..pos]);
                            let content_len = parse_content_length(&headers_str);
                            if buf.len() >= pos + 4 + content_len {
                                break;
                            }
                        }
                    }
                }).await;

                if read_res.is_err() && buf.is_empty() {
                    return;
                }

                let req_str = String::from_utf8_lossy(&buf);

                // 1. 发送多媒体/文件路由: /send_tg_file
                if req_str.contains("/send_tg_file") {
                    let (path, caption) = extract_file_params(&req_str);
                    if let Some(p) = path {
                        info!("Webhook requested sending file: {} (caption: {:?})", p, caption);
                        match send_local_file_to_tg(&client, allowed_user_id, &p, caption.as_deref()).await {
                            Ok(_) => {
                                let response = "HTTP/1.1 200 OK\r\nContent-Length: 17\r\n\r\nFILE_SENT_SUCCESS";
                                let _ = socket.write_all(response.as_bytes()).await;
                                return;
                            }
                            Err(e) => {
                                warn!("Failed to send file {}: {}", p, e);
                                let err_body = format!("ERR: {}", e);
                                let response = format!(
                                    "HTTP/1.1 500 Internal Server Error\r\nContent-Length: {}\r\n\r\n{}",
                                    err_body.len(),
                                    err_body
                                );
                                let _ = socket.write_all(response.as_bytes()).await;
                                return;
                            }
                        }
                    }
                }

                // 2. 发送普通文本消息路由: /send_tg
                if let Some(msg_text) = extract_msg_param(&req_str) {
                    let _ = client.send_split_messages(allowed_user_id, &msg_text, None).await;
                    let response = "HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nOK";
                    let _ = socket.write_all(response.as_bytes()).await;
                    return;
                }

                let response = "HTTP/1.1 400 Bad Request\r\nContent-Length: 11\r\n\r\nBad Request";
                let _ = socket.write_all(response.as_bytes()).await;
            });
        }
    }
}

fn find_header_end(buf: &[u8]) -> Option<usize> {
    buf.windows(4).position(|window| window == b"\r\n\r\n")
}

fn parse_content_length(headers: &str) -> usize {
    for line in headers.lines() {
        if line.to_lowercase().starts_with("content-length:") {
            if let Some(len_str) = line.split(':').nth(1) {
                return len_str.trim().parse::<usize>().unwrap_or(0);
            }
        }
    }
    0
}

fn extract_msg_param(req: &str) -> Option<String> {
    if let Some(body_start) = req.find("\r\n\r\n") {
        let body = &req[body_start + 4..];
        for pair in body.split('&') {
            if let Some((k, v)) = pair.split_once('=') {
                if k == "msg" {
                    return Some(urlencoding_decode(v));
                }
            }
        }
    }

    if let Some(first_line) = req.lines().next() {
        if let Some(query_start) = first_line.find("msg=") {
            let query = &first_line[query_start + 4..];
            let raw_val = query.split(&[' ', '&'][..]).next().unwrap_or("");
            if !raw_val.is_empty() {
                return Some(urlencoding_decode(raw_val));
            }
        }
    }
    None
}

fn extract_file_params(req: &str) -> (Option<String>, Option<String>) {
    let mut path = None;
    let mut caption = None;

    if let Some(body_start) = req.find("\r\n\r\n") {
        let body = &req[body_start + 4..];
        for pair in body.split('&') {
            if let Some((k, v)) = pair.split_once('=') {
                if k == "path" || k == "file" {
                    path = Some(urlencoding_decode(v));
                } else if k == "caption" || k == "msg" {
                    caption = Some(urlencoding_decode(v));
                }
            }
        }
    }

    if path.is_none() {
        if let Some(first_line) = req.lines().next() {
            if let Some(q_start) = first_line.find('?') {
                let query = first_line[q_start + 1..].split(' ').next().unwrap_or("");
                for pair in query.split('&') {
                    if let Some((k, v)) = pair.split_once('=') {
                        if k == "path" || k == "file" {
                            path = Some(urlencoding_decode(v));
                        } else if k == "caption" || k == "msg" {
                            caption = Some(urlencoding_decode(v));
                        }
                    }
                }
            }
        }
    }

    (path, caption)
}

fn urlencoding_decode(input: &str) -> String {
    let mut bytes = Vec::new();
    let mut chars = input.bytes();
    while let Some(b) = chars.next() {
        if b == b'%' {
            let hex1 = chars.next().unwrap_or(b'0');
            let hex2 = chars.next().unwrap_or(b'0');
            if let Ok(val) = u8::from_str_radix(
                &format!("{}{}", hex1 as char, hex2 as char),
                16,
            ) {
                bytes.push(val);
            }
        } else if b == b'+' {
            bytes.push(b' ');
        } else {
            bytes.push(b);
        }
    }
    String::from_utf8_lossy(&bytes).to_string()
}
