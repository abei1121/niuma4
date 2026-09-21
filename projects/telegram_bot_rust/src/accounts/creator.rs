use std::fs;
use std::os::unix::fs::symlink;
use std::path::Path;
use serde_json::Value;

use crate::accounts::identity::{
    exchange_code_for_tokens, refresh_token_and_get_info_blocking, DEFAULT_REDIRECT_URI,
    GOOGLE_OAUTH_AUTH_URL, LOCALHOST_REDIRECT_URI,
};
use crate::accounts::state::{
    get_account_list, load_account_state, save_account_state, ACCOUNTS_BASE_DIR, ACCOUNTS_MUTEX,
};

pub struct AddAccountResult {
    pub acc_key: String,
    pub index: usize,
    pub email: String,
    pub name: String,
    pub total_count: usize,
}

pub fn get_next_account_slot() -> (String, usize) {
    let list = get_account_list();
    let mut max_idx = 0;
    for acc in &list {
        let num_str = acc.trim_start_matches("acc");
        if let Ok(n) = num_str.parse::<usize>() {
            if n > max_idx {
                max_idx = n;
            }
        }
    }
    let next_num = max_idx + 1;
    (format!("acc{}", next_num), next_num)
}

pub fn generate_auth_instructions(next_slot: &str) -> (String, String) {
    let next_num = next_slot.trim_start_matches("acc");
    let mut s = String::new();
    s.push_str(&format!("➕ *添加新 Gemini 账号到动态轮换池*\n\n"));
    s.push_str(&format!("即将分配账号槽位: *{} (账号 {})*\n\n", next_slot, next_num));
    s.push_str("【方式 1：一键点击网页授权（推荐）】\n");
    s.push_str("1. 点击下方「🌐 打开 Google 登录授权页面」按钮完成登录；\n");
    s.push_str("2. 授权完成后，将浏览器地址栏跳转的 URL（包含 `code=`）或复制的 `4/0A...` 授权码直接发送到本对话；\n");
    s.push_str("3. 系统全自动兑换凭据并秒级加入动态轮换池！\n\n");
    s.push_str("【方式 2：直接发送 Token 凭据】\n");
    s.push_str("直接将 `refresh_token`（以 `1//0` 开头）或 `antigravity-oauth-token` JSON 文本发送给本机器人。\n\n");
    s.push_str("【方式 3：服务器终端命令行】\n");
    s.push_str(&format!("在服务器终端运行:\n`agy auth login` 或在控制台中授权账号"));
    (s, GOOGLE_OAUTH_AUTH_URL.to_string())
}

pub fn setup_new_account_slot(acc_key: &str) -> anyhow::Result<()> {
    let base_dir = Path::new(ACCOUNTS_BASE_DIR);
    let target_home = base_dir.join(acc_key);
    let cli_dir = target_home.join(".gemini").join("antigravity-cli");
    let shared_dir = base_dir.join("shared_data");

    fs::create_dir_all(&cli_dir)?;

    let shared_items = ["brain", "conversations", "conversation_summaries.db", "history.jsonl", "settings.json"];
    for item in &shared_items {
        let src = shared_dir.join(item);
        let dst = cli_dir.join(item);
        if src.exists() {
            let _ = fs::remove_file(&dst);
            let _ = fs::remove_dir_all(&dst);
            let _ = symlink(&src, &dst);
        }
    }

    Ok(())
}

pub fn bind_account_token(explicit_acc: Option<&str>, raw_input: &str) -> anyhow::Result<AddAccountResult> {
    let (acc_key, index) = match explicit_acc {
        Some(k) if k.starts_with("acc") => {
            let num = k.trim_start_matches("acc").parse::<usize>().unwrap_or(1);
            (k.to_string(), num)
        }
        _ => get_next_account_slot(),
    };

    let trimmed = raw_input.trim();
    let mut access_token = String::new();
    let mut refresh_token = String::new();
    let mut email = String::new();
    let mut name = String::new();

    // 1. 处理 authorization_code
    if trimmed.contains("code=") || trimmed.starts_with("4/0") || trimmed.starts_with("4/1") {
        let code = if let Some(pos) = trimmed.find("code=") {
            let rest = &trimmed[pos + 5..];
            rest.split('&').next().unwrap_or(rest).trim()
        } else {
            trimmed
        };

        match exchange_code_for_tokens(code, DEFAULT_REDIRECT_URI) {
            Ok((acc, rf, em, nm)) => {
                access_token = acc;
                refresh_token = rf;
                email = em;
                name = nm;
            }
            Err(_) => {
                let (acc, rf, em, nm) = exchange_code_for_tokens(code, LOCALHOST_REDIRECT_URI)?;
                access_token = acc;
                refresh_token = rf;
                email = em;
                name = nm;
            }
        }
    } else if trimmed.starts_with('{') {
        // 2. 处理 OAuth JSON
        if let Ok(v) = serde_json::from_str::<Value>(trimmed) {
            if let Some(rf) = v.get("token").and_then(|t| t.get("refresh_token")).and_then(|r| r.as_str()) {
                refresh_token = rf.to_string();
            } else if let Some(rf) = v.get("refresh_token").and_then(|r| r.as_str()) {
                refresh_token = rf.to_string();
            }
        }
        if !refresh_token.is_empty() {
            let (acc, em, nm) = refresh_token_and_get_info_blocking(&refresh_token)?;
            access_token = acc;
            email = em;
            name = nm;
        }
    } else if trimmed.starts_with("1//0") {
        // 3. 处理 refresh_token
        refresh_token = trimmed.to_string();
        let (acc, em, nm) = refresh_token_and_get_info_blocking(&refresh_token)?;
        access_token = acc;
        email = em;
        name = nm;
    }

    if refresh_token.is_empty() {
        return Err(anyhow::anyhow!("未能解析出有效的 refresh_token 或授权码。请发送以 1//0 开头的凭据、4/0 开头的授权码或 OAuth JSON。"));
    }

    if email.is_empty() {
        return Err(anyhow::anyhow!("向 Google 验证凭据成功，但未能检索到账号邮箱信息。"));
    }

    setup_new_account_slot(&acc_key)?;

    let token_data = serde_json::json!({
        "token": {
            "access_token": access_token,
            "token_type": "Bearer",
            "refresh_token": refresh_token,
            "expiry": 3599
        },
        "auth_method": "consumer"
    });

    let token_file = format!("{}/{}/.gemini/antigravity-cli/antigravity-oauth-token", ACCOUNTS_BASE_DIR, acc_key);
    fs::write(&token_file, serde_json::to_string_pretty(&token_data)?)?;

    let info_file = format!("{}/{}/.account_info.json", ACCOUNTS_BASE_DIR, acc_key);
    fs::write(&info_file, serde_json::to_string_pretty(&serde_json::json!({
        "email": email,
        "name": name
    }))?)?;

    let _guard = ACCOUNTS_MUTEX.lock().unwrap();
    let mut state = load_account_state();
    state.accounts.entry(acc_key.clone()).or_default();
    save_account_state(&state)?;

    let total_count = get_account_list().len();

    Ok(AddAccountResult {
        acc_key,
        index,
        email,
        name,
        total_count,
    })
}
