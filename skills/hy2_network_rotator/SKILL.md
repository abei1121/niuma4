---
name: hy2_network_rotator
description: Hysteria 2 multi-node speed benchmarking, latency probe and millisecond-level hot switching engine.
triggers:
  - hy2_switch
  - hy2_network_rotator
  - "network switch"
---

# Hysteria 2 专网节点测速与秒级热切换引擎

## 概述
基于 Rust 开发的高性能网络测速与热切换 CLI 工具，负责保障与境外大模型接口通信的毫秒级低延迟与高可用。

## 专职执行体
- 执行体路径: `/Users/hi/niuma/bin/hy2_switch` (软链接: `/Users/hi/niuma/bin/hy2_network_rotator`)
- 底层服务: `hysteria-client.service`

## 核心控制命令
1. 查看所有节点状态与连通性概览:
   `hy2_switch status`
2. 执行全节点真实延迟并发测速横评:
   `hy2_switch ping`
3. 切换主用节点 (例如切换至香港/日本节点):
   `hy2_switch switch <节点名称>`
4. 自动优选最低延迟可用节点:
   `hy2_switch auto`

## 验证与排障
- 检查当前代理端口: `curl -x socks5h://127.0.0.1:10808 https://api.ipify.org`
- 详细参考文档: `/Users/hi/niuma/lengbeifen/hy2_network_rotator_reference.md`
