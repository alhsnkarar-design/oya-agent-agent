import { createHash, randomBytes } from "node:crypto";

/**
 * "Sign in with Google" (OAuth 2.0 authorization code flow + PKCE, OpenID Connect).
 * Endpoints are overridable only so the flow can be tested against a local mock.
 */
const AUTH_URL = process.env.GOOGLE_AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = process.env.GOOGLE_TOKEN_URL || "https://oauth2.googleapis.com/token";
const USERINFO_URL = process.env.GOOGLE_USERINFO_URL || "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_STATE_COOKIE = "bannaa_google_oauth";

export const googleEnabled = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/** Public base URL of the app. Set APP_URL in production so the redirect URI never depends on request headers. */
export function appOrigin(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export const redirectUri = (req: Request) => `${appOrigin(req)}/api/auth/google/callback`;

/** Only allow same-site relative paths as post-login destinations (prevents open redirects). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

const b64url = (b: Buffer) => b.toString("base64url");

export function startGoogleLogin(req: Request, next: string) {
  const state = b64url(randomBytes(24));
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return {
    url: `${AUTH_URL}?${params}`,
    cookie: JSON.stringify({ state, verifier, next: safeNext(next), exp: Date.now() + 10 * 60_000 }),
  };
}

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

export async function finishGoogleLogin(req: Request, code: string, verifier: string): Promise<GoogleProfile> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(req),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("no access token");

  // Profile comes straight from Google over TLS using the access token we just received.
  const infoRes = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${token.access_token}` } });
  if (!infoRes.ok) throw new Error(`userinfo failed (${infoRes.status})`);
  const info = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean | string; name?: string };
  if (!info.sub || !info.email) throw new Error("incomplete Google profile");
  return {
    sub: String(info.sub),
    email: info.email.toLowerCase(),
    emailVerified: info.email_verified === true || info.email_verified === "true",
    name: (info.name || info.email.split("@")[0]).slice(0, 80),
  };
}
