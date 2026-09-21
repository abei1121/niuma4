// model.rs - 数据模型：账号状态与探针报告结构体

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AccountStatus {
    pub id: String,
    pub index: usize,
    pub is_active: bool,
    pub has_oauth_token: bool,
    pub oauth_file_size: u64,
    pub is_cooling: bool,
    pub cooling_remaining_seconds: i64,
    pub blocked_until_utc: Option<String>,
    pub blocked_until_local: Option<String>,
    pub status_text: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AccountRotationReport {
    pub timestamp: String,
    pub active_index: usize,
    pub active_account_id: String,
    pub total_accounts: usize,
    pub ready_accounts: usize,
    pub cooling_accounts: usize,
    pub all_ready: bool,
    pub accounts: Vec<AccountStatus>,
}
