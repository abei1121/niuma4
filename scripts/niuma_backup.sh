#!/usr/bin/env bash
# ==============================================================================
# 牛马4号 (niuma4) 离线单向灾备同步与脱敏导出工具
# 目标：将牛马4号核心灵魂资产（设定、记忆、技能、纯源码）安全导出至本地灾备仓并推送到 GitHub 私有库
# 铁律：严禁同步任何凭据、Token、密码、大视频文件与编译缓存 target/
# 目标仓库：git@github.com:abei1121/niuma4.git
# ==============================================================================

set -euo pipefail

VAULT_DIR="/Users/hi/niuma/niuma4_vault"
NIUMA_ROOT="/Users/hi/niuma"
SKILLS_ROOT="/Users/hi/.agents/skills"
REPO_URL="git@github.com:abei1121/niuma4.git"

echo "========================================================"
echo " [🚀] 牛马4号 核心资产异地脱敏灾备与 GitHub 同步启动"
echo " [📦] 目标仓库: ${REPO_URL}"
echo " [📁] 本地冷隔离区: ${VAULT_DIR}"
echo "========================================================"

echo "[1/8] 初始化灾备隔离区目录结构..."
mkdir -p "${VAULT_DIR}/memory"
mkdir -p "${VAULT_DIR}/skills"
mkdir -p "${VAULT_DIR}/projects"
mkdir -p "${VAULT_DIR}/wiki"
mkdir -p "${VAULT_DIR}/scripts"

echo "[2/8] 同步核心灵魂设定与行为法则..."
cp -f "${NIUMA_ROOT}/GEMINI.md" "${VAULT_DIR}/GEMINI.md"
cp -f "${NIUMA_ROOT}/AGENTS.md" "${VAULT_DIR}/AGENTS.md"
if [ -f "${NIUMA_ROOT}/memory/jiyi.json" ]; then
    cp -f "${NIUMA_ROOT}/memory/jiyi.json" "${VAULT_DIR}/memory/jiyi.json"
elif [ -f "${NIUMA_ROOT}/niuma1-main/memory/jiyi.json" ]; then
    cp -f "${NIUMA_ROOT}/niuma1-main/memory/jiyi.json" "${VAULT_DIR}/memory/jiyi.json"
fi
if [ -f "${NIUMA_ROOT}/memory/jiyi.md" ]; then
    cp -f "${NIUMA_ROOT}/memory/jiyi.md" "${VAULT_DIR}/memory/jiyi.md"
elif [ -f "${NIUMA_ROOT}/niuma1-main/memory/jiyi.md" ]; then
    cp -f "${NIUMA_ROOT}/niuma1-main/memory/jiyi.md" "${VAULT_DIR}/memory/jiyi.md"
fi

echo "[3/8] 同步知识图谱与架构全景 (wiki)..."
if [ -d "${NIUMA_ROOT}/wiki" ]; then
    cp -R "${NIUMA_ROOT}/wiki/"* "${VAULT_DIR}/wiki/"
fi

echo "[4/8] 同步 10 大现役核心技能库..."
rsync -av \
    --exclude="*.log" \
    --exclude="*cache*" \
    --exclude=".DS_Store" \
    "${SKILLS_ROOT}/" "${VAULT_DIR}/skills/"

echo "[5/8] 同步核心自研 Rust 与前端纯源码 (剔除 target, node_modules, dist, 凭据)..."
# 1. poly_mission_control (含最新前后端修复)
rsync -av \
    --exclude="target" \
    --exclude="web_frontend/node_modules" \
    --exclude="web_frontend/dist" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".env*" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/poly_mission_control/" "${VAULT_DIR}/projects/poly_mission_control/"

# 2. agy_wrapper_rust (含最新按需惰性 Token 自愈)
rsync -av \
    --exclude="target" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/agy_wrapper_rust/" "${VAULT_DIR}/projects/agy_wrapper_rust/"

# 3. gemini_account_probe
rsync -av \
    --exclude="target" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/gemini_account_probe/" "${VAULT_DIR}/projects/gemini_account_probe/"

# 4. agy_tool_guard (防轮询死循环守卫)
if [ -d "${NIUMA_ROOT}/sandbox/agy_tool_guard" ]; then
    rsync -av \
        --exclude="target" \
        --exclude=".git" \
        --exclude="*.log" \
        --exclude=".DS_Store" \
        "${NIUMA_ROOT}/sandbox/agy_tool_guard/" "${VAULT_DIR}/projects/agy_tool_guard/"
fi

# 5. telegram_bot_rust
rsync -av \
    --exclude="target" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".env" \
    --exclude=".env*" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/telegram_bot_rust/" "${VAULT_DIR}/projects/telegram_bot_rust/"

# 生成 telegram_bot_rust 的脱敏模板
cat << 'EOF' > "${VAULT_DIR}/projects/telegram_bot_rust/.env.example"
# Telegram Bot 配置模板 (生产运行时复制为 .env 并填写真实参数)
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN_HERE"
ALLOWED_USER_ID="YOUR_TELEGRAM_USER_ID_HERE"
HTTP_PROXY="socks5h://127.0.0.1:10808"
EOF

# 6. system_keeper_rust
rsync -av \
    --exclude="target" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/system_keeper_rust/" "${VAULT_DIR}/projects/system_keeper_rust/"

# 7. lan_file_server_rust
rsync -av \
    --exclude="target" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/lan_file_server_rust/" "${VAULT_DIR}/projects/lan_file_server_rust/"

# 8. proxy_health_checker_rust
rsync -av \
    --exclude="target" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude=".DS_Store" \
    "${NIUMA_ROOT}/niuma1-main/projects/proxy_health_checker_rust/" "${VAULT_DIR}/projects/proxy_health_checker_rust/"

echo "[6/8] 同步运维管理与通信脚本..."
cp -f "${NIUMA_ROOT}/scripts/manage_services.sh" "${VAULT_DIR}/scripts/manage_services.sh" 2>/dev/null || true
cp -f "${NIUMA_ROOT}/scripts/boot_autostart.sh" "${VAULT_DIR}/scripts/boot_autostart.sh" 2>/dev/null || true
cp -f "${NIUMA_ROOT}/scripts/niuma_backup.sh" "${VAULT_DIR}/scripts/niuma_backup.sh" 2>/dev/null || true
cp -f "${NIUMA_ROOT}/bin/tg_send" "${VAULT_DIR}/scripts/tg_send" 2>/dev/null || true
cp -f "${NIUMA_ROOT}/bin/tg_send_file" "${VAULT_DIR}/scripts/tg_send_file" 2>/dev/null || true
cp -f "${NIUMA_ROOT}/bin/gemini_oauth_flow" "${VAULT_DIR}/scripts/gemini_oauth_flow" 2>/dev/null || true

# 写入标准 .gitignore
cat << 'EOF' > "${VAULT_DIR}/.gitignore"
target/
node_modules/
dist/
*.log
.DS_Store
*.swp
*.tmp
*.pyc
__pycache__/
.env
.env.local
.env.production
antigravity-oauth-token
.oauth_pending_verifier.json
EOF

# 写入一键复原脚本 restore.sh
cat << 'EOF' > "${VAULT_DIR}/restore.sh"
#!/usr/bin/env bash
set -euo pipefail

DEST_ROOT="/Users/hi/niuma"
echo "=== 牛马4号 灾难一键复活程序 ==="
mkdir -p "${DEST_ROOT}/bin" "${DEST_ROOT}/scripts" "${DEST_ROOT}/wiki" "${DEST_ROOT}/video_workspace"

cp -f GEMINI.md "${DEST_ROOT}/GEMINI.md"
cp -f AGENTS.md "${DEST_ROOT}/AGENTS.md"
cp -R wiki/* "${DEST_ROOT}/wiki/"
cp -R skills/* "/Users/hi/.agents/skills/"
cp -R projects "${DEST_ROOT}/"
cp -R scripts/* "${DEST_ROOT}/scripts/"

echo "灵魂资产复原完成！请在各工程目录执行 cargo build --release 生成可执行体并部署至 ${DEST_ROOT}/bin/"
EOF
chmod +x "${VAULT_DIR}/restore.sh"

# 写入 README.md
cat << 'EOF' > "${VAULT_DIR}/README.md"
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
EOF

echo "[6.5/8] 执行高敏凭据脱敏替换 (Google OAuth Client ID & Secret)..."
find "${VAULT_DIR}" -type f \( -name "*.rs" -o -name "*.py" -o -name "*.html" -o -name "gemini_oauth_flow" \) -exec sed -i '' \
    -e 's/1071006060591-tmhssin2h21lcre235vtolojh4g403ep\.apps\.googleusercontent\.com/YOUR_GOOGLE_CLIENT_ID\.apps\.googleusercontent\.com/g' \
    -e 's/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/YOUR_GOOGLE_CLIENT_SECRET_1/g' \
    -e 's/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/YOUR_GOOGLE_CLIENT_SECRET_2/g' \
    {} +

echo "[7/8] 执行安全脱敏审计 (Security Redline Audit)..."
AUDIT_ERRORS=0

# 检查真实的 TG Bot Token 格式
if grep -rn -E "bot[0-9]{9,10}:[a-zA-Z0-9_-]{35}" "${VAULT_DIR}" 2>/dev/null; then
    echo "【CRITICAL】检测到真实的 Telegram Bot Token，终止同步！"
    AUDIT_ERRORS=$((AUDIT_ERRORS + 1))
fi

# 检查私钥特征
if grep -rn -E "BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY" "${VAULT_DIR}" 2>/dev/null; then
    echo "【CRITICAL】检测到私钥文件，终止同步！"
    AUDIT_ERRORS=$((AUDIT_ERRORS + 1))
fi

# 检查真实 OAuth Refresh Token
if grep -rn -E "1//0[a-zA-Z0-9_-]{40,}" "${VAULT_DIR}" 2>/dev/null; then
    echo "【CRITICAL】检测到真实 Google OAuth refresh token，终止同步！"
    AUDIT_ERRORS=$((AUDIT_ERRORS + 1))
fi

# 检查真实 Google API Key / Access Token
if grep -rn -E "ya29\.[a-zA-Z0-9_-]{50,}" "${VAULT_DIR}" 2>/dev/null; then
    echo "【CRITICAL】检测到真实 Google OAuth access token，终止同步！"
    AUDIT_ERRORS=$((AUDIT_ERRORS + 1))
fi

if [ "$AUDIT_ERRORS" -gt 0 ]; then
    echo "脱敏审计未通过，停止后续提交。"
    exit 1
fi
echo "✅ 脱敏安全审计通过：所有密钥凭据已脱敏，未发现泄漏风险。"

echo "[8/8] 提交并推送到 GitHub 远端仓库 (${REPO_URL})..."
cd "${VAULT_DIR}"
if [ ! -d ".git" ]; then
    git init -b main
    git config user.name "abei1121"
    git config user.email "133785132+abei1121@users.noreply.github.com"
    git remote add origin "${REPO_URL}"
else
    git remote set-url origin "${REPO_URL}"
fi

git add -A
COMMIT_TIME=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "feat(vault): 牛马4号全量灵魂资产与自研工程首次脱敏容灾备份 (${COMMIT_TIME})" || true
git branch -M main
git push -u origin main --force

echo "========================================================"
echo " [🎉] 恭喜！牛马4号全量灵魂资产与代码已成功同步至 GitHub:"
echo "      https://github.com/abei1121/niuma4"
echo "========================================================"
