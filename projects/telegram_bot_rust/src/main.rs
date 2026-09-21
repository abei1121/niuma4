mod accounts;
mod config;
mod conv;
mod handlers;
mod media;
mod mingdan;
mod runner;
mod telegram;
mod webhook;

use std::sync::Arc;
use std::time::Duration;
use log::{error, info, warn};
use tokio::time::sleep;

use crate::config::Config;
use crate::handlers::{handle_callback_query, handle_message, HandlerState};
use crate::media::download_tg_file;
use crate::telegram::TgClient;
use crate::webhook::start_proactive_webhook;

#[tokio::main]
async fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let cfg = Config::load();
    info!("Starting Antigravity Telegram Bot (Rust Edition with Dynamic Multi-Account & Multimedia Support)...");

    let tg_client = loop {
        match TgClient::new(cfg.bot_token.clone(), cfg.proxy_url.clone()) {
            Ok(c) => break c,
            Err(e) => {
                error!("Failed to create Telegram client: {}. Retrying in 5 seconds...", e);
                sleep(Duration::from_secs(5)).await;
            }
        }
    };

    info!("Telegram client initialized cleanly with Rust proxy & multimedia support.");

    // 启动 8090 端口 Proactive Webhook (支持文本与多媒体/文件发送)
    let webhook_client = tg_client.clone();
    let allowed_uid = cfg.allowed_user_id;
    tokio::spawn(async move {
        start_proactive_webhook(webhook_client, allowed_uid).await;
    });

    let handler_state = Arc::new(HandlerState::new());
    let mut offset: i64 = 0;

    info!("Entering Telegram Polling loop...");

    loop {
        match tg_client.get_updates(offset, 30).await {
            Ok(updates) => {
                for update in updates {
                    if update.update_id >= offset {
                        offset = update.update_id + 1;
                    }

                    // 处理 Inline Keyboard 按钮点击交互
                    if let Some(query) = update.callback_query {
                        if query.from.id != cfg.allowed_user_id {
                            warn!("Ignored callback query from unauthorized user: {}", query.from.id);
                            continue;
                        }
                        let client_clone = tg_client.clone();
                        tokio::spawn(async move {
                            handle_callback_query(client_clone, query).await;
                        });
                        continue;
                    }

                    let msg = match update.message {
                        Some(m) => m,
                        None => continue,
                    };

                    let user_id = match msg.from.as_ref() {
                        Some(u) => u.id,
                        None => continue,
                    };

                    if user_id != cfg.allowed_user_id {
                        warn!("Ignored message from unauthorized user: {}", user_id);
                        continue;
                    }

                    let caption_str = msg.caption.as_deref().unwrap_or("").trim();

                    // 处理多媒体接收与自动下载
                    let raw_text = if let Some(ref doc) = msg.document {
                        match download_tg_file(&tg_client, &doc.file_id, doc.file_name.as_deref(), "bin").await {
                            Ok(path) => format!(
                                "【命主发送了文件】已自动下载保存至: `{}`\n附带说明: {}\n请查看该文件内容并执行处理。",
                                path, if caption_str.is_empty() { "无" } else { caption_str }
                            ),
                            Err(e) => format!("【命主发送了文件但下载失败】: {}", e),
                        }
                    } else if let Some(ref photos) = msg.photo {
                        let largest_photo = photos.last();
                        if let Some(p) = largest_photo {
                            match download_tg_file(&tg_client, &p.file_id, None, "jpg").await {
                                Ok(path) => format!(
                                    "【命主发送了图片】已自动下载保存至: `{}`\n附带说明: {}\n请查看该图片并分析。",
                                    path, if caption_str.is_empty() { "无" } else { caption_str }
                                ),
                                Err(e) => format!("【命主发送了图片但下载失败】: {}", e),
                            }
                        } else {
                            "【命主发送了空图片】".to_string()
                        }
                    } else if let Some(ref voice) = msg.voice {
                        match download_tg_file(&tg_client, &voice.file_id, None, "ogg").await {
                            Ok(path) => format!("【命主发送了一条语音留言】已下载至: `{}`\n请查验。", path),
                            Err(e) => format!("【语音留言下载失败】: {}", e),
                        }
                    } else if let Some(ref audio) = msg.audio {
                        match download_tg_file(&tg_client, &audio.file_id, audio.file_name.as_deref(), "mp3").await {
                            Ok(path) => format!(
                                "【命主发送了音频文件】已下载至: `{}`\n附带说明: {}\n请查验。",
                                path, if caption_str.is_empty() { "无" } else { caption_str }
                            ),
                            Err(e) => format!("【音频下载失败】: {}", e),
                        }
                    } else if let Some(ref video) = msg.video {
                        match download_tg_file(&tg_client, &video.file_id, video.file_name.as_deref(), "mp4").await {
                            Ok(path) => format!(
                                "【命主发送了视频】已下载至: `{}`\n附带说明: {}\n请查验分析。",
                                path, if caption_str.is_empty() { "无" } else { caption_str }
                            ),
                            Err(e) => format!("【视频下载失败】: {}", e),
                        }
                    } else if let Some(ref t) = msg.text {
                        t.clone()
                    } else {
                        String::new()
                    };

                    let clean_text = raw_text.trim().to_string();
                    if clean_text.is_empty() {
                        continue;
                    }

                    tg_client.send_chat_typing(msg.chat.id).await;

                    let client_clone = tg_client.clone();
                    let proxy_clone = cfg.proxy_url.clone();
                    let state_clone = handler_state.clone();

                    tokio::spawn(async move {
                        handle_message(client_clone, msg, clean_text, proxy_clone, state_clone).await;
                    });
                }
            }
            Err(e) => {
                warn!("Failed to get updates: {}. Reconnecting in 3 seconds...", e);
                sleep(Duration::from_secs(3)).await;
            }
        }
    }
}
