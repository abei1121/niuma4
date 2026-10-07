#!/usr/bin/env python3
"""
全栈代码法医 (FullStack Code Forensic) · 手术刀式自动化自愈引擎 (Auto-Fixer)
针对高置信度确定性缺陷提供安全、等价的代码重构修复与补丁生成。
严格遵循小文件原则 (<= 250 行) 与零副作用规范。
"""
import os
import sys
import re
import difflib
import argparse

COLOR_RED = "\033[91m"
COLOR_YELLOW = "\033[93m"
COLOR_GREEN = "\033[92m"
COLOR_CYAN = "\033[96m"
COLOR_BOLD = "\033[1m"
COLOR_RESET = "\033[0m"

EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs"}
MAX_FILE_LINES = 250

def fix_viewport_culling(content: str) -> tuple[str, int]:
    """修复 RULE-MOB-05: 离屏海报/DOM -9999px 视口裁剪黑屏陷阱"""
    pattern = re.compile(r'-(?:9999|99999)px')
    matches = list(pattern.finditer(content))
    if not matches:
        return content, 0
    new_content = pattern.sub('0px /* forensic: replaced -9999px */', content)
    return new_content, len(matches)

def fix_unguarded_vibrate(content: str) -> tuple[str, int]:
    """修复 RULE-MOB-08: 裸调 navigator.vibrate 在 iOS Safari 报错"""
    # 查找前面没有 navigator.vibrate 守卫的裸调
    # 匹配 navigator.vibrate(...)
    pattern = re.compile(r'(?<![\.\w])navigator\.vibrate\s*\(([^)]+)\)')
    fixes_count = 0
    
    def repl(m):
        nonlocal fixes_count
        start = m.start()
        prefix = content[max(0, start - 200):start]
        # 如果前面已经有 navigator.vibrate 判断，不重复修复
        if "navigator.vibrate" in prefix or "'vibrate' in navigator" in prefix:
            return m.group(0)
        fixes_count += 1
        arg = m.group(1).strip()
        # 安全 IIFE 表达，兼容语句与表达式上下文
        return f"(typeof navigator !== 'undefined' && navigator.vibrate ? navigator.vibrate({arg}) : undefined)"

    new_content = pattern.sub(repl, content)
    return new_content, fixes_count

def fix_storage_json_parse(content: str) -> tuple[str, int]:
    """修复 RULE-SEC-01: 裸调 JSON.parse(storage.getItem) 崩溃陷阱"""
    # 查找不在 try/catch 内的 JSON.parse(localStorage.getItem(...))
    pattern = re.compile(r'JSON\.parse\s*\(\s*((?:window\.)?(?:localStorage|sessionStorage)\.getItem\s*\([^)]+\)(?:\s*\|\|\s*[\'"`][^\'"`]*[\'"`])?)\s*\)')
    fixes_count = 0

    def repl(m):
        nonlocal fixes_count
        start = m.start()
        prefix = content[max(0, start - 300):start]
        if "try" in prefix:
            return m.group(0)
        fixes_count += 1
        inner_expr = m.group(1).strip()
        # 使用安全内联 IIFE 包装，避免污染外层作用域
        return f"(() => {{ try {{ const _raw = {inner_expr}; return _raw ? JSON.parse(_raw) : null; }} catch (_) {{ return null; }} }})()"

    new_content = pattern.sub(repl, content)
    return new_content, fixes_count

def auto_fix_file(file_path: str, dry_run: bool = False) -> dict:
    """对单个文件执行手术刀修复"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            original = f.read()
    except Exception as e:
        return {"file": file_path, "fixed": 0, "error": str(e)}

    modified = original
    total_fixes = 0
    details = []

    # 1. 修复 -9999px 视口裁剪
    c1, count1 = fix_viewport_culling(modified)
    if count1 > 0:
        modified = c1
        total_fixes += count1
        details.append(f"RULE-MOB-05: 修复 {count1} 处 -9999px 视口裁剪")

    # 2. 修复裸调 navigator.vibrate
    c2, count2 = fix_unguarded_vibrate(modified)
    if count2 > 0:
        modified = c2
        total_fixes += count2
        details.append(f"RULE-MOB-08: 修复 {count2} 处裸调 navigator.vibrate")

    # 3. 修复裸调 JSON.parse(storage.getItem)
    c3, count3 = fix_storage_json_parse(modified)
    if count3 > 0:
        modified = c3
        total_fixes += count3
        details.append(f"RULE-SEC-01: 修复 {count3} 处裸调 JSON.parse(storage)")

    if total_fixes == 0:
        return {"file": file_path, "fixed": 0, "details": []}

    # 严格校验：修复后文件行数是否超过 250 行红线
    new_line_count = len(modified.splitlines())
    if new_line_count > MAX_FILE_LINES:
        return {
            "file": file_path,
            "fixed": 0,
            "skipped_reason": f"修复后行数 ({new_line_count}) 将超出 250 行小文件红线，已自动撤销重构，请人工拆分。",
            "details": details
        }

    # 生成 diff 预览
    diff_lines = list(difflib.unified_diff(
        original.splitlines(keepends=True),
        modified.splitlines(keepends=True),
        fromfile=f"a/{os.path.basename(file_path)}",
        tofile=f"b/{os.path.basename(file_path)}",
        n=2
    ))

    if not dry_run:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(modified)

    return {
        "file": file_path,
        "fixed": total_fixes,
        "details": details,
        "diff": "".join(diff_lines),
        "dry_run": dry_run
    }

def main():
    parser = argparse.ArgumentParser(description="全栈代码法医 (FullStack Code Forensic) · 手术刀式自愈引擎")
    parser.add_argument("target", nargs="?", default=".", help="目标项目路径或单个文件")
    parser.add_argument("--dry-run", action="store_true", help="仅预览生成的修复补丁 Diff，不直接写入文件")
    args = parser.parse_args()

    target_path = os.path.abspath(args.target)
    files_to_check = []

    if os.path.isfile(target_path):
        files_to_check.append(target_path)
    else:
        for root, dirs, files in os.walk(target_path):
            dirs[:] = [d for d in dirs if d not in {"node_modules", "dist", ".git", "build", "coverage", ".next"}]
            for file in files:
                if os.path.splitext(file)[1] in EXTENSIONS:
                    files_to_check.append(os.path.join(root, file))

    print(f"\n{COLOR_CYAN}=== 全栈代码法医 (Code Forensic) · 手术刀自愈引擎 (--fix) ==={COLOR_RESET}")
    print(f"Target: {target_path} | Files: {len(files_to_check)} | Mode: {'[DRY RUN 预演]' if args.dry_run else '[LIVE 自动写入]'}\n")

    total_fixed_files = 0
    total_remediations = 0

    for fpath in files_to_check:
        res = auto_fix_file(fpath, dry_run=args.dry_run)
        if res.get("fixed", 0) > 0:
            total_fixed_files += 1
            total_remediations += res["fixed"]
            rel = os.path.relpath(fpath, target_path)
            print(f"🩹 {COLOR_GREEN}{rel}{COLOR_RESET} (已自愈 {res['fixed']} 处)")
            for d in res["details"]:
                print(f"   ↳ {d}")
            if res.get("diff"):
                print(f"{COLOR_YELLOW}--- Diff Preview ---{COLOR_RESET}")
                for line in res["diff"].splitlines()[:15]:
                    print(f"   {line}")
                print()
        elif res.get("skipped_reason"):
            rel = os.path.relpath(fpath, target_path)
            print(f"⚠️ {COLOR_YELLOW}{rel}{COLOR_RESET}: {res['skipped_reason']}\n")

    if total_remediations == 0:
        print(f"{COLOR_GREEN}✓ 无需自动修复，目标工程未检出可自动修复的高置信度暗坑。{COLOR_RESET}\n")
    else:
        print(f"{COLOR_GREEN}✓ 自愈完成！成功修复 {total_fixed_files} 个文件中的 {total_remediations} 处暗坑。{COLOR_RESET}\n")

    return 0

if __name__ == "__main__":
    sys.exit(main())
