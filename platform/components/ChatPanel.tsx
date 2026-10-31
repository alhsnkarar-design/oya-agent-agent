"use client";
import { useEffect, useRef, useState } from "react";
import { compressImage, type PendingImage } from "@/lib/assets";
import type { ParsedOutput } from "@/lib/parse";
import type { Message } from "@/lib/storage";

const SUGGESTIONS = ["غيّر الألوان إلى درجات الأزرق", "أضف قسم آراء العملاء", "أضف وضعاً داكناً", "حسّن التصميم على الجوال"];

export function ChatPanel(props: {
  messages: Message[];
  assets: Record<string, string>;
  busy: boolean;
  live: ParsedOutput | null;
  onSend: (text: string, images: PendingImage[]) => void;
  onStop: () => void;
}) {
  const { messages, assets, busy, live, onSend, onStop } = props;
  const [text, setText] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [imgError, setImgError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | File[]) => {
    setImgError("");
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/"));
    for (const f of picked.slice(0, 4 - images.length)) {
      if (f.size > 15_000_000) {
        setImgError("الصورة أكبر من 15MB");
        continue;
      }
      try {
        const img = await compressImage(f);
        setImages((cur) => (cur.length >= 4 ? cur : [...cur, img]));
      } catch {
        setImgError("تعذّرت قراءة الصورة");
      }
    }
  };
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, live?.writing]);

  const submit = () => {
    const t = text.trim() || (images.length ? "استخدم الصور المرفقة" : "");
    if (!t || busy) return;
    onSend(t, images);
    setText("");
    setImages([]);
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
              {m.images && m.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {m.images.map((p) =>
                    assets[p] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p} src={assets[p]} alt={p} className="h-16 w-16 rounded-lg object-cover border border-white/20" />
                    ) : null,
                  )}
                </div>
              )}
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
                onClick={() => onSend(s, [])}
                className="shrink-0 text-xs rounded-full border border-ink-600 px-3 py-1 text-white/60 hover:text-white hover:border-brand-400"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div
          className="panel rounded-2xl p-2 focus-within:border-brand-500"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          {images.length > 0 && (
            <div className="flex gap-2 p-1 pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.dataUrl} alt={img.name} className="h-14 w-14 rounded-lg object-cover border border-ink-600" />
                  <button
                    onClick={() => setImages((cur) => cur.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-ink-600 text-xs leading-none"
                    aria-label="إزالة الصورة"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={(e) => {
              if (e.clipboardData.files.length) {
                e.preventDefault();
                addFiles(e.clipboardData.files);
              }
            }}
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
          {imgError && <p className="text-xs text-red-300 px-2">{imgError}</p>}
          <div className="flex justify-between items-center">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy || images.length >= 4}
                className="rounded-xl px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-ink-700 disabled:opacity-30"
                title="أرفق شعاراً أو صوراً أو لقطة تصميم تريد تحويلها إلى موقع"
              >
                🖼️ صورة
              </button>
            </div>
            {busy ? (
              <button onClick={onStop} className="rounded-xl bg-ink-700 px-4 py-2 text-sm hover:bg-ink-600">
                ⏹️ إيقاف
              </button>
            ) : (
              <button onClick={submit} disabled={!text.trim() && !images.length} className="rounded-xl btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-40">
                إرسال ↵
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
