import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getDb, type User } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = "bannaa_session";
const SESSION_DAYS = 30;

// ---------------------------------------------------------------- passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltB64, keyB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(expected, actual);
}

// ---------------------------------------------------------------- secret
let secretPromise: Promise<string> | null = null;

/** AUTH_SECRET is required in production; in development a persistent random one is created in .data/. */
function getSecret(): Promise<string> {
  if (process.env.AUTH_SECRET) return Promise.resolve(process.env.AUTH_SECRET);
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    return Promise.reject(new Error("AUTH_SECRET must be set in production"));
  }
  secretPromise ??= (async () => {
    const file = path.join(process.env.BANNAA_DATA_DIR || path.join(process.cwd(), ".data"), "auth-secret");
    try {
      return (await fs.readFile(file, "utf8")).trim();
    } catch {
      const s = randomBytes(32).toString("hex");
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, s, { mode: 0o600 });
      return s;
    }
  })();
  return secretPromise;
}

// ---------------------------------------------------------------- tokens
const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export async function signSession(userId: string): Promise<string> {
  const payload = b64url(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_DAYS * 86_400_000 }));
  const sig = createHmac("sha256", await getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function readSession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", await getSecret()).update(payload).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof uid === "string" && exp > Date.now() ? uid : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- request helpers
export type PublicUser = Pick<User, "id" | "email" | "name">;
export const publicUser = (u: User): PublicUser => ({ id: u.id, email: u.email, name: u.name });

export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const uid = await readSession(store.get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  return (await getDb()).getUserById(uid);
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * CSRF guard for state-changing requests: the browser always sends Origin on cross-site POST/PUT/DELETE,
 * so reject when it does not match the host the request was sent to.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin || origin === "null") return origin !== "null";
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const jsonError = (error: string, status: number) => Response.json({ error }, { status });
