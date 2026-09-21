export interface SystemMetrics {
  cpu_usage_pct: number;
  cpu_cores: number;
  cpu_model: string;
  load_avg_1m: number;
  load_avg_5m: number;
  load_avg_15m: number;
  cpu_cores_usage: number[];
  top_processes: {
    pid: string;
    name: string;
    cpu_pct: number;
    mem_pct: number;
  }[];
  memory_total_mb: number;
  memory_used_mb: number;
  memory_free_mb: number;
  disk_total_gb: number;
  disk_used_gb: number;
  disk_avail_gb: number;
  disk_used_pct: number;
  uptime_hours: number;
  crontab_active: boolean;
  telegram_bot_active: boolean;
  sidecar_active: boolean;
  last_batch_run?: string | null;
  [key: string]: any;
}

export interface GeminiAccount {
  index: number;
  name: string;
  is_active: boolean;
  is_cooling: boolean;
  cooldown_remaining_sec: number;
  status: string;
  token_health?: string;
  [key: string]: any;
}

export interface SubagentItem {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'error';
  last_active?: string;
  current_task?: string;
  description?: string;
  task_count?: number;
  [key: string]: any;
}

export interface DaemonStatus {
  name: string;
  service_name: string;
  status: 'active' | 'inactive' | 'failed';
  uptime?: string;
  pid?: number;
  description?: string;
  is_running?: boolean;
  cpu_pct?: number;
  mem_mb?: number;
  [key: string]: any;
}

export interface CrontabJob {
  schedule: string;
  command: string;
  description?: string;
  last_run?: string;
  next_run?: string;
  log_path?: string;
  [key: string]: any;
}

export interface SkillItem {
  name: string;
  description: string;
  triggers: string[];
  path?: string;
  enabled?: boolean;
  title?: string;
  is_executable_present?: boolean;
  reference_path?: string;
  ref_lines?: number;
  [key: string]: any;
}

export interface WikiItem {
  name: string;
  path: string;
  title?: string;
  relative_path?: string;
  size_human?: string;
  size_bytes?: number;
  modified_time?: string;
  [key: string]: any;
}
