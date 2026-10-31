"use client";
import { useEffect, useState } from "react";
import { IconCheck, IconCode, IconEye, IconLoader, IconMonitor, IconSparkles } from "../icons";
import { SiteMock } from "./SiteMock";

const PROMPT = "A landing page for my coffee roastery with an online menu and table booking";
const FILES = ["index.html", "menu.html", "css/style.css", "js/app.js"];

/** Looping animation of the builder: prompt → plan → files streaming → preview assembling. */
export function LiveDemo() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => (x + 1) % 130), 100);
    return () => clearInterval(id);
  }, []);

  const typed = PROMPT.slice(0, Math.min(PROMPT.length, Math.max(0, t * 2)));
  const planning = t > 42;
  const filesDone = Math.max(0, Math.min(FILES.length, Math.floor((t - 52) / 9)));
  const reveal = Math.max(0, Math.min(4, Math.floor((t - 50) / 9)));
  const done = t > 92;

  return (
    <div className="ring-gradient rounded-[24px] bg-ink-900/90 shadow-[0_40px_120px_-40px_#7c3aed80] overflow-hidden">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b hairline px-4 h-11">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="mx-auto hidden sm:flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1 text-xs text-white/40">
          bannaa.app/build
        </div>
      </div>
      <div className="grid md:grid-cols-[300px_1fr] min-h-[380px]">
        {/* chat */}
        <div className="border-r hairline p-4 flex flex-col gap-3 text-sm">
          <div className="self-end max-w-[92%] rounded-2xl rounded-br-md bg-brand-600/90 px-3.5 py-2.5 leading-relaxed">
            {typed}
            {t < 42 && <span className="animate-blink">▍</span>}
          </div>
          {planning && (
            <div className="max-w-[95%] rounded-2xl rounded-bl-md bg-white/5 border hairline px-3.5 py-3 animate-fade-up">
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <IconSparkles size={14} className="text-flare-400" />
                {done ? "Your site is ready. Want a dark mode next?" : "Planning a warm, editorial layout…"}
              </div>
              <div className="space-y-1.5 font-mono text-[12px]">
                {FILES.map((f, i) => (
                  <div key={f} className={`flex items-center gap-2 ${i < filesDone ? "text-emerald-300" : i === filesDone ? "text-brand-300" : "text-white/25"}`}>
                    {i < filesDone ? <IconCheck size={13} /> : i === filesDone ? <IconLoader size={13} /> : <span className="w-[13px]" />}
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* preview */}
        <div className="flex flex-col bg-ink-950/60">
          <div className="flex items-center gap-2 border-b hairline px-3 h-10 text-xs text-white/50">
            <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-white/80"><IconEye size={13} /> Preview</span>
            <span className="flex items-center gap-1.5 px-2 py-1"><IconCode size={13} /> Code</span>
            <span className="ml-auto flex items-center gap-1.5"><IconMonitor size={13} /> Desktop</span>
          </div>
          <div className="flex-1 p-4 sm:p-6">
            <div className="aspect-[16/10] rounded-xl overflow-hidden shadow-2xl relative">
              {reveal === 0 ? (
                <div className="absolute inset-0 grid place-items-center bg-ink-900">
                  <div className="space-y-2 w-1/2">
                    {[90, 70, 50].map((w) => (
                      <div key={w} className="h-2.5 rounded shimmer" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 origin-top-left" style={{ width: "50%", height: "50%", transform: "scale(2)" }}>
                  <SiteMock colors={["#9a3412", "#f59e0b"]} variant={1} reveal={reveal} title="Ember Roasters" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
