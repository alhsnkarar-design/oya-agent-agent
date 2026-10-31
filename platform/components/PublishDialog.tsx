"use client";
import { useState } from "react";
import { cloud, suggestSlug } from "@/lib/cloud";
import type { Project } from "@/lib/storage";

export function PublishDialog(props: {
  project: Project;
  loggedIn: boolean;
  flush: () => Promise<void>;
  onClose: () => void;
  onChange: (slug: string | null) => void;
}) {
  const { project, loggedIn, flush, onClose, onChange } = props;
  const [slug, setSlug] = useState(project.publishedSlug || suggestSlug(project));
  const [url, setUrl] = useState(project.publishedSlug ? `${location.origin}/s/${project.publishedSlug}/` : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const publish = async () => {
    setBusy(true);
    setError("");
    try {
      await flush(); // publish exactly what is on screen
      const r = await cloud.publish(project.id, slug);
      setUrl(r.url);
      onChange(r.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر النشر");
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    if (!confirm("إيقاف نشر الموقع؟ سيتوقف الرابط عن العمل.")) return;
    setBusy(true);
    try {
      await cloud.unpublish(project.id);
      setUrl("");
      onChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="panel rounded-3xl p-7 w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="publish-title" className="text-xl font-bold">🚀 نشر الموقع</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl" aria-label="إغلاق">×</button>
        </div>

        {!loggedIn ? (
          <div className="space-y-4">
            <p className="text-white/70 leading-relaxed">
              للنشر برابط يصل إليه أي شخص، سجّل الدخول أو أنشئ حساباً مجانياً. سينتقل مشروعك الحالي إلى حسابك تلقائياً.
            </p>
            <a
              href={`/login?mode=register&next=${encodeURIComponent(`/build?id=${project.id}`)}`}
              className="block text-center btn-primary rounded-xl py-3 font-semibold"
            >
              إنشاء حساب / تسجيل الدخول
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            <label className="block text-sm">
              رابط الموقع
              <div dir="ltr" className="mt-1 flex items-center rounded-xl bg-ink-800 border border-ink-600 focus-within:border-brand-500 overflow-hidden">
                <span className="pl-3 text-white/40 text-sm whitespace-nowrap">{typeof location !== "undefined" ? location.host : ""}/s/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 bg-transparent outline-none py-3 pr-3 font-mono"
                  aria-label="الرابط"
                  maxLength={40}
                />
              </div>
              <span className="text-xs text-white/40">أحرف إنجليزية صغيرة وأرقام وشرطة (-)</span>
            </label>

            {error && <p className="text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2" role="alert">{error}</p>}

            {url && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3">
                <div className="text-emerald-300 text-sm">✅ موقعك منشور على:</div>
                <a href={url} target="_blank" rel="noopener" dir="ltr" className="block font-mono text-sm break-all hover:underline">
                  {url}
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-sm rounded-lg bg-ink-700 px-3 py-1.5 hover:bg-ink-600"
                  >
                    {copied ? "تم النسخ ✓" : "نسخ الرابط"}
                  </button>
                  <a href={url} target="_blank" rel="noopener" className="text-sm rounded-lg bg-ink-700 px-3 py-1.5 hover:bg-ink-600">
                    فتح ↗
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener"
                    className="text-sm rounded-lg bg-ink-700 px-3 py-1.5 hover:bg-ink-600"
                  >
                    مشاركة واتساب
                  </a>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={publish} disabled={busy || slug.length < 3} className="flex-1 btn-primary rounded-xl py-3 font-semibold disabled:opacity-40">
                {busy ? "جارٍ النشر…" : url ? "تحديث النسخة المنشورة" : "انشر الآن"}
              </button>
              {url && (
                <button onClick={unpublish} disabled={busy} className="rounded-xl px-4 text-sm text-red-300 hover:bg-red-500/10">
                  إيقاف النشر
                </button>
              )}
            </div>
            <p className="text-xs text-white/40">النشر يأخذ لقطة من مشروعك الحالي. بعد أي تعديل اضغط «تحديث النسخة المنشورة».</p>
          </div>
        )}
      </div>
    </div>
  );
}
