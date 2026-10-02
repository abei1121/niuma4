#!/usr/bin/env python3
"""
FullStack Bug Hunter - Automated Static Heuristic & Vulnerability Scanner
Scans Web3, React, Mobile Web & Microservice source files for critical hidden bugs.
"""
import os
import sys
import re
import argparse

COLOR_RED = "\033[91m"
COLOR_YELLOW = "\033[93m"
COLOR_GREEN = "\033[92m"
COLOR_CYAN = "\033[96m"
COLOR_RESET = "\033[0m"

RULES = [
    {
        "id": "RULE-W3-01",
        "name": "BigInt Float / Decimals Cast Trap",
        "severity": "CRITICAL",
        "pattern": r"BigInt\s*\(\s*(?:Math\.floor|Number\([^\)]+\)|parseFloat|[0-9]+\.[0-9]+|\w+\s*[\*\/]\s*[0-9]+\.[0-9]+)",
        "message": "BigInt(float) throws unhandled SyntaxError/TypeError. Convert decimals via string shifting or integer arithmetic."
    },
    {
        "id": "RULE-W3-02",
        "name": "Direct Crypto / TON Address Equality",
        "severity": "HIGH",
        "pattern": r"(?:addr|address|wallet)\w*\s*[!=]==\s*(?:addr|address|wallet|\b0x[a-fA-F0-9]+|\b(?:EQ|UQ)[a-zA-Z0-9_-]{10,})",
        "message": "Raw address === comparison fails on bounceable(EQ) vs non-bounceable(UQ) or raw format. Use isAddressEqual()."
    },
    {
        "id": "RULE-W3-03",
        "name": "Hardcoded Bounceable Transfer Destination",
        "severity": "HIGH",
        "pattern": r"bounceable\s*:\s*true\b",
        "message": "Transfers/tips to uninitialized wallets bounce and lose gas if bounceable is true. Default to bounceable: false (UQ)."
    },
    {
        "id": "RULE-MOB-01",
        "name": "Async Clipboard Gesture Desync",
        "severity": "HIGH",
        "pattern": r"await\s+[\w\.\(\)]+;[\s\S]{0,120}navigator\.clipboard\.writeText",
        "message": "Safari/WebKit revokes user gesture after await, causing clipboard write to fail silently. Execute synchronously."
    },
    {
        "id": "RULE-MOB-02",
        "name": "Unguarded Custom Scheme Navigation",
        "severity": "MEDIUM",
        "pattern": r"(?:window\.location\.href|location\.assign|window\.open)\s*\(?[\s=]*['`\"][a-zA-Z0-9_\-\.]+:\/\/(?!https?:\/\/)",
        "message": "Direct custom scheme navigation can crash Telegram WebView/Safari. Use universal links or safe fallback wrapper."
    },
    {
        "id": "RULE-MOB-03",
        "name": "Blocking Native Dialog in WebApp",
        "severity": "MEDIUM",
        "pattern": r"\b(?:window\.)?(?:alert|confirm|prompt)\s*\(",
        "message": "Native alert/confirm blocks event loop and freezes mobile/Telegram WebApp. Use custom non-blocking UI modals."
    },
    {
        "id": "RULE-RCT-01",
        "name": "React Array Index As Key in Dynamic Element",
        "severity": "LOW",
        "pattern": r"<(?!(?:div|span|li|p)\s+key=\{\s*(?:index|idx|i)\s*\}\s*className=[\"'][^\"']*text-)\w+[^>]*\bkey\s*=\s*\{\s*(?:index|idx|i)\s*\}",
        "message": "Using array index as key causes DOM reuse anomalies and state mutation bugs in dynamic/sorted lists."
    },
    {
        "id": "RULE-RCT-02",
        "name": "Unsanitized Inner HTML",
        "severity": "CRITICAL",
        "pattern": r"<(?!style\b)[a-zA-Z0-9_\-]+[^>]*dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(?!DOMPurify|sanitize)",
        "message": "Unsanitized dangerouslySetInnerHTML introduces XSS vulnerabilities. Enforce DOMPurify.sanitize()."
    },
    {
        "id": "RULE-RCT-03",
        "name": "Modal History Stack Desync",
        "severity": "MEDIUM",
        "pattern": r"window\.history\.pushState\s*\(",
        "message": "Modal history.pushState requires synchronized popstate listener and teardown to prevent back button deadlocks."
    },
    {
        "id": "RULE-W3-04",
        "name": "TonProof Magic String or Fake Length Check",
        "severity": "CRITICAL",
        "pattern": r"(?:ton-safe-sign-magic|signature\.length\s*===\s*64|\.length\s*===\s*64\s*\?\s*true)",
        "message": "TonConnect 2.0 requires 'ton-connect' prefix and nacl ed25519 signature verification. Never trust length === 64 or safe-sign-magic."
    },
    {
        "id": "RULE-MOB-04",
        "name": "Destructive touchAction Body Lock",
        "severity": "HIGH",
        "pattern": r"document\.body\.style\.touchAction\s*=",
        "message": "Setting touchAction='none' breaks WebKit/iOS gesture tracking and can lock page scroll. Use overflow='hidden'."
    },
    {
        "id": "RULE-MOB-05",
        "name": "Offscreen Viewport Culling Trap (-9999px)",
        "severity": "HIGH",
        "pattern": r"-(?:9999|99999)px",
        "message": "Placing elements at -9999px causes WebKit/Safari viewport culling, resulting in blank/black canvas poster captures. Use bounded layer (top:0, left:0, opacity:0.01, zIndex:-100)."
    },
    {
        "id": "RULE-W3-05",
        "name": "Unguarded Raw BigInt Variable Cast",
        "severity": "HIGH",
        "pattern": r"\bconst\s+\w+\s*=\s*BigInt\s*\(\s*(?!\d+n?|['\"][0-9]+['\"])[a-zA-Z0-9_\.]+\s*\)",
        "message": "Converting variables via BigInt() without try/catch or format check throws SyntaxError on non-numeric strings, crashing the feed."
    }
]

EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
DEFAULT_EXCLUDE_DIRS = {"node_modules", "dist", ".git", "build", "coverage", ".next", "mingrentangheyue", "contracts"}

def scan_file(file_path, max_lines, enforce_file_size=True):
    findings = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
    except Exception as e:
        return [{"line": 0, "id": "ERR", "severity": "ERROR", "name": "File Read Error", "message": str(e)}]

    total_lines = len(lines)
    if enforce_file_size and total_lines > max_lines:
        findings.append({
            "line": 1,
            "id": "RULE-ARCH-01",
            "severity": "MEDIUM",
            "name": f"Small File Standard Violation ({total_lines} lines)",
            "message": f"File exceeds standard limit ({max_lines} lines). Monolithic files increase regression risks."
        })

    full_content = "".join(lines)
    for rule in RULES:
        for match in re.finditer(rule["pattern"], full_content):
            line_no = full_content[:match.start()].count("\n") + 1
            findings.append({
                "line": line_no,
                "id": rule["id"],
                "severity": rule["severity"],
                "name": rule["name"],
                "message": rule["message"],
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # Rule: Missing Effect Cleanup
    effect_pattern = re.compile(r"useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[", re.MULTILINE)
    for match in effect_pattern.finditer(full_content):
        body = match.group(1)
        if ("addEventListener" in body or "setInterval" in body) and "return" not in body:
            line_no = full_content[:match.start()].count("\n") + 1
            findings.append({
                "line": line_no,
                "id": "RULE-RCT-04",
                "severity": "HIGH",
                "name": "Uncleaned Timer / Event Listener in useEffect",
                "message": "Timer or event listener created without returning cleanup function, causing memory leaks.",
                "snippet": lines[line_no - 1].strip() if line_no <= len(lines) else ""
            })

    # Rule: Missing URL.revokeObjectURL
    if "createObjectURL" in full_content and "revokeObjectURL" not in full_content:
        findings.append({
            "line": 1,
            "id": "RULE-MOB-06",
            "severity": "HIGH",
            "name": "Unrevoked URL.createObjectURL Memory Leak",
            "message": "File creates Blob URLs with createObjectURL() but never calls revokeObjectURL(), causing bitmap memory leaks in mobile WebKit.",
            "snippet": "createObjectURL without revokeObjectURL"
        })

    return findings

def main():
    parser = argparse.ArgumentParser(description="FullStack Bug Hunter Static Heuristic Scanner")
    parser.add_argument("target", nargs="?", default=".", help="Target directory or file to scan")
    parser.add_argument("--max-lines", type=int, default=250, help="Max line limit per file (default: 250)")
    parser.add_argument("--skip-data", action="store_true", help="Skip large static data directories (e.g. data/)")
    parser.add_argument("--severity", choices=["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"], default="ALL")
    args = parser.parse_args()

    target_path = os.path.abspath(args.target)
    files_to_scan = []

    exclude_dirs = set(DEFAULT_EXCLUDE_DIRS)
    if args.skip_data:
        exclude_dirs.add("data")

    if os.path.isfile(target_path):
        files_to_scan.append(target_path)
    else:
        for root, dirs, files in os.walk(target_path):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if os.path.splitext(file)[1] in EXTENSIONS:
                    files_to_scan.append(os.path.join(root, file))

    total_scanned = len(files_to_scan)
    all_findings = {}
    issue_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

    for fpath in files_to_scan:
        enforce_size = not (args.skip_data and "/data/" in fpath)
        issues = scan_file(fpath, args.max_lines, enforce_file_size=enforce_size)
        filtered = [
            i for i in issues 
            if args.severity == "ALL" or i["severity"] == args.severity
        ]
        if filtered:
            all_findings[fpath] = filtered
            for issue in filtered:
                sev = issue.get("severity", "LOW")
                if sev in issue_counts:
                    issue_counts[sev] += 1

    # Project-level check: Tailwind v4 / Vite 6 missing Node 20 .nvmrc / .node-version
    pkg_path = os.path.join(target_path, "package.json")
    if os.path.isfile(pkg_path):
        try:
            with open(pkg_path, "r", encoding="utf-8") as f:
                pkg_content = f.read()
            if "@tailwindcss/vite" in pkg_content or "tailwindcss\": \"^4" in pkg_content:
                has_nvmrc = os.path.isfile(os.path.join(target_path, ".nvmrc"))
                has_node_version = os.path.isfile(os.path.join(target_path, ".node-version"))
                if not (has_nvmrc or has_node_version):
                    issue = {
                        "line": 1,
                        "id": "RULE-CI-01",
                        "severity": "HIGH",
                        "name": "Tailwind v4 Missing Node 20 Version Lock (.nvmrc/.node-version)",
                        "message": "Tailwind CSS v4 requires Node.js >= 20.0.0. Cloudflare Pages/CI fails without .nvmrc or .node-version."
                    }
                    if args.severity in ("ALL", "HIGH"):
                        all_findings.setdefault(pkg_path, []).append(issue)
                        issue_counts["HIGH"] += 1
        except Exception:
            pass

    print(f"\n{COLOR_CYAN}=== FullStack Bug Hunter Static Heuristic Scan ==={COLOR_RESET}")
    print(f"Target: {target_path}")
    print(f"Scanned: {total_scanned} files | Max Lines Rule: {args.max_lines}")
    print(f"Issues: {COLOR_RED}CRITICAL: {issue_counts['CRITICAL']}{COLOR_RESET} | "
          f"{COLOR_YELLOW}HIGH: {issue_counts['HIGH']}{COLOR_RESET} | "
          f"MEDIUM: {issue_counts['MEDIUM']} | LOW: {issue_counts['LOW']}\n")

    if not all_findings:
        print(f"{COLOR_GREEN}✓ Clean! No heuristic defects detected.{COLOR_RESET}\n")
        return 0

    for fpath, issues in all_findings.items():
        rel_path = os.path.relpath(fpath, target_path)
        print(f"📄 {COLOR_CYAN}{rel_path}{COLOR_RESET}")
        for issue in issues:
            sev_color = COLOR_RED if issue["severity"] == "CRITICAL" else (
                COLOR_YELLOW if issue["severity"] == "HIGH" else COLOR_RESET
            )
            print(f"  Line {issue['line']}: [{sev_color}{issue['severity']}{COLOR_RESET}] {issue['id']} - {issue['name']}")
            print(f"    ↳ {issue['message']}")
            if issue.get("snippet"):
                print(f"    ↳ Code: `{issue['snippet'][:80]}`")
        print()

    return 1 if (issue_counts["CRITICAL"] + issue_counts["HIGH"]) > 0 else 0

if __name__ == "__main__":
    sys.exit(main())
