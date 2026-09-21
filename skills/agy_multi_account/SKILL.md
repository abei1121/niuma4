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

## 核心架构原理
1. **HOME 隔离沙盒**：`agy_wrapper` 通过覆盖 `HOME` 环境变量，将 agy 进程的配置目录切换到对应账号的独立沙盒目录，实现账号间完全隔离。
2. **stderr 捕获识别**：实时捕获 agy 进程的 stderr，同时透传到终端；检测到 `429/resource_exhausted/quota` 关键词时触发轮换。
3. **动态冷却时间戳**：解析错误中的 `resets in Xm` 时长，写入 `status.json` 的 `blocked_until` 字段，加 30 秒缓冲。
4. **状态原子读写**：所有状态变更通过 `status.json` 原子持久化，下次启动自动加载恢复。
5. **网络瞬断重试**：超时/502/503 类错误最多重试 3 次（间隔 3 秒），不触发账号轮换。

## 深度原理索引
- 源码参考: `/tmp/fenshen2/agy_wrapper_rust/` (fenshen2 仓库)
- OAuth 换票脚本: `/Users/hi/niuma/niuma1-main/projects/gemini_account_probe/scripts/gemini_oauth_flow.py`
