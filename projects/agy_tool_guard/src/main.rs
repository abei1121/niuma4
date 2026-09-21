use std::collections::HashMap;
use std::fs;
use std::io::{self, Read};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;

// ─── State file path ────────────────────────────────────────────────────────
fn state_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    PathBuf::from(home).join(".gemini").join("agy_tool_guard_state.json")
}

// ─── Persistent state ────────────────────────────────────────────────────────
#[derive(Debug, Serialize, Deserialize, Default)]
struct GuardState {
    /// task_id -> list of unix timestamps (seconds) of recent status calls
    task_status_calls: HashMap<String, Vec<u64>>,
}

impl GuardState {
    fn load() -> Self {
        let p = state_path();
        if let Ok(data) = fs::read_to_string(&p) {
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Self::default()
        }
    }

    fn save(&self) {
        let p = state_path();
        if let Ok(json) = serde_json::to_string_pretty(self) {
            let _ = fs::write(p, json);
        }
    }

    /// Record a status call for `task_id`. Returns the count of calls within
    /// the last 60 seconds (including this one).
    fn record_status_call(&mut self, task_id: &str) -> usize {
        let now = now_secs();
        let calls = self.task_status_calls.entry(task_id.to_string()).or_default();
        // Prune entries older than 60 seconds
        calls.retain(|&t| now - t < 60);
        calls.push(now);
        calls.len()
    }
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

// ─── AGY PreToolUse hook I/O types ──────────────────────────────────────────
// Input format per hooks.md:
//   { "toolCall": { "name": "...", "args": { ... } }, "stepIdx": N, ... }

#[derive(Debug, Deserialize, Default)]
struct ToolCall {
    name: Option<String>,
    args: Option<Value>,
}

#[derive(Debug, Deserialize, Default)]
struct HookInput {
    #[serde(rename = "toolCall")]
    tool_call: Option<ToolCall>,
}

// Output format per hooks.md:
//   { "decision": "allow"|"deny"|"ask"|"force_ask", "reason": "..." }

#[derive(Debug, Serialize)]
struct HookOutput {
    decision: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    reason: Option<String>,
}

impl HookOutput {
    fn allow() -> Self {
        HookOutput { decision: "allow", reason: None }
    }
    fn deny(msg: impl Into<String>) -> Self {
        HookOutput { decision: "deny", reason: Some(msg.into()) }
    }
}

// ─── Self-check mode ─────────────────────────────────────────────────────────
fn self_check() {
    println!("agy_tool_guard v1.0.1 — ACTIVE");
    println!("State file: {}", state_path().display());
    let state = GuardState::load();
    println!("Tracked tasks: {}", state.task_status_calls.len());
    println!("Guard rules:");
    println!("  [1] manage_task(Action=status) for same task > 2 times in 60s → DENY");
    println!("  [2] schedule(DurationSeconds <= 30) → DENY");
    println!("  [3] Dangerous shell commands (rm -rf /, fork bomb, etc.) → DENY");
    println!("Hook I/O: PreToolUse JSON on stdin → decision JSON on stdout");
}

// ─── Main guard logic ─────────────────────────────────────────────────────────
fn run_guard(input: HookInput) -> HookOutput {
    let tool_call = match &input.tool_call {
        Some(tc) => tc,
        None => return HookOutput::allow(),
    };

    let tool_name = tool_call.name.as_deref().unwrap_or("");
    let args = tool_call.args.as_ref();

    // ── Rule 1: manage_task status polling guard ──────────────────────────────
    if tool_name == "manage_task" {
        if let Some(val) = args {
            let action = val.get("Action").and_then(|v| v.as_str()).unwrap_or("");
            if action == "status" {
                let task_id = val
                    .get("TaskId")
                    .and_then(|v| v.as_str())
                    .unwrap_or("__unknown__");
                let mut state = GuardState::load();
                let count = state.record_status_call(task_id);
                state.save();
                if count > 2 {
                    return HookOutput::deny(format!(
                        "[anti_busy_wait_guard] manage_task(status) called {} times in 60s for \
                         task '{}'. BLOCKED — do NOT poll. Wait for the system to notify you \
                         reactively instead.",
                        count, task_id
                    ));
                }
            }
        }
    }

    // ── Rule 2: Short-interval schedule (busy-wait simulation) ────────────────
    if tool_name == "schedule" {
        if let Some(val) = args {
            if let Some(secs) = val.get("DurationSeconds").and_then(|v| v.as_u64()) {
                if secs <= 30 {
                    return HookOutput::deny(format!(
                        "[anti_busy_wait_guard] schedule(DurationSeconds={}) is ≤30s — this \
                         simulates a busy-wait polling loop. BLOCKED. Use a longer interval \
                         (>30s) or rely on reactive wakeup.",
                        secs
                    ));
                }
            }
        }
    }

    // ── Rule 3: Dangerous run_command patterns ────────────────────────────────
    if tool_name == "run_command" {
        if let Some(val) = args {
            let cmd = val.get("CommandLine").and_then(|v| v.as_str()).unwrap_or("");
            let dangerous = [
                "rm -rf /",
                "rm -rf ~",
                "rm -rf $HOME",
                ":(){ :|:& };:",
                "dd if=/dev/zero of=/dev/",
                "mkfs.",
                "> /dev/sda",
                "chmod -R 777 /",
                "chown -R root /",
            ];
            for pat in &dangerous {
                if cmd.contains(pat) {
                    return HookOutput::deny(format!(
                        "[anti_busy_wait_guard] Dangerous command pattern '{}' detected. \
                         BLOCKED.",
                        pat
                    ));
                }
            }
        }
    }

    HookOutput::allow()
}

// ─── Entry point ─────────────────────────────────────────────────────────────
fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.get(1).map(|s| s.as_str()) == Some("--check") {
        self_check();
        return;
    }
    if args.get(1).map(|s| s.as_str()) == Some("--version") {
        println!("agy_tool_guard 1.0.1");
        return;
    }

    // PreToolUse hook mode: read JSON from stdin
    let mut raw = String::new();
    if io::stdin().read_to_string(&mut raw).is_err() {
        // Can't read stdin → fail-open
        println!("{}", serde_json::to_string(&HookOutput::allow()).unwrap());
        return;
    }

    let input: HookInput = match serde_json::from_str(&raw) {
        Ok(v) => v,
        Err(_) => {
            // Malformed input → fail-open
            println!("{}", serde_json::to_string(&HookOutput::allow()).unwrap());
            return;
        }
    };

    let output = run_guard(input);
    println!("{}", serde_json::to_string(&output).unwrap());
}
