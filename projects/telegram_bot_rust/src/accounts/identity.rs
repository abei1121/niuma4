use std::fs;
use std::path::Path;
use serde_json::Value;

pub const GOOGLE_CLIENT_ID: &str = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
pub const GOOGLE_CLIENT_SECRET: &str = "YOUR_GOOGLE_CLIENT_SECRET_1";
pub const DEFAULT_REDIRECT_URI: &str = "https://antigravity.google/oauth-callback";
pub const LOCALHOST_REDIRECT_URI: &str = "http://localhost:8085/oauth2callback";

pub const GOOGLE_OAUTH_AUTH_URL: &str = "https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com&prompt=consent&redirect_uri=https%3A%2F%2Fantigravity.google%2Foauth-callback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform";

pub fn get_account_identity(acc_key: &str) -> (String, String) {
    let cache_file = format!("/root/.gemini_accounts/{}/.account_info.json", acc_key);
    if let Ok(data) = fs::read_to_string(&cache_file) {
        if let Ok(val) = serde_json::from_str::<Value>(&data) {
            let email = val.get("email").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let name = val.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
            if !email.is_empty() {
                return (email, name);
            }
        }
    }

    let token_file = format!("/root/.gemini_accounts/{}/.gemini/antigravity-cli/antigravity-oauth-token", acc_key);
    if let Ok(token_data) = fs::read_to_string(&token_file) {
        if let Ok(val) = serde_json::from_str::<Value>(&token_data) {
            let rf = val.get("token")
                .and_then(|t| t.get("refresh_token"))
                .and_then(|r| r.as_str())
                .unwrap_or("");

            if !rf.is_empty() {
                if let Ok((_acc_tok, email, name)) = refresh_token_and_get_info_blocking(rf) {
                    if !email.is_empty() {
                        let _ = fs::write(
                            &cache_file,
                            serde_json::to_string_pretty(&serde_json::json!({
                                "email": email,
                                "name": name,
                            })).unwrap_or_default(),
                        );
                        return (email, name);
                    }
                }
            }
        }
    }

    if Path::new(&token_file).exists() {
        ("已配置凭据".to_string(), "Google Account".to_string())
    } else {
        ("未配置凭据".to_string(), "".to_string())
    }
}

pub fn set_account_name(acc_key: &str, new_name: &str) -> anyhow::Result<()> {
    let cache_file = format!("/root/.gemini_accounts/{}/.account_info.json", acc_key);
    let mut email = String::new();
    if let Ok(data) = fs::read_to_string(&cache_file) {
        if let Ok(val) = serde_json::from_str::<Value>(&data) {
            email = val.get("email").and_then(|v| v.as_str()).unwrap_or("").to_string();
        }
    }
    let json_data = serde_json::json!({
        "email": email,
        "name": new_name,
    });
    fs::write(&cache_file, serde_json::to_string_pretty(&json_data)?)?;
    Ok(())
}

pub fn refresh_token_and_get_info_blocking(refresh_token: &str) -> anyhow::Result<(String, String, String)> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()?;

    let params = [
        ("client_id", GOOGLE_CLIENT_ID),
        ("client_secret", GOOGLE_CLIENT_SECRET),
        ("grant_type", "refresh_token"),
        ("refresh_token", refresh_token),
    ];

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()?;

    if !resp.status().is_success() {
        let err_body = resp.text().unwrap_or_default();
        return Err(anyhow::anyhow!("Google token refresh failed: {}", err_body));
    }

    let token_res: Value = resp.json()?;
    let access_token = token_res
        .get("access_token")
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow::anyhow!("No access_token in Google response"))?
        .to_string();

    let user_resp = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(&access_token)
        .send()?;

    if !user_resp.status().is_success() {
        return Ok((access_token, "Google User".to_string(), "".to_string()));
    }

    let user_info: Value = user_resp.json()?;
    let email = user_info.get("email").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let name = user_info.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();

    Ok((access_token, email, name))
}

pub fn exchange_code_for_tokens(code: &str, redirect_uri: &str) -> anyhow::Result<(String, String, String, String)> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()?;

    let params = [
        ("client_id", GOOGLE_CLIENT_ID),
        ("client_secret", GOOGLE_CLIENT_SECRET),
        ("code", code),
        ("grant_type", "authorization_code"),
        ("redirect_uri", redirect_uri),
    ];

    let resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&params)
        .send()?;

    if !resp.status().is_success() {
        let err_body = resp.text().unwrap_or_default();
        return Err(anyhow::anyhow!("OAuth 授权码兑换失败: {}", err_body));
    }

    let token_res: Value = resp.json()?;
    let access_token = token_res
        .get("access_token")
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow::anyhow!("No access_token in Google response"))?
        .to_string();

    let refresh_token = token_res
        .get("refresh_token")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    if refresh_token.is_empty() {
        return Err(anyhow::anyhow!("Google 未返回 refresh_token（请重新尝试并确保勾选允许离线访问）"));
    }

    let (_, email, name) = refresh_token_and_get_info_blocking(&refresh_token)?;
    Ok((access_token, refresh_token, email, name))
}
