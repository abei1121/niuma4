use std::env;
use std::fs;

pub const MODEL_FILE: &str = "/Users/hi/niuma/.gemini_selected_model";
pub const CONV_ID_FILE: &str = "/Users/hi/niuma/.gemini_conv_id";
pub const DEFAULT_MODEL: &str = "Gemini 3.8 Flash (High)";
pub const DEFAULT_BOT_TOKEN: &str = "8844690782:AAGMqwiWvO7pF9tCHfcCco55m5JJTL7deng";
pub const DEFAULT_ALLOWED_USER_ID: i64 = 1826790916;
pub const DEFAULT_PROXY_URL: &str = "";

#[derive(Clone, Debug)]
pub struct Config {
    pub bot_token: String,
    pub allowed_user_id: i64,
    pub proxy_url: String,
}

impl Config {
    pub fn load() -> Self {
        load_dot_env("/Users/hi/niuma/niuma1-main/projects/telegram_bot_rust/.env");
        load_dot_env("/Users/hi/niuma/.env");

        let bot_token = env::var("TELEGRAM_BOT_TOKEN")
            .unwrap_or_else(|_| DEFAULT_BOT_TOKEN.to_string());

        let allowed_user_id = env::var("ALLOWED_USER_ID")
            .ok()
            .and_then(|s| s.parse::<i64>().ok())
            .unwrap_or(DEFAULT_ALLOWED_USER_ID);

        let proxy_url = env::var("HTTP_PROXY")
            .unwrap_or_else(|_| DEFAULT_PROXY_URL.to_string());

        Config {
            bot_token,
            allowed_user_id,
            proxy_url,
        }
    }
}

pub fn load_dot_env(filepath: &str) {
    if let Ok(content) = fs::read_to_string(filepath) {
        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((k, v)) = line.split_once('=') {
                let key = k.trim();
                let val = v.trim().trim_matches(|c| c == '"' || c == '\'');
                if env::var(key).is_err() {
                    env::set_var(key, val);
                }
            }
        }
    }
}

pub fn get_selected_model() -> String {
    if let Ok(data) = fs::read_to_string(MODEL_FILE) {
        let model = data.trim();
        if !model.is_empty() {
            return model.to_string();
        }
    }
    DEFAULT_MODEL.to_string()
}

pub fn set_selected_model(model: &str) -> std::io::Result<()> {
    fs::write(MODEL_FILE, model)
}
