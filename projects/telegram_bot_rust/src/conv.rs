use std::fs;
use std::sync::Mutex;
use log::info;

use crate::config::CONV_ID_FILE;

pub const MAX_CONTEXT_SIZE_BYTES: u64 = 400 * 1024; // 400KB

static CONV_MUTEX: Mutex<()> = Mutex::new(());

pub fn should_continue_session() -> bool {
    let _guard = CONV_MUTEX.lock().unwrap();
    // 如果没有明确标记 reset，默认始终继续全局一体化最新会话
    !fs::metadata("/tmp/agy_force_new_session").is_ok()
}

pub fn reset_conversation_id() {
    let _guard = CONV_MUTEX.lock().unwrap();
    let _ = fs::write("/tmp/agy_force_new_session", "1");
    let _ = fs::remove_file(CONV_ID_FILE);
    info!("已标记重置会话，下次输入将开启全新一体化上下文");
}

pub fn clear_reset_flag() {
    let _guard = CONV_MUTEX.lock().unwrap();
    let _ = fs::remove_file("/tmp/agy_force_new_session");
}
