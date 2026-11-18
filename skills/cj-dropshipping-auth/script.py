import os
import json
import time
import urllib.request
import urllib.error
from datetime import datetime

BASE = "https://developers.cjdropshipping.com/api2.0/v1/authentication"
CACHE = "/tmp/cj_token.json"
SAFETY_MARGIN = 3600  # treat a token as expired one hour early


def post(path, body=None, headers=None):
    h = {"Content-Type": "application/json", "User-Agent": "oya-agent"}
    h.update(headers or {})
    data = json.dumps(body or {}).encode()
    req = urllib.request.Request(f"{BASE}/{path}", data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode())
        except Exception:
            return {"result": False, "code": e.code, "message": str(e)}


def parse_ts(value):
    if not value:
        return 0
    if isinstance(value, (int, float)):
        return value / 1000 if value > 1e12 else value
    for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(value, fmt).timestamp()
        except ValueError:
            continue
    return 0


def load_cache():
    try:
        with open(CACHE) as f:
            return json.load(f)
    except Exception:
        return {}


def save_cache(data):
    try:
        with open(CACHE, "w") as f:
            json.dump(data, f)
        os.chmod(CACHE, 0o600)
    except Exception:
        pass


def valid(ts_value):
    return parse_ts(ts_value) - SAFETY_MARGIN > time.time()


def ok(resp):
    return resp.get("result") is True or resp.get("code") == 200


def public(tok, source):
    return {
        "ok": True,
        "source": source,
        "accessToken": tok.get("accessToken"),
        "accessTokenExpiryDate": tok.get("accessTokenExpiryDate"),
        "refreshToken": tok.get("refreshToken"),
        "refreshTokenExpiryDate": tok.get("refreshTokenExpiryDate"),
        "openId": tok.get("openId"),
        "usage": "Send header CJ-Access-Token: <accessToken> on CJ API calls",
    }


def refresh(refresh_token):
    resp = post("refreshAccessToken", {"refreshToken": refresh_token})
    if not ok(resp):
        return None, resp
    tok = resp.get("data") or {}
    save_cache(tok)
    return tok, resp


def get_token(inp):
    cache = load_cache()
    if not inp.get("force"):
        if cache.get("accessToken") and valid(cache.get("accessTokenExpiryDate")):
            return public(cache, "cache")
        if cache.get("refreshToken") and valid(cache.get("refreshTokenExpiryDate")):
            tok, _ = refresh(cache["refreshToken"])
            if tok:
                return public(tok, "refreshed")

    api_key = inp.get("api_key") or os.environ.get("CJ_API_KEY")
    if not api_key:
        return {"error": "No API key: pass api_key or set CJ_API_KEY"}
    resp = post("getAccessToken", {"apiKey": api_key})
    if not ok(resp):
        return {"error": resp.get("message") or "getAccessToken failed", "code": resp.get("code")}
    tok = resp.get("data") or {}
    save_cache(tok)
    return public(tok, "new")


def main():
    try:
        inp = json.loads(os.environ.get("INPUT_JSON", "{}") or "{}")
        action = inp.get("action") or "get_token"

        if action == "get_token":
            out = get_token(inp)
        elif action == "refresh_token":
            rt = inp.get("refresh_token") or load_cache().get("refreshToken")
            if not rt:
                out = {"error": "No refresh token available; call get_token first"}
            else:
                tok, resp = refresh(rt)
                out = public(tok, "refreshed") if tok else {
                    "error": resp.get("message") or "refreshAccessToken failed",
                    "code": resp.get("code"),
                }
        elif action == "logout":
            at = inp.get("access_token") or load_cache().get("accessToken")
            if not at:
                out = {"error": "No access token to revoke"}
            else:
                resp = post("logout", headers={"CJ-Access-Token": at})
                if ok(resp):
                    save_cache({})
                    out = {"ok": True, "message": "Logged out; token revoked"}
                else:
                    out = {"error": resp.get("message") or "logout failed", "code": resp.get("code")}
        else:
            out = {"error": f"Unknown action: {action}"}
        print(json.dumps(out))
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
