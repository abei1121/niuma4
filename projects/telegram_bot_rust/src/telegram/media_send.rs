use reqwest::multipart::{Form, Part};
use reqwest::Client;
use anyhow::Result;

pub async fn send_document(
    client: &Client,
    bot_token: &str,
    chat_id: i64,
    file_bytes: Vec<u8>,
    file_name: &str,
    caption: Option<&str>,
) -> Result<()> {
    let url = format!("https://api.telegram.org/bot{}/sendDocument", bot_token);
    let mut form = Form::new()
        .text("chat_id", chat_id.to_string())
        .part("document", Part::bytes(file_bytes).file_name(file_name.to_string()));
    if let Some(cap) = caption {
        form = form.text("caption", cap.to_string());
    }
    let resp = client.post(&url).multipart(form).send().await?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("sendDocument error: {}", resp.text().await.unwrap_or_default()))
    }
}

pub async fn send_photo(
    client: &Client,
    bot_token: &str,
    chat_id: i64,
    file_bytes: Vec<u8>,
    file_name: &str,
    caption: Option<&str>,
) -> Result<()> {
    let url = format!("https://api.telegram.org/bot{}/sendPhoto", bot_token);
    let mut form = Form::new()
        .text("chat_id", chat_id.to_string())
        .part("photo", Part::bytes(file_bytes).file_name(file_name.to_string()));
    if let Some(cap) = caption {
        form = form.text("caption", cap.to_string());
    }
    let resp = client.post(&url).multipart(form).send().await?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("sendPhoto error: {}", resp.text().await.unwrap_or_default()))
    }
}

pub async fn send_voice(
    client: &Client,
    bot_token: &str,
    chat_id: i64,
    file_bytes: Vec<u8>,
    file_name: &str,
    caption: Option<&str>,
) -> Result<()> {
    let url = format!("https://api.telegram.org/bot{}/sendVoice", bot_token);
    let mut form = Form::new()
        .text("chat_id", chat_id.to_string())
        .part("voice", Part::bytes(file_bytes).file_name(file_name.to_string()));
    if let Some(cap) = caption {
        form = form.text("caption", cap.to_string());
    }
    let resp = client.post(&url).multipart(form).send().await?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("sendVoice error: {}", resp.text().await.unwrap_or_default()))
    }
}

pub async fn send_audio(
    client: &Client,
    bot_token: &str,
    chat_id: i64,
    file_bytes: Vec<u8>,
    file_name: &str,
    caption: Option<&str>,
) -> Result<()> {
    let url = format!("https://api.telegram.org/bot{}/sendAudio", bot_token);
    let mut form = Form::new()
        .text("chat_id", chat_id.to_string())
        .part("audio", Part::bytes(file_bytes).file_name(file_name.to_string()));
    if let Some(cap) = caption {
        form = form.text("caption", cap.to_string());
    }
    let resp = client.post(&url).multipart(form).send().await?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("sendAudio error: {}", resp.text().await.unwrap_or_default()))
    }
}

pub async fn send_video(
    client: &Client,
    bot_token: &str,
    chat_id: i64,
    file_bytes: Vec<u8>,
    file_name: &str,
    caption: Option<&str>,
) -> Result<()> {
    let url = format!("https://api.telegram.org/bot{}/sendVideo", bot_token);
    let mut form = Form::new()
        .text("chat_id", chat_id.to_string())
        .part("video", Part::bytes(file_bytes).file_name(file_name.to_string()));
    if let Some(cap) = caption {
        form = form.text("caption", cap.to_string());
    }
    let resp = client.post(&url).multipart(form).send().await?;
    if resp.status().is_success() {
        Ok(())
    } else {
        Err(anyhow::anyhow!("sendVideo error: {}", resp.text().await.unwrap_or_default()))
    }
}
