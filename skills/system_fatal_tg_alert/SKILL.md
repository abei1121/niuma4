---
name: system_fatal_tg_alert
description: System fatal error monitor, automated crash self-healing and emergency Telegram P0 alert bridge.
triggers:
  - "fatal error"
  - "system alert"
  - system_fatal_tg_alert
---

# 系统致命错误监控与自愈推送守卫 (Fatal TG Alert - macOS M2 专属版)

## 概述
核心系统兜底告警与自愈组件，负责在基础服务（控制台、TG Bot、代理客户端等）发生宕机或内存爆表时，先静默尝试拉起自愈；若自愈失败则直连 Telegram 强推紧急报警。

## 专职执行体与关联组件
- 核心守护执行体: `/Users/hi/niuma/bin/system_keeper_rust`
- 紧急推送管道: `/Users/hi/niuma/bin/tg_send "告警信息"` (Webhook: `:8090/send_tg`)
- 集中服务管理: `/Users/hi/niuma/scripts/manage_services.sh`

## 告警规则与机制
1. **静默拉起优先**：检测到服务异常中断，优先执行 `/Users/hi/niuma/scripts/manage_services.sh restart <服务名>` 尝试静默自愈。
2. **P0 紧急推送**：自愈多次仍失败时，调用 Telegram 接口触发高优先级告警，绝不滥报假警。

## 验证与排障
- 手动测试告警推送: `/Users/hi/niuma/bin/tg_send "【测试告警】系统守卫告警通道测试通过"`
