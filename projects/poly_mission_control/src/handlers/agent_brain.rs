use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::process::Command;

const GEMINI_MD_PATH: &str = "/Users/hi/niuma/GEMINI.md";
const STATUS_JSON_PATH: &str = "/Users/hi/.gemini_accounts/status.json";
const MODEL_FILE_PATH: &str = "/Users/hi/niuma/.gemini_selected_model";
const TG_MODEL_CONFIG: &str = "/Users/hi/niuma/tg_model.config";
const AGY_WRAPPER_BIN: &str = "/Users/hi/niuma/bin/agy_wrapper";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountRotationInfo {
    pub active_index: usize,
    pub accounts: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelOption {
    pub id: String,
    pub label: String,
    pub provider: String,
    pub description: String,
    pub is_recommended: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelListResponse {
    pub current_model: String,
    pub available_models: Vec<ModelOption>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SwitchModelRequest {
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStatusResponse {
    pub agent_role: String,
    pub current_model: String,
    pub gemini_rules: String,
    pub rotation: Option<AccountRotationInfo>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PromptRequest {
    pub prompt: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GeminiRulesRequest {
    pub content: String,
}

pub fn get_current_model() -> String {
    fs::read_to_string(MODEL_FILE_PATH)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .unwrap_or_else(|| "Gemini 3.8 Flash (High)".to_string())
}

pub async fn get_agent_status() -> Json<AgentStatusResponse> {
    let rules = fs::read_to_string(GEMINI_MD_PATH).unwrap_or_default();
    let rotation = load_rotation_status();
    let cur_model = get_current_model();

    Json(AgentStatusResponse {
        agent_role: "分身3号 (全栈量化与系统自驱代理)".to_string(),
        current_model: cur_model,
        gemini_rules: rules,
        rotation,
    })
}

pub async fn list_available_models() -> Json<ModelListResponse> {
    let cur = get_current_model();
    let models = vec![
        ModelOption {
            id: "Gemini 3.8 Flash (High)".to_string(),
            label: "Gemini 3.8 Flash (High)".to_string(),
            provider: "Google".to_string(),
            description: "最新 3.8 旗舰 • 极速高智商 • 官方默认推荐".to_string(),
            is_recommended: true,
        },
        ModelOption {
            id: "Gemini 3.7 Flash (High)".to_string(),
            label: "Gemini 3.7 Flash (High)".to_string(),
            provider: "Google".to_string(),
            description: "官方 3.7 旗舰 • 高速稳定".to_string(),
            is_recommended: false,
        },
        ModelOption {
            id: "Gemini 3.1 Pro (High)".to_string(),
            label: "Gemini 3.1 Pro (High)".to_string(),
            provider: "Google".to_string(),
            description: "默认高阶深度推理 • 超长上下文架构".to_string(),
            is_recommended: false,
        },
        ModelOption {
            id: "Claude Sonnet 4.6 (Thinking)".to_string(),
            label: "Claude Sonnet 4.6 (Thinking)".to_string(),
            provider: "Anthropic".to_string(),
            description: "Claude 深度思考与长链条代码重构".to_string(),
            is_recommended: false,
        },
        ModelOption {
            id: "Claude Opus 4.6 (Thinking)".to_string(),
            label: "Claude Opus 4.6 (Thinking)".to_string(),
            provider: "Anthropic".to_string(),
            description: "Claude 顶级全能大模型 • 复杂推演".to_string(),
            is_recommended: false,
        },
        ModelOption {
            id: "GPT-OSS 120B (Medium)".to_string(),
            label: "GPT-OSS 120B (Medium)".to_string(),
            provider: "OpenAI".to_string(),
            description: "开源推理大模型 • 通用基准测试".to_string(),
            is_recommended: false,
        },
    ];
    Json(ModelListResponse {
        current_model: cur,
        available_models: models,
    })
}

pub async fn switch_model(Json(payload): Json<SwitchModelRequest>) -> Json<serde_json::Value> {
    let model = payload.model.trim();
    if model.is_empty() {
        return Json(json!({"success": false, "error": "Model name cannot be empty"}));
    }
    let _ = fs::write(MODEL_FILE_PATH, model);
    let _ = fs::write(TG_MODEL_CONFIG, model);
    Json(json!({
        "success": true,
        "current_model": model,
        "message": format!("驱动模型已成功切换为: {}", model)
    }))
}

pub async fn update_gemini_rules(Json(payload): Json<GeminiRulesRequest>) -> Json<serde_json::Value> {
    if let Ok(_) = fs::write(GEMINI_MD_PATH, &payload.content) {
        return Json(json!({"success": true, "message": "GEMINI.md rules updated successfully."}));
    }
    Json(json!({"success": false, "error": "Failed to write GEMINI.md"}))
}

pub async fn execute_agent_prompt(Json(payload): Json<PromptRequest>) -> Json<serde_json::Value> {
    let p = payload.prompt.trim();
    if p.is_empty() {
        return Json(json!({"success": false, "error": "Prompt cannot be empty"}));
    }

    let cur_model = get_current_model();
    let output_res = Command::new(AGY_WRAPPER_BIN)
        .arg("--model")
        .arg(&cur_model)
        .arg("--print")
        .arg(p)
        .output();

    match output_res {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            Json(json!({
                "success": output.status.success(),
                "response": stdout,
                "error": if stderr.is_empty() { None } else { Some(stderr) }
            }))
        }
        Err(e) => Json(json!({"success": false, "error": format!("Execution failed: {}", e)})),
    }
}

fn load_rotation_status() -> Option<AccountRotationInfo> {
    if let Ok(content) = fs::read_to_string(STATUS_JSON_PATH) {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&content) {
            let idx = val.get("active_index").and_then(|v| v.as_u64()).unwrap_or(0) as usize;
            let accs = val.get("accounts").cloned().unwrap_or(json!({}));
            return Some(AccountRotationInfo {
                active_index: idx,
                accounts: accs,
            });
        }
    }
    None
}
