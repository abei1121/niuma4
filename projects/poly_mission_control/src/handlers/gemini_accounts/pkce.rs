use axum::response::Json;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use chrono::{Duration as ChronoDuration, Utc};
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Read;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use super::auth::{fetch_or_read_account_info, ACCOUNTS_BASE_DIR, CLIENT_ID, CLIENT_SECRETS};
use super::fs_ops::{
    get_all_account_ids, load_raw_status_json, save_status_json, setup_account_environment,
};

pub const PKCE_REDIRECT_URI: &str = "https://antigravity.google/oauth-callback";
pub const PKCE_SCOPES: &str = "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs https://www.googleapis.com/auth/aicode openid";

static PENDING_STATES: Mutex<Option<HashMap<String, (String, Instant)>>> = Mutex::new(None);

fn generate_random_bytes(len: usize) -> Vec<u8> {
    let mut buf = vec![0u8; len];
    if let Ok(mut f) = File::open("/dev/urandom") {
        let _ = f.read_exact(&mut buf);
    } else {
        let now = Utc::now().timestamp_nanos_opt().unwrap_or(0);
        for (i, b) in buf.iter_mut().enumerate() {
            *b = ((now >> ((i % 8) * 8)) & 0xFF) as u8;
        }
    }
    buf
}

fn percent_encode(s: &str) -> String {
    let mut encoded = String::new();
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || b == b'-' || b == b'_' || b == b'.' || b == b'~' {
            encoded.push(b as char);
        } else {
            encoded.push_str(&format!("%{:02X}", b));
        }
    }
    encoded
}

pub async fn start_pkce_flow() -> Json<serde_json::Value> {
    let verifier_bytes = generate_random_bytes(32);
    let code_verifier = URL_SAFE_NO_PAD.encode(&verifier_bytes);

    let mut hasher = Sha256::new();
    hasher.update(code_verifier.as_bytes());
    let challenge_bytes = hasher.finalize();
    let code_challenge = URL_SAFE_NO_PAD.encode(challenge_bytes);

    let state_bytes = generate_random_bytes(16);
    let state = URL_SAFE_NO_PAD.encode(&state_bytes);

    // 缓存 state -> code_verifier 映射 (有效期 15 分钟)
    if let Ok(mut lock) = PENDING_STATES.lock() {
        let map = lock.get_or_insert_with(HashMap::new);
        // 清理过期数据
        map.retain(|_, (_, inst)| inst.elapsed() < Duration::from_secs(900));
        map.insert(state.clone(), (code_verifier.clone(), Instant::now()));
    }

    let mut params = Vec::new();
    params.push(("access_type", "offline"));
    params.push(("client_id", CLIENT_ID));
    params.push(("code_challenge", code_challenge.as_str()));
    params.push(("code_challenge_method", "S256"));
    params.push(("prompt", "consent"));
    params.push(("redirect_uri", PKCE_REDIRECT_URI));
    params.push(("response_type", "code"));
    params.push(("scope", PKCE_SCOPES));
    params.push(("state", state.as_str()));

    let query = params
        .into_iter()
        .map(|(k, v)| format!("{}={}", k, percent_encode(v)))
        .collect::<Vec<_>>()
        .join("&");

    let auth_url = format!("https://accounts.google.com/o/oauth2/auth?{}", query);

    Json(json!({
        "success": true,
        "auth_url": auth_url,
        "code_verifier": code_verifier,
        "state": state
    }))
}

#[derive(Debug, Deserialize)]
pub struct ExchangePkceRequest {
    pub id: Option<String>,
    pub name: Option<String>,
    pub code: String,
    pub code_verifier: Option<String>,
    pub state: Option<String>,
}

fn extract_code_and_state(input: &str) -> (String, Option<String>) {
    let trimmed = input.trim();
    let mut code = String::new();
    let mut state = None;

    if trimmed.contains("code=") {
        for part in trimmed.split(['?', '&']) {
            if let Some(c) = part.strip_prefix("code=") {
                code = c.split('&').next().unwrap_or(c).to_string();
            } else if let Some(s) = part.strip_prefix("state=") {
                state = Some(s.split('&').next().unwrap_or(s).to_string());
            }
        }
    } else {
        code = trimmed.to_string();
    }
    (code, state)
}

pub async fn exchange_pkce_code(
    Json(payload): Json<ExchangePkceRequest>,
) -> Json<serde_json::Value> {
    let (raw_code, parsed_state) = extract_code_and_state(&payload.code);
    if raw_code.is_empty() {
        return Json(json!({"success": false, "error": "授权码 (code) 不能为空"}));
    }

    let search_state = parsed_state.or(payload.state);
    let mut resolved_verifier = payload.code_verifier.unwrap_or_default();

    if let Some(ref st) = search_state {
        if let Ok(lock) = PENDING_STATES.lock() {
            if let Some(map) = lock.as_ref() {
                if let Some((v, _)) = map.get(st) {
                    resolved_verifier = v.clone();
                }
            }
        }
    }

    if resolved_verifier.trim().is_empty() {
        return Json(json!({
            "success": false,
            "error": "未检测到有效的 code_verifier。请确保在同一次会话中完成授权，或直接粘贴跳转后的完整网址(包含 state)"
        }));
    }

    let mut builder = Client::builder().timeout(Duration::from_secs(12));
    if let Ok(proxy) = reqwest::Proxy::all("http://127.0.0.1:10809") {
        builder = builder.proxy(proxy);
    }
    let client = builder.build().unwrap_or_default();

    let mut token_data: Option<serde_json::Value> = None;
    let mut last_err = "无法换取 Token".to_string();

    for secret in CLIENT_SECRETS {
        let params = [
            ("client_id", CLIENT_ID),
            ("client_secret", *secret),
            ("code", raw_code.as_str()),
            ("code_verifier", resolved_verifier.trim()),
            ("grant_type", "authorization_code"),
            ("redirect_uri", PKCE_REDIRECT_URI),
        ];

        match client.post("https://oauth2.googleapis.com/token").form(&params).send().await {
            Ok(resp) => {
                let status = resp.status();
                if let Ok(data) = resp.json::<serde_json::Value>().await {
                    if status.is_success() && data.get("refresh_token").is_some() {
                        token_data = Some(data);
                        break;
                    } else {
                        last_err = data.get("error_description")
                            .or_else(|| data.get("error"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("Google 拒绝换取凭据")
                            .to_string();
                    }
                }
            }
            Err(e) => {
                last_err = format!("连接 Google 认证服务失败 (代理可能未就绪): {}", e);
            }
        }
    }

    let token_json_val = match token_data {
        Some(d) => d,
        None => return Json(json!({"success": false, "error": last_err})),
    };

    let all_ids = get_all_account_ids();
    let acc_id = payload
        .id
        .clone()
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| {
            let mut next_num = all_ids.len() + 1;
            while all_ids.contains(&format!("acc{}", next_num)) {
                next_num += 1;
            }
            format!("acc{}", next_num)
        });

    let cli_dir = match setup_account_environment(&acc_id) {
        Ok(dir) => dir,
        Err(e) => return Json(json!({"success": false, "error": e})),
    };

    let expires_in_sec = token_json_val
        .get("expires_in")
        .and_then(|v| v.as_i64())
        .unwrap_or(3600);
    let expiry = Utc::now() + ChronoDuration::seconds(expires_in_sec);

    let standard_token = json!({
        "token": {
            "access_token": token_json_val.get("access_token").unwrap_or(&json!("")),
            "token_type": token_json_val.get("token_type").unwrap_or(&json!("Bearer")),
            "refresh_token": token_json_val.get("refresh_token").unwrap_or(&json!("")),
            "expiry": expiry.to_rfc3339()
        },
        "auth_method": "consumer",
        "id_token": token_json_val.get("id_token").unwrap_or(&json!(""))
    });

    let token_path = format!("{}/antigravity-oauth-token", cli_dir);
    if let Err(e) = fs::write(&token_path, serde_json::to_string_pretty(&standard_token).unwrap_or_default()) {
        return Json(json!({"success": false, "error": format!("写入 Token 失败: {}", e)}));
    }

    let (mut name, email, pic) = fetch_or_read_account_info(&acc_id, &token_path).await;
    if let Some(ref custom_name) = payload.name {
        let trimmed_name = custom_name.trim();
        if !trimmed_name.is_empty() {
            name = Some(trimmed_name.to_string());
            let cache_file = format!("{}/{}/.account_info.json", ACCOUNTS_BASE_DIR, acc_id);
            let mut val: serde_json::Value = fs::read_to_string(&cache_file)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_else(|| json!({}));
            val["name"] = json!(trimmed_name);
            let _ = fs::write(&cache_file, serde_json::to_string_pretty(&val).unwrap_or_default());
        }
    }

    let mut state = load_raw_status_json();
    if let Some(accounts_obj) = state.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        if !accounts_obj.contains_key(&acc_id) {
            accounts_obj.insert(acc_id.clone(), json!({"blocked_until": null}));
        }
    }
    let _ = save_status_json(&state);

    Json(json!({
        "success": true,
        "account_id": acc_id,
        "name": name,
        "email": email,
        "picture": pic,
        "message": format!("账号 [{}] 已成功入库为 {}", email.as_deref().unwrap_or(&acc_id), acc_id)
    }))
}
