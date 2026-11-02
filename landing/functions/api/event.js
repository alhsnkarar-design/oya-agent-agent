// POST /api/event — records a pricing-button click, to measure willingness to pay.
import { json, clean, pick, missingEnv, createDocument } from "../../lib/appwrite.js";

const REQUIRED = [
  "APPWRITE_ENDPOINT",
  "APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID",
  "APPWRITE_EVENTS_COLLECTION_ID",
];
const EVENTS = ["pricing_click"];
const PLANS = ["free", "starter", "pro", "business"];

export async function onRequestPost({ request, env }) {
  if (missingEnv(env, REQUIRED).length) return json({ error: "not_configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const name = pick(body.name, EVENTS);
  if (!name) return json({ error: "unknown_event" }, 400);

  const utm = body.utm && typeof body.utm === "object" ? body.utm : {};
  try {
    const result = await createDocument(env, env.APPWRITE_EVENTS_COLLECTION_ID, {
      name,
      plan: pick(body.plan, PLANS),
      utm_source: clean(utm.source, 100),
      country: clean(request.cf?.country, 8),
    });
    return json({ ok: result.ok }, result.ok ? 200 : 502);
  } catch (err) {
    console.error("event: appwrite error", err);
    return json({ error: "storage_failed" }, 502);
  }
}

export function onRequest() {
  return json({ error: "method_not_allowed" }, 405);
}
