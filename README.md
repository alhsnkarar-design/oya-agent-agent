# المساعد الإسلامي

> Built with [Oya AI](https://oya.ai)

## About

مساعد إسلامي وقور وهادئ، يعتمد على المصادر الموثوقة، ويتحدث بلغة عربية فصحى مبسطة وواضحة.

## Configuration

- **Mode:** skills
- **Agent ID:** `2e54f5c0-c499-4c53-bea8-1936621c3e79`
- **Model:** `gemini/gemini-3.5-flash`

## AI App & Website Builder — منشئ المواقع والتطبيقات بالذكاء الاصطناعي

صف ما تريد بلغتك، ويبني الوكيل مشروعاً كاملاً جاهزاً للتشغيل ويرسله لك كملف ZIP.

| الأداة | ماذا تبني |
|---|---|
| `build_website` (`skills/build-website`) | موقع متجاوب متعدد الصفحات (HTML/CSS/JS) + ملف معاينة مباشر، يدعم العربية RTL |
| `build_app` (`skills/build-app`) | تطبيق متكامل: `fullstack-node`، `react`، `nextjs`، `flask`، `fastapi`، `pwa`، `mobile-expo`، `flutter` |

**أمثلة:**
- «اصنع لي موقعاً لمطعم شامي فيه قائمة طعام ونموذج حجز، بألوان ذهبية وداكنة»
- «ابنِ تطبيق حجز مواعيد لعيادة أسنان مع تسجيل دخول ولوحة تحكم للمشرف» (stack: `fullstack-node`)
- «عدّل الموقع السابق: اجعل الخلفية فاتحة وأضف قسم آراء العملاء»

**الإعداد:** عيّن أحد المتغيرات التالية في بيئة الأدوات (sandbox):
`GEMINI_API_KEY` أو `OPENROUTER_API_KEY` أو `OPENAI_API_KEY`، أو `LLM_API_KEY` + `LLM_BASE_URL` لأي خدمة متوافقة مع OpenAI.
اختيارياً: `LLM_MODEL`، `LLM_MAX_TOKENS`. بدون مفتاح، يكتب الوكيل الملفات بنفسه وتقوم الأداة بالتحقق منها وتغليفها (وضع `files`).

**أوضاع العمل:** توليد (`description`) · تعديل (`feedback` + `previous_zip`) · تغليف (`files`).
يتم التحقق تلقائياً من الملفات (JSON صالح، بايثون يُترجم، وجود README والملفات المرتبطة، عدم وجود TODO) وتنقية المسارات.

## Usage

Every deployed agent exposes an **OpenAI-compatible API endpoint**. Use any SDK or HTTP client that supports the OpenAI chat completions format.

### Authentication

Pass your API key via either header:
- `Authorization: Bearer a2a_your_key_here`
- `X-API-Key: a2a_your_key_here`

Create API keys at [https://oya.ai/api-keys](https://oya.ai/api-keys).

### Endpoint

```
https://oya.ai/api/v1/chat/completions
```

### cURL

```bash
curl -X POST https://oya.ai/api/v1/chat/completions \
  -H "Authorization: Bearer a2a_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini/gemini-3.5-flash","messages":[{"role":"user","content":"Hello"}]}'

# Continue a conversation using thread_id from the first response:
curl -X POST https://oya.ai/api/v1/chat/completions \
  -H "Authorization: Bearer a2a_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini/gemini-3.5-flash","messages":[{"role":"user","content":"Follow up"}],"thread_id":"THREAD_ID"}'
```

### Python

```python
from openai import OpenAI

client = OpenAI(
    api_key="a2a_your_key_here",
    base_url="https://oya.ai/api/v1",
)

# First message — starts a new thread
response = client.chat.completions.create(
    model="gemini/gemini-3.5-flash",
    messages=[{"role": "user", "content": "Hello"}],
)
print(response.choices[0].message.content)

# Continue the conversation using thread_id
thread_id = response.thread_id
response = client.chat.completions.create(
    model="gemini/gemini-3.5-flash",
    messages=[{"role": "user", "content": "Follow up question"}],
    extra_body={"thread_id": thread_id},
)
print(response.choices[0].message.content)
```

### TypeScript

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "a2a_your_key_here",
  baseURL: "https://oya.ai/api/v1",
});

// First message — starts a new thread
const response = await client.chat.completions.create({
  model: "gemini/gemini-3.5-flash",
  messages: [{ role: "user", content: "Hello" }],
});
console.log(response.choices[0].message.content);

// Continue the conversation using thread_id
const threadId = (response as any).thread_id;
const followUp = await client.chat.completions.create({
  model: "gemini/gemini-3.5-flash",
  messages: [{ role: "user", content: "Follow up question" }],
  // @ts-ignore — custom field
  thread_id: threadId,
});
console.log(followUp.choices[0].message.content);
```

### Swift

```swift
// Package.swift:
// .package(url: "https://github.com/MacPaw/OpenAI.git", from: "0.4.0")
import Foundation
import OpenAI

@main
struct Main {
    static func main() async throws {
        let config = OpenAI.Configuration(
            token: "a2a_your_key_here",
            host: "oya.ai",
            scheme: "https"
        )
        let client = OpenAI(configuration: config)

        let query = ChatQuery(
            messages: [.user(.init(content: .string("Hello")))],
            model: "gemini/gemini-3.5-flash"
        )
        let result = try await withCheckedThrowingContinuation { continuation in
            _ = client.chats(query: query) { continuation.resume(with: $0) }
        }
        print(result.choices.first?.message.content ?? "")
    }
}
```

### Kotlin

```kotlin
// build.gradle.kts dependencies:
// implementation("com.aallam.openai:openai-client:4.0.1")
// implementation("io.ktor:ktor-client-cio:3.0.0")
import com.aallam.openai.api.chat.ChatCompletionRequest
import com.aallam.openai.api.chat.ChatMessage
import com.aallam.openai.api.chat.ChatRole
import com.aallam.openai.api.model.ModelId
import com.aallam.openai.client.OpenAI
import com.aallam.openai.client.OpenAIHost
import kotlinx.coroutines.runBlocking

fun main() = runBlocking {
    val openai = OpenAI(
        token = "a2a_your_key_here",
        host = OpenAIHost(baseUrl = "https://oya.ai/api/v1/")
    )
    val completion = openai.chatCompletion(
        ChatCompletionRequest(
            model = ModelId("gemini/gemini-3.5-flash"),
            messages = listOf(ChatMessage(role = ChatRole.User, content = "Hello"))
        )
    )
    println(completion.choices.first().message.messageContent)
}
```

### Streaming

```python
stream = client.chat.completions.create(
    model="gemini/gemini-3.5-flash",
    messages=[{"role": "user", "content": "Tell me about AI agents"}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

### Embeddable Widget

```html
<!-- Oya Chat Widget -->
<script
  src="https://oya.ai/widget.js"
  data-agent-id="2e54f5c0-c499-4c53-bea8-1936621c3e79"
  data-api-key="a2a_your_key_here"
  data-title="المساعد الإسلامي"
></script>
```

### Supported Models

- `gemini/gemini-2.0-flash`
- `gemini/gemini-2.5-flash`
- `gemini/gemini-2.5-pro`
- `gemini/gemini-3.5-flash`
- `gemini/gemini-3.1-pro-preview`
- `anthropic/claude-sonnet-4-6`
- `anthropic/claude-haiku-4-5-20251001`

---

*Managed by [Oya AI](https://oya.ai). Do not edit manually — changes are overwritten on each sync.*