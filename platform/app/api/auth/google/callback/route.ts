import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { ConflictError, getDb } from "@/lib/server/db";
import { setSessionCookie } from "@/lib/server/auth";
import { GOOGLE_STATE_COOKIE, appOrigin, finishGoogleLogin, googleEnabled } from "@/lib/server/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (req: Request, code: string) => Response.redirect(`${appOrigin(req)}/login?error=${code}`, 302);

function sameString(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Step 2: Google sends the user back here with ?code&state. */
export async function GET(req: Request) {
  if (!googleEnabled()) return fail(req, "google_disabled");
  const url = new URL(req.url);
  const store = await cookies();
  const raw = store.get(GOOGLE_STATE_COOKIE)?.value;
  store.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });

  if (url.searchParams.get("error")) return fail(req, "google_cancelled");
  let saved: { state: string; verifier: string; next: string; exp: number };
  try {
    saved = JSON.parse(raw ?? "");
  } catch {
    return fail(req, "google_state");
  }
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";
  if (!code || !saved?.state || saved.exp < Date.now() || !sameString(state, saved.state)) return fail(req, "google_state");

  let profile;
  try {
    profile = await finishGoogleLogin(req, code, saved.verifier);
  } catch {
    return fail(req, "google_failed");
  }
  if (!profile.emailVerified) return fail(req, "google_unverified");

  const db = await getDb();
  let user = await db.getUserByGoogleSub(profile.sub);
  if (!user) {
    const existing = await db.getUserByEmail(profile.email);
    if (existing) {
      // Same verified email as an email/password account: link them so both ways log into one account.
      await db.linkGoogle(existing.id, profile.sub);
      user = existing;
    } else {
      try {
        if (process.env.ALLOW_SIGNUP === "false") return fail(req, "signup_closed");
        user = await db.createUser(profile.email, profile.name, "", profile.sub);
      } catch (e) {
        if (e instanceof ConflictError) user = await db.getUserByEmail(profile.email);
        else throw e;
      }
    }
  }
  if (!user) return fail(req, "google_failed");
  await setSessionCookie(user.id);
  // Land on /login briefly so the browser can move any local projects into the account, then continue.
  return Response.redirect(`${appOrigin(req)}/login?done=1&next=${encodeURIComponent(saved.next)}`, 302);
}
