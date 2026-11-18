import os
import json
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

API = "https://developers.cjdropshipping.com/api2.0/v1"
CACHE = "/tmp/cj_token.json"
MARGIN = 3600


def request(method, path, params=None, body=None, token=None):
    url = f"{API}/{path}"
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v not in (None, "")})
    headers = {"Content-Type": "application/json", "User-Agent": "oya-agent"}
    if token:
        headers["CJ-Access-Token"] = token
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode())
        except Exception:
            return {"result": False, "code": e.code, "message": str(e)}


def ok(resp):
    return resp.get("result") is True or resp.get("code") == 200


def ts(value):
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


def fresh(value):
    return ts(value) - MARGIN > time.time()


def save(tok):
    try:
        with open(CACHE, "w") as f:
            json.dump(tok, f)
        os.chmod(CACHE, 0o600)
    except Exception:
        pass


def get_token(force=False):
    try:
        with open(CACHE) as f:
            cache = json.load(f)
    except Exception:
        cache = {}
    if not force:
        if cache.get("accessToken") and fresh(cache.get("accessTokenExpiryDate")):
            return cache["accessToken"], None
        if cache.get("refreshToken") and fresh(cache.get("refreshTokenExpiryDate")):
            resp = request("POST", "authentication/refreshAccessToken", body={"refreshToken": cache["refreshToken"]})
            if ok(resp) and (resp.get("data") or {}).get("accessToken"):
                save(resp["data"])
                return resp["data"]["accessToken"], None
    key = os.environ.get("CJ_API_KEY")
    if not key:
        return None, "No CJ token available and CJ_API_KEY is not set"
    resp = request("POST", "authentication/getAccessToken", body={"apiKey": key})
    if not ok(resp) or not (resp.get("data") or {}).get("accessToken"):
        return None, resp.get("message") or "getAccessToken failed"
    save(resp["data"])
    return resp["data"]["accessToken"], None


def call(path, params):
    token, err = get_token()
    if err:
        return {"result": False, "message": err}
    resp = request("GET", path, params=params, token=token)
    msg = str(resp.get("message", "")).lower()
    if not ok(resp) and ("token" in msg or resp.get("code") in (401, 1600001, 1600003)):
        token, err = get_token(force=True)
        if err:
            return {"result": False, "message": err}
        resp = request("GET", path, params=params, token=token)
    return resp


def price(value):
    try:
        return float(str(value).split("-")[0].strip())
    except (TypeError, ValueError):
        return None


def summarize(p):
    return {
        "pid": p.get("pid"),
        "name": p.get("productNameEn") or p.get("productName"),
        "sku": p.get("productSku"),
        "sellPriceUSD": p.get("sellPrice"),
        "image": p.get("productImage"),
        "category": p.get("categoryName"),
        "weightGrams": p.get("productWeight"),
    }


def details(pid):
    resp = call("product/query", {"pid": pid})
    if not ok(resp):
        return {"error": resp.get("message") or "product/query failed", "code": resp.get("code")}
    p = resp.get("data") or {}
    images = p.get("productImageSet") or p.get("productImage")
    if isinstance(images, str):
        try:
            images = json.loads(images)
        except ValueError:
            images = [images]
    return {
        "ok": True,
        "product": {
            **summarize(p),
            "images": (images or [])[:8] if isinstance(images, list) else images,
            "description": (p.get("description") or "")[:1500],
            "variants": [
                {
                    "vid": v.get("vid"),
                    "name": v.get("variantNameEn") or v.get("variantName"),
                    "sku": v.get("variantSku"),
                    "sellPriceUSD": v.get("variantSellPrice"),
                    "image": v.get("variantImage"),
                    "weightGrams": v.get("variantWeight"),
                }
                for v in (p.get("variants") or [])[:50]
            ],
        },
    }


def search(inp):
    if not any(inp.get(k) for k in ("keyword", "category_id", "sku")):
        return {"error": "Give a keyword, category_id, sku, or pid"}
    size = max(1, min(int(inp.get("page_size") or 10), 50))
    resp = call("product/list", {
        "productNameEn": inp.get("keyword"),
        "categoryId": inp.get("category_id"),
        "productSku": inp.get("sku"),
        "pageNum": max(1, int(inp.get("page") or 1)),
        "pageSize": size,
    })
    if not ok(resp):
        return {"error": resp.get("message") or "product/list failed", "code": resp.get("code")}
    data = resp.get("data") or {}
    items = [summarize(p) for p in data.get("list") or []]
    lo, hi = inp.get("min_price"), inp.get("max_price")
    if lo is not None or hi is not None:
        def within(it):
            pr = price(it["sellPriceUSD"])
            if pr is None:
                return False
            return (lo is None or pr >= float(lo)) and (hi is None or pr <= float(hi))
        items = [it for it in items if within(it)]
    return {
        "ok": True,
        "total": data.get("total"),
        "page": data.get("pageNum"),
        "pageSize": data.get("pageSize"),
        "count": len(items),
        "products": items,
    }


def main():
    try:
        inp = json.loads(os.environ.get("INPUT_JSON", "{}") or "{}")
        out = details(inp["pid"]) if inp.get("pid") else search(inp)
        print(json.dumps(out, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
