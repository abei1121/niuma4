---
name: anti_busy_wait_guard
description: Rust-based PreToolUse hook preventing infinite polling loops, excessive manage_task calls, and dangerous commands.
triggers:
  - anti_busy_wait_guard
  - tool_guard
  - "polling guard"
  - "防轮询"
  - "死循环拦截"
---

# Rust 原生防轮询死循环守卫 (Anti-Busy-Wait Guard)

## 概述
机械级拦截器，接入 Antigravity PreToolUse 钩子，从物理层杜绝 Agent 在多回合长任务执行中陷入无脑轮询与死循环。

## 专职执行体
- 二进制路径: `/Users/hi/niuma/bin/agy_tool_guard`
- 源码路径: `/Users/hi/niuma/sandbox/agy_tool_guard`
- 钩子配置: `~/.gemini/config/hooks/hooks.json`

## 拦截规则与阈值
1. **任务轮询拦截**：60 秒内对同一后台任务调用 `manage_task(Action="status")` 超过 2 次直接拦截报错。
2. **高频定时器拦截**：拦截 `schedule(DurationSeconds <= 30)` 的短周期轮询模拟行为。
3. **危险命令拦截**：机械拦截 `rm -rf /`、`rm -rf ~`、fork bomb、未保护的级联删除等高危操作。

## Hook I/O 协议 (AGY PreToolUse 标准)
- **Input (stdin)**: `{"toolCall": {"name": "...", "args": {...}}, "stepIdx": N, ...}`
- **Output (stdout)**: `{"decision": "allow"|"deny", "reason": "..."}`

## 验证与排障
- 守卫状态自检: `/Users/hi/niuma/bin/agy_tool_guard --check`
- 查看版本信息: `/Users/hi/niuma/bin/agy_tool_guard --version`
- 状态持久化文件: `~/.gemini/agy_tool_guard_state.json`

## 重新构建
```bash
cd /Users/hi/niuma/sandbox/agy_tool_guard
~/.cargo/bin/cargo build --release
cp target/release/agy_tool_guard /Users/hi/niuma/bin/agy_tool_guard
```
