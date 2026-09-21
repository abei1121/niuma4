pub mod probe;
pub mod registry;

use axum::response::Json;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::path::Path;

use self::probe::{check_process, execute_probe, get_version, resolve_path};
use self::registry::REGISTRY;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolItem {
    pub id: String,
    pub name: String,
    pub category: String,
    pub binary_path: String,
    pub version: String,
    pub status: String,
    pub is_running: bool,
    pub description: String,
    pub probe_cmd: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ProbeRequest {
    pub id: Option<String>,
}

pub async fn list_toolchain_registry() -> Json<serde_json::Value> {
    let mut tasks = Vec::new();
    for &spec in REGISTRY {
        tasks.push(tokio::task::spawn_blocking(move || {
            let bin_path = resolve_path(spec.paths).unwrap_or_else(|| spec.paths[0].to_string());
            let exists = Path::new(&bin_path).exists();
            let is_running = check_process(spec.process_pattern);

            let (version, status) = if exists {
                let v = get_version(&bin_path, spec.version_args);
                let s = if is_running { "Running" } else { "Ready" };
                (v, s.to_string())
            } else {
                ("未安装".to_string(), "Missing".to_string())
            };

            ToolItem {
                id: spec.id.to_string(),
                name: spec.name.to_string(),
                category: spec.category.to_string(),
                binary_path: bin_path,
                version,
                status,
                is_running,
                description: spec.description.to_string(),
                probe_cmd: format!("{} {}", spec.id, spec.probe_args.join(" ")).trim().to_string(),
            }
        }));
    }

    let mut tools = Vec::new();
    let mut categories = std::collections::BTreeSet::new();
    let mut ready_count = 0;
    let mut running_count = 0;

    for task in tasks {
        if let Ok(tool) = task.await {
            categories.insert(tool.category.clone());
            if tool.status != "Missing" {
                ready_count += 1;
            }
            if tool.is_running {
                running_count += 1;
            }
            tools.push(tool);
        }
    }

    Json(json!({
        "total_count": tools.len(),
        "ready_count": ready_count,
        "running_count": running_count,
        "categories": categories.into_iter().collect::<Vec<_>>(),
        "tools": tools,
    }))
}

pub async fn probe_toolchain(Json(payload): Json<ProbeRequest>) -> Json<serde_json::Value> {
    let target_id = payload.id.unwrap_or_default();
    let mut tasks = Vec::new();

    for &spec in REGISTRY {
        if !target_id.is_empty() && spec.id != target_id {
            continue;
        }
        tasks.push(tokio::task::spawn_blocking(move || {
            execute_probe(&spec)
        }));
    }

    let mut probe_results = Vec::new();
    for task in tasks {
        if let Ok(res) = task.await {
            probe_results.push(res);
        }
    }

    Json(json!({
        "success": true,
        "count": probe_results.len(),
        "results": probe_results,
    }))
}
