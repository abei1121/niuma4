use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct UpdateResponse {
    pub ok: bool,
    pub result: Vec<Update>,
}

#[derive(Deserialize, Debug)]
pub struct Update {
    pub update_id: i64,
    pub message: Option<Message>,
    pub callback_query: Option<CallbackQuery>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Message {
    pub message_id: i32,
    pub from: Option<User>,
    pub chat: Chat,
    pub text: Option<String>,
    pub caption: Option<String>,
    pub photo: Option<Vec<PhotoSize>>,
    pub document: Option<Document>,
    pub voice: Option<Voice>,
    pub audio: Option<Audio>,
    pub video: Option<Video>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct CallbackQuery {
    pub id: String,
    pub from: User,
    pub message: Option<Message>,
    pub data: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct PhotoSize {
    pub file_id: String,
    pub file_size: Option<u64>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Document {
    pub file_id: String,
    pub file_name: Option<String>,
    pub file_size: Option<u64>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Voice {
    pub file_id: String,
    pub file_size: Option<u64>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Audio {
    pub file_id: String,
    pub file_name: Option<String>,
    pub file_size: Option<u64>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Video {
    pub file_id: String,
    pub file_name: Option<String>,
    pub file_size: Option<u64>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct User {
    pub id: i64,
    pub username: Option<String>,
    pub first_name: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Chat {
    pub id: i64,
}

#[derive(Deserialize, Debug)]
pub struct GetFileResponse {
    pub ok: bool,
    pub result: Option<FileInfo>,
}

#[derive(Deserialize, Debug)]
pub struct FileInfo {
    pub file_path: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct InlineKeyboardButton {
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub callback_data: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
}

impl InlineKeyboardButton {
    pub fn callback(text: &str, data: &str) -> Self {
        Self {
            text: text.to_string(),
            callback_data: Some(data.to_string()),
            url: None,
        }
    }

    pub fn link(text: &str, url: &str) -> Self {
        Self {
            text: text.to_string(),
            callback_data: None,
            url: Some(url.to_string()),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct InlineKeyboardMarkup {
    pub inline_keyboard: Vec<Vec<InlineKeyboardButton>>,
}
