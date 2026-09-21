use std::collections::HashMap;
use std::process::Command;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use log::info;

static LAST_ALERT_MAP: Mutex<Option<HashMap<String, Instant>>> = Mutex::new(None);

pub fn send_tg_alert(msg: &str) {
    info!("Sending TG Alert: {}", msg);
    let _ = Command::new("/Users/hi/niuma/bin/tg_send")
        .arg(msg)
        .output();
}

pub fn send_tg_alert_throttled(key: &str, msg: &str, cooldown: Duration) {
    let mut guard = LAST_ALERT_MAP.lock().unwrap();
    let map = guard.get_or_insert_with(HashMap::new);

    let now = Instant::now();
    if let Some(last_time) = map.get(key) {
        if now.duration_since(*last_time) < cooldown {
            return;
        }
    }

    map.insert(key.to_string(), now);
    send_tg_alert(msg);
}
