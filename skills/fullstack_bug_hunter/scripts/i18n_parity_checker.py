#!/usr/bin/env python3
"""
FullStack Bug Hunter - Automated i18n Key Parity & Completeness Checker
Scans multi-language dictionary files (.ts, .js, .json) to ensure 100% key parity,
preventing blank cards, missing translations, and placeholder corruption.
"""
import os
import sys
import re
import json
import argparse

COLOR_RED = "\033[91m"
COLOR_YELLOW = "\033[93m"
COLOR_GREEN = "\033[92m"
COLOR_CYAN = "\033[96m"
COLOR_BOLD = "\033[1m"
COLOR_RESET = "\033[0m"

COMMON_LOCALE_DIRS = [
    "utils/locales",
    "src/locales",
    "locales",
    "src/i18n",
    "i18n",
    "src/utils/locales",
]

PREFERRED_BASE_LOCALES = ["zh-CN", "zh_CN", "zh-TW", "zh_TW", "en", "en-US", "en_US"]

def extract_keys_from_ts_content(content: str) -> dict:
    """
    Extracts key hierarchy and sample string values from JS/TS object exports.
    Handles nested objects, string literals, and removes comments safely.
    """
    # 1. Strip comments while preserving layout
    clean = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
    clean = re.sub(r'/\*[\s\S]*?\*/', '', clean)

    # 2. Extract key-value tokens using regex state machine
    # Matches: key: 'value' | key: { | 'quoted-key': ...
    lines = clean.splitlines()
    key_dict = {}
    stack = []  # list of (current_indent, key_name)

    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("import ") or stripped.startswith("export *"):
            continue

        indent = len(line) - len(line.lstrip())

        # Pop stack items that have greater or equal indentation (when closing brace or moving sibling)
        while stack and stack[-1][0] >= indent:
            stack.pop()

        # Check for key definition: e.g. keyName: or 'key-name':
        m_obj = re.match(r'^[\'"]?([a-zA-Z0-9_\-]+)[\'"]?\s*:\s*\{', stripped)
        m_val = re.match(r'^[\'"]?([a-zA-Z0-9_\-]+)[\'"]?\s*:\s*(?:[\'"`]([\s\S]*?)[\'"`]|\[([\s\S]*?)\]|([a-zA-Z0-9_]+))', stripped)

        if m_obj:
            k = m_obj.group(1)
            full_key = ".".join([item[1] for item in stack] + [k])
            key_dict[full_key] = "<object>"
            stack.append((indent, k))
        elif m_val:
            k = m_val.group(1)
            val = m_val.group(2) or m_val.group(3) or m_val.group(4) or ""
            full_key = ".".join([item[1] for item in stack] + [k])
            key_dict[full_key] = val.strip()

    return key_dict

def extract_keys_from_json(file_path: str) -> dict:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    flat = {}
    def flatten(prefix, obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                p = f"{prefix}.{k}" if prefix else k
                flatten(p, v)
        else:
            flat[prefix] = str(obj)
    flatten("", data)
    return flat

def parse_locale_file(file_path: str) -> dict:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".json":
        return extract_keys_from_json(file_path)
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return extract_keys_from_ts_content(content)
    except Exception as e:
        print(f"{COLOR_RED}Error reading {file_path}: {e}{COLOR_RESET}")
        return {}

def find_locale_directory(root_dir: str) -> str:
    for candidate in COMMON_LOCALE_DIRS:
        p = os.path.join(root_dir, candidate)
        if os.path.isdir(p):
            return p
    return ""

def get_placeholders(val: str) -> set:
    if not isinstance(val, str):
        return set()
    # Matches {name}, {{name}}, %s, %d, {0}
    found = re.findall(r'\{+([a-zA-Z0-9_]+)\}+|%(?:[sdf]|\d+\$[sdf])', val)
    return set(found)

def main():
    parser = argparse.ArgumentParser(description="FullStack Bug Hunter i18n Parity Checker")
    parser.add_argument("target", nargs="?", default=".", help="Project root or locales directory")
    parser.add_argument("--base", default=None, help="Base locale name (e.g. zh-CN, en)")
    parser.add_argument("--strict", action="store_true", help="Fail if target locales have extra/obsolete keys")
    args = parser.parse_args()

    target_path = os.path.abspath(args.target)
    locales_dir = ""
    if os.path.isdir(target_path):
        detected = find_locale_directory(target_path)
        if detected:
            locales_dir = detected
        else:
            # Check if target_path itself contains language files
            candidate_files = [f for f in os.listdir(target_path) if any(f.startswith(pref) for pref in ("zh", "en", "ja", "ko", "vi", "ru", "fr", "de", "es"))]
            if candidate_files:
                locales_dir = target_path
    else:
        locales_dir = os.path.dirname(target_path)

    if not locales_dir or not os.path.isdir(locales_dir):
        print(f"{COLOR_YELLOW}[i18n_parity_checker] No i18n/locales directory detected in {target_path}. Skipping.{COLOR_RESET}")
        return 0

    # Collect locale files (exclude index, types, starDict directories)
    all_files = [f for f in os.listdir(locales_dir) if f.endswith((".ts", ".js", ".json"))]
    locale_files = [f for f in all_files if not f.startswith("index.") and not f.startswith("types.")]

    if len(locale_files) <= 1:
        print(f"{COLOR_YELLOW}[i18n_parity_checker] Less than 2 locale files found in {locales_dir}. Parity check skipped.{COLOR_RESET}")
        return 0

    # Determine base locale
    base_file = None
    if args.base:
        for f in locale_files:
            if os.path.splitext(f)[0] == args.base:
                base_file = f
                break

    if not base_file:
        for pref in PREFERRED_BASE_LOCALES:
            for f in locale_files:
                if os.path.splitext(f)[0].lower() == pref.lower():
                    base_file = f
                    break
            if base_file:
                break

    if not base_file:
        base_file = locale_files[0]

    base_name = os.path.splitext(base_file)[0]
    base_path = os.path.join(locales_dir, base_file)
    base_data = parse_locale_file(base_path)
    base_keys = set(base_data.keys())

    print(f"\n{COLOR_CYAN}=== 全栈代码法医 (Code Forensic) · 多语言契约对齐探针 ==={COLOR_RESET}")
    print(f"Directory: {locales_dir}")
    print(f"Base Locale: {COLOR_BOLD}{base_file}{COLOR_RESET} ({len(base_keys)} keys)\n")

    has_errors = False
    for f in sorted(locale_files):
        if f == base_file:
            continue
        
        name = os.path.splitext(f)[0]
        fpath = os.path.join(locales_dir, f)
        t_data = parse_locale_file(fpath)
        t_keys = set(t_data.keys())

        missing = base_keys - t_keys
        extra = t_keys - base_keys

        # Placeholder checks on common keys
        placeholder_issues = []
        for k in base_keys.intersection(t_keys):
            base_p = get_placeholders(base_data.get(k, ""))
            tgt_p = get_placeholders(t_data.get(k, ""))
            if base_p and base_p != tgt_p:
                placeholder_issues.append((k, base_p, tgt_p))

        status_tag = f"{COLOR_GREEN}✓ 100% PARITY{COLOR_RESET}"
        if missing:
            status_tag = f"{COLOR_RED}✗ MISSING {len(missing)} KEYS{COLOR_RESET}"
            has_errors = True
        elif extra and args.strict:
            status_tag = f"{COLOR_YELLOW}⚠ {len(extra)} EXTRA KEYS{COLOR_RESET}"
            has_errors = True

        print(f"🌐 [{name:<8}] ({len(t_keys)} keys) -> {status_tag}")
        
        if missing:
            print(f"   {COLOR_RED}Missing Keys ({len(missing)}):{COLOR_RESET}")
            for k in sorted(list(missing))[:15]:
                print(f"     - {k}")
            if len(missing) > 15:
                print(f"     ... and {len(missing) - 15} more.")

        if extra and args.strict:
            print(f"   {COLOR_YELLOW}Extra/Obsolete Keys ({len(extra)}):{COLOR_RESET}")
            for k in sorted(list(extra))[:5]:
                print(f"     + {k}")

        if placeholder_issues:
            print(f"   {COLOR_YELLOW}Placeholder Mismatches ({len(placeholder_issues)}):{COLOR_RESET}")
            for k, bp, tp in placeholder_issues[:5]:
                print(f"     * {k}: expected {bp}, got {tp}")
        print()

    if has_errors:
        print(f"{COLOR_RED}❌ i18n parity check failed! Please synchronize dictionary keys.{COLOR_RESET}\n")
        return 1
    else:
        print(f"{COLOR_GREEN}✅ All {len(locale_files)} locales achieved 100% key parity with base!{COLOR_RESET}\n")
        return 0

if __name__ == "__main__":
    sys.exit(main())
