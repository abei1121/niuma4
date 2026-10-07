#!/usr/bin/env python3
"""
全栈代码法医 (FullStack Code Forensic) · 语义级污点流向分析器 (CodeQL-Inspired)
基于数据流分析原理，从不可信污染源 (Sources) 追踪数据流经传播路径至敏感操作致死汇 (Sinks)，
并检测是否存在有效卫语句 (Sanitizers)。
"""
import os
import sys
import re
import argparse
import subprocess

COLOR_RED = "\033[91m"
COLOR_YELLOW = "\033[93m"
COLOR_GREEN = "\033[92m"
COLOR_CYAN = "\033[96m"
COLOR_BOLD = "\033[1m"
COLOR_RESET = "\033[0m"

EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs"}
DEFAULT_EXCLUDE = {"node_modules", "dist", ".git", "build", "coverage", ".next", "mingrentangheyue", "contracts", "locales", "starDict"}

def mask_comments(content: str) -> str:
    """Masks comments preserving exact newlines and character offsets."""
    def repl_multi(m):
        nl = m.group(0).count('\n')
        return '\n' * nl + ' ' * (len(m.group(0)) - nl)
    def repl_single(m):
        return ' ' * len(m.group(0))
    masked = re.sub(r'/\*[\s\S]*?\*/', repl_multi, content)
    masked = re.sub(r'//[^\n]*', repl_single, masked)
    return masked

def analyze_taint_in_file(file_path: str) -> list:
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_content = f.read()
    except Exception as e:
        return [{"line": 1, "severity": "ERROR", "title": "Read Error", "detail": str(e)}]

    code = mask_comments(raw_content)
    lines = raw_content.splitlines()

    # -------------------------------------------------------------
    # Flow 1: Storage (Source) -> Unchecked JSON.parse() (Sink)
    # -------------------------------------------------------------
    direct_storage_parse = re.finditer(r'JSON\.parse\s*\(\s*(?:window\.)?(?:localStorage|sessionStorage)\.getItem', code)
    for m in direct_storage_parse:
        start_pos = m.start()
        line_no = code[:start_pos].count('\n') + 1
        prefix = code[max(0, start_pos - 600):start_pos]
        if "try" not in prefix:
            findings.append({
                "line": line_no,
                "severity": "HIGH",
                "id": "TAINT-STORAGE-PARSE",
                "title": "Unsanitized Storage Source to JSON.parse Sink",
                "source": "localStorage/sessionStorage.getItem",
                "sink": "JSON.parse()",
                "sanitizer": "try { ... } catch (e) { return fallback; }",
                "message": "Storage data read directly into JSON.parse() without try/catch. Corrupted or migrated schemas will crash the application.",
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # -------------------------------------------------------------
    # Flow 2: External / User String Source -> Raw BigInt Sink
    # -------------------------------------------------------------
    bigint_casts = re.finditer(r'\bconst\s+(\w+)\s*=\s*BigInt\s*\(\s*([a-zA-Z0-9_\.\[\]]+)\s*\)', code)
    for m in bigint_casts:
        var_name = m.group(1)
        src_expr = m.group(2)
        if re.match(r'^(?:\d+n?|Date\.now\(\)|Math\.)', src_expr):
            continue
        start_pos = m.start()
        line_no = code[:start_pos].count('\n') + 1
        prefix = code[max(0, start_pos - 400):start_pos]
        if "try" not in prefix:
            findings.append({
                "line": line_no,
                "severity": "HIGH",
                "id": "TAINT-BIGINT-CAST",
                "title": "Unchecked Variable to BigInt Sink",
                "source": f"Variable `{src_expr}`",
                "sink": "BigInt()",
                "sanitizer": "try/catch or parseInt / toNano formatting",
                "message": f"Casting `{src_expr}` to BigInt() without try/catch. Non-numeric or decimal strings trigger unhandled SyntaxError.",
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # -------------------------------------------------------------
    # Flow 3: URL SearchParams / Hash (Source) -> Navigation Sink
    # -------------------------------------------------------------
    url_source_pattern = r'(?:URLSearchParams|location\.search|location\.hash)[\s\S]{0,150}?(?:window\.location\.href|location\.assign|window\.open)\s*\(?[\s=]*([a-zA-Z0-9_]+)'
    for m in re.finditer(url_source_pattern, code):
        start_pos = m.start()
        line_no = code[:start_pos].count('\n') + 1
        sub_code = code[start_pos:start_pos + 250]
        if not ("startsWith" in sub_code or "whitelist" in sub_code or "encodeURIComponent" in sub_code):
            findings.append({
                "line": line_no,
                "severity": "HIGH",
                "id": "TAINT-URL-REDIRECT",
                "title": "Unvalidated URL Source to Navigation Sink",
                "source": "URLSearchParams / location.search",
                "sink": "window.location.href / window.open",
                "sanitizer": "Protocol whitelist check (startsWith('https://'))",
                "message": "URL parameters directly control navigation without protocol whitelist. Enables open redirect or scheme crash in WebView.",
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # -------------------------------------------------------------
    # Flow 4: Async Data Fetch (Source) -> setState on Unmounted Component (Race Condition Sink)
    # -------------------------------------------------------------
    # Precisely targets state updates AFTER an async boundary (await or inside .then/.catch)
    effect_pattern = re.compile(r'useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*(?:,\s*\[([^\]]*)\])?\)', re.MULTILINE)
    for m in effect_pattern.finditer(code):
        body = m.group(1)
        
        # Check if an async state update occurs:
        # A. setState after await: `await ... setXxx(...)`
        has_await_state = bool(re.search(r'\bawait\b[\s\S]+?(?<!\.)\bset(?!Item|Timeout|Interval|Property|Header)[A-Z]\w*\s*\(', body))
        
        # B. setState inside .then(...) or .catch(...) callback:
        has_then_state = False
        then_matches = re.finditer(r'\.(?:then|catch)\s*\(\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)?\s*=>\s*\{?([^);]+)', body)
        for tm in then_matches:
            if re.search(r'(?<!\.)\bset(?!Item|Timeout|Interval|Property|Header)[A-Z]\w*\s*\(', tm.group(1)):
                has_then_state = True
                break

        if has_await_state or has_then_state:
            # Check for teardown flag: cancelled, isMounted, or AbortController
            has_teardown = any(keyword in body for keyword in ("cancelled", "isMounted", "mounted", "abort", "AbortController", "ignore", "active"))
            has_cleanup_return = "return" in body
            if not (has_teardown and has_cleanup_return):
                line_no = code[:m.start()].count('\n') + 1
                findings.append({
                    "line": line_no,
                    "severity": "MEDIUM",
                    "id": "TAINT-ASYNC-RACE",
                    "title": "Async Fetch Source to State Sink without Cancellation Guard",
                    "source": "Async Network Fetch inside useEffect",
                    "sink": "React setState in async closure",
                    "sanitizer": "let cancelled = false; return () => { cancelled = true; } or AbortController",
                    "message": "Async request in useEffect updates state without cancellation guard. Triggers state race conditions and memory leaks on rapid unmount.",
                    "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
                })

    # -------------------------------------------------------------
    # Flow 5: Raw Expression (Source) -> dangerouslySetInnerHTML Sink (XSS Taint)
    # -------------------------------------------------------------
    danger_html_pattern = re.finditer(r'dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*([^}]+)\}\s*\}', code)
    for m in danger_html_pattern:
        expr = m.group(1).strip()
        if "DOMPurify" not in expr and "sanitize" not in expr:
            start_pos = m.start()
            line_no = code[:start_pos].count('\n') + 1
            findings.append({
                "line": line_no,
                "severity": "HIGH",
                "id": "TAINT-XSS-DOM",
                "title": "Raw Expression to dangerouslySetInnerHTML Sink",
                "source": f"Expression `{expr[:40]}`",
                "sink": "dangerouslySetInnerHTML",
                "sanitizer": "DOMPurify.sanitize(html)",
                "message": f"Rendering raw `{expr[:40]}` into innerHTML without DOMPurify.sanitize introduces cross-site scripting (DOM-XSS).",
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # -------------------------------------------------------------
    # Flow 6: postMessage Event (Source) -> Handler without Origin Validation Sink
    # -------------------------------------------------------------
    msg_listener_pattern = re.finditer(r'(?:window|document)\.addEventListener\s*\(\s*[\'"]message[\'"]\s*,\s*(?:\(?(\w+)\)?\s*=>\s*\{([\s\S]*?)\}|function\s*\w*\s*\(\s*(\w+)\s*\)\s*\{([\s\S]*?)\})', code)
    for m in msg_listener_pattern:
        event_var = m.group(1) or m.group(3) or "event"
        handler_body = m.group(2) or m.group(4) or ""
        origin_check_1 = f"{event_var}.origin"
        origin_check_2 = "origin"
        if origin_check_1 not in handler_body and origin_check_2 not in handler_body:
            start_pos = m.start()
            line_no = code[:start_pos].count('\n') + 1
            findings.append({
                "line": line_no,
                "severity": "HIGH",
                "id": "TAINT-POSTMESSAGE-ORIGIN",
                "title": "Unvalidated postMessage Origin Source to Message Handler Sink",
                "source": "window.addEventListener('message')",
                "sink": "Message event payload processing",
                "sanitizer": "if (event.origin !== TRUSTED_ORIGIN) return;",
                "message": "Message event listener processes data without verifying event.origin. Enables cross-origin message spoofing and iframe hijacking.",
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # -------------------------------------------------------------
    # Flow 7: Plaintext Mnemonic / Secret Key -> Web Storage Sink
    # -------------------------------------------------------------
    secret_storage_pattern = re.finditer(r'(?:localStorage|sessionStorage)\.setItem\s*\(\s*[\'"`]([^\'"`]*(?:mnemonic|private_key|secret_key|seed_phrase|privkey)[^\'"`]*)[\'"`]', code, re.IGNORECASE)
    for m in secret_storage_pattern:
        key_name = m.group(1)
        start_pos = m.start()
        line_no = code[:start_pos].count('\n') + 1
        findings.append({
            "line": line_no,
            "severity": "HIGH",
            "id": "TAINT-STORAGE-SECRET",
            "title": "Plaintext Seed Phrase / Private Key to Storage Sink",
            "source": f"Secret Key `{key_name}`",
            "sink": "localStorage / sessionStorage.setItem",
            "sanitizer": "WebCrypto AES-GCM / External Hardware Signer",
            "message": f"Saving sensitive credentials `{key_name}` directly into browser storage exposes funds to extension injection and XSS.",
            "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
        })

    return findings

def get_git_files(target_dir: str, mode: str) -> list:
    """Retrieve changed files from git repository."""
    cmd = ["git", "-C", target_dir]
    if mode == "staged":
        cmd += ["diff", "--cached", "--name-only", "--diff-filter=ACMR"]
    elif mode == "diff":
        cmd += ["diff", "HEAD", "--name-only", "--diff-filter=ACMR"]
    else:
        return []
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        files = [os.path.join(target_dir, f.strip()) for f in res.stdout.splitlines() if f.strip()]
        return [f for f in files if os.path.isfile(f) and os.path.splitext(f)[1] in EXTENSIONS and not f.endswith((".test.ts", ".spec.ts", ".test.tsx"))]
    except Exception:
        return []

def main():
    parser = argparse.ArgumentParser(description="全栈代码法医 (FullStack Code Forensic) · 语义级污点流向分析器")
    parser.add_argument("target", nargs="?", default=".", help="Project root or directory to analyze")
    parser.add_argument("--severity", choices=["ALL", "HIGH", "MEDIUM"], default="ALL")
    parser.add_argument("--staged", action="store_true", help="Only analyze files staged in git index (Pre-commit mode)")
    parser.add_argument("--diff", action="store_true", help="Only analyze modified files in git repository")
    args = parser.parse_args()

    target_path = os.path.abspath(args.target)
    files_to_scan = []

    if args.staged:
        files_to_scan = get_git_files(target_path, "staged")
        if not files_to_scan:
            print(f"\n{COLOR_CYAN}=== 全栈代码法医 · Git 暂存区污点分析 (--staged) ==={COLOR_RESET}")
            print(f"{COLOR_GREEN}✓ 暂存区无相关代码变更，0 文件需分析。{COLOR_RESET}\n")
            return 0
    elif args.diff:
        files_to_scan = get_git_files(target_path, "diff")
        if not files_to_scan:
            print(f"\n{COLOR_CYAN}=== 全栈代码法医 · Git 工作区污点分析 (--diff) ==={COLOR_RESET}")
            print(f"{COLOR_GREEN}✓ 工作区无相关代码变更，0 文件需分析。{COLOR_RESET}\n")
            return 0
    elif os.path.isfile(target_path):
        files_to_scan.append(target_path)
    else:
        for root, dirs, files in os.walk(target_path):
            dirs[:] = [d for d in dirs if d not in DEFAULT_EXCLUDE]
            for file in files:
                if os.path.splitext(file)[1] in EXTENSIONS and not file.endswith((".test.ts", ".spec.ts", ".test.tsx")):
                    files_to_scan.append(os.path.join(root, file))

    total_scanned = len(files_to_scan)
    all_findings = {}
    issue_counts = {"HIGH": 0, "MEDIUM": 0}

    for fpath in files_to_scan:
        issues = analyze_taint_in_file(fpath)
        filtered = [i for i in issues if args.severity == "ALL" or i["severity"] == args.severity]
        if filtered:
            all_findings[fpath] = filtered
            for issue in filtered:
                sev = issue.get("severity", "MEDIUM")
                if sev in issue_counts:
                    issue_counts[sev] += 1

    print(f"\n{COLOR_CYAN}=== 全栈代码法医 (Code Forensic) · 语义级污点流向分析器 ==={COLOR_RESET}")
    print(f"Target: {target_path}")
    print(f"Analyzed: {total_scanned} files | Flow Tracking: Source -> Sanitizer -> Sink")
    print(f"Findings: {COLOR_RED}HIGH (P0/P1): {issue_counts['HIGH']}{COLOR_RESET} | {COLOR_YELLOW}MEDIUM (P2): {issue_counts['MEDIUM']}{COLOR_RESET}\n")

    if not all_findings:
        print(f"{COLOR_GREEN}✓ 污点分析全部通过！未发现未受控危险数据流向 (Zero Taint Vulnerabilities).{COLOR_RESET}\n")
        return 0

    for fpath, issues in all_findings.items():
        rel_path = os.path.relpath(fpath, target_path)
        print(f"📄 {COLOR_CYAN}{rel_path}{COLOR_RESET}")
        for issue in issues:
            sev_color = COLOR_RED if issue["severity"] == "HIGH" else COLOR_YELLOW
            print(f"  Line {issue['line']}: [{sev_color}{issue['severity']}{COLOR_RESET}] {issue['id']} - {issue['title']}")
            print(f"    ↳ {COLOR_BOLD}Source (污染源):{COLOR_RESET} {issue['source']}")
            print(f"    ↳ {COLOR_BOLD}Sink (致死汇):{COLOR_RESET}   {issue['sink']}")
            print(f"    ↳ {COLOR_BOLD}Sanitizer (卫语句):{COLOR_RESET} {issue['sanitizer']}")
            print(f"    ↳ {issue['message']}")
            if issue.get("snippet"):
                print(f"    ↳ Code: `{issue['snippet'][:85]}`")
        print()

    return 1 if issue_counts["HIGH"] > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
