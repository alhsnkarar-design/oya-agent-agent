"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { compressImage, type PendingImage } from "@/lib/assets";
import { TEMPLATES } from "@/lib/templates";
import { IconArrowUp, IconPaperclip, IconSparkles, IconX } from "./icons";

const KINDS = ["Website", "Web app", "Landing page", "Online store", "Portfolio"] as const;

const PLACEHOLDERS = [
  "A landing page for my coffee roastery with an online menu…",
  "A booking app for my yoga studio with class schedules…",
  "A portfolio for a wedding photographer with a gallery…",
  "An online store for handmade candles with a cart…",
  "A dashboard to track my monthly expenses…",
];

export const PENDING_PROMPT = "bannaa:pending-prompt";
export const PENDING_IMAGES = "bannaa:pending-images";

/** Animated "typing" placeholder that cycles through example ideas. */
function useTypingPlaceholder(active: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    let i = 0;
    let pos = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = PLACEHOLDERS[i];
      pos += deleting ? -2 : 1;
      setText(full.slice(0, pos));
      if (!deleting && pos >= full.length) {
        deleting = true;
        t = setTimeout(tick, 1800);
        return;
      }
      if (deleting && pos <= 0) {
        deleting = false;
        i = (i + 1) % PLACEHOLDERS.length;
      }
      t = setTimeout(tick, deleting ? 18 : 38);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [active]);
  return text;
}

export function HeroPrompt() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Website");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const placeholder = useTypingPlaceholder(!prompt);

  const start = (text: string, withKind = true) => {
    const p = text.trim();
    if (!p && !images.length) return;
    setBusy(true);
    const full = withKind ? `Build a ${kind.toLowerCase()}: ${p || "based on the attached images"}` : p;
    sessionStorage.setItem(PENDING_PROMPT, full);
    if (images.length) sessionStorage.setItem(PENDING_IMAGES, JSON.stringify(images));
    else sessionStorage.removeItem(PENDING_IMAGES);
    router.push("/build?new=1");
  };

  const addFiles = async (files: FileList | File[]) => {
    for (const f of Array.from(files).filter((x) => x.type.startsWith("image/")).slice(0, 4 - images.length)) {
      const img = await compressImage(f).catch(() => null);
      if (img) setImages((cur) => (cur.length >= 4 ? cur : [...cur, img]));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(prompt);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="prompt-glow rounded-[22px]"
      >
        <div className="rounded-[22px] bg-ink-900/95 border border-white/10 p-3 text-left shadow-2xl">
          {images.length > 0 && (
            <div className="flex gap-2 px-2 pt-1 pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.dataUrl} alt={img.name} className="h-14 w-14 rounded-xl object-cover border border-white/10" />
                  <button
                    type="button"
                    onClick={() => setImages((c) => c.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-600 text-white"
                    aria-label="Remove image"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onPaste={(e) => {
              if (e.clipboardData.files.length) {
                e.preventDefault();
                addFiles(e.clipboardData.files);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                start(prompt);
              }
            }}
            rows={3}
            placeholder={placeholder || "Describe what you want to build…"}
            className="w-full resize-none bg-transparent outline-none px-3 pt-2 text-[17px] leading-relaxed placeholder:text-white/30"
            aria-label="Describe your project"
          />
          <div className="flex items-center gap-2 px-1 pt-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
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
              className="btn-ghost flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/70"
              title="Attach a logo, photos or a design screenshot"
            >
              <IconPaperclip size={15} /> Attach
            </button>
            <div className="hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                    kind === k ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button
              type="submit"
              disabled={busy || (!prompt.trim() && !images.length)}
              className="btn-primary grid h-10 w-10 place-items-center rounded-full disabled:opacity-30 disabled:shadow-none"
              aria-label="Start building"
            >
              <IconArrowUp size={18} />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {TEMPLATES.slice(0, 4).map((t) => (
          <button
            key={t.id}
            onClick={() => start(t.prompt, false)}
            className="btn-ghost flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-white/65 hover:text-white"
          >
            <IconSparkles size={14} className="text-brand-300" />
            {t.title}
          </button>
        ))}
      </div>
    </div>
  );
}
