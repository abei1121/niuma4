pub mod accounts_cmd;
pub mod callbacks;

pub use callbacks::handle_callback_query;

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use log::info;
use tokio::sync::{Mutex, Semaphore};

use crate::config::{get_selected_model, set_selected_model};
use crate::conv::reset_conversation_id;
use crate::runner::run_agy;
use crate::telegram::{Message, TgClient};
use accounts_cmd::handle_accounts_command;

pub struct HandlerState {
    pub semaphore: Semaphore,
    pub active_cancel: Mutex<Option<Arc<AtomicBool>>>,
}

impl HandlerState {
    pub fn new() -> Self {
        HandlerState {
            semaphore: Semaphore::new(1),
            active_cancel: Mutex::new(None),
        }
    }
}

pub async fn handle_message(
    tg_client: TgClient,
    msg: Message,
    raw_text: String,
    proxy_url: String,
    state: Arc<HandlerState>,
) {
    let text = raw_text.trim();
    let chat_id = msg.chat.id;
    let msg_id = msg.message_id;

    if text == "/stop" || text == "/cancel" {
        let mut cancel_guard = state.active_cancel.lock().await;
        if let Some(flag) = cancel_guard.take() {
            flag.store(true, Ordering::SeqCst);
            let _ = tg_client
                .send_message(
                    chat_id,
                    "已成功打断并终止当前正在执行的后台任务，系统锁已释放。",
                    Some(msg_id),
                    None,
                )
                .await;
        } else {
            let _ = tg_client
                .send_message(
                    chat_id,
                    "当前没有正在执行的后台任务。",
                    Some(msg_id),
                    None,
                )
                .await;
        }
        return;
    }

    let _permit = match state.semaphore.try_acquire() {
        Ok(permit) => permit,
        Err(_) => {
            let _ = tg_client
                .send_message(
                    chat_id,
                    "当前已有正在处理的任务，请稍后或发送 `/stop` 取消上一个任务。",
                    Some(msg_id),
                    Some("Markdown"),
                )
                .await;
            return;
        }
    };

    if text == "/model" || text.starts_with("/model ") {
        if text == "/model" {
            let cur_model = get_selected_model();
            let msg_text = format!(
                "🤖 *当前模型*: `{}`\n\n可选模型列表：\n- `Gemini 3.8 Flash (High)` (最新 3.8 旗舰模型)\n- `Gemini 3.7 Flash (High)` (3.7 旗舰模型)\n- `Gemini 3.1 Pro (High)` (默认高阶推理)\n- `Claude Sonnet 4.6 (Thinking)` (Claude 思考模型)\n- `Claude Opus 4.6 (Thinking)` (Claude 顶级思考)\n- `GPT-OSS 120B (Medium)` (开源推理)\n\n发送 `/model <模型名>` 切换，例如：`/model Gemini 3.8 Flash (High)`",
                cur_model
            );
            let _ = tg_client
                .send_message(chat_id, &msg_text, Some(msg_id), Some("Markdown"))
                .await;
            return;
        }
        let new_model = text.trim_start_matches("/model ").trim();
        if let Err(e) = set_selected_model(new_model) {
            let _ = tg_client
                .send_message(
                    chat_id,
                    &format!("切换模型失败: {}", e),
                    Some(msg_id),
                    None,
                )
                .await;
            return;
        }
        let reply_text = format!("模型已成功切换为: `{}`", new_model);
        let _ = tg_client
            .send_message(chat_id, &reply_text, Some(msg_id), Some("Markdown"))
            .await;
        info!("Model switched to: {}", new_model);
        return;
    }

    // 账号相关指令路由
    if let Ok(true) = handle_accounts_command(&tg_client, chat_id, msg_id, text).await {
        return;
    }

    if text == "/video" || text == "/status" || text == "/sxmd" || text == "/refresh" || text == "/radar" || text == "/scan" {
        let _ = tg_client
            .send_message(
                chat_id,
                "⚡ *正在发起全网雷达穿透扫描* (拉取 3000 大单流并清洗榜单，预计 2~4 秒)...",
                Some(msg_id),
                Some("Markdown"),
            )
            .await;

        let msg_text = crate::mingdan::trigger_scan_and_get_report().await;
        let _ = tg_client
            .send_split_messages(chat_id, &msg_text, Some(msg_id))
            .await;
        return;
    }

    if text == "/mingdan" || text == "/early" || text == "/early_birds" {
        let msg_text = crate::mingdan::get_mingdan_message();
        let _ = tg_client
            .send_split_messages(chat_id, &msg_text, Some(msg_id))
            .await;
        return;
    }

    if text == "/start" || text == "/new" || text == "/reset" {
        reset_conversation_id();
        let reply_text = "会话已重置。下一条消息将开启全新的上下文会话。\n我是您的【牛马1号】（小韭菜牧场剪辑牛马）（自媒体视频剪辑 Agent），请指示。";
        let _ = tg_client
            .send_message(chat_id, reply_text, Some(msg_id), Some("Markdown"))
            .await;
        info!("Conversation reset requested by user.");
        return;
    }

    let cancel_flag = Arc::new(AtomicBool::new(false));
    {
        let mut cancel_guard = state.active_cancel.lock().await;
        *cancel_guard = Some(cancel_flag.clone());
    }

    let client_clone = tg_client.clone();
    let res = run_agy(text, &proxy_url, move || {
        let c = client_clone.clone();
        tokio::spawn(async move {
            c.send_chat_typing(chat_id).await;
        });
    })
    .await;

    {
        let mut cancel_guard = state.active_cancel.lock().await;
        *cancel_guard = None;
    }

    match res {
        Ok(result_text) => {
            tg_client
                .send_split_messages(chat_id, &result_text, Some(msg_id))
                .await;
            info!("Replied successfully.");
        }
        Err(e) => {
            let _ = tg_client
                .send_message(
                    chat_id,
                    &format!("执行失败: {}", e),
                    Some(msg_id),
                    None,
                )
                .await;
        }
    }
}
