---
name: niuma_disaster_recovery
description: 牛马4号 GitHub 异地脱敏灾难恢复与本地冷归档管理守卫。
triggers:
  - niuma_backup
  - disaster_recovery
  - "灾备"
  - "灾难恢复"
  - "github backup"
---

# 牛马4号 异地脱敏灾难恢复与冷备份守卫 (Disaster Recovery Vault)

## 概述
专职负责牛马4号核心资产的异地容灾与脱敏备份，保障在物理宿主机宕机、硬盘损毁或系统崩溃重装后，半小时内无损复活全部心智记忆、技能与控制面板。

## 灾备仓库定点
- **GitHub 私有灾备仓**: `git@github.com:abei1121/niuma4.git` (Private)
- **本地独立冷隔离区**: `/Users/hi/niuma/niuma4_vault/`
- **一键脱敏导出工具**: `/Users/hi/niuma/bin/niuma_backup`

## 核心备份资产清单 (轻量级纯源码与配置文件)
1. **灵魂设定**: `/Users/hi/niuma/GEMINI.md` 与 `AGENTS.md` (Apple Silicon M2 / VideoToolbox 硬件架构与行为铁律)
2. **记忆中枢**: `memory/jiyi.json` 与 `memory/jiyi.md`
3. **架构与业务知识库**: `wiki/` (5篇系统架构图谱与黄金赛道指南)
4. **现役核心技能库**: `/Users/hi/.agents/skills/` (10大技能全量同步)
5. **自研项目纯源码**:
   - `poly_mission_control` (Rust 后端 + Vite/React 前端，剥离 target 与 node_modules)
   - `agy_wrapper_rust` (多账号透明轮换包装器，含 JIT 按需惰性刷新)
   - `gemini_account_probe` (多账号态势与冷却探针)
   - `agy_tool_guard` (PreToolUse 机械级防死循环守卫)
   - `telegram_bot_rust` (Rust 源码，真实 Token 自动转换为 `.env.example`)
   - `system_keeper_rust`、`lan_file_server_rust`、`proxy_health_checker_rust`
6. **系统维护工具与守护**: `scripts/` (manage_services.sh, tg_send, gemini_oauth_flow)

## 常用灾备命令
1. **日常一键增量脱敏备份与推送**:
   `/Users/hi/niuma/bin/niuma_backup`
2. **全新机器灾难一键复活 (在新系统执行)**:
   ```bash
   git clone git@github.com:abei1121/niuma4.git /Users/hi/niuma/niuma4_vault
   cd /Users/hi/niuma/niuma4_vault
   bash restore.sh
   ```

## 安全红线与脱敏铁律
- 严禁真实 Telegram Bot Token、Hysteria 2 节点密钥、Tailscale 凭证入库。
- 严禁大视频文件（mp4/mkv）与编译缓存（target/dist）入库。
- 脚本内嵌安全审计器，一旦检测到未脱敏私钥立即熔断终止推送。
