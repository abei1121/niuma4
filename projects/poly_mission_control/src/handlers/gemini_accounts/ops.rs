use axum::response::Json;
use serde_json::json;
use std::fs;

use super::auth::{fetch_or_read_account_info, normalize_token_json, CLIENT_ID, GOOGLE_AUTH_URL};
use super::fs_ops::{
    get_all_account_ids, load_raw_status_json, save_status_json, setup_account_environment,
    ACCOUNTS_BASE_DIR,
};
use super::types::{AccountIdRequest, AddGeminiAccountRequest, UpdateGeminiNameRequest};

pub async fn add_gemini_account(
    Json(payload): Json<AddGeminiAccountRequest>,
) -> Json<serde_json::Value> {
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

    let mut token_saved = false;
    if let Some(ref raw_token) = payload.token_json {
        if let Some(normalized) = normalize_token_json(raw_token) {
            let token_path = format!("{}/antigravity-oauth-token", cli_dir);
            if fs::write(&token_path, normalized).is_ok() {
                token_saved = true;
                let _ = fetch_or_read_account_info(&acc_id, &token_path).await;
            }
        }
    }

    if let Some(ref custom_name) = payload.name {
        let trimmed_name = custom_name.trim();
        if !trimmed_name.is_empty() {
            let cache_file = format!("{}/{}/.account_info.json", ACCOUNTS_BASE_DIR, acc_id);
            let mut val: serde_json::Value = fs::read_to_string(&cache_file)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_else(|| json!({}));
            val["name"] = json!(trimmed_name);
            if let Ok(c) = serde_json::to_string_pretty(&val) {
                let _ = fs::write(&cache_file, c);
            }
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
        "token_saved": token_saved,
        "message": format!("Gemini 账号 {} 添加并配置成功", acc_id)
    }))
}

pub async fn update_gemini_account_name(
    Json(payload): Json<UpdateGeminiNameRequest>,
) -> Json<serde_json::Value> {
    let acc_ids = get_all_account_ids();
    let acc_id = match payload.resolve_id(&acc_ids) {
        Some(id) => id,
        None => return Json(json!({"success": false, "error": "Account ID or index required"})),
    };
    let cache_file = format!("{}/{}/.account_info.json", ACCOUNTS_BASE_DIR, acc_id);
    let mut val: serde_json::Value = fs::read_to_string(&cache_file)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_else(|| json!({}));
    val["name"] = json!(payload.name.trim());
    if let Ok(content) = serde_json::to_string_pretty(&val) {
        let _ = fs::write(&cache_file, content);
        return Json(json!({"success": true, "id": acc_id, "name": payload.name.trim()}));
    }
    Json(json!({"success": false, "error": "Failed to write account info"}))
}

pub async fn switch_gemini_account(
    Json(payload): Json<AccountIdRequest>,
) -> Json<serde_json::Value> {
    let acc_ids = get_all_account_ids();
    let target_id = match payload.resolve_id(&acc_ids) {
        Some(id) => id,
        None => return Json(json!({"success": false, "error": "Account ID or index required"})),
    };
    if let Some(idx) = acc_ids.iter().position(|x| x == &target_id) {
        let mut state = load_raw_status_json();
        state["active_index"] = json!(idx);
        if let Some(accounts_obj) = state.get_mut("accounts").and_then(|v| v.as_object_mut()) {
            if let Some(acc) = accounts_obj.get_mut(&target_id) {
                acc["blocked_until"] = serde_json::Value::Null;
            }
        }
        let _ = save_status_json(&state);
        return Json(json!({"success": true, "active_index": idx, "active_account": target_id}));
    }
    Json(json!({"success": false, "error": format!("Account ID '{}' not found", target_id)}))
}

pub async fn remove_gemini_account(
    Json(payload): Json<AccountIdRequest>,
) -> Json<serde_json::Value> {
    let acc_ids = get_all_account_ids();
    let target_id = match payload.resolve_id(&acc_ids) {
        Some(id) => id,
        None => return Json(json!({"success": false, "error": "Account ID or index required"})),
    };
    let mut state = load_raw_status_json();
    if let Some(accounts_obj) = state.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        accounts_obj.remove(&target_id);
    }
    let _ = save_status_json(&state);
    Json(json!({"success": true, "removed": target_id}))
}

#[allow(dead_code)]
pub async fn get_oauth_url() -> Json<serde_json::Value> {
    Json(json!({
        "oauth_url": GOOGLE_AUTH_URL,
        "client_id": CLIENT_ID
    }))
}
