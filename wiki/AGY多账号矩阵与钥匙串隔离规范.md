# AGY 多账号矩阵与 macOS 钥匙串隔离规范 (Agy Multi Account)

> **修订时间**：2026-09-27  
> **适用机型**：Apple Mac mini M2 / macOS 统一沙盒环境  
> **状态**：全系统已固化并上线运行

---

## 1. 核心架构与单源真理唯一定点 (Single Source of Truth)

- **账号沙盒物理根目录**：`/Users/hi/.gemini_accounts/`（`acc1`, `acc2`, `acc3`, `acc4`, `acc5`）
- **状态真理定点文件**：`/Users/hi/.gemini_accounts/status.json`
- **自动轮换包装器（JIT 执行体）**：`/Users/hi/niuma/bin/agy_wrapper`（由 `projects/agy_wrapper_rust/` 编译）
- **状态与冷却巡检探针**：`/Users/hi/niuma/bin/gemini_account_probe`
- **PKCE OAuth 授权与换票脚本**：`/Users/hi/niuma/bin/gemini_oauth_flow`
- **控制面板（8999 中枢）**：`/Users/hi/niuma/bin/poly_mission_control`（前端：`Preact` + 后端：`Axum`）

---

## 2. 致命血泪教训：macOS 钥匙串（Keychain）穿透劫持

### 2.1 故障现象
命主在控制面板点击切换为主号或使用探针切换主号后，终端交互启动的 `agy` 依然顽固读取 `acc1` 账号（`yabzaibot@gmail.com`），造成“面板点击完全没反应，永远卡死在 acc1”的假象。

### 2.2 底层根因剖析
1. **Antigravity 认证链优先级（`ChainedAuth`）**：
   Antigravity CLI 原生二进制（`/Users/hi/.local/bin/agy.real`）为 Go 语言编写，其 Token 加载逻辑拥有严苛的优先级链条：
   - **第一优先级**：优先调用 macOS 系统的钥匙串服务（`keyringAuth`，基于 `github.com/zalando/go-keyring`）。
   - **第二优先级**：仅当钥匙串查询为空或失败时，才回退读取本地沙盒文件 `~/.gemini/antigravity-cli/antigravity-oauth-token`。
2. **软链接穿透劫持**：
   早期在包装器中曾设置 `symlink("/Users/hi/Library/Keychains", &lib_keychains)`，将每个账号沙盒的 `Library/Keychains` 指向宿主机个人钥匙串。
   由于宿主机钥匙串中存储了命主的原始登录凭证（acc1：`yabzaibot@gmail.com`），无论环境变量 `HOME` 如何切换到 `acc2`、`acc3`，底层 `agy.real` 都会穿透软链接直接从宿主钥匙串读出 acc1 凭据，**彻底无视各账号独立的 `antigravity-oauth-token` 文件**。

### 2.3 物理隔离铁律
- **严禁软链接**：严禁将任何账号沙盒的 `Library/Keychains` 软链接至宿主机 `/Users/hi/Library/Keychains`！
- **独立空目录**：每个账号必须保持各自独立的真实空目录：
  ```bash
  /Users/hi/.gemini_accounts/<acc>/Library/Keychains
  ```
  通过提供空的钥匙串目录，使 `agy.real` 查询系统钥匙串时失败返回，从而**强制触发回退逻辑，读取沙盒专有的 `antigravity-oauth-token`**。
- **自愈防穿透守卫**：
  `agy_wrapper_rust`（`executor.rs`、`login.rs`）与 `poly_mission_control`（`fs_ops.rs`）中均已固化自动修复逻辑：
  ```rust
  let lib_keychains = target_home.join("Library").join("Keychains");
  if lib_keychains.is_symlink() {
      let _ = fs::remove_file(&lib_keychains);
  }
  if !lib_keychains.exists() {
      let _ = fs::create_dir_all(&lib_keychains);
  }
  ```
  任何误建或历史遗留的软链接，在启动或新增账号时都会被自动拔除并重建成独立空目录。

---

## 3. 双通道切换机制与进程生命周期边界

### 3.1 切换通道
1. **控制面板前端切换（推荐）**：
   访问 `http://127.0.0.1:8999` 进入【大模型矩阵轮换与动态冷却池】，在目标账号行点击 **【设为主号】**。
2. **命令行探针极速切换**：
   ```bash
   /Users/hi/niuma/bin/gemini_account_probe --switch 0   # 激活 acc1
   /Users/hi/niuma/bin/gemini_account_probe --switch 1   # 激活 acc2
   /Users/hi/niuma/bin/gemini_account_probe --switch 2   # 激活 acc3
   ```

### 3.2 进程生命周期边界（为什么在原终端里需要退出重进）
- **写入的本质**：切换操作仅原子修改磁盘上的状态真理文件 `/Users/hi/.gemini_accounts/status.json` 中的 `active_index`。
- **生效边界**：
  - **面板内置大模型任务**：面板后端下次触发调用（如智能导演粗洗、Agent 提示词执行）时，**立即实时生效**为新主号。
  - **新打开的终端会话**：直接输入 `agy`，**立即生效**为新主号。
  - **已在运行的交互式终端会话**：进程在启动瞬间已经将当时的 `HOME` 与内存 Token 固化，**外部文件修改无法热注入正在运行的进程内存**。必须在该终端中输入 `/exit` 退出，再次运行 `agy`，即可平滑无缝加载新主号。

---

## 4. 账号状态巡检与日常维护命令

```bash
# 1. 人类可读健康探针巡检
/Users/hi/niuma/bin/gemini_account_probe

# 2. JSON 格式输出（供自动化工具消费）
/Users/hi/niuma/bin/gemini_account_probe --json

# 3. 单号强制解除限流冷却
/Users/hi/niuma/bin/gemini_account_probe --unblock acc1

# 4. 一键解除全矩阵账号冷却
/Users/hi/niuma/bin/gemini_account_probe --unblock-all

# 5. 生成 PKCE OAuth 授权 URL
python3 /Users/hi/niuma/bin/gemini_oauth_flow generate

# 6. 换票并注册新分身沙盒
python3 /Users/hi/niuma/bin/gemini_oauth_flow exchange "4/0A..." acc6
```
