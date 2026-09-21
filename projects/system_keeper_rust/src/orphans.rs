use std::fs;
use log::{info, warn};
use sysinfo::{Pid, System};

fn has_deleted_pty(pid: u32) -> bool {
    for fd in 0..=2 {
        if let Ok(target) = fs::read_link(format!("/proc/{}/fd/{}", pid, fd)) {
            let path_str = target.to_string_lossy();
            if path_str.contains("/dev/pts/") && path_str.contains("(deleted)") {
                return true;
            }
        }
    }
    false
}

/// 清理真正脱离父进程或终端已销毁的异常僵死孤儿进程
/// 严禁盲杀正在正常为 Telegram Bot 服务的子进程！
pub fn cleanup_orphan_agy_processes(sys: &System) {
    for (pid, process) in sys.processes() {
        let name = process.name();
        let cmd = process.cmd().join(" ");

        // 只针对包含 agy 或 agy_wrapper 的进程
        if name.contains("agy") || cmd.contains("agy") {
            // 守护自身绝对不杀
            if pid.as_u32() == std::process::id() {
                continue;
            }

            let run_time_secs = process.run_time();

            // 判定 1: 物理终端已注销且脱机挂死超过 300 秒的 CLI 孤儿
            if has_deleted_pty(pid.as_u32()) && run_time_secs > 300 {
                warn!(
                    "🧹 [孤儿回收] 检测到终端已销毁且超时挂起的悬挂进程 PID {} (cmd: {}, 运行时长: {}s)，执行安全回收",
                    pid, cmd, run_time_secs
                );
                let _ = nix::sys::signal::kill(
                    nix::unistd::Pid::from_raw(pid.as_u32() as i32),
                    nix::sys::signal::Signal::SIGTERM,
                );
                continue;
            }

            // 判定 2: 被系统 init (PPID == 1) 收养，且已存活超过 30 分钟的异常挂起孤儿
            if let Some(parent_pid) = process.parent() {
                if parent_pid.as_u32() == 1 && run_time_secs > 1800 {
                    warn!(
                        "🧹 [孤儿回收] 检测到被 init(1) 收养且超时挂起的真孤儿进程 PID {} (cmd: {}, 运行时长: {}s)，执行安全回收",
                        pid, cmd, run_time_secs
                    );
                    let _ = nix::sys::signal::kill(
                        nix::unistd::Pid::from_raw(pid.as_u32() as i32),
                        nix::sys::signal::Signal::SIGTERM,
                    );
                }
            }
        }
    }
}
