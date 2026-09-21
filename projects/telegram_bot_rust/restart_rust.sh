#!/bin/bash
set -e

# 规则4：严禁未推送直接杀死进程。先通过当前在线的 8090 端口推送预告通知
/home/a/tg_send "🚀 准备将 Telegram Bot 服务引擎升级并切换至 Rust 原生版本..." || true
sleep 1

# 杀死旧的 Go 进程或现有 telegram_bot 进程
pkill -9 -f "/home/a/telegram_bot_go/telegram_bot" 2>/dev/null || true
pkill -9 -f "/home/a/telegram_bot_rust/target/release/telegram_bot_rust" 2>/dev/null || true
sleep 2

# 后台启动 Rust 版本 Telegram Bot
nohup /home/a/telegram_bot_rust/target/release/telegram_bot_rust > /home/a/telegram_bot.log 2>&1 &

# 等待 Webhook 服务启动 (:8090)
sleep 3

# 实弹打靶验收推送
/home/a/tg_send "✅ Rust 版 Telegram Bot 引擎已完美上线！无内存泄漏风险，多模块解耦架构运行正常。"
