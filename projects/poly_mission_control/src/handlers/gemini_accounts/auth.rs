use reqwest::Client;
use serde_json::json;
use std::fs;
use std::path::Path;
use std::time::Duration;

pub const ACCOUNTS_BASE_DIR: &str = "/Users/hi/.gemini_accounts";
pub const CLIENT_ID: &str = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
pub const CLIENT_SECRETS: &[&str] = &[
    "YOUR_GOOGLE_CLIENT_SECRET_1",
    "YOUR_GOOGLE_CLIENT_SECRET_2",
];
#[allow(dead_code)]
pub const GOOGLE_AUTH_URL: &str = "https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com&prompt=consent&redirect_uri=https%3A%2F%2Fantigravity.google%2Foauth-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform";

pub fn normalize_token_json(raw: &str) -> Option<String> {
    let trimmed = raw.trim();
    if trimmed.is_empty() {
        return None;
    }

    if trimmed.starts_with('{') {
        if let Ok(mut val) = serde_json::from_str::<serde_json::Value>(trimmed) {
            if val.get("token").is_some() {
                if val.get("auth_method").is_none() {
                    val["auth_method"] = json!("consumer");
                }
                return serde_json::to_string_pretty(&val).ok();
            } else if val.get("refresh_token").is_some() || val.get("access_token").is_some() {
                let wrapper = json!({
                    "token": val,
                    "auth_method": "consumer"
                });
                return serde_json::to_string_pretty(&wrapper).ok();
            }
        }
    }

    // Treat as raw refresh_token string
    let wrapper = json!({
        "token": {
            "access_token": "",
            "refresh_token": trimmed,
            "token_type": "Bearer",
            "expiry": "0001-01-01T00:00:00Z"
        },
        "auth_method": "consumer"
    });
    serde_json::to_string_pretty(&wrapper).ok()
}

pub async fn fetch_or_read_account_info(
    acc_id: &str,
    token_path: &str,
) -> (Option<String>, Option<String>, Option<String>) {
    let cache_file = format!("{}/{}/.account_info.json", ACCOUNTS_BASE_DIR, acc_id);
    if let Ok(data) = fs::read_to_string(&cache_file) {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&data) {
            let name = val.get("name").and_then(|v| v.as_str()).map(|s| s.to_string());
            let email = val.get("email").and_then(|v| v.as_str()).map(|s| s.to_string());
            let pic = val.get("picture").and_then(|v| v.as_str()).map(|s| s.to_string());
            if email.is_some() || name.is_some() {
                return (name, email, pic);
            }
        }
    }

    if !Path::new(token_path).exists() {
        return (None, None, None);
    }

    let token_content = match fs::read_to_string(token_path) {
        Ok(c) => c,
        Err(_) => return (None, None, None),
    };

    let token_val: serde_json::Value = match serde_json::from_str(&token_content) {
        Ok(v) => v,
        Err(_) => return (None, None, None),
    };

    let mut builder = Client::builder().timeout(Duration::from_secs(8));
    if let Ok(proxy) = reqwest::Proxy::all("http://127.0.0.1:10809") {
        builder = builder.proxy(proxy);
    }
    let client = builder.build().unwrap_or_default();
    let access_token = token_val
        .pointer("/token/access_token")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    if !access_token.is_empty() {
        if let Ok(resp) = client
            .get("https://www.googleapis.com/oauth2/v3/userinfo")
            .bearer_auth(access_token)
            .send()
            .await
        {
            if resp.status().is_success() {
                if let Ok(uinfo) = resp.json::<serde_json::Value>().await {
                    let name = uinfo.get("name").and_then(|v| v.as_str()).map(|s| s.to_string());
                    let email = uinfo.get("email").and_then(|v| v.as_str()).map(|s| s.to_string());
                    let pic = uinfo.get("picture").and_then(|v| v.as_str()).map(|s| s.to_string());
                    let _ = fs::write(&cache_file, serde_json::to_string_pretty(&uinfo).unwrap_or_default());
                    return (name, email, pic);
                }
            }
        }
    }

    let refresh_token = token_val
        .pointer("/token/refresh_token")
        .and_then(|v| v.as_str())
        .unwrap_or_default();
    if refresh_token.is_empty() {
        return (None, None, None);
    }

    for secret in CLIENT_SECRETS {
        let params = [
            ("client_id", CLIENT_ID),
            ("client_secret", *secret),
            ("grant_type", "refresh_token"),
            ("refresh_token", refresh_token),
        ];
        if let Ok(ref_resp) = client.post("https://oauth2.googleapis.com/token").form(&params).send().await {
            if ref_resp.status().is_success() {
                if let Ok(ref_data) = ref_resp.json::<serde_json::Value>().await {
                    if let Some(new_tok) = ref_data.get("access_token").and_then(|v| v.as_str()) {
                        if let Ok(u_resp) = client
                            .get("https://www.googleapis.com/oauth2/v3/userinfo")
                            .bearer_auth(new_tok)
                            .send()
                            .await
                        {
                            if u_resp.status().is_success() {
                                if let Ok(uinfo) = u_resp.json::<serde_json::Value>().await {
                                    let name = uinfo.get("name").and_then(|v| v.as_str()).map(|s| s.to_string());
                                    let email = uinfo.get("email").and_then(|v| v.as_str()).map(|s| s.to_string());
                                    let pic = uinfo.get("picture").and_then(|v| v.as_str()).map(|s| s.to_string());
                                    let _ = fs::write(&cache_file, serde_json::to_string_pretty(&uinfo).unwrap_or_default());
                                    return (name, email, pic);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    (None, None, None)
}
