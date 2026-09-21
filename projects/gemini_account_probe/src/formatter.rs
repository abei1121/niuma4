// formatter.rs - 人类可读报告格式化输出

use crate::model::AccountRotationReport;

pub fn print_human_report(report: &AccountRotationReport) {
    println!();
    println!("=== Gemini 多账号轮换态势探针 ===");
    println!("探测时间 : {}", report.timestamp);
    println!(
        "账号总数 : {}  |  就绪: {}  |  冷却中: {}",
        report.total_accounts, report.ready_accounts, report.cooling_accounts
    );
    println!(
        "当前激活 : {} (index: {})",
        report.active_account_id, report.active_index
    );
    if report.all_ready {
        println!("全局状态 : [全部就绪]");
    } else {
        println!(
            "全局状态 : [{}个账号冷却中]",
            report.cooling_accounts
        );
    }
    println!();

    for acc in &report.accounts {
        let active_mark = if acc.is_active { " [激活]" } else { "" };
        let token_mark = if acc.has_oauth_token {
            format!("[有凭据 {}B]", acc.oauth_file_size)
        } else {
            "[无凭据]".to_string()
        };

        println!(
            "  ACC{} ({}){}  {}  {}",
            acc.index + 1,
            acc.id,
            active_mark,
            token_mark,
            acc.status_text
        );

        if acc.is_cooling {
            if let Some(ref local_time) = acc.blocked_until_local {
                println!("         预计解除: {}", local_time);
            }
        }
    }
    println!();
}
