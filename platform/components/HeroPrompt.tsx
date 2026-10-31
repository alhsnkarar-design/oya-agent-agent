"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TEMPLATES } from "@/lib/templates";

const IDEAS = ["موقع لمطعم شامي مع حجز طاولات", "متجر عطور مع سلة مشتريات", "تطبيق حجز مواعيد لعيادة", "صفحة هبوط لتطبيق محاسبة"];

export function HeroPrompt() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const go = (p: string) => {
    const text = p.trim();
    if (!text) return;
    sessionStorage.setItem("bannaa:pending-prompt", text);
    router.push("/build?new=1");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(prompt);
        }}
        className="panel rounded-3xl p-3 shadow-2xl shadow-brand-700/10 focus-within:border-brand-500 transition"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              go(prompt);
            }
          }}
          rows={3}
          placeholder="صِف الموقع أو التطبيق الذي تريده… مثال: موقع لمقهى مختص فيه قائمة المشروبات ونموذج حجز وألوان بنية دافئة"
          className="w-full resize-none bg-transparent outline-none p-3 text-lg placeholder:text-white/35"
          aria-label="وصف المشروع"
        />
        <div className="flex items-center justify-between gap-3 px-2 pb-1">
          <div className="hidden sm:flex flex-wrap gap-2">
            {IDEAS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(i)}
                className="text-xs rounded-full border border-ink-600 px-3 py-1 text-white/60 hover:text-white hover:border-brand-400 transition"
              >
                {i}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="btn-primary rounded-2xl px-6 py-3 font-semibold disabled:opacity-40 shrink-0"
          >
            ابنِ الآن ✨
          </button>
        </div>
      </form>

      <div className="mt-14">
        <h2 className="text-center text-white/60 mb-5">أو ابدأ من قالب جاهز</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.prompt)}
              className="panel rounded-2xl p-4 text-right hover:border-brand-500 hover:-translate-y-0.5 transition group"
            >
              <div className="text-3xl mb-2">{t.emoji}</div>
              <div className="font-semibold group-hover:text-brand-300">{t.title}</div>
              <div className="text-xs text-white/40 mt-1">{t.category}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
