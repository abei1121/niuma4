use log::info;
use crate::accounts::{
    bind_account_token, generate_auth_instructions, get_erdu_status_message, get_next_account_slot,
    set_account_name, switch_account,
};
use crate::telegram::{InlineKeyboardButton, InlineKeyboardMarkup, TgClient};

pub async fn handle_accounts_command(
    tg_client: &TgClient,
    chat_id: i64,
    msg_id: i32,
    text: &str,
) -> anyhow::Result<bool> {
    if text == "/erdu" || text == "/accounts" {
        let (msg_text, markup) = get_erdu_status_message();
        let _ = tg_client
            .send_message_with_markup(chat_id, &msg_text, Some(msg_id), Some("Markdown"), Some(markup))
            .await;
        return Ok(true);
    }

    if text == "/qiehuanerdu"
        || text.starts_with("/qiehuanerdu ")
        || text == "/switch_account"
        || text.starts_with("/switch_account ")
    {
        let arg = text
            .trim_start_matches("/qiehuanerdu")
            .trim_start_matches("/switch_account")
            .trim();
        let target = if arg.is_empty() { None } else { Some(arg) };
        match switch_account(target) {
            Ok(msg_text) => {
                let (status_text, markup) = get_erdu_status_message();
                let combined = format!("{}\n\n{}", msg_text, status_text);
                let _ = tg_client
                    .send_message_with_markup(chat_id, &combined, Some(msg_id), Some("Markdown"), Some(markup))
                    .await;
            }
            Err(e) => {
                let _ = tg_client
                    .send_message(chat_id, &format!("切换账号失败: {}", e), Some(msg_id), None)
                    .await;
            }
        }
        return Ok(true);
    }

    if text.starts_with("/set_name ") || text.starts_with("/name ") {
        let raw = if text.starts_with("/set_name ") {
            text.trim_start_matches("/set_name ").trim()
        } else {
            text.trim_start_matches("/name ").trim()
        };
        let mut parts = raw.split_whitespace();
        let acc_key = parts.next().unwrap_or("");
        let new_name: String = parts.collect::<Vec<_>>().join(" ");
        if !acc_key.is_empty() && !new_name.is_empty() {
            if let Err(e) = set_account_name(acc_key, &new_name) {
                let _ = tg_client.send_message(chat_id, &format!("设置账号备注失败: {}", e), Some(msg_id), None).await;
            } else {
                let (msg_text, markup) = get_erdu_status_message();
                let reply = format!("已成功将 `{}` 的备注名修改为: *{}*\n\n{}", acc_key, new_name, msg_text);
                let _ = tg_client.send_message_with_markup(chat_id, &reply, Some(msg_id), Some("Markdown"), Some(markup)).await;
            }
            return Ok(true);
        }
    }

    if text == "/add_account"
        || text == "/add_acc"
        || text == "/new_account"
        || text.starts_with("/add_account ")
        || text.starts_with("/add_acc ")
        || text.starts_with("/new_account ")
    {
        let arg = text
            .trim_start_matches("/add_account")
            .trim_start_matches("/add_acc")
            .trim_start_matches("/new_account")
            .trim();

        if arg.is_empty() {
            let (next_slot, _) = get_next_account_slot();
            let (instructions, auth_url) = generate_auth_instructions(&next_slot);
            let markup = InlineKeyboardMarkup {
                inline_keyboard: vec![
                    vec![InlineKeyboardButton::link("🌐 打开 Google 登录授权页面", &auth_url)],
                    vec![InlineKeyboardButton::callback("🔄 授权完成，刷新账号池", "refresh_erdu")],
                ],
            };
            let _ = tg_client
                .send_message_with_markup(chat_id, &instructions, Some(msg_id), Some("Markdown"), Some(markup))
                .await;
            return Ok(true);
        }

        match bind_account_token(None, arg) {
            Ok(res) => {
                let reply = format!(
                    "🎉 *新账号添加成功！*\n\n• 账号槽位: *{} (账号 {})*\n• 账号姓名: *{}*\n• 绑定邮箱: `{}`\n• 当前轮换池总数: *{} 个*\n\n已完成共享目录挂载与 Google 凭据验证，即刻参与动态轮换！",
                    res.acc_key, res.index, res.name, res.email, res.total_count
                );
                let (_, markup) = get_erdu_status_message();
                let _ = tg_client
                    .send_message_with_markup(chat_id, &reply, Some(msg_id), Some("Markdown"), Some(markup))
                    .await;
                info!("New account added: {} ({} - {})", res.acc_key, res.name, res.email);
            }
            Err(e) => {
                let _ = tg_client
                    .send_message(chat_id, &format!("❌ 添加账号失败: {}", e), Some(msg_id), None)
                    .await;
            }
        }
        return Ok(true);
    }

    // 自动检测用户直接粘贴的 OAuth Token JSON、refresh_token 或 authorization_code
    if (text.starts_with('{') && text.contains("refresh_token"))
        || text.starts_with("1//0")
        || text.contains("code=")
        || (text.len() >= 40 && (text.starts_with("4/0") || text.starts_with("4/1")))
    {
        match bind_account_token(None, text) {
            Ok(res) => {
                let reply = format!(
                    "🎉 *检测到 OAuth 凭据，新账号已自动挂载！*\n\n• 分配槽位: *{} (账号 {})*\n• 账号姓名: *{}*\n• 认证邮箱: `{}`\n• 轮换池规模: *{} 个账号*\n\n该账号已加入轮换管线，将在主账号限流或调用时自动轮换调度。",
                    res.acc_key, res.index, res.name, res.email, res.total_count
                );
                let (_, markup) = get_erdu_status_message();
                let _ = tg_client
                    .send_message_with_markup(chat_id, &reply, Some(msg_id), Some("Markdown"), Some(markup))
                    .await;
                info!("Auto-detected and bound token for {} ({} - {})", res.acc_key, res.name, res.email);
                return Ok(true);
            }
            Err(e) => {
                let _ = tg_client
                    .send_message(chat_id, &format!("⚠️ 尝试解析 OAuth 凭据失败: {}", e), Some(msg_id), None)
                    .await;
                return Ok(true);
            }
        }
    }

    Ok(false)
}
