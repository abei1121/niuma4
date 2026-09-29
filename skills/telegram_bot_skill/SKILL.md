---
name: telegram_bot_skill
description: Telegram high-availability bot bridge and proactive CLI notification push tool for text, media and files.
triggers:
  - tg_send
  - tg_send_file
  - telegram_bot
---

# Telegram Bot 高并发通信与 CLI 强推工具链 (macOS M2 专属版)

## 概述
基于 Rust 原生重构的 Telegram 通信中枢，提供全双工交互 Bot（群聊/私聊指令响应）与极速 CLI 消息与多媒体文件强推工具，内存占用仅约 9.8MB。

## 专职执行体与常驻服务
- CLI 文本强推工具: `/Users/hi/niuma/bin/tg_send` (支持单行文本，超长自动截断与分段)
- CLI 文件/图片强推工具: `/Users/hi/niuma/bin/tg_send_file` (支持图片、海报、压缩包与媒体文件，附带可选标题)
- 后台常驻服务: `telegram_bot_rust` (端口: 8090 Webhook)
- 执行体定点: `/Users/hi/niuma/bin/telegram_bot_rust`
- 源码工程定点: `/Users/hi/niuma/niuma1-main/projects/telegram_bot_rust/`

## 核心调用示例
1. 向命主 Telegram 强推文本通知:
   `/Users/hi/niuma/bin/tg_send "任务处理完成，结果确认正常"`
2. 向命主 Telegram 强推图片/海报/文件:
   `/Users/hi/niuma/bin/tg_send_file "/path/to/poster.png" "战报海报 2K Retina 预览"`
3. 查看 Telegram Bot 运行状态:
   `/Users/hi/niuma/scripts/manage_services.sh status` 或 `pgrep -fl telegram_bot_rust`
4. 检查 Bot 日志:
   `tail -n 20 /Users/hi/niuma/telegram_bot.log`
5. 重启 Bot 服务:
   `/Users/hi/niuma/scripts/manage_services.sh restart telegram_bot_rust`

## 验证与排障
- 文本接口探针: `curl -s -X POST http://127.0.0.1:8090/send_tg --data-urlencode "msg=ping"`
- 文件接口探针: `curl -s -X POST http://127.0.0.1:8090/send_tg_file --data-urlencode "path=/path/to/file" --data-urlencode "caption=test"`
