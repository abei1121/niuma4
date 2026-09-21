// state.rs - 状态管理模块：账号列表、status.json 读写、冷却判断

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub const ORIGINAL_AGY_PATH: &str = "/Users/hi/.local/bin/agy.real";
pub const BASE_ACCOUNTS_DIR: &str = "/Users/hi/.gemini_accounts";
pub const STATUS_FILE: &str = "/Users/hi/.gemini_accounts/status.json";

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


