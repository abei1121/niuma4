// retry.rs - 错误识别模块：429 限流检测、网络错误识别、冷却时长解析

use chrono::Duration;
use regex::Regex;

/// 解析 stderr 中形如 "resets in 10m30s" 的冷却时长
pub fn parse_reset_duration(err_str: &str) -> Duration {
    let re = match Regex::new(r"(?i)resets?\s+in\s+([0-9hmsd.]+)") {
        Ok(r) => r,
        Err(_) => return Duration::zero(),
    };

    if let Some(caps) = re.captures(err_str) {
        if let Some(m) = caps.get(1) {
            let mut dur_str = m.as_str().trim_end_matches('.').to_string();
            let mut total_secs: i64 = 0;

            let day_re = Regex::new(r"(\d+)d").unwrap();
            if let Some(dcaps) = day_re.captures(&dur_str) {
                if let Some(ds) = dcaps.get(1) {
                    if let Ok(d) = ds.as_str().parse::<i64>() {
                        total_secs += d * 86400;
                    }
                }
                dur_str = day_re.replace_all(&dur_str, "").to_string();
            }

            let hour_re = Regex::new(r"(\d+)h").unwrap();
            if let Some(hcaps) = hour_re.captures(&dur_str) {
                if let Some(hs) = hcaps.get(1) {
                    if let Ok(h) = hs.as_str().parse::<i64>() {
                        total_secs += h * 3600;
                    }
                }
                dur_str = hour_re.replace_all(&dur_str, "").to_string();
            }

            let min_re = Regex::new(r"(\d+)m").unwrap();
            if let Some(mcaps) = min_re.captures(&dur_str) {
                if let Some(ms) = mcaps.get(1) {
                    if let Ok(mins) = ms.as_str().parse::<i64>() {
                        total_secs += mins * 60;
                    }
                }
                dur_str = min_re.replace_all(&dur_str, "").to_string();
            }

            let sec_re = Regex::new(r"(\d+)s").unwrap();
            if let Some(scaps) = sec_re.captures(&dur_str) {
                if let Some(ss) = scaps.get(1) {
                    if let Ok(secs) = ss.as_str().parse::<i64>() {
                        total_secs += secs;
                    }
                }
            }

            if total_secs > 0 {
                return Duration::seconds(total_secs);
            }
        }
    }
    Duration::zero()
}

/// 识别网络瞬断类错误（可重试）
pub fn is_network_error(err_lower: &str) -> bool {
    err_lower.contains("timeout waiting for response")
        || err_lower.contains("timeout waiting for cascade")
        || err_lower.contains("context deadline exceeded")
        || err_lower.contains("unexpected eof")
        || err_lower.contains("connection reset")
        || err_lower.contains("bad gateway")
        || err_lower.contains("gateway timeout")
        || err_lower.contains("internal server error")
        || err_lower.contains("502")
        || err_lower.contains("503")
        || err_lower.contains("proxy error")
        || err_lower.contains("context canceled")
}

/// 识别 429 / ResourceExhausted 类限流错误（触发账号轮换）
pub fn is_quota_exhausted(err_lower: &str) -> bool {
    err_lower.contains("resource_exhausted")
        || err_lower.contains("quota")
        || err_lower.contains("rate limit")
        || err_lower.contains("429")
        || err_lower.contains("limit exceeded")
        || err_lower.contains("exhausted")
}
