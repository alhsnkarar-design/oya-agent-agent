// Zifidit Store Worker (zifidit.com).
// - Serves store/public from this repo, pinned to the commit in SITE_REF (edge-cached).
// - /api/subscribe, /api/contact, /api/order, /api/track backed by D1 (binding DB).
// Order totals are recomputed here from products.json; client prices are never trusted.

const REPO = "https://raw.githubusercontent.com/alhsnkarar-design/oya-agent-agent/";
const SHIPPING_FEE = 4.99;
const FREE_FROM = 0; // 0 = free shipping on every order
const TYPES = { html: "text/html; charset=utf-8", css: "text/css; charset=utf-8", js: "text/javascript; charset=utf-8", json: "application/json; charset=utf-8", svg: "image/svg+xml", txt: "text/plain; charset=utf-8", webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", ico: "image/x-icon", xml: "application/xml" };
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()" };
const STATUS = { new: "Received — awaiting payment", paid: "Paid — preparing to ship", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };

const SCHEMA = [
  "CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, topic TEXT, message TEXT, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS orders (ref TEXT PRIMARY KEY, email TEXT, name TEXT, phone TEXT, country TEXT, state TEXT, city TEXT, address TEXT, zip TEXT, items TEXT, subtotal REAL, shipping REAL, total REAL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL)"
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
const emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

async function asset(path, env, ctx) {
  const url = REPO + env.SITE_REF + "/store/public" + path;
  const cache = caches.default;
  const key = new Request(url);
  let res = await cache.match(key);
  if (!res) {
    const up = await fetch(url, { cf: { cacheTtl: 86400, cacheEverything: true } });
    if (!up.ok) return null;
    const ext = path.split(".").pop().toLowerCase();
    const short = ext === "html" || ext === "json";
    res = new Response(up.body, { headers: Object.assign({ "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": short ? "public, max-age=60" : "public, max-age=3600" }, SEC) });
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
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  let b;
  try { b = await req.json(); } catch (e) { return json({ error: "Invalid request." }, 400); }
  if (!env.DB) return json({ error: "This feature isn't available yet. Please try again soon." }, 503);
  const db = env.DB;
  await ensureSchema(db);

  if (path === "/api/subscribe") {
    const email = clip(b.email, 200).toLowerCase();
    if (!emailOk(email)) return json({ error: "Enter a valid email address." }, 400);
    await db.prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)").bind(email, now()).run();
    return json({ ok: true });
  }

  if (path === "/api/contact") {
    const name = clip(b.name, 120), email = clip(b.email, 200), topic = clip(b.topic, 60), message = clip(b.message, 4000);
    if (!name || !emailOk(email) || message.length < 5) return json({ error: "Add your name, a valid email and a message." }, 400);
    await db.prepare("INSERT INTO messages (name, email, topic, message, created_at) VALUES (?, ?, ?, ?, ?)").bind(name, email, topic, message, now()).run();
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
      if (p.stock === 0) return json({ error: "“" + p.name + "” just sold out. Remove it from your bag and try again." }, 409);
      const q = Math.min(qty, typeof p.stock === "number" ? p.stock : 99);
      subtotal += p.price * q;
      lines.push({ id: p.id, name: p.name, price: p.price, qty: q });
    }
    if (!lines.length) return json({ error: "Your bag is empty or its items are no longer available." }, 400);
    const o = { email: clip(b.email, 200).toLowerCase(), name: clip(b.name, 120), phone: clip(b.phone, 30), country: clip(b.country, 60), state: clip(b.state, 60), city: clip(b.city, 80), address: clip(b.address, 400), zip: clip(b.zip, 20) };
    if (!emailOk(o.email)) return json({ error: "Enter a valid email address." }, 400);
    if (!o.name || !o.phone || !o.country || !o.city || !o.address) return json({ error: "Fill in your name, phone, country, city and address." }, 400);
    subtotal = Math.round(subtotal * 100) / 100;
    const shipping = subtotal >= FREE_FROM ? 0 : SHIPPING_FEE;
    const total = Math.round((subtotal + shipping) * 100) / 100;
    const ref = "ZF" + crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    await db.prepare("INSERT INTO orders (ref, email, name, phone, country, state, city, address, zip, items, subtotal, shipping, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)")
      .bind(ref, o.email, o.name, o.phone, o.country, o.state, o.city, o.address, o.zip, JSON.stringify(lines), subtotal, shipping, total, now()).run();
    return json({ ok: true, ref: ref, total: total });
  }

  if (path === "/api/track") {
    const ref = clip(b.ref, 20).toUpperCase(), email = clip(b.email, 200).toLowerCase();
    const row = await db.prepare("SELECT status FROM orders WHERE ref = ? AND email = ?").bind(ref, email).first();
    if (!row) return json({ error: "We couldn't find an order with that number and email." }, 404);
    return json({ status: STATUS[row.status] || row.status });
  }

  return json({ error: "Not found." }, 404);
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.hostname === "www.zifidit.com") { url.hostname = "zifidit.com"; return Response.redirect(url.toString(), 301); }
    const path = url.pathname;
    if (path.startsWith("/api/")) {
      try { return await api(path, req, env, ctx); } catch (e) { return json({ error: "Server error. Please try again in a moment." }, 500); }
    }
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    if (/\.[a-z0-9]+$/i.test(path) && !path.includes("..")) {
      const r = await asset(path, env, ctx);
      return r || new Response("Not found", { status: 404, headers: SEC });
    }
    const shell = await asset("/index.html", env, ctx);
    return shell || new Response("Unavailable", { status: 503 });
  }
};
