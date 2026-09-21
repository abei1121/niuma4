// prober.rs - 账号物理探测：读取 status.json + 检测 OAuth token 文件

use chrono::{DateTime, Local, Utc};
use std::collections::HashMap;
use std::fs;
use crate::model::{AccountRotationReport, AccountStatus};

pub const ACCOUNTS_BASE_DIR: &str = "/Users/hi/.gemini_accounts";
pub const STATUS_JSON_PATH: &str = "/Users/hi/.gemini_accounts/status.json";

pub fn get_all_account_ids() -> Vec<String> {
    let mut ids = Vec::new();
    if let Ok(entries) = fs::read_dir(ACCOUNTS_BASE_DIR) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with("acc") && name.chars().skip(3).all(|c| c.is_ascii_digit()) {
                        ids.push(name.to_string());
                    }
                }
            }
        }
    }
    ids.sort_by_key(|a| a.chars().skip(3).collect::<String>().parse::<usize>().unwrap_or(0));
    ids
}

pub fn parse_iso_datetime(s: &str) -> Option<DateTime<Utc>> {
    if s == "0001-01-01T00:00:00Z" || s.trim().is_empty() {
        return None;
    }
    if let Ok(dt) = DateTime::parse_from_rfc3339(s) {
        return Some(dt.with_timezone(&Utc));
    }
    None
}

pub fn probe_accounts() -> AccountRotationReport {
    let account_ids = get_all_account_ids();
    let mut active_idx = 0usize;
    let mut blocked_map: HashMap<String, Option<String>> = HashMap::new();

    if let Ok(content) = fs::read_to_string(STATUS_JSON_PATH) {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
            active_idx = val.get("active_index").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
            if let Some(accs) = val.get("accounts").and_then(|v| v.as_object()) {
                for (k, v) in accs {
                    let b = v.get("blocked_until").and_then(|s| s.as_str()).map(|s| s.to_string());
                    blocked_map.insert(k.clone(), b);
                }
            }
        }
    }

    let now_utc = Utc::now();
    let now_str = Local::now().format("%Y-%m-%d %H:%M:%S CST").to_string();
    let mut account_statuses = Vec::new();
    let mut ready_count = 0usize;
    let mut cooling_count = 0usize;

    let active_account_id = if active_idx < account_ids.len() {
        account_ids[active_idx].clone()
    } else {
        format!("acc{}", active_idx + 1)
    };

    for (idx, id) in account_ids.iter().enumerate() {
        let is_active = idx == active_idx;
        // macOS 路径：~/.gemini_accounts/<acc>/.gemini/antigravity-cli/antigravity-oauth-token
        let token_path = format!(
            "{}/{}/.gemini/antigravity-cli/antigravity-oauth-token",
            ACCOUNTS_BASE_DIR, id
        );
        let token_metadata = fs::metadata(&token_path);
        let has_oauth = token_metadata.as_ref().map(|m| m.is_file() && m.len() > 0).unwrap_or(false);
        let oauth_file_size = token_metadata.as_ref().map(|m| m.len()).unwrap_or(0);

        let blocked_raw = blocked_map.get(id).and_then(|o| o.as_deref());
        let (is_cooling, diff_sec, utc_str, local_str, status_text) = match blocked_raw {
            Some(s) if !s.trim().is_empty() && s != "0001-01-01T00:00:00Z" => {
                if let Some(dt) = parse_iso_datetime(s) {
                    if dt > now_utc {
                        let diff = (dt - now_utc).num_seconds();
                        let mins = diff / 60;
                        let secs = diff % 60;
                        let txt = format!("冷却降温中 (剩余 {}分{:02}秒)", mins, secs);
                        let local = dt.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S").to_string();
                        (true, diff, Some(dt.to_rfc3339()), Some(local), txt)
                    } else {
                        (false, 0, None, None, "正常就绪 (冷却已过)".to_string())
                    }
                } else {
                    (false, 0, None, None, "正常就绪".to_string())
                }
            }
            _ => (false, 0, None, None, "正常就绪 (无冷却)".to_string()),
        };

        if is_cooling {
            cooling_count += 1;
        } else {
            ready_count += 1;
        }

        account_statuses.push(AccountStatus {
            id: id.clone(),
            index: idx,
            is_active,
            has_oauth_token: has_oauth,
            oauth_file_size,
            is_cooling,
            cooling_remaining_seconds: diff_sec,
            blocked_until_utc: utc_str,
            blocked_until_local: local_str,
            status_text,
        });
    }

    AccountRotationReport {
        timestamp: now_str,
        active_index: active_idx,
        active_account_id,
        total_accounts: account_ids.len(),
        ready_accounts: ready_count,
        cooling_accounts: cooling_count,
        all_ready: cooling_count == 0,
        accounts: account_statuses,
    }
}
