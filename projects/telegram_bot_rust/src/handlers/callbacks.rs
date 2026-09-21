use log::info;
use crate::accounts::{
    generate_auth_instructions, get_erdu_status_message, get_next_account_slot, switch_account,
};
use crate::telegram::{CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, TgClient};

pub async fn handle_callback_query(tg_client: TgClient, query: CallbackQuery) {
    let query_id = &query.id;
    let data = query.data.as_deref().unwrap_or("");
    let msg = match query.message {
        Some(m) => m,
        None => {
            let _ = tg_client.answer_callback_query(query_id, None, false).await;
            return;
        }
    };

    let chat_id = msg.chat.id;
    let msg_id = msg.message_id;

    if data.starts_with("switch_acc:") {
        let acc_key = data.trim_start_matches("switch_acc:");
        match switch_account(Some(acc_key)) {
            Ok(switch_msg) => {
                let _ = tg_client
                    .answer_callback_query(query_id, Some(&format!("已切换至 {}", acc_key)), false)
                    .await;
                let (new_text, new_markup) = get_erdu_status_message();
                let _ = tg_client
                    .edit_message_text(chat_id, msg_id, &new_text, Some("Markdown"), Some(new_markup))
                    .await;
                info!("Callback switch account: {}", switch_msg);
            }
            Err(e) => {
                let _ = tg_client
                    .answer_callback_query(query_id, Some(&format!("切换失败: {}", e)), true)
                    .await;
            }
        }
        return;
    }

    if data == "add_account" {
        let (next_slot, _) = get_next_account_slot();
        let (prompt_text, auth_url) = generate_auth_instructions(&next_slot);
        let _ = tg_client.answer_callback_query(query_id, None, false).await;

        let markup = InlineKeyboardMarkup {
            inline_keyboard: vec![
                vec![InlineKeyboardButton::link("🌐 打开 Google 登录授权页面", &auth_url)],
                vec![InlineKeyboardButton::callback("🔄 授权完成，刷新账号池", "refresh_erdu")],
            ],
        };

        let _ = tg_client
            .send_message_with_markup(chat_id, &prompt_text, Some(msg_id), Some("Markdown"), Some(markup))
            .await;
        return;
    }

    if data == "refresh_erdu" {
        let _ = tg_client.answer_callback_query(query_id, Some("状态已刷新"), false).await;
        let (new_text, new_markup) = get_erdu_status_message();
        let _ = tg_client
            .edit_message_text(chat_id, msg_id, &new_text, Some("Markdown"), Some(new_markup))
            .await;
        return;
    }

    let _ = tg_client.answer_callback_query(query_id, None, false).await;
}
