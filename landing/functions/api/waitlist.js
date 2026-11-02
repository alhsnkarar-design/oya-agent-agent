// POST /api/waitlist — saves a waitlist sign-up to Appwrite.
import { json, clean, pick, missingEnv, createDocument } from "../../lib/appwrite.js";

const REQUIRED = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_WAITLIST_COLLECTION_ID",
];
const CONTENT_TYPES = ["religious", "education", "business", "marketing", "creator", "other"];
const PLANS = ["free", "starter", "pro", "business"];
const PREPAY = ["yes", "maybe", "no"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function onRequestPost({ request, env }) {
  const missing = missingEnv(env, REQUIRED);
  if (missing.length) {
    console.error("waitlist: missing env", missing.join(","));
    return json({ error: "not_configured" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success for bots.
  if (clean(body.website, 200)) return json({ ok: true });

  const email = clean(body.email, 160).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

  const contentType = pick(body.content_type, CONTENT_TYPES);
  if (!contentType) return json({ error: "invalid_content_type" }, 400);

  const utm = body.utm && typeof body.utm === "object" ? body.utm : {};
  const data = {
    email,
    name: clean(body.name, 80),
    content_type: contentType,
    plan: pick(body.plan, PLANS),
    prepay: pick(body.prepay, PREPAY),
    utm_source: clean(utm.source, 100),
    utm_medium: clean(utm.medium, 100),
    utm_campaign: clean(utm.campaign, 100),
    referrer: clean(body.referrer, 300),
    country: clean(request.cf?.country, 8),
  };

  try {
    const result = await createDocument(env, env.APPWRITE_WAITLIST_COLLECTION_ID, data);
    if (result.ok || result.duplicate) return json({ ok: true, already: result.duplicate });
    console.error("waitlist: appwrite status", result.status);
    return json({ error: "storage_failed" }, 502);
  } catch (err) {
    console.error("waitlist: appwrite error", err);
    return json({ error: "storage_failed" }, 502);
  }
}

export function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
