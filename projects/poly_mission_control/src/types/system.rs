use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessCpuInfo {
    pub pid: String,
    pub name: String,
    pub cpu_pct: f64,
    pub mem_pct: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub cpu_usage_pct: f64,
    pub cpu_cores: usize,
    pub cpu_model: String,
    pub load_avg_1m: f64,
    pub load_avg_5m: f64,
    pub load_avg_15m: f64,
    pub cpu_cores_usage: Vec<f64>,
    pub top_processes: Vec<ProcessCpuInfo>,
    pub memory_total_mb: u64,
    pub memory_used_mb: u64,
    pub memory_free_mb: u64,
    pub disk_total_gb: u64,
    pub disk_used_gb: u64,
    pub disk_avail_gb: u64,
    pub disk_used_pct: u32,
    pub uptime_hours: f64,
    pub crontab_active: bool,
    pub telegram_bot_active: bool,
    pub sidecar_active: bool,
    pub last_batch_run: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogResponse {
    pub log_name: String,
    pub lines: Vec<String>,
}
