---
name: hy2_network_rotator
description: Hysteria 2 multi-node speed benchmarking, latency probe and millisecond-level hot switching engine.
triggers:
  - hy2_switch
  - hy2_network_rotator
  - "network switch"
---

# Hysteria 2 高速专网代理与网络自愈引擎

## 概述
基于 Hysteria 2 (Salamander 混淆) 的专网高速通道与 Rust 探针自愈守护，负责保障与境外大模型和 Telegram 接口的毫秒级低延迟与高可用。

## 专职执行体与本地端口
- 客户端执行体: `/Users/hi/niuma/bin/hysteria`
- 配置文件定点: `/Users/hi/niuma/hysteria.yaml`
- 自愈看门狗: `/Users/hi/niuma/bin/proxy_health_checker_rust`
- 本地代理端口:
  - SOCKS5: `127.0.0.1:10808`
  - HTTP: `127.0.0.1:10809`

## 核心控制与排障命令
1. 检查当前代理连通性与公网出口:
   `curl -s -x socks5h://127.0.0.1:10808 https://api.ipify.org`
2. 检查 Google 接口握手延迟:
   `curl -I -x socks5h://127.0.0.1:10808 https://www.google.com --max-time 5`
3. 重启 Hysteria 2 服务:
   `/Users/hi/niuma/scripts/manage_services.sh restart hysteria`
4. 查看代理自愈守护日志:
   `tail -n 20 /Users/hi/niuma/proxy_health_checker.log`

