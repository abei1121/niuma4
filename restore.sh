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
