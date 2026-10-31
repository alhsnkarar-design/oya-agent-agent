"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, fetchMe, importLocalProjects } from "@/lib/cloud";
import { IconLoader } from "@/components/icons";

export function LoginForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);

  const next = (() => {
    const n = params.get("next") || "/";
    return n.startsWith("/") && !n.startsWith("//") ? n : "/";
  })();

  useEffect(() => {
    fetchMe().then((m) => setGoogle(Boolean(m.google)));
    const err = params.get("error");
    if (err) setError(GOOGLE_ERRORS[err] ?? "Google sign-in failed. Please try again.");
    // returning from Google: move local projects into the account, then continue
    if (params.get("done") === "1") {
      setBusy(true);
      fetchMe(true)
        .then(() => importLocalProjects())
        .finally(() => (window.location.href = next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await auth.login(email, password);
      else await auth.register(name, email, password);
      await fetchMe(true);
      await importLocalProjects();
      window.location.href = next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  const input =
    "mt-1.5 w-full rounded-xl bg-ink-950 border border-white/10 px-4 py-3 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold tracking-tight">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-2 text-white/50">
        {mode === "login" ? "Log in to keep building." : "Start building websites and apps by describing them."}
      </p>

      {google && (
        <>
          <a
            href={`/api/auth/google?next=${encodeURIComponent(next)}`}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 font-semibold text-[#1f1f1f] transition hover:bg-white/90"
          >
            <GoogleLogo /> Continue with Google
          </a>
          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-white/30">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={`${google ? "" : "mt-8 "}space-y-4`}>
        {mode === "register" && (
          <label className="block text-sm text-white/70">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required className={input} autoComplete="name" placeholder="Jane Doe" />
          </label>
        )}
        <label className="block text-sm text-white/70">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={input}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm text-white/70">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 8 : undefined}
            className={input}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
          />
        </label>
        {error && (
          <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2" role="alert">
            {error}
          </p>
        )}
        <button disabled={busy} className="w-full btn-primary flex items-center justify-center gap-2 rounded-full py-3 font-semibold disabled:opacity-50">
          {busy && <IconLoader size={16} />}
          {mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        {mode === "login" ? "New to Bannaa? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="font-medium text-white hover:text-brand-300"
        >
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
      <p className="mt-8 text-xs leading-relaxed text-white/35">
        Projects you started in this browser move into your account automatically, so you can open them anywhere and publish them.
      </p>
    </div>
  );
}

const GOOGLE_ERRORS: Record<string, string> = {
  google_cancelled: "Google sign-in was cancelled.",
  google_state: "Your sign-in session expired. Please try again.",
  google_failed: "We couldn't sign you in with Google. Please try again.",
  google_unverified: "Your Google email address isn't verified.",
  google_disabled: "Google sign-in isn't set up yet.",
  signup_closed: "Sign-ups are currently closed.",
};

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
