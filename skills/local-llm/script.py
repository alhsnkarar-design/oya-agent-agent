import os
import json
import urllib.request

DEFAULT_URL = "http://localhost:20128/v1/chat/completions"


def request(url, payload=None):
    headers = {"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
    api_key = os.environ.get("LOCAL_LLM_API_KEY", "")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as response:
        return json.loads(response.read().decode())


def main():
    try:
        inputs = json.loads(os.environ.get("INPUT_JSON", "{}"))
        prompt = inputs.get("prompt", "")
        if not prompt:
            print(json.dumps({"error": "Prompt is required"}))
            return

        url = os.environ.get("LOCAL_LLM_URL", DEFAULT_URL)
        model = inputs.get("model") or os.environ.get("LOCAL_LLM_MODEL", "")
        if not model:
            models_url = url.rsplit("/chat/completions", 1)[0] + "/models"
            models = request(models_url).get("data", [])
            if not models:
                print(json.dumps({"error": "No model given and /v1/models returned none"}))
                return
            model = models[0]["id"]

        messages = []
        if inputs.get("system"):
            messages.append({"role": "system", "content": inputs["system"]})
        messages.append({"role": "user", "content": prompt})

        data = request(url, {
            "model": model,
            "messages": messages,
            "temperature": inputs.get("temperature", 0.7),
        })
        reply = data["choices"][0]["message"]["content"]
        print(json.dumps({"model": model, "reply": reply}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))


if __name__ == "__main__":
    main()
