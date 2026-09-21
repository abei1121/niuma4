use axum::response::Json;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;

const ACCOUNTS_FILE: &str = "/Users/hi/niuma/multi_accounts_matrix.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountRecord {
    pub id: String,
    pub label: String,
    pub platform: String, // "Polymarket" | "Predict.fun" | "Dual"
    pub eoa_address: String,
    pub proxy_address: Option<String>,
    pub pol_balance: f64,
    pub usdc_balance: f64,
    pub bnb_balance: f64,
    pub usdt_balance: f64,
    pub is_active: bool,
    pub last_synced_at: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AccountAddRequest {
    pub label: String,
    pub platform: String,
    pub eoa_address: String,
    pub proxy_address: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AccountActionRequest {
    pub id: String,
}

pub async fn get_accounts() -> Json<Vec<AccountRecord>> {
    Json(load_accounts())
}

pub async fn add_account(Json(payload): Json<AccountAddRequest>) -> Json<serde_json::Value> {
    let eoa = payload.eoa_address.trim().to_lowercase();
    if !eoa.starts_with("0x") || eoa.len() != 42 {
        return Json(json!({"success": false, "error": "Invalid EVM EOA address"}));
    }

    let mut accounts = load_accounts();
    let id = format!("acc-{}", Utc::now().timestamp_millis());
    let proxy = payload.proxy_address.filter(|p| !p.trim().is_empty()).map(|p| p.trim().to_string());

    let (pol, usdc, bnb, usdt) = fetch_chain_balances(&eoa, proxy.as_deref()).await;

    let new_acc = AccountRecord {
        id,
        label: payload.label,
        platform: payload.platform,
        eoa_address: eoa,
        proxy_address: proxy,
        pol_balance: pol,
        usdc_balance: usdc,
        bnb_balance: bnb,
        usdt_balance: usdt,
        is_active: true,
        last_synced_at: Some(Utc::now().format("%Y-%m-%d %H:%M:%S").to_string()),
    };

    accounts.push(new_acc);
    save_accounts(&accounts);

    Json(json!({"success": true, "total_accounts": accounts.len()}))
}

pub async fn remove_account(Json(payload): Json<AccountActionRequest>) -> Json<serde_json::Value> {
    let mut accounts = load_accounts();
    accounts.retain(|a| a.id != payload.id);
    save_accounts(&accounts);
    Json(json!({"success": true, "total_accounts": accounts.len()}))
}

pub async fn toggle_account(Json(payload): Json<AccountActionRequest>) -> Json<serde_json::Value> {
    let mut accounts = load_accounts();
    for a in &mut accounts {
        if a.id == payload.id {
            a.is_active = !a.is_active;
        }
    }
    save_accounts(&accounts);
    Json(json!({"success": true, "accounts": accounts}))
}

pub async fn sync_balances() -> Json<serde_json::Value> {
    let mut accounts = load_accounts();
    for a in &mut accounts {
        let (pol, usdc, bnb, usdt) = fetch_chain_balances(&a.eoa_address, a.proxy_address.as_deref()).await;
        a.pol_balance = pol;
        a.usdc_balance = usdc;
        a.bnb_balance = bnb;
        a.usdt_balance = usdt;
        a.last_synced_at = Some(Utc::now().format("%Y-%m-%d %H:%M:%S").to_string());
    }
    save_accounts(&accounts);
    Json(json!({"success": true, "accounts": accounts}))
}

fn load_accounts() -> Vec<AccountRecord> {
    if let Ok(content) = fs::read_to_string(ACCOUNTS_FILE) {
        if let Ok(list) = serde_json::from_str::<Vec<AccountRecord>>(&content) {
            return list;
        }
    }
    vec![
        AccountRecord {
            id: "acc-main-poly".to_string(),
            label: "主操盘矩阵 #1 (Polymarket 旗舰)".to_string(),
            platform: "Polymarket".to_string(),
            eoa_address: "0x2e1c1132C155992Bbe0B2c6996933423688D5530".to_string(),
            proxy_address: Some("0x644928259ec1616d7c27552f4574041A893A95CE".to_string()),
            pol_balance: 12.78,
            usdc_balance: 1.0,
            bnb_balance: 0.0,
            usdt_balance: 0.0,
            is_active: true,
            last_synced_at: Some("2026-08-29 18:42:00".to_string()),
        },
        AccountRecord {
            id: "acc-main-pred".to_string(),
            label: "Predict.fun 专属 #1 (BSC 主链)".to_string(),
            platform: "Predict.fun".to_string(),
            eoa_address: "0x2e1c1132C155992Bbe0B2c6996933423688D5530".to_string(),
            proxy_address: None,
            pol_balance: 0.0,
            usdc_balance: 0.0,
            bnb_balance: 0.00005,
            usdt_balance: 0.0,
            is_active: true,
            last_synced_at: Some("2026-08-29 18:42:00".to_string()),
        }
    ]
}

fn save_accounts(list: &[AccountRecord]) {
    if let Ok(content) = serde_json::to_string_pretty(list) {
        let _ = fs::write(ACCOUNTS_FILE, content);
    }
}

async fn fetch_chain_balances(eoa: &str, _proxy: Option<&str>) -> (f64, f64, f64, f64) {
    let mut clob_usdc = 0.0;
    let client = reqwest::Client::builder()
        .no_proxy()
        .timeout(std::time::Duration::from_millis(1000))
        .build()
        .unwrap_or_default();
    if let Ok(resp) = client.get("http://127.0.0.1:8088/clob").send().await {
        if resp.status().is_success() {
            if let Ok(val) = resp.json::<serde_json::Value>().await {
                if let Some(b) = val.get("balance").and_then(|v| v.as_f64()) {
                    clob_usdc = b;
                }
            }
        }
    }

    let (pol, chain_usdc, bnb, usdt) = tokio::join!(
        query_rpc_balance("https://polygon-bor-rpc.publicnode.com", eoa),
        query_erc20_balance("https://polygon-bor-rpc.publicnode.com", "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", eoa, 6),
        query_rpc_balance("https://bsc-rpc.publicnode.com", eoa),
        query_erc20_balance("https://bsc-rpc.publicnode.com", "0x55d398326f99059fF775485246999027B3197955", eoa, 18)
    );

    let final_usdc = if clob_usdc > 0.0 { clob_usdc } else { chain_usdc };
    (pol, final_usdc, bnb, usdt)
}

async fn query_rpc_balance(rpc: &str, addr: &str) -> f64 {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(1500))
        .build()
        .unwrap_or_default();
    let body = json!({
        "jsonrpc": "2.0",
        "method": "eth_getBalance",
        "params": [addr, "latest"],
        "id": 1
    });
    if let Ok(resp) = client.post(rpc).json(&body).send().await {
        if resp.status().is_success() {
            if let Ok(val) = resp.json::<serde_json::Value>().await {
                if let Some(hex_str) = val.get("result").and_then(|r| r.as_str()) {
                    let clean = hex_str.trim_start_matches("0x");
                    if let Ok(wei) = u128::from_str_radix(clean, 16) {
                        return (wei as f64 / 1e18 * 10000.0).round() / 10000.0;
                    }
                }
            }
        }
    }
    0.0
}

async fn query_erc20_balance(rpc: &str, token_contract: &str, addr: &str, decimals: u32) -> f64 {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_millis(1500))
        .build()
        .unwrap_or_default();
    let clean_addr = addr.trim_start_matches("0x").to_lowercase();
    let data = format!("0x70a08231000000000000000000000000{}", clean_addr);
    let body = json!({
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{"to": token_contract, "data": data}, "latest"],
        "id": 1
    });
    if let Ok(resp) = client.post(rpc).json(&body).send().await {
        if resp.status().is_success() {
            if let Ok(val) = resp.json::<serde_json::Value>().await {
                if let Some(hex_str) = val.get("result").and_then(|r| r.as_str()) {
                    let clean = hex_str.trim_start_matches("0x");
                    if let Ok(amount) = u128::from_str_radix(clean, 16) {
                        let factor = 10f64.powi(decimals as i32);
                        return (amount as f64 / factor * 10000.0).round() / 10000.0;
                    }
                }
            }
        }
    }
    0.0
}
