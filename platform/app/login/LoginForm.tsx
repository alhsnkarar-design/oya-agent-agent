"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { auth, fetchMe, importLocalProjects } from "@/lib/cloud";

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
      setError(err instanceof Error ? err.message : "حدث خطأ");
      setBusy(false);
    }
  };

  const input = "w-full rounded-xl bg-ink-800 border border-ink-600 px-4 py-3 outline-none focus:border-brand-500";

  return (
    <div className="panel rounded-3xl p-8 w-full max-w-md shadow-2xl">
      <div className="flex rounded-xl bg-ink-800 p-1 mb-6 text-sm">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`flex-1 rounded-lg py-2 ${mode === m ? "bg-ink-600 font-semibold" : "text-white/60"}`}
          >
            {m === "login" ? "تسجيل الدخول" : "حساب جديد"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <label className="block text-sm">
            الاسم
            <input value={name} onChange={(e) => setName(e.target.value)} required className={`${input} mt-1`} autoComplete="name" />
          </label>
        )}
        <label className="block text-sm">
          البريد الإلكتروني
          <input
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${input} mt-1 text-left`}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          كلمة المرور
          <input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 8 : undefined}
            className={`${input} mt-1 text-left`}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode === "register" && <span className="text-xs text-white/40">8 أحرف على الأقل</span>}
        </label>
        {error && <p className="text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2" role="alert">{error}</p>}
        <button disabled={busy} className="w-full btn-primary rounded-xl py-3 font-semibold disabled:opacity-50">
          {busy ? "…" : mode === "login" ? "دخول" : "إنشاء الحساب"}
        </button>
      </form>
      <p className="text-xs text-white/40 mt-6 leading-relaxed">
        مشاريعك المحفوظة في هذا المتصفح ستنتقل تلقائياً إلى حسابك بعد الدخول، لتصل إليها من أي جهاز وتنشرها برابط.
      </p>
    </div>
  );
}
