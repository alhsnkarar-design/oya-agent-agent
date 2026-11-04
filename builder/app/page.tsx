"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  "تطبيق لحجز مواعيد صالون حلاقة مع قائمة خدمات وأسعار",
  "تطبيق لتتبع المصروفات الشهرية مع رسم بياني بسيط",
  "متجر قهوة: قائمة مشروبات وسلة طلبات",
  "تطبيق لحفظ القرآن مع جدول مراجعة يومي",
  "تطبيق لياقة: تمارين يومية وعدّاد وقت",
];

type Recent = { id: string; name: string; updatedAt: string };

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then(setRecent)
      .catch(() => {});
  }, []);

  async function start(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر إنشاء المشروع");
      // The editor sends the first prompt to the agent on open.
      sessionStorage.setItem(`first-prompt:${data.id}`, value);
      router.push(`/p/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      setLoading(false);
    }
  }

  return (
    <main className="landing">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">ب</span>
          بنّاء
        </div>
        <span className="pill">نسخة تجريبية</span>
      </header>

      <section className="hero">
        <span className="pill">تطبيقات حقيقية لـ iOS وAndroid</span>
        <h1>
          اكتب فكرتك، <span>ونبني تطبيقك</span>
        </h1>
        <p className="lead">
          صف التطبيق الذي تريده بالعربية. يكتب الذكاء الاصطناعي الكود، وتراه يعمل أمامك، ثم تعدّل عليه بالمحادثة.
        </p>

        <form
          className="prompt-card"
          onSubmit={(e) => {
            e.preventDefault();
            start(prompt);
          }}
        >
          <label htmlFor="prompt" className="sr-only">
            وصف التطبيق
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: تطبيق لمطعم فيه قائمة طعام بالصور وسلة طلبات وصفحة تأكيد…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) start(prompt);
            }}
            autoFocus
          />
          <div className="prompt-actions">
            <span className="pill">Ctrl + Enter للإرسال</span>
            <button className="btn" type="submit" disabled={loading || !prompt.trim()}>
              {loading ? "جارٍ الإنشاء…" : "ابنِ التطبيق ←"}
            </button>
          </div>
        </form>
        {error && <div className="error-text">{error}</div>}

        <div className="examples">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" onClick={() => setPrompt(ex)}>
              {ex}
            </button>
          ))}
        </div>

        {recent.length > 0 && (
          <div className="recent">
            <h2>مشاريعك</h2>
            <div className="recent-grid">
              {recent.slice(0, 9).map((p) => (
                <a key={p.id} href={`/p/${p.id}`}>
                  {p.name}
                  <small>{new Date(p.updatedAt).toLocaleString("ar")}</small>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
      <footer className="footer">بنّاء — اسم مؤقت</footer>
    </main>
  );
}
