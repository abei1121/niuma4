// operations.rs - 运维操作：解除冷却、切换主账号

use std::fs;
use crate::prober::STATUS_JSON_PATH;

/// 解除指定账号的冷却状态
pub fn unblock_account(account_id: &str) -> Result<String, String> {
    let content = fs::read_to_string(STATUS_JSON_PATH).map_err(|e| e.to_string())?;
    let mut val: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    if let Some(accs) = val.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        if let Some(acc) = accs.get_mut(account_id) {
            acc["blocked_until"] = serde_json::Value::Null;
            let formatted = serde_json::to_string_pretty(&val).map_err(|e| e.to_string())?;
            fs::write(STATUS_JSON_PATH, formatted).map_err(|e| e.to_string())?;
            return Ok(format!("账号 {} 冷却状态已成功解除", account_id));
        }
    }
    Err(format!("未在 status.json 中找到账号 {}", account_id))
}

/// 解除全部账号的冷却状态
pub fn unblock_all() -> Result<String, String> {
    let content = fs::read_to_string(STATUS_JSON_PATH).map_err(|e| e.to_string())?;
    let mut val: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    let mut unblocked_count = 0usize;
    if let Some(accs) = val.get_mut("accounts").and_then(|v| v.as_object_mut()) {
        for (_k, v) in accs.iter_mut() {
            if !v["blocked_until"].is_null() {
                v["blocked_until"] = serde_json::Value::Null;
                unblocked_count += 1;
            }
        }
    }
    let formatted = serde_json::to_string_pretty(&val).map_err(|e| e.to_string())?;
    fs::write(STATUS_JSON_PATH, formatted).map_err(|e| e.to_string())?;
    Ok(format!("已成功解除全部 {} 个账号的冷却状态", unblocked_count))
}

/// 切换主运行激活账号（按 index，0-based）
pub fn switch_active(target_idx: usize) -> Result<String, String> {
    let content = fs::read_to_string(STATUS_JSON_PATH).map_err(|e| e.to_string())?;
    let mut val: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    val["active_index"] = serde_json::json!(target_idx);
    let formatted = serde_json::to_string_pretty(&val).map_err(|e| e.to_string())?;
    fs::write(STATUS_JSON_PATH, formatted).map_err(|e| e.to_string())?;
    Ok(format!("已将主运行账号切换为 index: {} (acc{})", target_idx, target_idx + 1))
}
