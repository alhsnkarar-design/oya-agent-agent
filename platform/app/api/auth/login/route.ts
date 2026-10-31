import { getDb } from "@/lib/server/db";
import { jsonError, publicUser, sameOrigin, setSessionCookie, verifyPassword } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError("Request not allowed", 403);
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const user = email ? await (await getDb()).getUserByEmail(email) : null;
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("Incorrect email or password", 401);
  }
  await setSessionCookie(user.id);
  return Response.json({ user: publicUser(user) });
}
