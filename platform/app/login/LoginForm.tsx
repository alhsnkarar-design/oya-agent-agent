"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
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

  const next = (() => {
    const n = params.get("next") || "/";
    return n.startsWith("/") && !n.startsWith("//") ? n : "/";
  })();

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

      <form onSubmit={submit} className="mt-8 space-y-4">
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
