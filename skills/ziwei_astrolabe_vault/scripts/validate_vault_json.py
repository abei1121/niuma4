#!/usr/bin/env python3
"""
scripts/validate_vault_json.py - Validate Ziwei Private Knowledge Vault Integrity
Strictly <= 250 lines. Zero external dependencies.
"""
import json
import sys
from pathlib import Path

def validate_vault(file_path: Path) -> bool:
    if not file_path.exists():
        print(f"Error: Knowledge vault file not found: {file_path}")
        return False

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error: Failed to parse JSON: {e}")
        return False

    required_keys = ["version", "patterns", "qintian_theorems", "domain_guidelines"]
    for k in required_keys:
        if k not in data:
            print(f"Error: Missing required root key: '{k}'")
            return False

    patterns = data.get("patterns", {})
    if len(patterns) < 15:
        print(f"Warning: Expected at least 15 patterns, found {len(patterns)}")

    pattern_fields = ["name", "type", "essence", "modern_scene", "breakthrough_action"]
    for pid, pdata in patterns.items():
        for field in pattern_fields:
            if field not in pdata or not pdata[field]:
                print(f"Error: Pattern '{pid}' missing field '{field}'")
                return False

    domains = data.get("domain_guidelines", {})
    expected_domains = ["career", "marriage", "wealth", "health"]
    for d in expected_domains:
        if d not in domains:
            print(f"Error: Missing domain guideline: '{d}'")
            return False

    clusters = data.get("canonical_144_star_clusters", {})
    if len(clusters) != 144:
        print(f"Error: Expected exactly 144 canonical star clusters, found {len(clusters)}")
        return False

    cluster_fields = ["id", "chart", "branch", "stars", "essence", "modern_business", "palace_applications", "breakthrough_action", "defensive_reframing"]
    for cid, cdata in clusters.items():
        for field in cluster_fields:
            if field not in cdata:
                print(f"Error: Star cluster '{cid}' missing field '{field}'")
                return False

    print(f"Success: Knowledge vault is 100% valid! ({len(patterns)} patterns, {len(domains)} domains, {len(clusters)} canonical star clusters)")
    return True

if __name__ == "__main__":
    vault_file = Path("/Users/hi/niuma/projects/obs_membership_rust/data/knowledge_vault.json")
    if len(sys.argv) > 1:
        vault_file = Path(sys.argv[1])
    success = validate_vault(vault_file)
    sys.exit(0 if success else 1)
