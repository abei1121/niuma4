# niuma4 - 牛马4号 核心灾备与灵魂冷备份仓

> **定位**：小韭菜牧场剪辑牛马（牛马4号 • Apple Silicon M2 macOS）的异地灾难恢复仓库（Disaster Recovery Vault）。  
> 仅存放核心灵魂准则、长期记忆、10 大现役技能库、自研纯源码与管理脚本。**已执行严格的敏感密钥剥离与脱敏处理**。

---

## 仓内核心资产目录

```text
├── GEMINI.md               # 核心行为法则与硬件纪律 (Apple Silicon M2 / VideoToolbox 硬件加速)
├── AGENTS.md               # 代理中枢总指挥定点
├── memory/                 # 记忆中枢 (jiyi.json, jiyi.md)
├── wiki/                   # 5 篇架构知识图谱与导演指南
├── skills/                 # 10 大现役核心技能库
│   ├── agy_multi_account        # 多账号矩阵动态轮换与惰性保鲜
│   ├── anti_busy_wait_guard     # Rust 原生防轮询死循环守卫
│   ├── video_director_pipeline  # 12 大赛道与 72 细分导演流水线
│   ├── niuma_disaster_recovery  # 异地脱敏灾难恢复守卫
│   ├── hermes_heartbeat_worker  # 心跳探针与夜间做梦守护
│   ├── hy2_network_rotator      # Hysteria 2 节点测速热切换
│   ├── system_fatal_tg_alert    # 致命错误自愈与 TG P0 告警桥
│   ├── system_keeper            # 8GB 内存保护与进程收割看门狗
│   ├── telegram_bot_skill       # TG 手机端双向通信交互
│   └── pinokio                  # 生态应用发现与调用
├── projects/               # 自研纯源码 (已剥离 target/ 与 node_modules/)
│   ├── poly_mission_control     # 视频剪辑中枢 + Web 前端
│   ├── agy_wrapper_rust         # 多账号透明轮换包装器 (JIT 惰性刷新)
│   ├── gemini_account_probe     # 多账号健康与冷却态势探针
│   ├── agy_tool_guard           # PreToolUse 机械级安全拦截器
│   ├── telegram_bot_rust        # TG 双向通信桥 (含 .env.example)
│   ├── system_keeper_rust       # 内存保护看门狗
│   ├── lan_file_server_rust     # 局域网跨端文件传输
│   └── proxy_health_checker_rust# 代理健康探针
├── scripts/                # 常用运维脚本
└── restore.sh              # 新机器一键灾难复原脚本
```

---

## 灾难一键复活步骤 (在全新 Mac 执行)

1. **克隆私有仓**：
   ```bash
   git clone git@github.com:abei1121/niuma4.git /Users/hi/niuma/niuma4_vault
   ```
2. **执行无损复原**：
   ```bash
   cd /Users/hi/niuma/niuma4_vault
   bash restore.sh
   ```
3. **补充真实凭据**：
   - 复制 `/Users/hi/niuma/projects/telegram_bot_rust/.env.example` 为 `.env` 并填入真实 TG Token。
   - 运行 `/Users/hi/niuma/bin/gemini_oauth_flow generate` 录入 Gemini 多账号凭据。
