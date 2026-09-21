---
name: system_keeper
description: System watchdog, zombie/orphan process reaper, Mac M2 8GB memory protector and core services self-healing daemon.
triggers:
  - system_keeper
  - orphan_reaper
  - "system watchdog"
---

# System Keeper 孤儿收割与进程看门狗 (macOS M2 专属版)

## 概述
常驻后台的核心看门狗服务，专职负责保护 Apple Mac mini M2 8GB 统一内存不被撑爆，定时收割无父终端的悬挂孤儿进程（非 launchd 接管且 PPID 为 1）、僵尸进程与泄漏进程，并对核心守护进程进行保活和日志滚动治理。

## 专职执行体与自启配置
- 执行体路径: `/Users/hi/niuma/bin/system_keeper_rust` (源码: `/Users/hi/niuma/niuma1-main/projects/system_keeper_rust`)
- 自启入口: `~/Library/LaunchAgents/com.niuma.services.plist` -> `/Users/hi/niuma/scripts/boot_autostart.sh`
- 运行日志: `/Users/hi/niuma/system_keeper.log`

## 常用运维命令
1. 查看看门狗服务运行状态:
   `/Users/hi/niuma/scripts/manage_services.sh status` 或 `manage_services status`
2. 检查孤儿收割与巡检实时日志:
   `tail -n 25 /Users/hi/niuma/system_keeper.log`
3. 重启看门狗守护进程:
   `/Users/hi/niuma/scripts/manage_services.sh restart system_keeper_rust`

## 保护与守护清单
- 重点保活: `poly_mission_control`, `telegram_bot_rust`, `proxy_health_checker_rust`, `lan_file_server`, `hysteria`
- 保护白名单: 严禁误杀 Telegram Bot 拉起的子进程与当前工作会话终端进程
