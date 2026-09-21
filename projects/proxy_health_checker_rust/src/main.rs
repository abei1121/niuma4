mod config;
mod checker;
mod restarter;

use env_logger::Env;
use log::{info, warn};
use tokio::time::{sleep, interval};

use crate::checker::Checker;
use crate::config::{CHECK_INTERVAL, MAX_FAILURES, RESTART_BUFFER};
use crate::restarter::restart_hysteria;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
    info!("[ProxyChecker] 代理健康检测服务 (Rust 原生版) 已启动...");

    let checker = match Checker::new() {
        Ok(c) => c,
        Err(e) => {
            log::error!("[ProxyChecker] 初始化客户端失败: {}", e);
            return Err(e);
        }
    };

    let mut fail_count = 0;

    // 启动即检测一次
    if !checker.check().await {
        fail_count += 1;
    } else {
        fail_count = 0;
    }

    let mut ticker = interval(CHECK_INTERVAL);
    // 第一拍立即触发，跳过第一拍避免重复检测
    ticker.tick().await;

    loop {
        ticker.tick().await;
        if checker.check().await {
            if fail_count > 0 {
                info!("[ProxyChecker] 代理恢复正常 (此前失败 {} 次)", fail_count);
            }
            fail_count = 0;
        } else {
            fail_count += 1;
            warn!(
                "[ProxyChecker] 代理检测失败 (累计 {}/{})",
                fail_count, MAX_FAILURES
            );
            if fail_count >= MAX_FAILURES {
                restart_hysteria();
                fail_count = 0;
                sleep(RESTART_BUFFER).await;
            }
        }
    }
}
