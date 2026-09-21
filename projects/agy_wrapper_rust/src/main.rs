// main.rs - agy_wrapper 入口：透明代理 agy 并实现多账号自动轮换

mod executor;
mod login;
mod retry;
mod state;

use std::env;
use std::fs;
use std::path::Path;

use executor::run_with_account_rotation;
use login::handle_login_command;
use state::BASE_ACCOUNTS_DIR;

fn main() {
    // 确保账号基础目录存在
    let _ = fs::create_dir_all(Path::new(BASE_ACCOUNTS_DIR));

    let raw_args: Vec<String> = env::args().collect();
    let cmd_args = if raw_args.len() > 1 {
        &raw_args[1..]
    } else {
        &[]
    };

    // 拦截 login 子命令
    if let Ok(true) = handle_login_command(cmd_args) {
        return;
    }

    // 其余所有命令走多账号轮换执行
    run_with_account_rotation(cmd_args);
}
