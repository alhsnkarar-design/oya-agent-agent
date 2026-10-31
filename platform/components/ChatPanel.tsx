"use client";
import { useEffect, useRef, useState } from "react";
import { compressImage, type PendingImage } from "@/lib/assets";
import type { ParsedOutput } from "@/lib/parse";
import type { Message } from "@/lib/storage";
import { LogoMark } from "./Logo";
import { IconAlert, IconArrowUp, IconCheck, IconFile, IconLoader, IconPaperclip, IconSparkles, IconStop, IconX } from "./icons";

const SUGGESTIONS = ["Make it more colorful", "Add a testimonials section", "Add a dark mode toggle", "Improve the mobile layout", "Add a contact page"];

export function ChatPanel(props: {
  messages: Message[];
  assets: Record<string, string>;
  busy: boolean;
  live: ParsedOutput | null;
  onSend: (text: string, images: PendingImage[]) => void;
  onStop: () => void;
  className?: string;
}) {
  const { messages, assets, busy, live, onSend, onStop, className = "" } = props;
  const [text, setText] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [imgError, setImgError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, live?.writing, Object.keys(live?.files ?? {}).length]);

  const addFiles = async (list: FileList | File[]) => {
    setImgError("");
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/"));
    for (const f of picked.slice(0, 4 - images.length)) {
      if (f.size > 15_000_000) {
        setImgError("Images must be under 15 MB");
        continue;
      }
      try {
        const img = await compressImage(f);
        setImages((cur) => (cur.length >= 4 ? cur : [...cur, img]));
      } catch {
        setImgError("Couldn't read that image");
      }
    }
  };

  const submit = () => {
    const t = text.trim() || (images.length ? "Use the attached images" : "");
    if (!t || busy) return;
    onSend(t, images);
    setText("");
    setImages([]);
  };

  const done = live ? Object.keys(live.files) : [];

  return (
    <aside className={`w-full md:w-[400px] md:max-w-[42vw] shrink-0 border-r hairline flex-col bg-ink-900/70 ${className}`}>
      <div className="flex-1 overflow-y-auto scroll-thin px-4 py-5 space-y-5">
        {!messages.length && (
          <div className="mt-12 text-center px-6">
            <div className="mx-auto mb-4 w-fit animate-float"><LogoMark size={44} /></div>
            <h2 className="text-lg font-semibold">What should we build?</h2>
            <p className="mt-2 text-sm text-white/45 leading-relaxed">
              Describe your website or app below. Attach a logo, photos or a design screenshot for extra precision.
            </p>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end animate-fade-up">
              <div className="max-w-[88%] rounded-2xl rounded-br-md bg-white/[0.07] border hairline px-4 py-3 text-[14.5px] leading-relaxed whitespace-pre-wrap">
                {m.images && m.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {m.images.map((p) =>
                      assets[p] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p} src={assets[p]} alt={p} className="h-16 w-16 rounded-lg object-cover border border-white/15" />
                      ) : null,
                    )}
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3 animate-fade-up">
              <div className="shrink-0 pt-0.5"><LogoMark size={26} /></div>
              <div className="min-w-0 flex-1 text-[14.5px] leading-relaxed">
                <div className="mb-1 text-xs font-medium text-white/40">Bannaa</div>
                <div className={`whitespace-pre-wrap ${m.status === "error" ? "text-rose-200" : "text-white/85"}`}>
                  {m.status === "error" && <IconAlert size={15} className="inline mr-1.5 -mt-0.5 text-rose-300" />}
                  {m.content || (m.status === "streaming" ? "" : "")}
                </div>

                {m.status === "streaming" && (
                  <div className="mt-3 rounded-xl border hairline bg-ink-950/60 p-3 space-y-1.5 font-mono text-[12px]">
                    {!live?.writing && !done.length && (
                      <div className="flex items-center gap-2 text-white/50">
                        <IconSparkles size={13} className="text-flare-400 animate-pulse" /> Thinking through the design…
                      </div>
                    )}
                    {done.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-emerald-300">
                        <IconCheck size={13} /> {f}
                      </div>
                    ))}
                    {live?.writing && (
                      <div className="flex items-center gap-2 text-brand-300">
                        <IconLoader size={13} /> {live.writing}
                      </div>
                    )}
                  </div>
                )}

                {m.status === "done" && m.changed && m.changed.length > 0 && (
                  <details className="mt-3 group rounded-xl border hairline bg-ink-950/40">
                    <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/80">
                      <IconFile size={13} /> {m.changed.length} file{m.changed.length > 1 ? "s" : ""} changed
                      <span className="ml-auto transition group-open:rotate-180">▾</span>
                    </summary>
                    <div className="px-3 pb-2.5 font-mono text-[12px] text-white/50 space-y-0.5">
                      {m.changed.map((f) => (
                        <div key={f} className="flex items-center gap-2"><IconCheck size={12} className="text-emerald-400" /> {f}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 pt-0">
        {messages.length > 0 && !busy && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2.5 mask-fade-x">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSend(s, [])}
                className="shrink-0 btn-ghost rounded-full px-3 py-1 text-xs text-white/60 hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div
          className="prompt-glow rounded-2xl"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          <div className="rounded-2xl bg-ink-850 border border-white/10 p-2">
            {images.length > 0 && (
              <div className="flex gap-2 p-1 pb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={img.name} className="h-14 w-14 rounded-lg object-cover border border-white/10" />
                    <button
                      onClick={() => setImages((cur) => cur.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-600"
                      aria-label="Remove image"
                    >
                      <IconX size={11} />
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
              placeholder={messages.length ? "Ask for a change… e.g. “add a pricing page”" : "Describe what you want to build…"}
              className="w-full resize-none bg-transparent outline-none px-2 py-1 text-[14.5px] placeholder:text-white/30"
              aria-label="Message"
            />
            {imgError && <p className="text-xs text-rose-300 px-2">{imgError}</p>}
            <div className="flex items-center justify-between">
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
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                title="Attach a logo, photos or a design screenshot"
              >
                <IconPaperclip size={15} /> Attach
              </button>
              {busy ? (
                <button onClick={onStop} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15">
                  <IconStop size={13} /> Stop
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!text.trim() && !images.length}
                  className="btn-primary grid h-8 w-8 place-items-center rounded-full disabled:opacity-30 disabled:shadow-none"
                  aria-label="Send"
                >
                  <IconArrowUp size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
