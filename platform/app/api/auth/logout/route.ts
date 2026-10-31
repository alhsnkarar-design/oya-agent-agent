import { clearSessionCookie, jsonError, sameOrigin } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError("طلب غير مسموح", 403);
  await clearSessionCookie();
  return Response.json({ ok: true });
}
