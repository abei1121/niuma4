#!/usr/bin/env python3
import os
import sys
import json
import base64
import hashlib
import urllib.parse
import datetime
import requests

CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
CLIENT_SECRETS = [
    "YOUR_GOOGLE_CLIENT_SECRET_1",
    "YOUR_GOOGLE_CLIENT_SECRET_2",
]
REDIRECT_URI = "https://antigravity.google/oauth-callback"
SCOPES = "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs https://www.googleapis.com/auth/aicode openid"

PENDING_FILE = "/Users/hi/.gemini_accounts/.oauth_pending_verifier.json"
ACCOUNTS_BASE_DIR = "/Users/hi/.gemini_accounts"
STATUS_JSON_PATH = "/Users/hi/.gemini_accounts/status.json"

def generate():
    verifier = base64.urlsafe_b64encode(os.urandom(32)).decode("utf-8").rstrip("=")
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode("utf-8")).digest()).decode("utf-8").rstrip("=")
    state = base64.urlsafe_b64encode(os.urandom(16)).decode("utf-8").rstrip("=")

    os.makedirs(ACCOUNTS_BASE_DIR, exist_ok=True)
    with open(PENDING_FILE, "w") as f:
        json.dump({"verifier": verifier, "state": state}, f)

    params = {
        "access_type": "offline",
        "client_id": CLIENT_ID,
        "code_challenge": challenge,
        "code_challenge_method": "S256",
        "prompt": "consent",
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "state": state
    }
    url = "https://accounts.google.com/o/oauth2/auth?" + urllib.parse.urlencode(params)
    print(url)

def exchange(raw_code_or_url, acc_id="acc4"):
    if not os.path.exists(PENDING_FILE):
        print(json.dumps({"success": False, "error": "未找到待验证的 PKCE 凭据，请重新生成授权链接"}))
        sys.exit(1)

    with open(PENDING_FILE, "r") as f:
        pending = json.load(f)
    verifier = pending.get("verifier", "")

    code = raw_code_or_url.strip()
    if "code=" in code:
        parsed = urllib.parse.urlparse(code)
        qs = urllib.parse.parse_qs(parsed.query)
        if "code" in qs:
            code = qs["code"][0]
        else:
            match = [p for p in code.split("&") if p.startswith("code=")]
            if match:
                code = match[0].split("=")[1]
    code = urllib.parse.unquote(code)

    token_data = None
    last_err = ""
    for secret in [None] + CLIENT_SECRETS:
        post_data = {
            "client_id": CLIENT_ID,
            "code": code,
            "code_verifier": verifier,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
        }
        if secret:
            post_data["client_secret"] = secret

        resp = requests.post("https://oauth2.googleapis.com/token", data=post_data, timeout=10)
        if resp.status_code == 200:
            token_data = resp.json()
            break
        else:
            last_err = resp.text

    if not token_data:
        print(json.dumps({"success": False, "error": f"Token exchange failed: {last_err}"}))
        sys.exit(1)

    expires_in = token_data.get("expires_in", 3599)
    expiry = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=expires_in)).strftime("%Y-%m-%dT%H:%M:%SZ")

    antigravity_token = {
        "token": {
            "access_token": token_data.get("access_token", ""),
            "token_type": token_data.get("token_type", "Bearer"),
            "refresh_token": token_data.get("refresh_token", ""),
            "expiry": expiry
        },
        "auth_method": "consumer"
    }
    if "id_token" in token_data:
        antigravity_token["id_token"] = token_data["id_token"]

    cli_dir = os.path.join(ACCOUNTS_BASE_DIR, acc_id, ".gemini", "antigravity-cli")
    os.makedirs(cli_dir, exist_ok=True)
    token_path = os.path.join(cli_dir, "antigravity-oauth-token")
    with open(token_path, "w") as f:
        json.dump(antigravity_token, f, indent=2)

    user_info = {}
    if token_data.get("access_token"):
        u_resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": "Bearer " + token_data.get("access_token", "")},
            timeout=5
        )
        if u_resp.status_code == 200:
            user_info = u_resp.json()
            cache_file = os.path.join(ACCOUNTS_BASE_DIR, acc_id, ".account_info.json")
            with open(cache_file, "w") as f:
                json.dump(user_info, f, indent=2)

    status = {"active_index": 0, "accounts": {}}
    if os.path.exists(STATUS_JSON_PATH):
        try:
            with open(STATUS_JSON_PATH, "r") as f:
                status = json.load(f)
        except Exception:
            pass

    if "accounts" not in status:
        status["accounts"] = {}
    if acc_id not in status["accounts"]:
        status["accounts"][acc_id] = {"blocked_until": None}

    with open(STATUS_JSON_PATH, "w") as f:
        json.dump(status, f, indent=2)

    try:
        os.remove(PENDING_FILE)
    except Exception:
        pass

    print(json.dumps({
        "success": True,
        "account_id": acc_id,
        "email": user_info.get("email", "unknown"),
        "name": user_info.get("name", "unknown"),
        "has_refresh_token": bool(token_data.get("refresh_token")),
        "expiry": expiry
    }))

def refresh(acc_id="acc1", force=False):
    cli_dir = os.path.join(ACCOUNTS_BASE_DIR, acc_id, ".gemini", "antigravity-cli")
    token_path = os.path.join(cli_dir, "antigravity-oauth-token")
    if not os.path.exists(token_path):
        print(json.dumps({"success": False, "error": f"Token file not found: {token_path}"}))
        sys.exit(1)

    with open(token_path, "r") as f:
        d = json.load(f)
    token = d.get("token", {})
    rt = token.get("refresh_token")
    if not rt:
        print(json.dumps({"success": False, "error": f"No refresh_token found in {acc_id}"}))
        sys.exit(1)

    expiry_str = token.get("expiry")
    if not force and expiry_str:
        try:
            exp_dt = datetime.datetime.fromisoformat(expiry_str.replace("Z", "+00:00"))
            now_dt = datetime.datetime.now(datetime.timezone.utc)
            rem = (exp_dt - now_dt).total_seconds()
            if rem > 300:
                print(json.dumps({
                    "success": True,
                    "refreshed": False,
                    "account_id": acc_id,
                    "remaining_seconds": int(rem),
                    "expiry": expiry_str
                }))
                return
        except Exception:
            pass

    last_err = ""
    for secret in CLIENT_SECRETS:
        post_data = {
            "client_id": CLIENT_ID,
            "client_secret": secret,
            "grant_type": "refresh_token",
            "refresh_token": rt,
        }
        try:
            resp = requests.post("https://oauth2.googleapis.com/token", data=post_data, timeout=10)
            if resp.status_code == 200:
                res = resp.json()
                expires_in = res.get("expires_in", 3599)
                new_expiry = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=expires_in)).strftime("%Y-%m-%dT%H:%M:%SZ")
                d["token"]["access_token"] = res["access_token"]
                d["token"]["expiry"] = new_expiry
                d["auth_method"] = "consumer"
                if "refresh_token" in res:
                    d["token"]["refresh_token"] = res["refresh_token"]
                with open(token_path, "w") as f:
                    json.dump(d, f, indent=2)
                print(json.dumps({
                    "success": True,
                    "refreshed": True,
                    "account_id": acc_id,
                    "expires_in": expires_in,
                    "expiry": new_expiry
                }))
                return
            else:
                last_err = resp.text
        except Exception as e:
            last_err = str(e)

    print(json.dumps({"success": False, "error": f"Refresh failed: {last_err}"}))
    sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 gemini_oauth_flow.py [generate | exchange <code> [acc_id] | refresh [acc_id] [--force]]")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "generate":
        generate()
    elif cmd == "exchange":
        if len(sys.argv) < 3:
            print("Error: code required")
            sys.exit(1)
        acc = sys.argv[3] if len(sys.argv) > 3 else "acc4"
        exchange(sys.argv[2], acc)
    elif cmd == "refresh":
        acc = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("-") else "acc1"
        force = "--force" in sys.argv
        refresh(acc, force)
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
