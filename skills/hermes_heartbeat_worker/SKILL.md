---
name: hermes_heartbeat_worker
description: Autonomous 30-minute toolchain health probe, self-healing watchdog and 03:30 night dreaming worker.
triggers:
  - hermes_heartbeat
  - heartbeat_worker
  - "system heartbeat"
---

# 牛马4号 自主心跳探活与大模型做梦研报守卫 (Hermes Pulse)

## 概述
系统后台探活与做梦反思中枢，负责链路探活，并在每日生成大模型做梦复盘与系统洞察研报，展示于 Web 控制台中枢 (8999 端口)。

## 核心载体与面板接口
- 控制台中枢接口: `http://127.0.0.1:8999/api/insights/dream`
- 网络探活看门狗: `/Users/hi/niuma/bin/proxy_health_checker_rust`
- 日志输出定点: `/Users/hi/niuma/proxy_health_checker.log`
- 控制台研报组件: Mission Control「Hermes 量化每日大模型做梦复盘与研报」

## 常用运维命令
1. 检查探针服务运行状态:
   `ps aux | grep proxy_health_checker_rust`
2. 读取最新做梦研报内容:
   `curl -s http://127.0.0.1:8999/api/insights/dream | jq .`
3. 重启网络与探活服务:
   `/Users/hi/niuma/scripts/manage_services.sh restart proxy_health_checker_rust`

