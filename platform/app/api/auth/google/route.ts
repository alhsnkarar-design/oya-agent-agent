import { cookies } from "next/headers";
import { GOOGLE_STATE_COOKIE, googleEnabled, startGoogleLogin } from "@/lib/server/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Step 1: send the browser to Google's account chooser. */
export async function GET(req: Request) {
  if (!googleEnabled()) return Response.redirect(new URL("/login?error=google_disabled", req.url), 302);
  const next = new URL(req.url).searchParams.get("next") ?? "/";
  const { url, cookie } = startGoogleLogin(req, next);
  (await cookies()).set(GOOGLE_STATE_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax", // must survive the top-level redirect back from Google
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return Response.redirect(url, 302);
}
