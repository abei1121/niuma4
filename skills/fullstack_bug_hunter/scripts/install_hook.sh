#!/usr/bin/env bash
# 全栈代码法医 (FullStack Code Forensic) - Git Pre-Commit 门禁一键安装脚本
set -e

TARGET_REPO="${1:-.}"
TARGET_REPO_ABS="$(cd "$TARGET_REPO" && pwd)"
GIT_DIR="$TARGET_REPO_ABS/.git"
HOOK_FILE="$GIT_DIR/hooks/pre-commit"
SKILL_SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$GIT_DIR" ]; then
    echo "❌ 错误: 目标路径不是一个 Git 仓库 ($TARGET_REPO_ABS/.git 不存在)"
    exit 1
fi

mkdir -p "$GIT_DIR/hooks"

cat << 'EOF' > "$HOOK_FILE"
#!/usr/bin/env bash
# 全栈代码法医 (FullStack Code Forensic) · Git 增量安全拦截守卫
SKILL_DIR="/Users/hi/.agents/skills/fullstack_bug_hunter/scripts"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo ""
echo "🩺 =================================================="
echo "   全栈代码法医 · Git Commit 暂存区增量门禁审查中..."
echo "=================================================="

# 1. 增量启发式缺陷扫描 (仅核查本次 git add 暂存的文件)
python3 "$SKILL_DIR/bug_scanner.py" "$REPO_ROOT" --staged
SCAN_RET=$?
if [ $SCAN_RET -ne 0 ]; then
    echo ""
    echo "❌ [全栈代码法医] 拦截成功: 暂存区存在阻断级暗坑或违规！"
    echo "   ↳ 提示: 请修复上述错误后重新 git add，或运行 python3 $SKILL_DIR/auto_fixer.py 进行一键自愈。"
    echo "   ↳ 紧急旁路: 如确认无害需强制提交，可使用 git commit -m '...' --no-verify"
    echo ""
    exit 1
fi

# 2. 增量数据流与污点分析 (追踪暂存区不可信数据流)
python3 "$SKILL_DIR/taint_analyzer.py" "$REPO_ROOT" --staged
TAINT_RET=$?
if [ $TAINT_RET -ne 0 ]; then
    echo ""
    echo "❌ [全栈代码法医] 拦截成功: 暂存区存在未受控数据流污点 (Taint Flaw)！"
    echo "   ↳ 提示: 请增加 try/catch 卫语句或挂载防护后重新提交。"
    echo ""
    exit 1
fi

echo "✅ [全栈代码法医] 增量门禁审查全部通过！提交放行。"
echo ""
exit 0
EOF

chmod +x "$HOOK_FILE"

echo "=================================================="
echo "✓ 全栈代码法医 Git 增量门禁安装成功！"
echo "  Target Repo: $TARGET_REPO_ABS"
echo "  Hook Path:   $HOOK_FILE"
echo "  触发机制:    每次 git commit 自动以 <10ms 增量审查暂存区文件"
echo "=================================================="
