#!/usr/bin/env bash
# 全栈代码法医 (FullStack Code Forensic) - 自动化全量回归与缺陷验收流水线
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="."
MODE="full"
FIX_FLAG=""

for arg in "$@"; do
    case "$arg" in
        --staged)
            MODE="staged"
            ;;
        --diff)
            MODE="diff"
            ;;
        --fix)
            FIX_FLAG="--fix"
            ;;
        --install-hook)
            MODE="install-hook"
            ;;
        *)
            if [ -d "$arg" ] || [ -f "$arg" ]; then
                TARGET_DIR="$arg"
            fi
            ;;
    esac
done

if [ "$MODE" = "install-hook" ]; then
    bash "$SCRIPT_DIR/install_hook.sh" "$TARGET_DIR"
    exit 0
fi

echo "=================================================="
echo "  全栈代码法医 (Code Forensic) - 一键回归验收流水线"
echo "  Target: $TARGET_DIR | Mode: $MODE ${FIX_FLAG:+(带自动修复)}"
echo "=================================================="

# 0. 如果指定了 --fix，先运行自愈引擎
if [ -n "$FIX_FLAG" ]; then
    echo ""
    echo "[Step 0] 运行手术刀式自愈引擎 (--fix)..."
    python3 "$SCRIPT_DIR/auto_fixer.py" "$TARGET_DIR"
fi

if [ "$MODE" = "staged" ]; then
    echo ""
    echo "[Step 1/2] 暂存区增量启发式扫描..."
    python3 "$SCRIPT_DIR/bug_scanner.py" "$TARGET_DIR" --staged
    echo ""
    echo "[Step 2/2] 暂存区增量污点分析..."
    python3 "$SCRIPT_DIR/taint_analyzer.py" "$TARGET_DIR" --staged
    echo ""
    echo "=================================================="
    echo "✓ 暂存区增量门禁审核全部通过！"
    echo "=================================================="
    exit 0
elif [ "$MODE" = "diff" ]; then
    echo ""
    echo "[Step 1/2] 工作区增量启发式扫描..."
    python3 "$SCRIPT_DIR/bug_scanner.py" "$TARGET_DIR" --diff
    echo ""
    echo "[Step 2/2] 工作区增量污点分析..."
    python3 "$SCRIPT_DIR/taint_analyzer.py" "$TARGET_DIR" --diff
    echo ""
    echo "=================================================="
    echo "✓ 工作区增量审查全部通过！"
    echo "=================================================="
    exit 0
fi

# 全量模式 (Full Mode)
# 1. 运行启发式静态规则扫描 (Static Heuristic Scanner)
echo ""
echo "[Step 1/4] Running static heuristic scanner (启发式规则扫描)..."
python3 "$SCRIPT_DIR/bug_scanner.py" "$TARGET_DIR" --skip-data

# 2. 运行语义级数据流与污点分析 (Semantic Taint Analyzer)
echo ""
echo "[Step 2/4] Running semantic taint analyzer (污点与数据流追踪)..."
python3 "$SCRIPT_DIR/taint_analyzer.py" "$TARGET_DIR"

# 3. 运行多语言 Key 拓扑对齐校验 (i18n Parity Checker)
echo ""
echo "[Step 3/4] Running i18n multi-language parity checker (100% 对齐校验)..."
python3 "$SCRIPT_DIR/i18n_parity_checker.py" "$TARGET_DIR"

# 4. 检查 TypeScript 编译与前端产物构建 (Build & Typecheck)
if [ -f "$TARGET_DIR/package.json" ]; then
    echo ""
    echo "[Step 4/4] Checking project build and TypeScript compilation..."
    cd "$TARGET_DIR"
    if npm run build; then
        echo "✓ Build passed cleanly!"
    else
        echo "✗ Build failed! Please inspect compilation errors."
        exit 1
    fi
else
    echo ""
    echo "[Step 4/4] No package.json found in target, skipping build check."
fi

echo ""
echo "=================================================="
echo "✓ 全栈代码法医全量验收流水线执行完毕！所有检查通过！"
echo "=================================================="
