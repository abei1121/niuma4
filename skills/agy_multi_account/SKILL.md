---
name: agy_multi_account
description: >-
  AGY 多账号矩阵动态冷却与配额探针。用于检测账号配额消耗、状态巡检、故障自动轮换，以及新增账号 PKCE OAuth 授权与凭证录入。
triggers:
  - "多账号轮换"
  - "轮询"
  - "多账号轮询"
  - "账号轮询"
  - "动态轮询"
  - "gemini account probe"
  - "账号配额检测"
  - "agy cooling"
  - "agy_multi_account"
  - "新增大模型账号"
  - "gemini oauth flow"
  - "switch account"
  - "agy account"
---

# AGY 多账号矩阵轮换与配额探针 (Agy Multi Account)

## 专职执行载体（本机 macOS 路径）
- **自动轮换 agy 包装器**: `/Users/hi/niuma/bin/agy_wrapper`
- **状态与冷却探针**: `/Users/hi/niuma/bin/gemini_account_probe`
- **PKCE OAuth 授权换票**: `/Users/hi/niuma/bin/gemini_oauth_flow`
- **账号物理根目录**: `/Users/hi/.gemini_accounts/` (acc1, acc2, acc3 独立沙盒)
- **状态真理文件**: `/Users/hi/.gemini_accounts/status.json`
- **源码工程**: `/Users/hi/niuma/niuma1-main/projects/agy_wrapper_rust/` 和 `gemini_account_probe/`

## 核心调用命令

```bash
# 1. 探测多账号状态与冷却健康度（人类可读）
/Users/hi/niuma/bin/gemini_account_probe

# 2. JSON 格式输出（供自动化消费）
/Users/hi/niuma/bin/gemini_account_probe --json

# 3. 手动切换主运行激活账号（index 从 0 开始）
/Users/hi/niuma/bin/gemini_account_probe --switch 0   # 切换到 acc1
/Users/hi/niuma/bin/gemini_account_probe --switch 1   # 切换到 acc2

# 4. 手动解除指定账号的限流冷却
/Users/hi/niuma/bin/gemini_account_probe --unblock acc1

# 5. 一键解除全部账号冷却
/Users/hi/niuma/bin/gemini_account_probe --unblock-all

# 6. 为新账号初始化沙盒并执行登录
/Users/hi/niuma/bin/agy_wrapper login 1   # 登录 acc1
/Users/hi/niuma/bin/agy_wrapper login 2   # 登录 acc2

# 7. 生成合规 Google OAuth PKCE 授权链接
python3 /Users/hi/niuma/bin/gemini_oauth_flow generate

# 8. 换票并注册新分身（如 acc2）
python3 /Users/hi/niuma/bin/gemini_oauth_flow exchange "4/0A..." acc2
```

## 结果真理核验
- 运行 `gemini_account_probe`，确认目标账号处于 `[正常就绪 (无冷却)]` 且 `[有凭据]`。
- 确认 `/Users/hi/.gemini_accounts/<acc>/.gemini/antigravity-cli/antigravity-oauth-token` 存在且 `auth_method` 为 `consumer`。

## 核心架构原理与铁律防坑准则
1. **HOME 隔离沙盒**：`agy_wrapper` 通过覆盖 `HOME` 环境变量，将 agy 进程的配置目录切换到对应账号的独立沙盒目录，实现账号间完全隔离。
2. **macOS 钥匙串（Keychain）物理隔离铁律（防穿透防死锁）**：
   - **铁律警告**：严禁将任何账号沙盒的 `Library/Keychains` 软链接至宿主机 `/Users/hi/Library/Keychains`！
   - **穿透劫持根因**：Antigravity CLI 原生 Go 二进制的 `ChainedAuth` 优先从 macOS Keychain（`keyringAuth`）提取凭据；若存在软链接，将导致所有账号不论如何切换都强制穿透读取宿主机已保存的 acc1（`yabzaibot@gmail.com`），造成永久锁死 acc1。
   - **物理隔离规范**：每个账号必须保持各自独立的真实空目录 `~/.gemini_accounts/<acc>/Library/Keychains`，强迫 Antigravity 回退读取沙盒内的 `antigravity-oauth-token` 文件。`agy_wrapper` 在启动与登录时均内置防穿透逻辑：检测到软链接立即强制断开拔除并重建真实目录。
3. **面板与命令行双通道切换及生效边界**：
   - **控制面板（8999）**：“大模型矩阵轮换”页点击【设为主号】即时写入 `status.json` 的 `active_index`。
   - **探针命令行**：执行 `/Users/hi/niuma/bin/gemini_account_probe --switch <idx>`。
   - **生效边界铁律**：
     - 面板内置的大模型推演功能（如 Agent 提示词执行、导演智能脚本推演）**立即实时生效**。
     - 新开终端或新运行的 `agy` 进程**立即生效**。
     - **已在运行中的交互式 `agy` 终端会话**：由于进程内存已经加载了启动时的 Token 和环境，**无法被外部进程热重载**，必须在该终端内输入 `/exit` 退出后重新执行 `agy` 即可生效。
4. **stderr 捕获识别**：实时捕获 agy 进程的 stderr，同时透传到终端；检测到 `429/resource_exhausted/quota` 关键词时触发轮换。
5. **动态冷却时间戳**：解析错误中的 `resets in Xm` 时长，写入 `status.json` 的 `blocked_until` 字段，加 30 秒缓冲。
6. **状态原子读写**：所有状态变更通过 `status.json` 原子持久化，下次启动自动加载恢复。
7. **网络瞬断重试**：超时/502/503 类错误最多重试 3 次（间隔 3 秒），不触发账号轮换。

## 深度原理索引
- 源码参考: `/Users/hi/niuma/niuma1-main/projects/agy_wrapper_rust/`
- 控制台后端: `/Users/hi/niuma/niuma1-main/projects/poly_mission_control/src/handlers/gemini_accounts/`
- OAuth 换票脚本: `/Users/hi/niuma/niuma1-main/projects/gemini_account_probe/scripts/gemini_oauth_flow.py`
