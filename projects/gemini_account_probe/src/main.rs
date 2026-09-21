// main.rs - gemini_account_probe 入口

mod formatter;
mod model;
mod operations;
mod prober;

use std::env;

fn print_help() {
    println!("Gemini 多账号动态轮询态势探针 (gemini_account_probe)");
    println!("用法:");
    println!("  gemini_account_probe                   执行物理探测并输出人类可读报告");
    println!("  gemini_account_probe --json            以 JSON 格式输出物理探测数据");
    println!("  gemini_account_probe --unblock <id>   解除指定账号冷却 (如 acc1)");
    println!("  gemini_account_probe --unblock-all     解除全部账号冷却锁定");
    println!("  gemini_account_probe --switch <idx>   切换激活账号 index (从0开始)");
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.iter().any(|a| a == "-h" || a == "--help") {
        print_help();
        return;
    }

    if let Some(pos) = args.iter().position(|a| a == "--unblock") {
        if let Some(id) = args.get(pos + 1) {
            match operations::unblock_account(id) {
                Ok(msg) => println!("{}", msg),
                Err(err) => {
                    eprintln!("错误: {}", err);
                    std::process::exit(1);
                }
            }
            return;
        } else {
            eprintln!("错误: --unblock 需要指定账号 ID (例如 acc1)");
            std::process::exit(1);
        }
    }

    if args.iter().any(|a| a == "--unblock-all") {
        match operations::unblock_all() {
            Ok(msg) => println!("{}", msg),
            Err(err) => {
                eprintln!("错误: {}", err);
                std::process::exit(1);
            }
        }
        return;
    }

    if let Some(pos) = args.iter().position(|a| a == "--switch") {
        if let Some(idx_str) = args.get(pos + 1) {
            if let Ok(idx) = idx_str.parse::<usize>() {
                match operations::switch_active(idx) {
                    Ok(msg) => println!("{}", msg),
                    Err(err) => {
                        eprintln!("错误: {}", err);
                        std::process::exit(1);
                    }
                }
                return;
            }
        }
        eprintln!("错误: --switch 需要指定有效的数字索引 (如 0, 1, 2)");
        std::process::exit(1);
    }

    let report = prober::probe_accounts();

    if args.iter().any(|a| a == "--json") {
        if let Ok(json_str) = serde_json::to_string_pretty(&report) {
            println!("{}", json_str);
        }
    } else {
        formatter::print_human_report(&report);
    }
}
