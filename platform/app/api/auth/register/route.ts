import { ConflictError, getDb } from "@/lib/server/db";
import { hashPassword, jsonError, publicUser, sameOrigin, setSessionCookie } from "@/lib/server/auth";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError("Request not allowed", 403);
  if (process.env.ALLOW_SIGNUP === "false") return jsonError("Sign-ups are currently closed", 403);
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim().slice(0, 80);
  const password = String(body.password ?? "");
  if (!EMAIL.test(email) || email.length > 200) return jsonError("Please enter a valid email address", 400);
  if (!name) return jsonError("Name is required", 400);
  if (password.length < 8 || password.length > 200) return jsonError("Password must be at least 8 characters", 400);
  try {
    const user = await (await getDb()).createUser(email, name, await hashPassword(password));
    await setSessionCookie(user.id);
    return Response.json({ user: publicUser(user) });
  } catch (e) {
    if (e instanceof ConflictError) return jsonError("An account with this email already exists", 409);
    throw e;
  }
}
