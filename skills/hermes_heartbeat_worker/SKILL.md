---
name: hermes_heartbeat_worker
description: Autonomous 30-minute toolchain health probe, self-healing watchdog and 03:30 night dreaming worker.
triggers:
  - hermes_heartbeat
  - heartbeat_worker
  - "system heartbeat"
---

# 牛马4号 30m 自主心跳探活与做梦反思守卫 (Hermes Pulse)

## 概述
常驻后台探活守卫，每 30 分钟对网络隧道与核心工具链进行脉冲探活，并在每日凌晨 03:30 执行知识库反思与系统状态做梦记录。

## 专职执行体与常驻服务
- 执行体路径: `/Users/hi/niuma/bin/hermes_heartbeat_worker`
- 系统服务名: `hermes_heartbeat.service`
- 做梦脚本定点: `/Users/hi/niuma/bin/dream_cron.sh`

## 常用运维命令
1. 查看心跳服务状态:
   `launchctl list | grep hermes_heartbeat`
2. 查看最新心跳日志:
   `journalctl -u hermes_heartbeat -n 20 --no-pager`
3. 重启心跳服务:
   `launchctl kickstart -k hermes_heartbeat`

## 验证与排障
- 做梦日记归档目录: `/Users/hi/niuma/wiki/journal/`
- 详细参考文档: `/Users/hi/niuma/lengbeifen/hermes_heartbeat_worker_reference.md`
