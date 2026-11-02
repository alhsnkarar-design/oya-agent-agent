// Shared helpers for the Cloudflare Pages Functions.
// Secrets live in Cloudflare Pages → Settings → Variables and Secrets, never in this repo.

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function clean(value, max) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

export function pick(value, allowed) {
  const v = String(value ?? "");
  return allowed.includes(v) ? v : "";
}

export function missingEnv(env, keys) {
  return keys.filter((k) => !env[k]);
}

// Creates a document in an Appwrite collection through the REST API.
// Returns { ok, status, duplicate }.
export async function createDocument(env, collectionId, data) {
  const endpoint = env.APPWRITE_ENDPOINT.replace(/\/+$/, "");
  const url = `${endpoint}/databases/${env.APPWRITE_DATABASE_ID}/collections/${collectionId}/documents`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": env.APPWRITE_PROJECT_ID,
      "X-Appwrite-Key": env.APPWRITE_API_KEY,
    },
    body: JSON.stringify({ documentId: "unique()", data }),
  });
  // 409 = a unique index (email) already has this value.
  return { ok: res.ok, status: res.status, duplicate: res.status === 409 };
}
