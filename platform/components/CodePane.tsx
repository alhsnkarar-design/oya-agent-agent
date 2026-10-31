"use client";
import { useEffect, useMemo, useState } from "react";
import type { FileMap } from "@/lib/parse";
import { IconFile } from "./icons";

const DOT: Record<string, string> = { html: "#f97316", css: "#38bdf8", js: "#facc15", json: "#a3e635", md: "#e5e7eb", svg: "#f472b6" };

export function CodePane(props: {
  files: FileMap;
  writing: string | null;
  writingContent: string;
  readOnly: boolean;
  onChange: (path: string, content: string) => void;
}) {
  const { files, writing, writingContent, readOnly, onChange } = props;
  const paths = useMemo(() => {
    const all = Object.keys(files);
    if (writing && !all.includes(writing)) all.push(writing);
    return all.sort();
  }, [files, writing]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (writing) setSelected(writing);
    else if (!selected || !files[selected]) setSelected(paths[0] ?? null);
  }, [writing, paths, files, selected]);

  const isWriting = selected === writing && writing != null;
  const content = selected ? (isWriting ? writingContent : files[selected] ?? "") : "";

  if (!paths.length) return <div className="h-full grid place-items-center text-white/40">No files yet</div>;

  return (
    <div className="h-full flex bg-ink-950">
      <nav className="w-60 shrink-0 border-r hairline overflow-y-auto scroll-thin p-2 text-[13px]">
        <div className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-white/35">Files</div>
        {paths.map((p) => (
          <button
            key={p}
            onClick={() => setSelected(p)}
            className={`flex w-full items-center gap-2 text-left rounded-lg px-2 py-1.5 font-mono truncate transition ${
              selected === p ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: DOT[p.split(".").pop() ?? ""] ?? "#9ca3af" }} />
            <span className="truncate">{p}</span>
            {p === writing && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-300 animate-pulse" />}
          </button>
        ))}
      </nav>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-4 h-10 text-xs text-white/45 border-b hairline font-mono flex items-center justify-between">
          <span className="flex items-center gap-2"><IconFile size={13} /> {selected}</span>
          <span>{content.split("\n").length} lines{readOnly ? "" : " · editable"}</span>
        </div>
        <textarea
          value={content}
          readOnly={readOnly || isWriting}
          onChange={(e) => selected && onChange(selected, e.target.value)}
          spellCheck={false}
          className="code-area flex-1 w-full resize-none bg-transparent text-[13px] leading-6 text-white/85 p-4 outline-none scroll-thin"
          aria-label={`Contents of ${selected}`}
        />
      </div>
    </div>
  );
}
