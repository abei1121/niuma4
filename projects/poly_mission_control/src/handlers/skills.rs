use axum::extract::Query;
use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::Path;

const LENGBEIFEN_DIR: &str = "/Users/hi/niuma/lengbeifen";

fn get_skills_dir() -> String {
    let candidate_dirs = [
        "/Users/hi/.agents/skills",
        "/Users/hi/niuma/skills",
        "/Users/hi/niuma/niuma1-main/skills",
    ];
    for d in candidate_dirs {
        if Path::new(d).exists() {
            return d.to_string();
        }
    }
    "/Users/hi/.agents/skills".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillSummary {
    pub name: String,
    pub title: String,
    pub description: String,
    pub triggers: Vec<String>,
    pub executable_path: String,
    pub reference_path: String,
    pub is_executable_present: bool,
    pub ref_lines: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SkillDetailQuery {
    pub name: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SkillSaveRequest {
    pub name: String,
    pub content: String,
}

pub async fn list_skills() -> Json<Vec<SkillSummary>> {
    let mut list = Vec::new();

    let skills_dir = get_skills_dir();
    if let Ok(entries) = fs::read_dir(&skills_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let skill_name = entry.file_name().to_string_lossy().to_string();
                let skill_md_path = path.join("SKILL.md");
                
                if skill_md_path.exists() {
                    let skill_content = fs::read_to_string(&skill_md_path).unwrap_or_default();
                    let (desc, triggers) = parse_yaml_frontmatter(&skill_content);
                    let ref_path = format!("{}/{}_reference.md", LENGBEIFEN_DIR, skill_name);

                    let (ref_lines, exec_path) = if let Ok(ref_content) = fs::read_to_string(&ref_path) {
                        let lines = ref_content.lines().count();
                        let exec = extract_executable_path(&ref_content, &skill_name);
                        (lines, exec)
                    } else {
                        (0, extract_fallback_executable(&skill_name))
                    };

                    let is_exec_ok = if exec_path.starts_with('/') {
                        Path::new(&exec_path).exists()
                    } else {
                        true
                    };

                    let title = get_skill_chinese_title(&skill_name);

                    list.push(SkillSummary {
                        name: skill_name,
                        title,
                        description: if desc.is_empty() { "系统已注册技能".to_string() } else { desc },
                        triggers,
                        executable_path: exec_path,
                        reference_path: ref_path,
                        is_executable_present: is_exec_ok,
                        ref_lines,
                    });
                }
            }
        }
    }

    list.sort_by(|a, b| a.name.cmp(&b.name));
    Json(list)
}

pub async fn get_skill_detail(Query(query): Query<SkillDetailQuery>) -> Json<serde_json::Value> {
    let skills_dir = get_skills_dir();
    let skill_path = format!("{}/{}/SKILL.md", skills_dir, query.name);
    let ref_path = format!("{}/{}_reference.md", LENGBEIFEN_DIR, query.name);

    let skill_content = fs::read_to_string(&skill_path).unwrap_or_default();
    let ref_content = fs::read_to_string(&ref_path).unwrap_or_else(|_| "暂无冷备份文档".to_string());

    Json(json!({
        "name": query.name,
        "skill_md": skill_content,
        "reference_doc": ref_content,
        "skill_path": skill_path,
        "ref_path": ref_path
    }))
}

pub async fn save_skill_detail(Json(payload): Json<SkillSaveRequest>) -> Json<serde_json::Value> {
    let ref_path = format!("{}/{}_reference.md", LENGBEIFEN_DIR, payload.name);
    if let Err(e) = fs::write(&ref_path, &payload.content) {
        return Json(json!({"success": false, "error": e.to_string()}));
    }
    Json(json!({"success": true, "path": ref_path}))
}

fn parse_yaml_frontmatter(content: &str) -> (String, Vec<String>) {
    let mut desc = String::new();
    let mut triggers = Vec::new();
    let mut in_frontmatter = false;
    let mut in_triggers = false;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == "---" {
            if in_frontmatter {
                break;
            } else {
                in_frontmatter = true;
                continue;
            }
        }

        if in_frontmatter {
            if trimmed.starts_with("description:") {
                in_triggers = false;
                desc = trimmed.trim_start_matches("description:").trim().trim_matches('"').to_string();
            } else if trimmed.starts_with("triggers:") {
                in_triggers = true;
            } else if in_triggers {
                if trimmed.starts_with("- ") {
                    let trigger = trimmed.trim_start_matches("- ").trim().trim_matches('"').to_string();
                    triggers.push(trigger);
                } else if !trimmed.is_empty() && !trimmed.starts_with('#') {
                    in_triggers = false;
                }
            }
        }
    }

    (desc, triggers)
}

fn extract_executable_path(ref_content: &str, skill_name: &str) -> String {
    for line in ref_content.lines() {
        let trimmed = line.trim();
        if trimmed.contains("执行体路径:") || trimmed.contains("执行体命令:") || trimmed.contains("Executable wrapper:") {
            let path_part = trimmed.split(':').nth(1).unwrap_or("").trim().trim_matches('`').to_string();
            if !path_part.is_empty() {
                return path_part;
            }
        }
    }
    extract_fallback_executable(skill_name)
}

fn extract_fallback_executable(skill_name: &str) -> String {
    match skill_name {
        "agy_multi_account" => "/Users/hi/niuma/bin/agy_account".to_string(),
        "anti_busy_wait_guard" => "/Users/hi/niuma/sandbox/agy_tool_guard/target/release/agy_tool_guard".to_string(),
        "hermes_heartbeat_worker" => "/Users/hi/niuma/bin/hermes_heartbeat_worker".to_string(),
        "hy2_network_rotator" => "/Users/hi/niuma/bin/hy2_switch".to_string(),
        "system_fatal_tg_alert" => "/Users/hi/niuma/system_keeper_rust/target/release/system_keeper_rust".to_string(),
        "system_keeper" => "/Users/hi/niuma/bin/system_keeper".to_string(),
        "telegram_bot_skill" => "/Users/hi/niuma/tg_send".to_string(),
        _ => format!("/Users/hi/niuma/bin/{}", skill_name),
    }
}

fn get_skill_chinese_title(skill_name: &str) -> String {
    match skill_name {
        "agy_multi_account" => "多账号大模型动态轮换池".to_string(),
        "anti_busy_wait_guard" => "Rust 原生工具防死循环守卫".to_string(),
        "hermes_heartbeat_worker" => "Hermes 心跳保活与主动推送".to_string(),
        "hy2_network_rotator" => "Hysteria 2 节点测速与自动轮换".to_string(),
        "system_fatal_tg_alert" => "系统致命错误监控与自愈推送".to_string(),
        "system_keeper" => "系统巡检守卫与孤儿进程收割".to_string(),
        "telegram_bot_skill" => "Telegram Bot 高并发通信与 CLI".to_string(),
        _ => skill_name.replace('_', " ").to_uppercase(),
    }
}
