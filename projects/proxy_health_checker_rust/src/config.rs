use std::time::Duration;

pub const PROXY_URL: &str = "http://127.0.0.1:10809";
pub const TARGET_URL: &str = "https://clob.polymarket.com/time";
pub const CHECK_INTERVAL: Duration = Duration::from_secs(15);
pub const TIMEOUT: Duration = Duration::from_secs(5);
pub const RESTART_BUFFER: Duration = Duration::from_secs(5);
pub const MAX_FAILURES: usize = 3;
