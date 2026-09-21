use serde_json::json;
use std::collections::HashMap;
use std::fs;
use std::os::unix::fs::symlink;
use std::path::Path;

pub const ACCOUNTS_BASE_DIR: &str = "/Users/hi/.gemini_accounts";
pub const STATUS_JSON_PATH: &str = "/Users/hi/.gemini_accounts/status.json";
pub const SHARED_DATA_DIR: &str = "/Users/hi/.gemini_accounts/shared_data";

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

pub fn load_status_data() -> (usize, HashMap<String, Option<String>>) {
    let mut map = HashMap::new();
    let mut active_idx = 0;
    if let Ok(content) = fs::read_to_string(STATUS_JSON_PATH) {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
            active_idx = val.get("active_index").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
            if let Some(accs) = val.get("accounts").and_then(|v| v.as_object()) {
                for (k, v) in accs {
                    let b = v.get("blocked_until").and_then(|s| s.as_str()).map(|s| s.to_string());
                    map.insert(k.clone(), b);
                }
            }
        }
    }
    (active_idx, map)
}

pub fn load_raw_status_json() -> serde_json::Value {
    fs::read_to_string(STATUS_JSON_PATH)
        .ok()
        .and_then(|c| serde_json::from_str::<serde_json::Value>(&c).ok())
        .unwrap_or_else(|| json!({"active_index": 0, "accounts": {}}))
}

pub fn save_status_json(val: &serde_json::Value) -> Result<(), std::io::Error> {
    let s = serde_json::to_string_pretty(val).unwrap_or_default();
    fs::write(STATUS_JSON_PATH, s)
}

pub fn setup_account_environment(acc_id: &str) -> Result<String, String> {
    let target_dir = format!("{}/{}", ACCOUNTS_BASE_DIR, acc_id);
    let cli_dir = format!("{}/.gemini/antigravity-cli", target_dir);
    if let Err(e) = fs::create_dir_all(&cli_dir) {
        return Err(format!("Failed to create directory {}: {}", cli_dir, e));
    }

    // Config symlink
    let cfg_src = "/Users/hi/.gemini/config";
    let cfg_dst = format!("{}/.gemini/config", target_dir);
    if !Path::new(&cfg_dst).exists() {
        let _ = symlink(cfg_src, &cfg_dst);
    }

    // Shared data symlinks
    let shared_items = ["brain", "conversations", "conversation_summaries.db", "history.jsonl", "settings.json"];
    for item in shared_items {
        let src = format!("{}/{}", SHARED_DATA_DIR, item);
        let dst = format!("{}/{}", cli_dir, item);
        let _ = fs::remove_file(&dst);
        let _ = fs::remove_dir_all(&dst);
        if Path::new(&src).exists() {
            let _ = symlink(&src, &dst);
        }
    }

    Ok(cli_dir)
}
