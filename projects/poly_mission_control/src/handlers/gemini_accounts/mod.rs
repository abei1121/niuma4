pub mod auth;
pub mod cooling;
pub mod fs_ops;
pub mod ops;
pub mod pkce;
pub mod types;

use axum::response::Json;
use std::path::Path;

pub use auth::fetch_or_read_account_info;
pub use cooling::{
    evaluate_cooling, test_gemini_cooling, unblock_all_gemini_accounts, unblock_gemini_account,
};
pub use fs_ops::{get_all_account_ids, load_status_data, ACCOUNTS_BASE_DIR};
pub use ops::{
    add_gemini_account, remove_gemini_account, switch_gemini_account, update_gemini_account_name,
};
pub use pkce::{exchange_pkce_code, start_pkce_flow};
pub use types::*;

pub async fn list_gemini_accounts() -> Json<Vec<GeminiAccountItem>> {
    let mut list = Vec::new();
    let (active_idx, status_map) = load_status_data();

    let mut acc_ids = get_all_account_ids();
    if acc_ids.is_empty() {
        acc_ids = vec!["acc1".to_string(), "acc2".to_string(), "acc3".to_string()];
    }

    for (idx, acc_id) in acc_ids.iter().enumerate() {
        let is_active = idx == active_idx;
        let blocked = status_map.get(acc_id).and_then(|v| v.as_ref()).cloned();
        let (is_cooling, remaining_secs, blocked_until, blocked_until_local, status_text) =
            evaluate_cooling(blocked.as_deref());

        let acc_dir = format!("{}/{}", ACCOUNTS_BASE_DIR, acc_id);
        let token_path = format!("{}/.gemini/antigravity-cli/antigravity-oauth-token", acc_dir);
        let dir_exists = Path::new(&acc_dir).exists();
        let has_token = Path::new(&token_path).exists();

        let (name, email, picture) = fetch_or_read_account_info(acc_id, &token_path).await;

        list.push(GeminiAccountItem {
            id: acc_id.clone(),
            name,
            email,
            picture,
            is_active,
            is_cooling,
            blocked_until,
            blocked_until_local,
            cooldown_remaining_secs: remaining_secs,
            cooldown_status_text: status_text,
            has_token,
            dir_exists,
        });
    }

    Json(list)
}
