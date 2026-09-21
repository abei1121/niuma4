use std::collections::HashMap;
use std::fs;
use std::sync::Mutex;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::accounts::identity::get_account_identity;

pub const ACCOUNTS_BASE_DIR: &str = "/Users/hi/.gemini_accounts";
pub const ACCOUNTS_STATUS_FILE: &str = "/Users/hi/.gemini_accounts/status.json";

pub static ACCOUNTS_MUTEX: Mutex<()> = Mutex::new(());

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct AccountStatus {
    #[serde(default)]
    pub blocked_until: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AccountState {
    pub active_index: usize,
    pub accounts: HashMap<String, AccountStatus>,
}

impl Default for AccountState {
    fn default() -> Self {
        let acc_list = get_account_list();
        let mut map = HashMap::new();
        for acc in &acc_list {
            map.insert(acc.clone(), AccountStatus::default());
        }
        AccountState {
            active_index: 0,
            accounts: map,
        }
    }
}

pub fn get_account_list() -> Vec<String> {
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
    if ids.is_empty() {
        ids = vec!["acc1".to_string(), "acc2".to_string(), "acc3".to_string()];
    }
    ids.sort_by_key(|a| a.chars().skip(3).collect::<String>().parse::<usize>().unwrap_or(0));
    ids
}

pub fn load_account_state() -> AccountState {
    let mut state = AccountState::default();
    let acc_list = get_account_list();

    if let Ok(data) = fs::read_to_string(ACCOUNTS_STATUS_FILE) {
        if let Ok(parsed) = serde_json::from_str::<AccountState>(&data) {
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

pub fn save_account_state(state: &AccountState) -> anyhow::Result<()> {
    let json_str = serde_json::to_string_pretty(state)?;
    fs::write(ACCOUNTS_STATUS_FILE, json_str)?;
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

pub fn switch_account(target_str: Option<&str>) -> anyhow::Result<String> {
    let _guard = ACCOUNTS_MUTEX.lock().unwrap();
    let mut state = load_account_state();
    let acc_list = get_account_list();
    let num_accs = acc_list.len();
    if num_accs == 0 {
        return Ok("无可用账号".to_string());
    }

    let mut target_idx: Option<usize> = None;
    if let Some(s) = target_str {
        let clean = s.trim().to_lowercase().replace("acc", "");
        if let Ok(num) = clean.parse::<usize>() {
            if num >= 1 && num <= num_accs {
                target_idx = Some(num - 1);
            }
        }
    }

    let next_idx = match target_idx {
        Some(idx) => idx,
        None => (state.active_index + 1) % num_accs,
    };

    switch_to_index_locked(&mut state, &acc_list, next_idx)
}

pub fn switch_to_account_index(idx: usize) -> anyhow::Result<String> {
    let _guard = ACCOUNTS_MUTEX.lock().unwrap();
    let mut state = load_account_state();
    let acc_list = get_account_list();
    if idx >= acc_list.len() {
        return Ok(format!("指定账号序号 {} 超出范围 (1..{})", idx + 1, acc_list.len()));
    }
    switch_to_index_locked(&mut state, &acc_list, idx)
}

fn switch_to_index_locked(state: &mut AccountState, acc_list: &[String], next_idx: usize) -> anyhow::Result<String> {
    state.active_index = next_idx;
    let acc_key = &acc_list[next_idx];
    state.accounts.insert(acc_key.clone(), AccountStatus { blocked_until: None });

    save_account_state(state)?;
    let (email, name) = get_account_identity(acc_key);
    let id_str = if !email.is_empty() {
        format!(" (`{}` | {})", email, name)
    } else {
        "".to_string()
    };

    Ok(format!(
        "AGY 账号已成功切换为: *账号 {} ({})*{}\n状态: 正常就绪\n从下一次请求开始将强制使用该账号火力管线。",
        next_idx + 1,
        acc_key,
        id_str
    ))
}
