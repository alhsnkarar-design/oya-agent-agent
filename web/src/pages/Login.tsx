import { useEffect, useState } from "react";
import { useT } from "../i18n";
import { go, useRoute } from "../router";
import { resetPassword, setAuthLanguage, signInEmail, signInGoogle, signUpEmail, useAuth } from "../lib/auth";
import "./login.css";

export function Login() {
  const { t, lang } = useT();
  const { params } = useRoute();
  const auth = useAuth();
  const [signup, setSignup] = useState(params.get("signup") === "1");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { void setAuthLanguage(lang); }, [lang, auth.enabled]);
  useEffect(() => { if (auth.user) go("/editor"); }, [auth.user]);

  const errMsg = (e: unknown) => {
    const c = (e as { code?: string; message?: string })?.code ?? (e as Error)?.message ?? "";
    const ar = lang === "ar";
    if (c === "verify") return t.verify_sent;
    if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return ar ? "الإيميل أو كلمة السر غلط." : "Wrong email or password.";
    if (c.includes("email-already-in-use")) return ar ? "الإيميل ده مسجّل قبل كده. ادخل بيه." : "This email is already registered. Log in instead.";
    if (c.includes("invalid-email")) return ar ? "اكتب إيميل صحيح." : "Enter a valid email.";
    if (c.includes("weak-password")) return t.pw_short;
    if (c.includes("too-many-requests")) return ar ? "محاولات كتير. استنى شوية وجرّب تاني." : "Too many attempts. Wait a bit and try again.";
    if (c.includes("popup-closed")) return ar ? "اتقفلت نافذة جوجل قبل ما تكمّل." : "The Google window closed before finishing.";
    if (c === "auth_off") return t.auth_off;
    return t.err_generic;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (signup) {
      if (pw.length < 8) return setMsg({ text: t.pw_short, bad: true });
      if (pw !== pw2) return setMsg({ text: t.pw_mismatch, bad: true });
    }
    setBusy(true);
    try {
      if (signup) { await signUpEmail(email.trim(), pw); setMsg({ text: t.verify_sent }); setSignup(false); setPw(""); setPw2(""); }
      else await signInEmail(email.trim(), pw);
    } catch (er) { setMsg({ text: errMsg(er), bad: (er as Error)?.message !== "verify" }); }
    finally { setBusy(false); }
  }

  async function google() {
    setMsg(null); setBusy(true);
    try { await signInGoogle(); } catch (er) { setMsg({ text: errMsg(er), bad: true }); } finally { setBusy(false); }
  }

  async function forgot() {
    if (!email.trim()) return setMsg({ text: lang === "ar" ? "اكتب إيميلك الأول." : "Enter your email first.", bad: true });
    try { await resetPassword(email.trim()); setMsg({ text: t.reset_sent }); } catch (er) { setMsg({ text: errMsg(er), bad: true }); }
  }

  return (
    <main className="login wrap">
      <div className="box card">
        <h1>{signup ? t.signup_title : t.login_title}</h1>
        {auth.ready && !auth.enabled && <p className="note">{t.auth_off}</p>}
        <button className="btn google" onClick={() => void google()} disabled={busy || !auth.enabled}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.9 11.9 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>
          {t.with_google}
        </button>
        <div className="or"><span>{t.or}</span></div>
        <form onSubmit={(e) => void submit(e)}>
          <label htmlFor="em">{t.email}</label>
          <input id="em" type="email" autoComplete="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="pw">{t.password}</label>
          <input id="pw" type="password" autoComplete={signup ? "new-password" : "current-password"} dir="ltr" required minLength={signup ? 8 : undefined} value={pw} onChange={(e) => setPw(e.target.value)} />
          {signup && (<>
            <label htmlFor="pw2">{t.password2}</label>
            <input id="pw2" type="password" autoComplete="new-password" dir="ltr" required value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </>)}
          {!signup && <button type="button" className="link" onClick={() => void forgot()}>{t.forgot}</button>}
          {msg && <p className={"msg" + (msg.bad ? " bad" : "")} role="status">{msg.text}</p>}
          <button className="btn cream full" disabled={busy || !auth.enabled}>{signup ? t.get_started : t.login}</button>
        </form>
        <p className="swap">{signup ? t.have_account : t.no_account} <button className="link" onClick={() => { setSignup(!signup); setMsg(null); }}>{signup ? t.login : t.get_started}</button></p>
      </div>
    </main>
  );
}
