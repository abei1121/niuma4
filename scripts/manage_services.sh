#!/bin/bash
# 牛马4号 核心常驻服务集中管理脚本 (macOS Darwin ARM64)
# 支持: start, stop, restart, status

ACTION="${1:-status}"
TARGET="${2:-}"
BASE_DIR="/Users/hi/niuma"
BIN_DIR="$BASE_DIR/bin"
LOG_DIR="$BASE_DIR"

export PATH="/Users/hi/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export HOME="/Users/hi"
export USER="hi"

SERVICES=(
    "poly_mission_control:自媒体控制台中枢 Web 管理引擎 (8999端口):$BIN_DIR/poly_mission_control --port 8999 --host 0.0.0.0:$LOG_DIR/poly_mission_control.log"
    "system_keeper_rust:系统机械级常驻守护引擎 (孤儿收割与防卡死):$BIN_DIR/system_keeper_rust:$LOG_DIR/system_keeper.log"
    "proxy_health_checker_rust:代理健康监测与网络自愈服务 (自动探活):$BIN_DIR/proxy_health_checker_rust:$LOG_DIR/proxy_health_checker.log"
    "telegram_bot_rust:Telegram 手机端双向通信桥接服务 (8090端口):$BIN_DIR/telegram_bot_rust:$LOG_DIR/telegram_bot.log"
    "lan_file_server:局域网高速跨设备文件传输服务 (8888端口):$BIN_DIR/lan_file_server $BASE_DIR:$LOG_DIR/lan_file_server.log"
    "hysteria:Hysteria 2 高速专线代理隧道 (10808/10809端口):$BIN_DIR/hysteria client --config $BASE_DIR/hysteria.yaml:$LOG_DIR/hysteria.log"
)

is_running() {
    local proc_name="$1"
    pgrep -f "$proc_name" >/dev/null 2>&1
}

start_service() {
    local name="$1"
    local desc="$2"
    local cmd="$3"
    local log="$4"

    if [ "$name" = "hysteria" ] && [ ! -f "$BASE_DIR/hysteria.yaml" ]; then
        echo "[$name] 未启动 (需提供 $BASE_DIR/hysteria.yaml 配置文件)"
        return
    fi

    if is_running "$name"; then
        echo "[$name] 已经在运行中 (PID: $(pgrep -f "$name" | head -1))"
    else
        echo "正在启动 [$name] ($desc)..."
        nohup $cmd >> "$log" 2>&1 &
        sleep 1
        if is_running "$name"; then
            echo "[$name] 启动成功 (PID: $(pgrep -f "$name" | head -1))"
        else
            echo "[$name] 启动失败，请检查日志: $log"
        fi
    fi
}

stop_service() {
    local name="$1"
    if is_running "$name"; then
        echo "正在停止 [$name] (PID: $(pgrep -f "$name" | tr '\n' ' '))..."
        pkill -f "$name"
        sleep 0.5
    else
        echo "[$name] 未在运行"
    fi
}

case "$ACTION" in
    start)
        if [ -n "$TARGET" ]; then
            found=false
            for item in "${SERVICES[@]}"; do
                IFS=':' read -r name desc cmd log <<< "$item"
                if [[ "$name" == *"$TARGET"* ]]; then
                    start_service "$name" "$desc" "$cmd" "$log"
                    found=true
                fi
            done
            if [ "$found" = false ]; then
                echo "未找到匹配服务: $TARGET"
                exit 1
            fi
        else
            echo "=== 正在启动牛马4号全量核心守护服务 ==="
            for item in "${SERVICES[@]}"; do
                IFS=':' read -r name desc cmd log <<< "$item"
                start_service "$name" "$desc" "$cmd" "$log"
            done
        fi
        ;;
    stop)
        if [ -n "$TARGET" ]; then
            found=false
            for item in "${SERVICES[@]}"; do
                IFS=':' read -r name desc cmd log <<< "$item"
                if [[ "$name" == *"$TARGET"* ]]; then
                    stop_service "$name"
                    found=true
                fi
            done
            if [ "$found" = false ]; then
                echo "未找到匹配服务: $TARGET"
                exit 1
            fi
        else
            echo "=== 正在停止牛马4号全量守护服务 ==="
            for item in "${SERVICES[@]}"; do
                IFS=':' read -r name desc cmd log <<< "$item"
                stop_service "$name"
            done
        fi
        ;;
    restart)
        if [ -n "$TARGET" ]; then
            found=false
            for item in "${SERVICES[@]}"; do
                IFS=':' read -r name desc cmd log <<< "$item"
                if [[ "$name" == *"$TARGET"* ]]; then
                    stop_service "$name"
                    start_service "$name" "$desc" "$cmd" "$log"
                    found=true
                fi
            done
            if [ "$found" = false ]; then
                echo "未找到匹配服务: $TARGET"
                exit 1
            fi
        else
            echo "=== 正在重启牛马4号全量守护服务 ==="
            for item in "${SERVICES[@]}"; do
                IFS=':' read -r name desc cmd log <<< "$item"
                stop_service "$name"
                start_service "$name" "$desc" "$cmd" "$log"
            done
        fi
        ;;
    status)
        echo "=== 牛马4号 核心守护服务实时运行状态 ==="
        printf "%-26s %-8s %-12s %s\n" "服务标识" "状态" "PID" "描述"
        echo "----------------------------------------------------------------------"
        for item in "${SERVICES[@]}"; do
            IFS=':' read -r name desc cmd log <<< "$item"
            if is_running "$name"; then
                pid=$(pgrep -f "$name" | head -1)
                printf "%-26s \033[32m%-8s\033[0m %-12s %s\n" "$name" "RUNNING" "$pid" "$desc"
            else
                printf "%-26s \033[31m%-8s\033[0m %-12s %s\n" "$name" "STOPPED" "--" "$desc"
            fi
        done
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
