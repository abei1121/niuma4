pub mod creator;
pub mod identity;
pub mod state;

pub use creator::*;
pub use identity::*;
pub use state::*;

use crate::telegram::{InlineKeyboardButton, InlineKeyboardMarkup};

fn shorten_name_and_email(name: &str, email: &str, acc_key: &str) -> String {
    if !name.is_empty() && name != "Google Account" && name != "Google User" {
        return name.to_string();
    }
    if !email.is_empty() && !email.contains("已配置") && !email.contains("未配置") {
        let prefix = email.split('@').next().unwrap_or(email);
        if prefix.len() > 10 {
            return format!("{}..", &prefix[..8]);
        }
        return prefix.to_string();
    }
    acc_key.to_string()
}

pub fn get_erdu_status_message() -> (String, InlineKeyboardMarkup) {
    let _guard = ACCOUNTS_MUTEX.lock().unwrap();
    let state = load_account_state();
    let acc_list = get_account_list();

    let mut sb = String::from("📊 *AGY 多账号大模型动态轮换池*\n\n");

    for (idx, acc_key) in acc_list.iter().enumerate() {
        let status = state.accounts.get(acc_key).cloned().unwrap_or_default();
        let (email, name) = get_account_identity(acc_key);

        let active_tag = if idx == state.active_index {
            " 👈 *[当前主用]*"
        } else {
            ""
        };

        let is_blocked = is_account_blocked(&status);

        let account_title = if !name.is_empty() && name != "Google Account" && name != "Google User" {
            format!("• *账号 {} ({}) - {}*", idx + 1, acc_key, name)
        } else {
            format!("• *账号 {} ({})*", idx + 1, acc_key)
        };

        let email_desc = if !email.is_empty() {
            format!(" (`{}`)", email)
        } else {
            "".to_string()
        };

        if is_blocked {
            sb.push_str(&format!("{}: 🔴 限流冷却中{}{}\n", account_title, email_desc, active_tag));
        } else {
            sb.push_str(&format!("{}: 🟢 正常就绪 (额度充足){}{}\n", account_title, email_desc, active_tag));
        }
    }

    let current_acc = acc_list.get(state.active_index).cloned().unwrap_or_else(|| "acc1".to_string());
    let (cur_email, cur_name) = get_account_identity(&current_acc);
    let cur_name_part = if !cur_name.is_empty() && cur_name != "Google Account" {
        format!(" - {}", cur_name)
    } else {
        "".to_string()
    };
    let cur_display = if !cur_email.is_empty() {
        format!("账号 {} ({}){} (`{}`)", state.active_index + 1, current_acc, cur_name_part, cur_email)
    } else {
        format!("账号 {} ({})", state.active_index + 1, current_acc)
    };

    sb.push_str(&format!("\n当前默认主用: *{}*\n", cur_display));
    sb.push_str("👇 点击下方按钮可切换账号或添加新账号：");

    // 构建 Inline Keyboard 按钮
    let mut keyboard: Vec<Vec<InlineKeyboardButton>> = Vec::new();
    let mut current_row: Vec<InlineKeyboardButton> = Vec::new();

    for (idx, acc_key) in acc_list.iter().enumerate() {
        let (email, name) = get_account_identity(acc_key);
        let label = shorten_name_and_email(&name, &email, acc_key);

        let btn_text = if idx == state.active_index {
            format!("✅ 账号{}·{}", idx + 1, label)
        } else {
            format!("⚡ 账号{}·{}", idx + 1, label)
        };

        current_row.push(InlineKeyboardButton::callback(&btn_text, &format!("switch_acc:{}", acc_key)));

        if current_row.len() >= 2 {
            keyboard.push(current_row);
            current_row = Vec::new();
        }
    }
    if !current_row.is_empty() {
        keyboard.push(current_row);
    }

    // 操作行：点击添加新 Gemini 账号 与 刷新状态
    keyboard.push(vec![
        InlineKeyboardButton::callback("➕ 点击添加更多 Gemini 账号", "add_account"),
        InlineKeyboardButton::callback("🔄 刷新状态", "refresh_erdu"),
    ]);

    (sb, InlineKeyboardMarkup { inline_keyboard: keyboard })
}
