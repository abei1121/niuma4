// state.rs - 状态管理模块：账号列表、status.json 读写、冷却判断

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub const ORIGINAL_AGY_PATH: &str = "/Users/hi/.local/bin/agy.real";
pub const BASE_ACCOUNTS_DIR: &str = "/Users/hi/.gemini_accounts";
pub const STATUS_FILE: &str = "/Users/hi/.gemini_accounts/status.json";
pub const OAUTH_HELPER_PATH: &str = "/Users/hi/niuma/bin/gemini_oauth_flow";

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct AccountStatus {
    #[serde(default)]
    pub blocked_until: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct State {
    pub active_index: usize,
    pub accounts: HashMap<String, AccountStatus>,
}

pub fn get_account_list() -> Vec<String> {
    let mut ids = Vec::new();
    if let Ok(entries) = fs::read_dir(BASE_ACCOUNTS_DIR) {
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
    if ids.is_empty() {
        ids = vec!["acc1".to_string(), "acc2".to_string(), "acc3".to_string()];
    }
    ids.sort_by_key(|a| a.chars().skip(3).collect::<String>().parse::<usize>().unwrap_or(0));
    ids
}

pub fn load_state() -> State {
    let acc_list = get_account_list();
    let mut map = HashMap::new();
    for acc in &acc_list {
        map.insert(acc.clone(), AccountStatus::default());
    }
    let mut state = State {
        active_index: 0,
        accounts: map,
    };

    if let Ok(data) = fs::read_to_string(STATUS_FILE) {
        if let Ok(parsed) = serde_json::from_str::<State>(&data) {
            state.active_index = parsed.active_index;
            for (k, v) in parsed.accounts {
                state.accounts.insert(k, v);
            }
        }
    }

    for acc in &acc_list {
        state.accounts.entry(acc.clone()).or_insert_with(AccountStatus::default);
    }

    if !acc_list.is_empty() && state.active_index >= acc_list.len() {
        state.active_index = 0;
    }

    state
}

pub fn save_state(state: &State) -> anyhow::Result<()> {
    let json_str = serde_json::to_string_pretty(state)?;
    fs::write(STATUS_FILE, json_str)?;
    Ok(())
}

pub fn is_account_blocked(status: &AccountStatus) -> bool {
    if let Some(ref b) = status.blocked_until {
        if b == "0001-01-01T00:00:00Z" || b.is_empty() {
            return false;
        }
        if let Ok(dt) = DateTime::parse_from_rfc3339(b) {
            return dt.with_timezone(&Utc) > Utc::now();
        }
    }
    false
}

pub fn account_has_gemini_config(acc_name: &str) -> bool {
    let p = Path::new(BASE_ACCOUNTS_DIR).join(acc_name).join(".gemini");
    p.exists()
}

/// 按需惰性检查账号 Token 剩余有效期。若已过期或剩余不足 5 分钟，调用 OAuth 工具单账号静默刷新
pub fn ensure_account_token_fresh(acc_name: &str) {
    let token_file = Path::new(BASE_ACCOUNTS_DIR)
        .join(acc_name)
        .join(".gemini")
        .join("antigravity-cli")
        .join("antigravity-oauth-token");

    if !token_file.exists() {
        return;
    }

    let mut needs_refresh = false;
    if let Ok(data) = fs::read_to_string(&token_file) {
        if let Ok(v) = serde_json::from_str::<serde_json::Value>(&data) {
            if let Some(exp_str) = v.get("token").and_then(|t| t.get("expiry")).and_then(|e| e.as_str()) {
                if let Ok(dt) = DateTime::parse_from_rfc3339(exp_str) {
                    let now = Utc::now();
                    let rem = (dt.with_timezone(&Utc) - now).num_seconds();
                    if rem <= 300 {
                        needs_refresh = true;
                    }
                } else {
                    needs_refresh = true;
                }
            } else {
                needs_refresh = true;
            }
        }
    }

    if needs_refresh {
        eprintln!("[agy_wrapper] 账号 {} Token 即将过期或已失效，按需惰性刷新中...", acc_name);
        let status = std::process::Command::new("/usr/bin/python3")
            .arg(OAUTH_HELPER_PATH)
            .arg("refresh")
            .arg(acc_name)
            .status();
        match status {
            Ok(s) if s.success() => {
                eprintln!("[agy_wrapper] 账号 {} Token 刷新就绪", acc_name);
            }
            _ => {
                eprintln!("[agy_wrapper] 警告: 账号 {} 惰性刷新失败，将尝试直接调用", acc_name);
            }
        }
    }
}

