import { STORAGE_SHIM } from "../preview";
import type { Site } from "./db";

const MIME: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  webmanifest: "application/manifest+json",
  ico: "image/x-icon",
};

/** Public URL of a published site. Use SITES_URL to serve sites from a separate (isolated) domain. */
export function siteUrl(req: Request, slug: string): string {
  const base = process.env.SITES_URL?.replace(/\/$/, "") || new URL(req.url).origin;
  return `${base}/s/${slug}/`;
}

/** True when this request arrives on the dedicated sites domain (full origin isolation). */
function onIsolatedHost(req: Request): boolean {
  if (!process.env.SITES_URL) return false;
  try {
    return new URL(process.env.SITES_URL).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

function lookup(site: Site, rel: string): { body: BodyInit; type: string } | null {
  const candidates = rel === "" ? ["index.html"] : [rel, `${rel}.html`, `${rel.replace(/\/$/, "")}/index.html`];
  for (const p of candidates) {
    if (site.files[p] != null) {
      const ext = p.split(".").pop()!.toLowerCase();
      return { body: site.files[p], type: MIME[ext] ?? "application/octet-stream" };
    }
    const asset = site.assets?.[p];
    if (asset) {
      const m = asset.match(/^data:([^;]+);base64,(.*)$/s);
      if (m) return { body: new Uint8Array(Buffer.from(m[2], "base64")), type: m[1] };
    }
  }
  return null;
}

export function serveSite(req: Request, site: Site | null, rel: string): Response {
  const isolated = onIsolatedHost(req);
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=60",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
  // On the platform's own domain, run site code in an opaque origin so it can never call our API as the visitor.
  if (!isolated) headers["Content-Security-Policy"] = "sandbox allow-scripts allow-forms allow-popups allow-modals allow-downloads";

  const found = site ? lookup(site, rel) : null;
  if (!found) {
    return new Response(
      `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>غير موجود</title><body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0f0d1a;color:#ece9ff"><div style="text-align:center"><div style="font-size:64px">🧱</div><h1>الصفحة غير موجودة</h1><p style="opacity:.6">صُنعت المواقع على منصة بنّاء</p></div></body></html>`,
      { status: 404, headers: { ...headers, "Content-Type": MIME.html } },
    );
  }
  let body = found.body;
  if (!isolated && found.type.startsWith("text/html") && typeof body === "string") {
    // sandboxed pages cannot use localStorage — provide an in-memory fallback so apps keep working
    const shim = `<script>${STORAGE_SHIM}</script>`;
    body = /<head[^>]*>/i.test(body) ? body.replace(/<head[^>]*>/i, (h) => h + shim) : shim + body;
  }
  return new Response(body, { headers: { ...headers, "Content-Type": found.type } });
}
