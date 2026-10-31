"use client";
import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/lib/templates";
import { PENDING_IMAGES, PENDING_PROMPT } from "../HeroPrompt";
import { IconArrowRight } from "../icons";
import { SiteMock } from "./SiteMock";

export function Showcase() {
  const router = useRouter();
  const use = (prompt: string) => {
    sessionStorage.setItem(PENDING_PROMPT, prompt);
    sessionStorage.removeItem(PENDING_IMAGES);
    router.push("/build?new=1");
  };
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((t, i) => (
        <button
          key={t.id}
          onClick={() => use(t.prompt)}
          className="group text-left rounded-2xl panel p-2.5 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_30px_60px_-30px_#7c3aed99]"
        >
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.04]">
              <SiteMock colors={t.colors} variant={i} title={t.title} />
            </div>
            <div className="absolute inset-0 grid place-items-center bg-ink-950/60 opacity-0 transition group-hover:opacity-100">
              <span className="btn-white flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold">
                Use template <IconArrowRight size={15} />
              </span>
            </div>
          </div>
          <div className="px-2 pt-3 pb-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{t.title}</span>
              <span className="text-[11px] rounded-full bg-white/5 border hairline px-2 py-0.5 text-white/50">{t.category}</span>
            </div>
            <p className="mt-1 text-sm text-white/45">{t.blurb}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
