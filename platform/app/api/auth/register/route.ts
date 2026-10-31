import { ConflictError, getDb } from "@/lib/server/db";
import { hashPassword, jsonError, publicUser, sameOrigin, setSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError("طلب غير مسموح", 403);
  if (process.env.ALLOW_SIGNUP === "false") return jsonError("التسجيل مغلق حالياً", 403);
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim().slice(0, 80);
  const password = String(body.password ?? "");
  if (!EMAIL.test(email) || email.length > 200) return jsonError("البريد الإلكتروني غير صحيح", 400);
  if (!name) return jsonError("الاسم مطلوب", 400);
  if (password.length < 8 || password.length > 200) return jsonError("كلمة المرور يجب أن تكون 8 أحرف على الأقل", 400);
  try {
    const user = await (await getDb()).createUser(email, name, await hashPassword(password));
    await setSessionCookie(user.id);
    return Response.json({ user: publicUser(user) });
  } catch (e) {
    if (e instanceof ConflictError) return jsonError("هذا البريد مسجّل مسبقاً", 409);
    throw e;
  }
}
