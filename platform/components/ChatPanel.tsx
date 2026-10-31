"use client";
import { useEffect, useRef, useState } from "react";
import type { ParsedOutput } from "@/lib/parse";
import type { Message } from "@/lib/storage";

const SUGGESTIONS = ["غيّر الألوان إلى درجات الأزرق", "أضف قسم آراء العملاء", "أضف وضعاً داكناً", "حسّن التصميم على الجوال"];

export function ChatPanel(props: {
  messages: Message[];
  busy: boolean;
  live: ParsedOutput | null;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const { messages, busy, live, onSend, onStop } = props;
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, live?.writing]);

  const submit = () => {
    if (!text.trim() || busy) return;
    onSend(text.trim());
    setText("");
  };

  const done = live ? Object.keys(live.files) : [];

  return (
    <aside className="w-[380px] max-w-[45vw] shrink-0 border-l border-ink-700 flex flex-col bg-ink-900/60">
      <div className="flex-1 overflow-y-auto scroll-thin p-4 space-y-4">
        {!messages.length && (
          <div className="text-center text-white/50 mt-10 leading-loose">
            <div className="text-4xl mb-3">👋</div>
            مرحباً! صِف الموقع أو التطبيق الذي تريده
            <br />
            وسأبنيه لك خطوة بخطوة.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-start" : "flex justify-end"}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed text-[15px] ${
                m.role === "user"
                  ? "bg-brand-600/90 rounded-br-md"
                  : m.status === "error"
                    ? "bg-red-500/10 border border-red-500/30 rounded-bl-md"
                    : "bg-ink-800 border border-ink-700 rounded-bl-md"
              }`}
            >
              {m.content || (m.status === "streaming" ? "…" : "")}
              {m.status === "streaming" && (
                <div className="mt-3 space-y-1 text-xs font-mono">
                  {done.map((f) => (
                    <div key={f} className="text-emerald-300">✓ {f}</div>
                  ))}
                  {live?.writing && <div className="text-brand-300 animate-pulse">✍️ {live.writing}</div>}
                  {!live?.writing && !done.length && <div className="text-white/40 animate-pulse">يفكّر ويخطط…</div>}
                </div>
              )}
              {m.status === "done" && m.changed && m.changed.length > 0 && (
                <details className="mt-3 text-xs text-white/50">
                  <summary className="cursor-pointer">تم تعديل {m.changed.length} ملفات</summary>
                  <div className="mt-1 font-mono space-y-0.5">
                    {m.changed.map((f) => (
                      <div key={f}>• {f}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-ink-700">
        {messages.length > 0 && !busy && (
          <div className="flex gap-2 overflow-x-auto scroll-thin pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSend(s)}
                className="shrink-0 text-xs rounded-full border border-ink-600 px-3 py-1 text-white/60 hover:text-white hover:border-brand-400"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="panel rounded-2xl p-2 focus-within:border-brand-500">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={3}
            placeholder={messages.length ? "اطلب تعديلاً… مثال: أضف صفحة للأسعار" : "صِف ما تريد بناءه…"}
            className="w-full resize-none bg-transparent outline-none px-2 py-1 placeholder:text-white/35"
            aria-label="رسالة"
          />
          <div className="flex justify-end">
            {busy ? (
              <button onClick={onStop} className="rounded-xl bg-ink-700 px-4 py-2 text-sm hover:bg-ink-600">
                ⏹️ إيقاف
              </button>
            ) : (
              <button onClick={submit} disabled={!text.trim()} className="rounded-xl btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-40">
                إرسال ↵
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
