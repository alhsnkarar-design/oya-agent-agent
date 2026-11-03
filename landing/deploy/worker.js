// zifidit.com Worker: serves the page from the public repo (cached 5 min) and stores bookings in D1 (binding DB).
const PAGE = "https://raw.githubusercontent.com/alhsnkarar-design/oya-agent-agent/claude/auto-motion-graphics-site-rqo0y3/landing/deploy/index.html";
const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0C0C0D"/><circle cx="22" cy="22" r="4" fill="#F2A72B"/></svg>';
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=()" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...SEC, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

async function waitlist(request, env) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!env.DB) return json({ error: "not_configured" }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (clean(body.website, 200)) return json({ ok: true });
  const email = clean(body.email, 160).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);
  const utm = body.utm && typeof body.utm === "object" ? body.utm : {};
  try {
    const r = await env.DB.prepare("INSERT OR IGNORE INTO waitlist (email, utm_source, utm_medium, utm_campaign, referrer, country, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
      .bind(email, clean(utm.source, 100), clean(utm.medium, 100), clean(utm.campaign, 100), clean(body.referrer, 300), clean(request.cf?.country, 8), new Date().toISOString()).run();
    const row = await env.DB.prepare("SELECT id FROM waitlist WHERE email = ?1").bind(email).first();
    return json({ ok: true, already: r.meta.changes === 0, position: row?.id ?? null });
  } catch (err) {
    console.error("waitlist: d1 error", err);
    return json({ error: "storage_failed" }, 502);
  }
}

async function page() {
  const res = await fetch(PAGE, { cf: { cacheTtl: 300, cacheEverything: true } });
  if (!res.ok) return new Response("Zifidit: الصفحة مش متاحة دلوقتي، جرّب بعد دقيقة.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(res.body, { headers: { ...SEC, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=120" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    switch (url.pathname) {
      case "/api/waitlist": return waitlist(request, env);
      case "/favicon.svg": return new Response(FAVICON, { headers: { ...SEC, "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
      case "/robots.txt": return new Response("User-agent: *\nAllow: /\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      case "/": case "/index.html": return page();
      default: return Response.redirect(url.origin + "/", 302);
    }
  },
};
