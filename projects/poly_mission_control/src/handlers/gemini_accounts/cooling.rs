use axum::response::Json;
use chrono::{DateTime, Local, Utc};
use serde_json::json;

use super::fs_ops::{load_raw_status_json, save_status_json};
use super::types::{AccountIdRequest, TestCoolingRequest};

pub fn parse_iso_datetime(s: &str) -> Option<DateTime<Utc>> {
    if s == "0001-01-01T00:00:00Z" || s.trim().is_empty() {
        return None;
    }
    if let Ok(dt) = DateTime::parse_from_rfc3339(s) {
        return Some(dt.with_timezone(&Utc));
    }
    None
}

pub fn evaluate_cooling(
    blocked: Option<&str>,
) -> (bool, i64, Option<String>, Option<String>, String) {
    let raw_str = match blocked {
        Some(s) if !s.trim().is_empty() && s != "0001-01-01T00:00:00Z" => s,
        _ => return (false, 0, None, None, "正常就绪 (无冷却)".to_string()),
    };

    if let Some(dt_utc) = parse_iso_datetime(raw_str) {
        let now = Utc::now();
        if dt_utc > now {
            let diff = (dt_utc - now).num_seconds();
            let mins = diff / 60;
            let secs = diff % 60;
            let status_text = format!("冷却降温中 (剩余 {}分{:02}秒)", mins, secs);
            let local_str = dt_utc
                .with_timezone(&Local)
                .format("%Y-%m-%d %H:%M:%S")
                .to_string();
            return (
                true,
                diff,
                Some(dt_utc.to_rfc3339()),
                Some(local_str),
                status_text,
            );
        }
    }

    (false, 0, None, None, "正常就绪 (无冷却)".to_string())
}

pub async fn unblock_gemini_account(
    Json(payload): Json<AccountIdRequest>,
) -> Json<serde_json::Value> {
    let acc_ids = crate::handlers::gemini_accounts::fs_ops::get_all_account_ids();
    let target_id = match payload.resolve_id(&acc_ids) {
        Some(id) => id,
        None => return Json(json!({"success": false, "error": "Account ID or index required"})),
    };
    let mut state = load_raw_status_json();
    if let Some(accounts_obj) = state.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        if let Some(acc) = accounts_obj.get_mut(&target_id) {
            acc["blocked_until"] = serde_json::Value::Null;
            let _ = save_status_json(&state);
            return Json(json!({
                "success": true,
                "message": format!("账号 {} 冷却状态已成功解除", target_id)
            }));
        }
    }
    Json(json!({"success": false, "error": format!("Account ID '{}' not found", target_id)}))
}

pub async fn unblock_all_gemini_accounts() -> Json<serde_json::Value> {
    let mut state = load_raw_status_json();
    let mut unblocked_count = 0;
    if let Some(accounts_obj) = state.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        for (_k, v) in accounts_obj.iter_mut() {
            if !v["blocked_until"].is_null() {
                v["blocked_until"] = serde_json::Value::Null;
                unblocked_count += 1;
            }
        }
    }
    let _ = save_status_json(&state);
    Json(json!({
        "success": true,
        "unblocked_count": unblocked_count,
        "message": format!("已成功重置并解除全部 {} 个账号的冷却状态", unblocked_count)
    }))
}

pub async fn test_gemini_cooling(
    Json(payload): Json<TestCoolingRequest>,
) -> Json<serde_json::Value> {
    let mins = payload.minutes.unwrap_or(5).clamp(1, 60);
    let expire_at = Utc::now() + chrono::Duration::minutes(mins);
    let mut state = load_raw_status_json();
    if let Some(accounts_obj) = state.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        let acc_entry = accounts_obj
            .entry(payload.id.clone())
            .or_insert_with(|| json!({}));
        acc_entry["blocked_until"] = json!(expire_at.to_rfc3339());
        let _ = save_status_json(&state);
        return Json(json!({
            "success": true,
            "account": payload.id,
            "blocked_until": expire_at.to_rfc3339(),
            "minutes": mins,
            "message": format!("已为账号 {} 设置 {} 分钟模拟限流冷却", payload.id, mins)
        }));
    }
    Json(json!({"success": false, "error": "Failed to update status.json"}))
}
