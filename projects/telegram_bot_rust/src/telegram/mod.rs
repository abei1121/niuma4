pub mod media_send;
pub mod types;

pub use types::*;

use reqwest::{Client, Proxy};
use serde::Serialize;
use std::time::Duration;
use log::warn;
use anyhow::Result;

#[derive(Clone)]
pub struct TgClient {
    client: Client,
    bot_token: String,
}

#[derive(Serialize)]
struct SendMessagePayload {
    chat_id: i64,
    text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    reply_to_message_id: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    parse_mode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    reply_markup: Option<InlineKeyboardMarkup>,
}

#[derive(Serialize)]
struct EditMessagePayload {
    chat_id: i64,
    message_id: i32,
    text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    parse_mode: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    reply_markup: Option<InlineKeyboardMarkup>,
}

#[derive(Serialize)]
struct AnswerCallbackQueryPayload {
    callback_query_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    show_alert: Option<bool>,
}

#[derive(Serialize)]
struct SendChatActionPayload {
    chat_id: i64,
    action: String,
}

impl TgClient {
    pub fn new(bot_token: String, proxy_url: String) -> Result<Self> {
        let mut builder = Client::builder().timeout(Duration::from_secs(60));
        if !proxy_url.is_empty() {
            if let Ok(proxy) = Proxy::all(&proxy_url) {
                builder = builder.proxy(proxy);
            }
        }
        let client = builder.build()?;
        Ok(TgClient { client, bot_token })
    }

    pub async fn get_updates(&self, offset: i64, timeout: u64) -> Result<Vec<Update>> {
        let url = format!(
            "https://api.telegram.org/bot{}/getUpdates?offset={}&timeout={}",
            self.bot_token, offset, timeout
        );
        let resp = self.client.get(&url).send().await?.json::<UpdateResponse>().await?;
        if resp.ok {
            Ok(resp.result)
        } else {
            Err(anyhow::anyhow!("Telegram API getUpdates returned false ok"))
        }
    }

    pub async fn send_chat_typing(&self, chat_id: i64) {
        let url = format!("https://api.telegram.org/bot{}/sendChatAction", self.bot_token);
        let payload = SendChatActionPayload {
            chat_id,
            action: "typing".to_string(),
        };
        let _ = self.client.post(&url).json(&payload).send().await;
    }

    pub async fn get_file_path(&self, file_id: &str) -> Result<String> {
        let url = format!("https://api.telegram.org/bot{}/getFile?file_id={}", self.bot_token, file_id);
        let resp = self.client.get(&url).send().await?.json::<GetFileResponse>().await?;
        if resp.ok {
            if let Some(info) = resp.result {
                if let Some(path) = info.file_path {
                    return Ok(path);
                }
            }
        }
        Err(anyhow::anyhow!("Failed to retrieve file path for file_id: {}", file_id))
    }

    pub async fn download_file_bytes(&self, remote_file_path: &str) -> Result<Vec<u8>> {
        let url = format!("https://api.telegram.org/file/bot{}/{}", self.bot_token, remote_file_path);
        let bytes = self.client.get(&url).send().await?.bytes().await?;
        Ok(bytes.to_vec())
    }

    pub async fn send_message(
        &self,
        chat_id: i64,
        text: &str,
        reply_to_msg_id: Option<i32>,
        parse_mode: Option<&str>,
    ) -> Result<()> {
        self.send_message_with_markup(chat_id, text, reply_to_msg_id, parse_mode, None).await
    }

    pub async fn send_message_with_markup(
        &self,
        chat_id: i64,
        text: &str,
        reply_to_msg_id: Option<i32>,
        parse_mode: Option<&str>,
        reply_markup: Option<InlineKeyboardMarkup>,
    ) -> Result<()> {
        let url = format!("https://api.telegram.org/bot{}/sendMessage", self.bot_token);
        let payload = SendMessagePayload {
            chat_id,
            text: text.to_string(),
            reply_to_message_id: reply_to_msg_id,
            parse_mode: parse_mode.map(|s| s.to_string()),
            reply_markup,
        };
        let resp = self.client.post(&url).json(&payload).send().await?;
        if resp.status().is_success() {
            Ok(())
        } else {
            let body = resp.text().await.unwrap_or_default();
            Err(anyhow::anyhow!("Send message error: {}", body))
        }
    }

    pub async fn edit_message_text(
        &self,
        chat_id: i64,
        message_id: i32,
        text: &str,
        parse_mode: Option<&str>,
        reply_markup: Option<InlineKeyboardMarkup>,
    ) -> Result<()> {
        let url = format!("https://api.telegram.org/bot{}/editMessageText", self.bot_token);
        let payload = EditMessagePayload {
            chat_id,
            message_id,
            text: text.to_string(),
            parse_mode: parse_mode.map(|s| s.to_string()),
            reply_markup,
        };
        let resp = self.client.post(&url).json(&payload).send().await?;
        if resp.status().is_success() {
            Ok(())
        } else {
            let body = resp.text().await.unwrap_or_default();
            Err(anyhow::anyhow!("Edit message error: {}", body))
        }
    }

    pub async fn answer_callback_query(
        &self,
        callback_query_id: &str,
        text: Option<&str>,
        show_alert: bool,
    ) -> Result<()> {
        let url = format!("https://api.telegram.org/bot{}/answerCallbackQuery", self.bot_token);
        let payload = AnswerCallbackQueryPayload {
            callback_query_id: callback_query_id.to_string(),
            text: text.map(|s| s.to_string()),
            show_alert: if show_alert { Some(true) } else { None },
        };
        let _ = self.client.post(&url).json(&payload).send().await;
        Ok(())
    }

    pub async fn send_split_messages(
        &self,
        chat_id: i64,
        text: &str,
        reply_to_msg_id: Option<i32>,
    ) {
        const MAX_LEN: usize = 4000;
        if text.len() <= MAX_LEN {
            if let Err(e) = self.send_message(chat_id, text, reply_to_msg_id, Some("Markdown")).await {
                warn!("Failed to send markdown message: {}. Retrying plain text.", e);
                let _ = self.send_message(chat_id, text, reply_to_msg_id, None).await;
            }
            return;
        }

        let mut chunks = Vec::new();
        let mut current_chunk = String::new();

        for line in text.lines() {
            if current_chunk.len() + line.len() + 1 > MAX_LEN {
                chunks.push(current_chunk.clone());
                current_chunk.clear();
            }
            if !current_chunk.is_empty() {
                current_chunk.push('\n');
            }
            current_chunk.push_str(line);
        }
        if !current_chunk.is_empty() {
            chunks.push(current_chunk);
        }

        for (i, chunk) in chunks.iter().enumerate() {
            let reply_id = if i == 0 { reply_to_msg_id } else { None };
            if let Err(_) = self.send_message(chat_id, chunk, reply_id, Some("Markdown")).await {
                let _ = self.send_message(chat_id, chunk, reply_id, None).await;
            }
            tokio::time::sleep(Duration::from_millis(200)).await;
        }
    }

    pub async fn send_document(&self, chat_id: i64, bytes: Vec<u8>, name: &str, cap: Option<&str>) -> Result<()> {
        media_send::send_document(&self.client, &self.bot_token, chat_id, bytes, name, cap).await
    }

    pub async fn send_photo(&self, chat_id: i64, bytes: Vec<u8>, name: &str, cap: Option<&str>) -> Result<()> {
        media_send::send_photo(&self.client, &self.bot_token, chat_id, bytes, name, cap).await
    }

    pub async fn send_voice(&self, chat_id: i64, bytes: Vec<u8>, name: &str, cap: Option<&str>) -> Result<()> {
        media_send::send_voice(&self.client, &self.bot_token, chat_id, bytes, name, cap).await
    }

    pub async fn send_audio(&self, chat_id: i64, bytes: Vec<u8>, name: &str, cap: Option<&str>) -> Result<()> {
        media_send::send_audio(&self.client, &self.bot_token, chat_id, bytes, name, cap).await
    }

    pub async fn send_video(&self, chat_id: i64, bytes: Vec<u8>, name: &str, cap: Option<&str>) -> Result<()> {
        media_send::send_video(&self.client, &self.bot_token, chat_id, bytes, name, cap).await
    }
}
