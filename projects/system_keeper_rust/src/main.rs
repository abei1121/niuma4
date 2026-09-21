mod cron_guard;
mod memory_guard;
mod notify;
mod orphans;
mod process_guard;
mod resource;

use std::time::Duration;
use log::info;
use sysinfo::System;
use tokio::time::sleep;

use crate::cron_guard::check_and_restore_crontab;
use crate::memory_guard::check_and_auto_heal_memory;
use crate::orphans::cleanup_orphan_agy_processes;
use crate::process_guard::check_and_guard_services;
use crate::resource::check_system_resources_and_rotate_logs;

#[tokio::main]
async fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let args: Vec<String> = std::env::args().collect();
    let run_once = args.iter().any(|a| a == "--once" || a == "-1" || a == "--check" || a == "test" || a == "-h" || a == "--help");

    info!("Starting Antigravity System Keeper Daemon (Rust Edition)...");
    let mut sys = System::new_all();

    loop {
        // 刷新系统进程信息
        sys.refresh_processes();

        // 1. 守护 Crontab 完整性
        check_and_restore_crontab();

        // 2. 探针与进程守护 (telegram_bot, pm_sidecar, poly_l2_engine, lan_file_server)
        check_and_guard_services(&mut sys);

        // 3. 清理孤儿 agy 进程
        cleanup_orphan_agy_processes(&sys);

        // 4. 磁盘告警与日志 10MB 自动轮转
        check_system_resources_and_rotate_logs();

        // 5. 记忆体系 5 分钟周期性深度巡检与全自动自愈 (0 死链, 0 孤立)
        check_and_auto_heal_memory();

        if run_once {
            info!("System Keeper: Single check completed successfully.");
            break;
        }

        // 每 60 秒轮询巡检一次，杜绝高频进程遍历与日志风暴
        sleep(Duration::from_secs(60)).await;
    }
}
