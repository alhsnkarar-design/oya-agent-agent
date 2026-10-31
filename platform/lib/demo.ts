/**
 * Demo mode: used when no AI provider key is configured, so the whole
 * platform (streaming, preview, versions, export) can be tried end-to-end.
 */
import { formatFiles } from "./prompts";

const INDEX = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>قهوة المساء — محمصة ومقهى مختص</title>
  <meta name="description" content="محمصة ومقهى مختص يقدم أجود حبوب القهوة المحمصة يومياً" />
  <meta property="og:title" content="قهوة المساء" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-stone-50 text-stone-800">
  <header class="sticky top-0 z-30 backdrop-blur bg-stone-50/80 border-b border-stone-200">
    <nav class="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
      <a href="index.html" class="text-xl font-bold text-amber-800">☕ قهوة المساء</a>
      <button id="menuBtn" class="md:hidden p-2" aria-label="القائمة">☰</button>
      <ul id="menu" class="hidden md:flex gap-8 font-semibold">
        <li><a href="#menu-list" class="hover:text-amber-700">القائمة</a></li>
        <li><a href="#about" class="hover:text-amber-700">قصتنا</a></li>
        <li><a href="contact.html" class="hover:text-amber-700">تواصل معنا</a></li>
      </ul>
    </nav>
  </header>

  <section class="hero relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-5 py-24 grid md:grid-cols-2 gap-10 items-center">
      <div class="reveal">
        <span class="inline-block bg-amber-100 text-amber-800 rounded-full px-4 py-1 text-sm mb-4">محمّصة يومياً منذ 2014</span>
        <h1 class="text-4xl md:text-6xl font-bold leading-tight mb-6">كل فنجان <span class="text-amber-700">حكاية</span> تبدأ من المزرعة</h1>
        <p class="text-lg text-stone-600 mb-8">نختار حبوبنا من إثيوبيا وكولومبيا واليمن، ونحمّصها بعناية لتصلك بنكهتها الكاملة.</p>
        <a href="#menu-list" class="btn">اكتشف القائمة</a>
      </div>
      <img class="rounded-3xl shadow-2xl reveal" src="https://picsum.photos/seed/coffee/700/520" alt="فنجان قهوة مختصة" />
    </div>
  </section>

  <section id="menu-list" class="max-w-6xl mx-auto px-5 py-20">
    <h2 class="text-3xl font-bold mb-10 text-center">قائمة المشروبات</h2>
    <div id="cards" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
  </section>

  <section id="about" class="bg-amber-900 text-amber-50">
    <div class="max-w-4xl mx-auto px-5 py-20 text-center reveal">
      <h2 class="text-3xl font-bold mb-6">قصتنا</h2>
      <p class="text-lg leading-loose opacity-90">بدأنا بمحمصة صغيرة وحلم كبير: أن نقدّم قهوة تحترم المزارع وتُسعد الضيف. اليوم نخدم أكثر من ألف ضيف أسبوعياً.</p>
    </div>
  </section>

  <footer class="text-center py-10 text-stone-500">© 2026 قهوة المساء — صُنع بواسطة بنّاء</footer>
  <script src="js/app.js"></script>
</body>
</html>`;

const CONTACT = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>تواصل معنا — قهوة المساء</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-stone-50 text-stone-800">
  <main class="max-w-xl mx-auto px-5 py-16">
    <a href="index.html" class="text-amber-700 font-semibold">→ العودة للرئيسية</a>
    <h1 class="text-3xl font-bold my-6">تواصل معنا</h1>
    <form id="contactForm" class="space-y-4 bg-white p-6 rounded-2xl shadow" novalidate>
      <label class="block">الاسم<input name="name" required class="field" /></label>
      <label class="block">البريد الإلكتروني<input name="email" type="email" required class="field" /></label>
      <label class="block">رسالتك<textarea name="msg" required rows="4" class="field"></textarea></label>
      <p id="formMsg" class="text-sm"></p>
      <button class="btn w-full">إرسال</button>
    </form>
  </main>
  <script src="js/app.js"></script>
</body>
</html>`;

const CSS = `body{font-family:"IBM Plex Sans Arabic",system-ui,sans-serif}
.hero{background:radial-gradient(circle at 80% 20%,#fde68a55,transparent 50%),radial-gradient(circle at 10% 80%,#d6d3d155,transparent 40%)}
.btn{display:inline-block;background:#92400e;color:#fff;padding:.85rem 2rem;border-radius:999px;font-weight:700;transition:transform .2s,box-shadow .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 25px -10px #92400e}
.field{display:block;width:100%;margin-top:.35rem;border:1px solid #d6d3d1;border-radius:.75rem;padding:.7rem 1rem}
.field:focus{outline:2px solid #d97706;border-color:transparent}
.reveal{opacity:0;transform:translateY(24px);transition:all .8s ease}
.reveal.visible{opacity:1;transform:none}
.card{background:#fff;border-radius:1.25rem;padding:1.5rem;box-shadow:0 1px 3px #0001;transition:transform .25s,box-shadow .25s}
.card:hover{transform:translateY(-4px);box-shadow:0 20px 40px -20px #0003}`;

const JS = `const drinks=[
  {n:"إسبريسو",d:"جرعة مركزة بنكهة الشوكولاتة الداكنة",p:12,e:"☕"},
  {n:"كورتادو",d:"إسبريسو مع حليب مبخّر بالتساوي",p:16,e:"🥛"},
  {n:"V60 إثيوبي",d:"تقطير يدوي بنكهات الياسمين والتوت",p:22,e:"🌸"},
  {n:"لاتيه بالهيل",d:"لمسة عربية دافئة بالهيل المطحون",p:19,e:"✨"},
  {n:"كولد برو",d:"منقوع بارد 18 ساعة، ناعم ومنعش",p:20,e:"🧊"},
  {n:"قهوة سعودية",d:"شقراء بالهيل والزعفران مع التمر",p:15,e:"🌴"}];
const cards=document.getElementById("cards");
if(cards){cards.innerHTML=drinks.map(x=>\`<article class="card reveal"><div class="text-4xl mb-3">\${x.e}</div><h3 class="text-xl font-bold">\${x.n}</h3><p class="text-stone-500 my-2">\${x.d}</p><p class="font-bold text-amber-700">\${x.p} ر.س</p></article>\`).join("");}
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
const mb=document.getElementById("menuBtn"),menu=document.getElementById("menu");
mb&&mb.addEventListener("click",()=>{menu.classList.toggle("hidden");menu.classList.add("flex","flex-col","absolute","top-16","right-0","left-0","bg-white","p-5")});
const form=document.getElementById("contactForm");
form&&form.addEventListener("submit",e=>{e.preventDefault();const m=document.getElementById("formMsg");
  if(!form.checkValidity()){m.textContent="الرجاء تعبئة جميع الحقول ببريد صحيح";m.className="text-sm text-red-600";return}
  m.textContent="شكراً لك! سنرد عليك خلال 24 ساعة ☕";m.className="text-sm text-green-700";form.reset();});`;

export function demoOutput(isEdit: boolean): string {
  if (isEdit) {
    return `=== PLAN ===
أنت في الوضع التجريبي، لذلك لا يمكنني تنفيذ التعديلات فعلياً.
=== NOTES ===
لتفعيل التوليد والتعديل الحقيقي بالذكاء الاصطناعي، أضف ANTHROPIC_API_KEY (أو GEMINI_API_KEY) في ملف ‎.env.local ثم أعد تشغيل المنصة.`;
  }
  return `=== PLAN ===
(وضع تجريبي) سأبني لك موقعاً نموذجياً لمقهى مختص بصفحتين: الرئيسية وتواصل معنا.
${formatFiles({ "index.html": INDEX, "contact.html": CONTACT, "css/style.css": CSS, "js/app.js": JS })}
=== NOTES ===
هذا موقع نموذجي لأن المنصة تعمل بدون مفتاح ذكاء اصطناعي.
أضف ANTHROPIC_API_KEY في ‎.env.local لتوليد أي موقع تصفه فعلياً.`;
}
