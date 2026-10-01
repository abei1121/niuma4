#!/usr/bin/env bash
# FullStack Bug Hunter - Remediation & Regression Verification Script
set -e

TARGET_DIR="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================================="
echo "  FullStack Bug Hunter - Automated Verification"
echo "  Target: $TARGET_DIR"
echo "=================================================="

# 1. Run Static Heuristic Scanner
echo ""
echo "[Step 1/2] Running static heuristic scanner..."
python3 "$SCRIPT_DIR/bug_scanner.py" "$TARGET_DIR" --skip-data

# 2. Check TypeScript & Build if package.json exists
if [ -f "$TARGET_DIR/package.json" ]; then
    echo ""
    echo "[Step 2/2] Checking project build and TypeScript compilation..."
    cd "$TARGET_DIR"
    if npm run build; then
        echo "✓ Build passed cleanly!"
    else
        echo "✗ Build failed! Please inspect compilation errors."
        exit 1
    fi
else
    echo ""
    echo "[Step 2/2] No package.json found in target, skipping build check."
fi

echo ""
echo "=================================================="
echo "✓ Verification completed successfully!"
echo "=================================================="
