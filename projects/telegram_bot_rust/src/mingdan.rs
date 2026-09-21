use std::fs;
use std::process::Command;

pub async fn trigger_scan_and_get_report() -> String {
    get_video_status_message()
}

pub fn get_mingdan_message() -> String {
    get_video_status_message()
}

pub fn get_video_status_message() -> String {
    let tasks_path = "/Users/hi/niuma/video_workspace/tasks.json";
    let tasks_json: Vec<serde_json::Value> = fs::read_to_string(tasks_path)
        .ok()
        .and_then(|c| serde_json::from_str(&c).ok())
        .unwrap_or_default();

    let completed = tasks_json.iter().filter(|t| t["status"] == "completed").count();
    let processing = tasks_json.iter().filter(|t| t["status"] == "processing").count();
    let failed = tasks_json.iter().filter(|t| t["status"] == "failed").count();

    format!(
        "🎬 *【牛马4号 · 自媒体视频剪辑中枢状态】*\n━━━━━━━━━━━━━━━━━━━\n\n\
        • *身份定位*: `牛马4号 (独立自治)`\n\
        • *硬件架构*: `Apple Silicon M2 (8C) / 8GB 统一内存`\n\
        • *操作系统*: `macOS (Darwin ARM64)`\n\
        • *硬件加速*: `Apple VideoToolbox (h264/hevc 极速硬解硬编)`\n\
        • *剪辑任务*: 总计 `{}` | 运行中 `{}` | 已完成 `{}` | 失败 `{}`\n\
        • *控制面板*: `http://192.168.1.3:8999`\n\n\
        _发送视频链接或指令，牛马4号将为您全自动流水线处理剪辑。_",
        tasks_json.len(), processing, completed, failed
    )
}
