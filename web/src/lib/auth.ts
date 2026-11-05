// Firebase Authentication (email/password + Google). The public web config comes from /api/config,
// so the site works in guest mode until Firebase is configured on the Worker.
import { useSyncExternalStore } from "react";
import type { Auth, User } from "firebase/auth";

export type SiteConfig = {
  firebase: { apiKey: string; authDomain: string; projectId: string; appId?: string } | null;
};
type State = { ready: boolean; enabled: boolean; user: { uid: string; email: string | null; name: string | null } | null };

let state: State = { ready: false, enabled: false, user: null };
const subs = new Set<() => void>();
const set = (s: Partial<State>) => { state = { ...state, ...s }; subs.forEach((f) => f()); };
let auth: Auth | null = null;
let fb: typeof import("firebase/auth") | null = null;

export const authReady: Promise<void> = (async () => {
  try {
    const cfg = (await (await fetch("/api/config")).json()) as SiteConfig;
    if (!cfg.firebase?.apiKey) { set({ ready: true, enabled: false }); return; }
    const [{ initializeApp }, m] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
    fb = m;
    auth = m.getAuth(initializeApp(cfg.firebase));
    await m.setPersistence(auth, m.browserLocalPersistence);
    await new Promise<void>((res) => {
      m.onAuthStateChanged(auth!, (u: User | null) => {
        set({ ready: true, enabled: true, user: u && (u.emailVerified || u.providerData.some((p) => p.providerId === "google.com")) ? { uid: u.uid, email: u.email, name: u.displayName } : null });
        res();
      });
    });
  } catch {
    set({ ready: true, enabled: false });
  }
})();

export function useAuth() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => state);
}

/** ID token for API calls, or null for guests. */
export async function idToken(): Promise<string | null> {
  await authReady;
  const u = auth?.currentUser;
  if (!u) return null;
  return u.getIdToken();
}

function need() { if (!auth || !fb) throw new Error("auth_off"); return { auth, fb }; }

export async function signInGoogle() {
  const { auth, fb } = need();
  await fb.signInWithPopup(auth, new fb.GoogleAuthProvider());
}
export async function signInEmail(email: string, pw: string) {
  const { auth, fb } = need();
  const cred = await fb.signInWithEmailAndPassword(auth, email, pw);
  if (!cred.user.emailVerified) {
    await fb.sendEmailVerification(cred.user);
    await fb.signOut(auth);
    throw new Error("verify");
  }
}
export async function signUpEmail(email: string, pw: string) {
  const { auth, fb } = need();
  const cred = await fb.createUserWithEmailAndPassword(auth, email, pw);
  await fb.sendEmailVerification(cred.user);
  await fb.signOut(auth);
}
export async function resetPassword(email: string) {
  const { auth, fb } = need();
  await fb.sendPasswordResetEmail(auth, email);
}
export async function signOut() {
  if (auth && fb) await fb.signOut(auth);
}
export async function setAuthLanguage(l: string) {
  if (auth) auth.languageCode = l;
}
