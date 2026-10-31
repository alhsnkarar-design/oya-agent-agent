/**
 * Demo mode: used when no AI provider key is configured, so the whole
 * platform (streaming, preview, versions, export) can be tried end-to-end.
 */
import { formatFiles } from "./prompts";

const INDEX = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ember Roasters — Specialty coffee, roasted daily</title>
  <meta name="description" content="Small-batch specialty coffee roasted every morning. Visit our café or book a table." />
  <meta property="og:title" content="Ember Roasters" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☕</text></svg>" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-stone-50 text-stone-800">
  <header class="sticky top-0 z-30 backdrop-blur bg-stone-50/80 border-b border-stone-200">
    <nav class="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
      <a href="index.html" class="text-xl font-bold text-amber-800">Ember Roasters</a>
      <button id="menuBtn" class="md:hidden p-2" aria-label="Open menu">☰</button>
      <ul id="menu" class="hidden md:flex gap-8 font-semibold">
        <li><a href="#menu-list" class="hover:text-amber-700">Menu</a></li>
        <li><a href="#about" class="hover:text-amber-700">Our story</a></li>
        <li><a href="contact.html" class="hover:text-amber-700">Book a table</a></li>
      </ul>
    </nav>
  </header>

  <section class="hero relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-5 py-24 grid md:grid-cols-2 gap-10 items-center">
      <div class="reveal">
        <span class="inline-block bg-amber-100 text-amber-800 rounded-full px-4 py-1 text-sm mb-4">Roasted daily since 2014</span>
        <h1 class="display text-5xl md:text-7xl leading-[1.02] mb-6">Every cup tells a story <em class="text-amber-700">from the farm</em></h1>
        <p class="text-lg text-stone-600 mb-8">Single-origin beans from Ethiopia, Colombia and Yemen — roasted in small batches so they reach you at their peak.</p>
        <a href="#menu-list" class="btn">Explore the menu</a>
      </div>
      <img class="rounded-3xl shadow-2xl reveal" src="https://picsum.photos/seed/coffee/700/520" alt="A cup of specialty coffee" />
    </div>
  </section>

  <section id="menu-list" class="max-w-6xl mx-auto px-5 py-20">
    <h2 class="display text-4xl mb-10 text-center">On the menu</h2>
    <div id="cards" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
  </section>

  <section id="about" class="bg-amber-900 text-amber-50">
    <div class="max-w-4xl mx-auto px-5 py-20 text-center reveal">
      <h2 class="display text-4xl mb-6">Our story</h2>
      <p class="text-lg leading-loose opacity-90">We started with a tiny roaster and a big idea: coffee that respects the farmer and delights the guest. Today we welcome over a thousand guests every week.</p>
    </div>
  </section>

  <footer class="text-center py-10 text-stone-500">© 2026 Ember Roasters — made with Bannaa</footer>
  <script src="js/app.js"></script>
</body>
</html>`;

const CONTACT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Book a table — Ember Roasters</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="bg-stone-50 text-stone-800">
  <main class="max-w-xl mx-auto px-5 py-16">
    <a href="index.html" class="text-amber-700 font-semibold">← Back home</a>
    <h1 class="display text-5xl my-6">Book a table</h1>
    <form id="contactForm" class="space-y-4 bg-white p-6 rounded-2xl shadow" novalidate>
      <label class="block">Name<input name="name" required class="field" /></label>
      <label class="block">Email<input name="email" type="email" required class="field" /></label>
      <label class="block">Notes<textarea name="msg" required rows="4" class="field"></textarea></label>
      <p id="formMsg" class="text-sm"></p>
      <button class="btn w-full">Request booking</button>
    </form>
  </main>
  <script src="js/app.js"></script>
</body>
</html>`;

const CSS = `body{font-family:"Inter",system-ui,sans-serif}
.display{font-family:"Instrument Serif",Georgia,serif;font-weight:400;letter-spacing:-.01em}
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
  {n:"Espresso",d:"A dense shot with dark chocolate notes",p:3.5,e:"☕"},
  {n:"Cortado",d:"Espresso cut with equal steamed milk",p:4.2,e:"🥛"},
  {n:"Ethiopian V60",d:"Hand-poured, jasmine and berry notes",p:5.5,e:"🌸"},
  {n:"Cardamom latte",d:"A warm twist with freshly ground cardamom",p:5,e:"✨"},
  {n:"Cold brew",d:"Steeped for 18 hours, smooth and bright",p:4.8,e:"🧊"},
  {n:"Honey flat white",d:"Velvety microfoam with wildflower honey",p:4.9,e:"🍯"}];
const cards=document.getElementById("cards");
if(cards){cards.innerHTML=drinks.map(x=>\`<article class="card reveal"><div class="text-4xl mb-3">\${x.e}</div><h3 class="text-xl font-bold">\${x.n}</h3><p class="text-stone-500 my-2">\${x.d}</p><p class="font-bold text-amber-700">$\${x.p.toFixed(2)}</p></article>\`).join("");}
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
const mb=document.getElementById("menuBtn"),menu=document.getElementById("menu");
mb&&mb.addEventListener("click",()=>{menu.classList.toggle("hidden");menu.classList.add("flex","flex-col","absolute","top-16","right-0","left-0","bg-white","p-5")});
const form=document.getElementById("contactForm");
form&&form.addEventListener("submit",e=>{e.preventDefault();const m=document.getElementById("formMsg");
  if(!form.checkValidity()){m.textContent="Please fill in every field with a valid email.";m.className="text-sm text-red-600";return}
  m.textContent="Thanks! We'll confirm your booking within 24 hours ☕";m.className="text-sm text-green-700";form.reset();});`;

export function demoOutput(isEdit: boolean): string {
  if (isEdit) {
    return `=== PLAN ===
You're in demo mode, so I can't apply edits yet.
=== NOTES ===
To enable real AI generation and edits, add ANTHROPIC_API_KEY (or GEMINI_API_KEY) to .env.local and restart the server.`;
  }
  return `=== PLAN ===
(Demo mode) Building a sample two-page site for a specialty coffee roastery: home and booking.
${formatFiles({ "index.html": INDEX, "contact.html": CONTACT, "css/style.css": CSS, "js/app.js": JS })}
=== NOTES ===
This is a sample site because no AI provider key is configured.
Add ANTHROPIC_API_KEY to .env.local to generate anything you describe.`;
}
