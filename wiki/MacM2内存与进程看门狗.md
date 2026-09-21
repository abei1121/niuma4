---
name: system_keeper
description: System watchdog, zombie/orphan process reaper, 8GB memory protector and core services self-healing daemon.
triggers:
  - system_keeper
  - orphan_reaper
  - "system watchdog"
---

# System Keeper 孤儿收割与进程看门狗 (Rust Edition)

## 概述
常驻后台的核心看门狗服务，专职负责保护 J3710 8GB 物理内存不被撑爆，定时收割无父进程的悬挂孤儿进程、僵尸进程与泄漏进程，并对核心守护进程进行保活。

## 专职执行体与系统服务
- 执行体路径: `/home/a/bin/system_keeper` (源码: `/home/a/system_keeper_rust`)
- 系统服务名: `system_keeper.service`

## 常用运维命令
1. 查看看门狗服务运行状态:
   `systemctl status system_keeper`
2. 检查孤儿收割与巡检实时日志:
   `journalctl -u system_keeper -n 25 --no-pager`
3. 重启看门狗守护进程:
   `systemctl restart system_keeper`

## 保护与守护清单
- 重点保活: `poly_mission_control`, `telegram_bot`, `hysteria-client`, `hermes_heartbeat`
- 详细参考文档: `/home/a/lengbeifen/system_keeper_reference.md`
