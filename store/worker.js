// Zifidit Store Worker (zifidit.com).
// - Serves store/public from this repo, pinned to the commit in SITE_REF (edge-cached).
// - /api/subscribe, /api/contact, /api/order, /api/track backed by D1 (binding DB).
// Order totals are recomputed here from products.json; client prices are never trusted.

const REPO = "https://raw.githubusercontent.com/alhsnkarar-design/oya-agent-agent/";
const SHIPPING_FEE = 60;
const FREE_FROM = 1500;
const TYPES = { html: "text/html; charset=utf-8", css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8", json: "application/json; charset=utf-8", svg: "image/svg+xml", txt: "text/plain; charset=utf-8", webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", ico: "image/x-icon", xml: "application/xml" };
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()" };
const STATUS_AR = { new: "قيد المراجعة", confirmed: "تم التأكيد", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, reach TEXT, topic TEXT, message TEXT, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS orders (ref TEXT PRIMARY KEY, name TEXT, phone TEXT, email TEXT, gov TEXT, city TEXT, address TEXT, notes TEXT, items TEXT, subtotal REAL, shipping REAL, total REAL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL)"
];
let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch(SCHEMA.map(function (s) { return db.prepare(s); }));
  schemaReady = true;
}

function json(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, SEC) });
}
const clip = function (v, n) { return String(v == null ? "" : v).trim().slice(0, n); };
const now = function () { return new Date().toISOString(); };
const phoneOk = function (v) { return /^01[0125]\d{8}$/.test(String(v).replace(/[\s-]/g, "")); };

async function asset(path, env, ctx) {
  const url = REPO + env.SITE_REF + "/store/public" + path;
  const cache = caches.default;
  const key = new Request(url);
  let res = await cache.match(key);
  if (!res) {
    const up = await fetch(url, { cf: { cacheTtl: 86400, cacheEverything: true } });
    if (!up.ok) return null;
    const ext = path.split(".").pop().toLowerCase();
    const isHtml = ext === "html", isData = ext === "json";
    res = new Response(up.body, { headers: Object.assign({ "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": isHtml || isData ? "public, max-age=60" : "public, max-age=3600" }, SEC) });
    ctx.waitUntil(cache.put(key, res.clone()));
  }
  return res;
}

async function loadProducts(env, ctx) {
  const r = await asset("/products.json", env, ctx);
  if (!r) return [];
  try { const l = await r.json(); return Array.isArray(l) ? l : []; } catch (e) { return []; }
}

async function api(path, req, env, ctx) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let b;
  try { b = await req.json(); } catch (e) { return json({ error: "طلب غير صالح." }, 400); }
  const db = env.DB;
  await ensureSchema(db);

  if (path === "/api/subscribe") {
    const email = clip(b.email, 200).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: "اكتب بريداً إلكترونياً صحيحاً." }, 400);
    await db.prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)").bind(email, now()).run();
    return json({ ok: true });
  }

  if (path === "/api/contact") {
    const name = clip(b.name, 120), reach = clip(b.reach, 160), topic = clip(b.topic, 60), message = clip(b.message, 4000);
    if (!name || !reach || message.length < 5) return json({ error: "من فضلك اكتب اسمك ووسيلة التواصل ورسالتك." }, 400);
    await db.prepare("INSERT INTO messages (name, reach, topic, message, created_at) VALUES (?, ?, ?, ?, ?)").bind(name, reach, topic, message, now()).run();
    return json({ ok: true });
  }

  if (path === "/api/order") {
    const products = await loadProducts(env, ctx);
    const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
    const lines = [];
    let subtotal = 0;
    for (const it of items) {
      const p = products.find(function (x) { return x && x.id === it.id; });
      const qty = Math.floor(Number(it.qty));
      if (!p || !(qty > 0)) continue;
      if (p.stock === 0) return json({ error: "المنتج «" + p.name + "» نفدت كميته. أزله من السلة وحاول مرة أخرى." }, 409);
      const q = Math.min(qty, typeof p.stock === "number" ? p.stock : 99);
      subtotal += p.price * q;
      lines.push({ id: p.id, name: p.name, price: p.price, qty: q });
    }
    if (!lines.length) return json({ error: "السلة فارغة أو تحتوي منتجات لم تعد متاحة." }, 400);
    const o = { name: clip(b.name, 120), phone: clip(b.phone, 20).replace(/[\s-]/g, ""), email: clip(b.email, 200), gov: clip(b.gov, 40), city: clip(b.city, 80), address: clip(b.address, 400), notes: clip(b.notes, 1000) };
    if (!o.name || !o.gov || !o.city || !o.address) return json({ error: "من فضلك أكمل الاسم والمحافظة والمدينة والعنوان." }, 400);
    if (!phoneOk(o.phone)) return json({ error: "اكتب رقم موبايل مصري صحيح من 11 رقماً يبدأ بـ 01." }, 400);
    const shipping = subtotal >= FREE_FROM ? 0 : SHIPPING_FEE;
    const ref = "ZF-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
    await db.prepare("INSERT INTO orders (ref, name, phone, email, gov, city, address, notes, items, subtotal, shipping, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)")
      .bind(ref, o.name, o.phone, o.email, o.gov, o.city, o.address, o.notes, JSON.stringify(lines), subtotal, shipping, subtotal + shipping, now()).run();
    return json({ ok: true, ref: ref, total: subtotal + shipping });
  }

  if (path === "/api/track") {
    const ref = clip(b.ref, 20).toUpperCase(), phone = clip(b.phone, 20).replace(/[\s-]/g, "");
    const row = await db.prepare("SELECT status FROM orders WHERE ref = ? AND phone = ?").bind(ref, phone).first();
    if (!row) return json({ error: "لم نجد طلباً بهذا الرقم وهذا الموبايل. تأكد من البيانات." }, 404);
    return json({ status: STATUS_AR[row.status] || row.status });
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.hostname === "www.zifidit.com") { url.hostname = "zifidit.com"; return Response.redirect(url.toString(), 301); }
    const path = url.pathname;
    if (path.startsWith("/api/")) {
      try { return await api(path, req, env, ctx); } catch (e) { return json({ error: "حدث خطأ في الخادم. حاول مرة أخرى بعد قليل." }, 500); }
    }
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    if (/\.[a-z0-9]+$/i.test(path) && !path.includes("..")) {
      const r = await asset(path, env, ctx);
      return r || new Response("Not found", { status: 404, headers: SEC });
    }
    // Client-side routes all serve the app shell.
    const shell = await asset("/index.html", env, ctx);
    return shell || new Response("Unavailable", { status: 503 });
  }
};
