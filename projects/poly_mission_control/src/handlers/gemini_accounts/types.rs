use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GeminiAccountItem {
    pub id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub picture: Option<String>,
    pub is_active: bool,
    pub is_cooling: bool,
    pub blocked_until: Option<String>,
    pub blocked_until_local: Option<String>,
    pub cooldown_remaining_secs: i64,
    pub cooldown_status_text: String,
    pub has_token: bool,
    pub dir_exists: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AddGeminiAccountRequest {
    pub id: Option<String>,
    pub name: Option<String>,
    pub token_json: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateGeminiNameRequest {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub index: Option<serde_json::Value>,
    pub name: String,
}

impl UpdateGeminiNameRequest {
    pub fn resolve_id(&self, all_ids: &[String]) -> Option<String> {
        if let Some(ref id) = self.id {
            if !id.trim().is_empty() {
                return Some(id.trim().to_lowercase());
            }
        }
        if let Some(ref idx_val) = self.index {
            if let Some(s) = idx_val.as_str() {
                return Some(s.trim().to_lowercase());
            }
            if let Some(n) = idx_val.as_u64() {
                let n = n as usize;
                if n < all_ids.len() {
                    return Some(all_ids[n].clone());
                }
                return Some(format!("acc{}", n + 1));
            }
        }
        None
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct AccountIdRequest {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub index: Option<serde_json::Value>,
}

impl AccountIdRequest {
    pub fn resolve_id(&self, all_ids: &[String]) -> Option<String> {
        if let Some(ref id) = self.id {
            if !id.trim().is_empty() {
                return Some(id.trim().to_lowercase());
            }
        }
        if let Some(ref idx_val) = self.index {
            if let Some(s) = idx_val.as_str() {
                return Some(s.trim().to_lowercase());
            }
            if let Some(n) = idx_val.as_u64() {
                let n = n as usize;
                if n < all_ids.len() {
                    return Some(all_ids[n].clone());
                }
                return Some(format!("acc{}", n + 1));
            }
        }
        None
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct TestCoolingRequest {
    pub id: String,
    pub minutes: Option<i64>,
}

