#!/bin/bash
# ==============================================================================
# 牛马4号 开机自启入口脚本 (由 macOS launchd 守护进程加载)
# ==============================================================================

export PATH="/Users/hi/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export HOME="/Users/hi"
export USER="hi"

BASE_DIR="/Users/hi/niuma"
BOOT_LOG="$BASE_DIR/launchd_boot.log"

echo "========================================================" >> "$BOOT_LOG"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [LaunchAgent] 物理机开机/登录事件触发，准备拉起服务..." >> "$BOOT_LOG"

# 登录后等待 5 秒，确保网络堆栈 (Wi-Fi/以太网/DNS) 及系统守护环境完全初始化
sleep 5

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [LaunchAgent] 开始执行核心常驻服务全量拉起..." >> "$BOOT_LOG"

# 调用服务管理脚本拉起全量守护进程
"$BASE_DIR/scripts/manage_services.sh" start >> "$BOOT_LOG" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [LaunchAgent] 核心常驻服务拉起完成，运行状态巡检：" >> "$BOOT_LOG"
"$BASE_DIR/scripts/manage_services.sh" status >> "$BOOT_LOG" 2>&1
echo "========================================================" >> "$BOOT_LOG"
