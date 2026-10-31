import { clearSessionCookie, jsonError, sameOrigin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError("Request not allowed", 403);
  await clearSessionCookie();
  return Response.json({ ok: true });
}
