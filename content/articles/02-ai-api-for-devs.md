# اربط موقعك بالذكاء الاصطناعي في 30 دقيقة (دليل المطورين)

> **الشريحة:** 🔵 المطورين والمبرمجين · **وقت القراءة:** 10 دقايق · **المستوى:** متوسط

عندك موقع أو تطبيق وعاوز تضيفله شات بوت، أو ميزة تلخيص، أو «اقترح وصف للمنتج»؟ مش محتاج تدرّب موديل ولا تشتري GPU. كل اللي محتاجه **API**.

في المقال ده هنبني Backend صغير بـ Node.js بيكلّم موديل ذكاء اصطناعي، ونربطه بصفحة HTML بسيطة، ونغطّي الأمان والتكلفة.

---

## الفكرة العامة (Architecture)

```
[المتصفح / التطبيق]  ──►  [الـ Backend بتاعك]  ──►  [AI API]
       ▲                       │
       └──────── الرد ─────────┘
```

**ليه مانكلّمش الـ API من المتصفح على طول؟**
عشان **مفتاح الـ API** (API Key). لو حطّيته في كود الـ Frontend، أي حد يفتح DevTools هياخده ويصرف من رصيدك. **المفتاح مكانه السيرفر بس.** دي أهم قاعدة في المقال كله.

---

## الخطوة 1: جهّز المشروع

```bash
mkdir ai-demo && cd ai-demo
npm init -y
npm install express dotenv
```

اعمل ملف `.env` (وضيفه في `.gitignore` حالًا):

```env
AI_API_KEY=your_key_here
AI_BASE_URL=https://api.provider.com/v1
AI_MODEL=model-name-here
```

> 💡 أغلب المزوّدين (وكمان الـ Gateways اللي بتجمع موديلات كتير في API واحد) بيدعموا صيغة **Chat Completions** المتوافقة مع OpenAI. يعني الكود اللي تحت هيشتغل مع أغلبهم بمجرد ما تغيّر `AI_BASE_URL` و`AI_MODEL`. راجع توثيق المزوّد بتاعك للعنوان واسم الموديل بالظبط.

---

## الخطوة 2: الـ Backend

`server.js`:

```js
import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json({ limit: '20kb' }));
app.use(express.static('public'));

const SYSTEM_PROMPT = `إنت مساعد خدمة عملاء لمتجر إلكتروني.
رد بالعامية المصرية، باختصار وأدب.
لو مش عارف الإجابة، قول كده وماتألّفش.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  // 1) تحقّق من المدخلات
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return res.status(400).json({ error: 'رسائل غير صالحة' });
  }

  try {
    const response = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        max_tokens: 500, // 2) سقف للتكلفة
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10), // 3) آخر 10 رسايل بس
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI error', response.status, await response.text());
      return res.status(502).json({ error: 'الخدمة مش متاحة دلوقتي' });
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حصلت مشكلة، جرّب تاني' });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));
```

وضيف `"type": "module"` في `package.json` عشان `import` يشتغل.

---

## الخطوة 3: الـ Frontend

`public/index.html`:

```html
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>مساعد المتجر</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    #log p { padding: .6rem .9rem; border-radius: 12px; }
    .user { background: #e8f0fe; } .bot { background: #f1f3f4; }
    form { display: flex; gap: .5rem; } input { flex: 1; padding: .6rem; }
  </style>
</head>
<body>
  <h1>اسأل المساعد 🤖</h1>
  <div id="log"></div>
  <form id="f">
    <input id="q" placeholder="اكتب سؤالك…" autocomplete="off" required>
    <button>ابعت</button>
  </form>

  <script>
    const messages = [];
    const log = document.getElementById('log');

    function add(role, text) {
      const p = document.createElement('p');
      p.className = role === 'user' ? 'user' : 'bot';
      p.textContent = text; // textContent مش innerHTML عشان XSS
      log.appendChild(p);
    }

    document.getElementById('f').onsubmit = async (e) => {
      e.preventDefault();
      const q = document.getElementById('q');
      const text = q.value.trim();
      if (!text) return;
      q.value = '';
      add('user', text);
      messages.push({ role: 'user', content: text });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      const reply = data.reply ?? data.error;
      add('bot', reply);
      if (data.reply) messages.push({ role: 'assistant', content: reply });
    };
  </script>
</body>
</html>
```

شغّل:

```bash
node server.js
```

وافتح `http://localhost:3000`. مبروك، عندك شات بوت شغّال 🎉

---

## الخطوة 4: قبل ما تنزّله Production ✅

### الأمان
- [ ] **المفتاح في `.env` بس**، ومش متساب في Git (لو اتسرّب بالغلط: الغيه فورًا واعمل واحد جديد).
- [ ] **Rate Limiting:** حط حد لعدد الطلبات لكل IP (مثلًا مكتبة `express-rate-limit`)، وإلا حد يعمل سكريبت ويخلّص رصيدك في ليلة.
- [ ] **Prompt Injection:** المستخدم ممكن يكتب «انسى التعليمات اللي فاتت واعمل كذا». ماتديش الموديل صلاحيات خطيرة (زي مسح بيانات أو رد فلوس) من غير تحقّق في الكود بتاعك إنت.
- [ ] **ما تعرضش رد الموديل كـ HTML** من غير Sanitization.

### التكلفة
- التسعير غالبًا **بالـ Token** (حوالي جزء من كلمة)، و**الدخل والخرج** ليهم أسعار مختلفة.
- `max_tokens` + إنك تبعت آخر كام رسالة بس = فاتورة متوقّعة.
- ابدأ بموديل صغير ورخيص، ولو الجودة مش كفاية اطلع لموديل أكبر.
- حط **حد إنفاق شهري** (Spending Limit) من لوحة تحكم المزوّد.

### تجربة المستخدم
- **Streaming:** اعرض الرد كلمة بكلمة بدل ما المستخدم يستنى. أغلب الـ APIs بتدعم `stream: true`.
- رسالة واضحة لو الخدمة وقعت.
- اكتب للمستخدم إنه بيكلّم AI مش بني آدم.

---

## الخطوة الجاية

- **RAG:** خلّي البوت يجاوب من ملفات منتجاتك وأسئلتك الشائعة بدل معلوماته العامة.
- **Tool Calling:** خلّي البوت «يعمل» حاجات، زي إنه يدوّر على حالة أوردر من الداتابيز.
- **Agents:** اربط كذا أداة ببعض عشان البوت ينفّذ مهمة كاملة لوحده.

هنشرحهم واحد واحد في المقالات الجاية. لو عندك سؤال أو الكود ماشتغلش، اكتبه في الكومنتات 👇

---

### إعادة تدوير المقال ده
- **فيديو يوتيوب (12 دقيقة):** Live coding للمقال كله من الصفر
- **ريل 1:** «أوعى تحط مفتاح الـ API في الـ Frontend»، مع ديمو لسرقته من DevTools
- **ريل 2:** «ثلاث سطور تحميك من فاتورة AI مرعبة» (max_tokens، rate limit، spending limit)
- **كاروسيل:** Checklist الـ Production
