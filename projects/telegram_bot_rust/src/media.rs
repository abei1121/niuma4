use anyhow::{anyhow, Result};
use log::info;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::telegram::TgClient;

const DOWNLOAD_DIR: &str = "/tmp/tg_downloads";

pub fn ensure_download_dir() -> Result<()> {
    if !Path::new(DOWNLOAD_DIR).exists() {
        fs::create_dir_all(DOWNLOAD_DIR)?;
    }
    Ok(())
}

pub async fn download_tg_file(
    tg_client: &TgClient,
    file_id: &str,
    suggested_filename: Option<&str>,
    ext_fallback: &str,
) -> Result<String> {
    ensure_download_dir()?;

    let remote_path = tg_client.get_file_path(file_id).await?;
    let file_bytes = tg_client.download_file_bytes(&remote_path).await?;

    let now_ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let final_filename = match suggested_filename {
        Some(name) if !name.trim().is_empty() => format!("{}_{}", now_ts, name.trim()),
        _ => {
            let ext = Path::new(&remote_path)
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or(ext_fallback);
            format!("tg_media_{}.{}", now_ts, ext)
        }
    };

    let target_path = PathBuf::from(DOWNLOAD_DIR).join(&final_filename);
    fs::write(&target_path, file_bytes)?;

    let abs_path = target_path.to_string_lossy().to_string();
    info!("Successfully downloaded TG file to: {}", abs_path);
    Ok(abs_path)
}

pub async fn send_local_file_to_tg(
    tg_client: &TgClient,
    chat_id: i64,
    file_path: &str,
    caption: Option<&str>,
) -> Result<()> {
    let p = Path::new(file_path);
    if !p.exists() {
        return Err(anyhow!("File does not exist: {}", file_path));
    }

    let file_name = p
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "file.bin".to_string());

    let ext = p
        .extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase())
        .unwrap_or_default();

    let file_bytes = fs::read(file_path)?;

    match ext.as_str() {
        "jpg" | "jpeg" | "png" | "webp" => {
            info!("Sending photo to TG chat {}: {}", chat_id, file_path);
            tg_client
                .send_photo(chat_id, file_bytes, &file_name, caption)
                .await
        }
        "ogg" | "oga" => {
            info!("Sending voice to TG chat {}: {}", chat_id, file_path);
            tg_client
                .send_voice(chat_id, file_bytes, &file_name, caption)
                .await
        }
        "mp3" | "m4a" | "wav" | "flac" | "aac" => {
            info!("Sending audio to TG chat {}: {}", chat_id, file_path);
            tg_client
                .send_audio(chat_id, file_bytes, &file_name, caption)
                .await
        }
        "mp4" | "mov" | "mkv" | "avi" | "webm" => {
            info!("Sending video to TG chat {}: {}", chat_id, file_path);
            tg_client
                .send_video(chat_id, file_bytes, &file_name, caption)
                .await
        }
        _ => {
            info!("Sending document to TG chat {}: {}", chat_id, file_path);
            tg_client
                .send_document(chat_id, file_bytes, &file_name, caption)
                .await
        }
    }
}
