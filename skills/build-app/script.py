"""
build_app — يبني تطبيقاً متكاملاً (واجهة + خادم + قاعدة بيانات، أو تطبيق جوال) من وصف نصي.

وضعان للعمل:
  1) وضع التوليد: يُرسل الوصف إلى نموذج لغوي (OpenAI-compatible) ويستلم ملفات الموقع.
     يتطلب أحد المتغيرات: LLM_API_KEY أو GEMINI_API_KEY أو OPENROUTER_API_KEY أو OPENAI_API_KEY.
  2) وضع التغليف: إذا مرّر الوكيل الحقل "files" (كتبها النموذج بنفسه) فلا حاجة لأي مفتاح؛
     يتم التحقق من الملفات وتغليفها في ملف ZIP جاهز للتحميل والنشر.

لا يعتمد إلا على مكتبة بايثون القياسية.
"""
import io
import json
import os
import re
import time
import urllib.error
import urllib.request
import zipfile

OUT_DIR = "/tmp/ai_builder"
MAX_FILES = 60
MAX_FILE_BYTES = 400_000

STACKS = {
    "react": "React 18 + Vite + TypeScript + Tailwind CSS (frontend only, localStorage persistence).",
    "fullstack-node": "Frontend: React + Vite + Tailwind in /client. Backend: Node.js + Express REST API in /server "
                      "with SQLite (better-sqlite3), JWT auth (bcrypt), input validation, CORS. Root package.json with "
                      "scripts to install/run both (concurrently).",
    "nextjs": "Next.js 14 App Router + TypeScript + Tailwind, API route handlers, Prisma + SQLite, NextAuth credentials auth.",
    "flask": "Python Flask + SQLAlchemy + SQLite, Jinja2 templates + Tailwind CDN, Flask-Login auth, requirements.txt.",
    "fastapi": "Backend: FastAPI + SQLModel + SQLite + JWT auth in /backend (requirements.txt). "
               "Frontend: React + Vite + Tailwind in /frontend calling the API.",
    "pwa": "Installable Progressive Web App: HTML/CSS/vanilla JS, manifest.json, service worker with offline cache, "
           "IndexedDB storage. No build step; index.html is the entry point.",
    "mobile-expo": "React Native mobile app with Expo (SDK 51) + TypeScript + React Navigation + AsyncStorage.",
    "flutter": "Flutter 3 mobile app (Dart), Material 3, Provider state management, shared_preferences persistence.",
}

SYSTEM_PROMPT = """You are a principal full-stack engineer. Build a COMPLETE, runnable application
from the user's description using the requested stack. The project must run after following the README.

Hard requirements:
- Every file needed to install and run: manifests (package.json / requirements.txt / pubspec.yaml),
  configs, source code, seed data, .env.example (never real secrets), .gitignore, and README.md with
  exact setup/run/deploy commands.
- Implement ALL requested features end-to-end (data model, API/business logic, UI, validation,
  error/loading/empty states). No TODOs, no placeholders, no omitted code ("..." is forbidden).
- Clean architecture, small focused modules, consistent naming, basic security (hashed passwords,
  parameterized queries, input validation, CORS config, auth on protected routes).
- Responsive, accessible, polished UI. Real content in the requested language; if Arabic/RTL, set
  dir="rtl" and RTL-aware layout.
- Pin realistic dependency versions. Keep the file count reasonable (<= 45 files).

Output format — STRICTLY, nothing outside these blocks except a final NOTES block:
=== FILE: relative/path.ext ===
<full file content>
=== END FILE ===
(repeat for every file)
=== NOTES ===
<short summary: features, how to run, default demo credentials if any>
"""

FILE_RE = re.compile(r"=== FILE:\s*(.+?)\s*===\s*\n(.*?)\n=== END FILE ===", re.S)
NOTES_RE = re.compile(r"=== NOTES ===\s*\n(.*)$", re.S)


# ---------------------------------------------------------------- LLM client
def _llm_config():
    """Resolve an OpenAI-compatible endpoint from environment variables."""
    model = os.environ.get("LLM_MODEL")
    if os.environ.get("LLM_API_KEY"):
        return (os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1"),
                os.environ["LLM_API_KEY"], model or "gpt-4o")
    if os.environ.get("GEMINI_API_KEY"):
        return ("https://generativelanguage.googleapis.com/v1beta/openai",
                os.environ["GEMINI_API_KEY"], model or "gemini-2.5-flash")
    if os.environ.get("OPENROUTER_API_KEY"):
        return ("https://openrouter.ai/api/v1",
                os.environ["OPENROUTER_API_KEY"], model or "anthropic/claude-sonnet-4.5")
    if os.environ.get("OPENAI_API_KEY"):
        return ("https://api.openai.com/v1", os.environ["OPENAI_API_KEY"], model or "gpt-4o")
    return None


def call_llm(system, user, max_tokens=None, retries=2):
    cfg = _llm_config()
    if not cfg:
        raise RuntimeError("NO_LLM_KEY")
    base, key, model = cfg
    max_tokens = max_tokens or int(os.environ.get("LLM_MAX_TOKENS", "64000"))
    last = None
    for attempt in range(retries + 1):
        body = json.dumps({
            "model": model,
            "messages": [{"role": "system", "content": system},
                         {"role": "user", "content": user}],
            "max_tokens": max_tokens,
            "temperature": 0.4,
        }).encode()
        req = urllib.request.Request(
            base.rstrip("/") + "/chat/completions", data=body,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                data = json.loads(r.read().decode())
            return data["choices"][0]["message"]["content"] or ""
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="ignore")[:400]
            last = f"HTTP {e.code}: {msg}"
            if e.code == 400 and "token" in msg.lower() and max_tokens > 16000:
                max_tokens = 16000  # model has a lower output cap — retry immediately
                continue
            if e.code < 500 and e.code != 429:
                break
        except Exception as e:  # network / parsing
            last = str(e)
        time.sleep(2 ** (attempt + 1))
    raise RuntimeError(f"LLM request failed: {last}")


# ---------------------------------------------------------------- helpers
def safe_path(p):
    p = p.strip().strip("`'\"").replace("\\", "/")
    parts = [x for x in p.split("/") if x not in ("", ".")]
    if not parts or any(x == ".." for x in parts):
        return None
    return "/".join(parts)


def normalize_files(raw):
    """Accept {"path": "content"} or [{"path":..,"content":..}]."""
    items = raw.items() if isinstance(raw, dict) else (
        (f.get("path"), f.get("content")) for f in raw if isinstance(f, dict))
    files = {}
    for path, content in items:
        sp = safe_path(str(path or ""))
        if sp and isinstance(content, str) and len(content.encode()) <= MAX_FILE_BYTES:
            files[sp] = content
        if len(files) >= MAX_FILES:
            break
    return files


def parse_llm_output(text):
    files = {}
    for path, content in FILE_RE.findall(text):
        sp = safe_path(path)
        if sp:
            files[sp] = re.sub(r"^```[\w-]*\n|\n```$", "", content.strip("\n")) + "\n"
    notes = NOTES_RE.search(text)
    return files, (notes.group(1).strip() if notes else "")


def slugify(s):
    s = re.sub(r"[^\w\-]+", "-", s.strip().lower(), flags=re.U).strip("-")
    return (s or "site")[:40]


def validate_app(files, stack):
    warnings = []
    for path, content in files.items():
        if path.endswith(".json"):
            try:
                json.loads(content)
            except ValueError:
                warnings.append(f"{path}: invalid JSON")
        if path.endswith(".py"):
            try:
                compile(content, path, "exec")
            except SyntaxError as e:
                warnings.append(f"{path}: Python syntax error line {e.lineno}")
        if re.search(r"^\s*(//|#)\s*\.\.\.|TODO", content, re.M):
            warnings.append(f"{path}: contains placeholder/TODO")
    if not any(p.lower() == "readme.md" for p in files):
        warnings.append("README.md missing")
    expected = {"flask": "requirements.txt", "flutter": "pubspec.yaml", "fastapi": "backend/requirements.txt"}
    need = expected.get(stack)
    if need and need not in files:
        warnings.append(f"{need} missing")
    if stack in ("react", "nextjs", "mobile-expo", "fullstack-node") and not any(
            p.endswith("package.json") for p in files):
        warnings.append("package.json missing")
    if stack == "pwa" and "index.html" not in files:
        warnings.append("index.html missing")
    return warnings


def inline_preview(files):
    """Single self-contained HTML (CSS/JS inlined) for instant preview."""
    html = files["index.html"]

    def css(m):
        p = safe_path(m.group(1))
        return f"<style>\n{files[p]}\n</style>" if p in files else m.group(0)

    def js(m):
        p = safe_path(m.group(1))
        return f"<script>\n{files[p]}\n</script>" if p in files else m.group(0)

    html = re.sub(r'<link[^>]+href="([^"]+\.css)"[^>]*>', css, html)
    html = re.sub(r'<script[^>]+src="([^"]+\.js)"[^>]*>\s*</script>', js, html)
    return html


def write_outputs(name, files, preview=True):
    os.makedirs(OUT_DIR, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    zip_path = os.path.join(OUT_DIR, f"{name}-{stamp}.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for path, content in sorted(files.items()):
            z.writestr(f"{name}/{path}", content)
    outputs = [zip_path]
    if preview:
        prev = os.path.join(OUT_DIR, f"{name}-preview.html")
        with open(prev, "w", encoding="utf-8") as f:
            f.write(inline_preview(files))
        outputs.append(prev)
    return outputs


def load_zip(zip_path):
    """Reload a project produced earlier (for revisions)."""
    files = {}
    if zip_path and os.path.isfile(zip_path):
        with zipfile.ZipFile(zip_path) as z:
            for n in z.namelist():
                if not n.endswith("/"):
                    rel = n.split("/", 1)[1] if "/" in n else n
                    files[rel] = z.read(n).decode("utf-8", errors="ignore")
    return normalize_files(files)


def zip_root(zip_path):
    if zip_path and os.path.isfile(zip_path):
        with zipfile.ZipFile(zip_path) as z:
            names = z.namelist()
            if names and "/" in names[0]:
                return names[0].split("/", 1)[0]
    return None


# ---------------------------------------------------------------- main
def build_prompt(inp):
    stack = inp.get("stack") or "fullstack-node"
    lines = [f"Application description:\n{inp.get('description', '')}",
             f"Stack: {STACKS.get(stack, stack)}"]
    for key, label in (("language", "UI language"), ("style", "Visual style"),
                       ("features", "Required features"), ("entities", "Data entities"),
                       ("auth", "Authentication")):
        if inp.get(key):
            val = inp[key]
            lines.append(f"{label}: {', '.join(val) if isinstance(val, list) else val}")
    previous = normalize_files(inp.get("previous_files") or {}) or load_zip(inp.get("previous_zip"))
    if inp.get("feedback") and previous:
        lines.append("\nThis is a REVISION. Apply the following changes and return ALL files "
                     f"(full content, not diffs):\n{inp['feedback']}\n\nCurrent files:")
        for p, c in previous.items():
            lines.append(f"=== FILE: {p} ===\n{c}\n=== END FILE ===")
    return "\n".join(lines)


def main():
    inp = json.loads(os.environ.get("INPUT_JSON", "{}"))
    description = (inp.get("description") or "").strip()
    name = slugify(inp.get("project_name") or zip_root(inp.get("previous_zip"))
                   or description[:30] or "app")
    stack = inp.get("stack") or "fullstack-node"
    notes = ""

    if inp.get("files"):
        files = normalize_files(inp["files"])
        mode = "package"
    else:
        if not description and not inp.get("feedback"):
            print(json.dumps({"error": "description is required (or pass files)"}, ensure_ascii=False))
            return
        try:
            raw = call_llm(SYSTEM_PROMPT, build_prompt(inp))
        except RuntimeError as e:
            if str(e) == "NO_LLM_KEY":
                print(json.dumps({
                    "error": "no_llm_key",
                    "hint": ("No LLM API key configured. Generate the files yourself and call "
                             "build_app again with files={path: content}, or set "
                             "GEMINI_API_KEY / OPENROUTER_API_KEY / OPENAI_API_KEY / LLM_API_KEY."),
                }, ensure_ascii=False))
                return
            raise
        files, notes = parse_llm_output(raw)
        mode = "generate"

    if not files:
        print(json.dumps({"error": "no files produced"}, ensure_ascii=False))
        return

    warnings = validate_app(files, stack)
    outputs = write_outputs(name, files, preview=(stack == "pwa" and "index.html" in files))
    for path in outputs:
        print(f"A2ABASEAI_FILE: {path}")
    print(json.dumps({
        "ok": True,
        "mode": mode,
        "project": name,
        "stack": stack,
        "files": sorted(files),
        "zip": outputs[0],
        "preview": outputs[1] if len(outputs) > 1 else None,
        "notes": notes,
        "warnings": warnings,
        "run_hint": "Unzip, then follow README.md (install dependencies, copy .env.example to .env, run dev script).",
    }, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
