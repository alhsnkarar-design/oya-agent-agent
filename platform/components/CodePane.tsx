"use client";
import { useEffect, useMemo, useState } from "react";
import type { FileMap } from "@/lib/parse";

const ICON: Record<string, string> = { html: "🌐", css: "🎨", js: "⚙️", json: "🧾", md: "📝", svg: "🖼️" };

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

  if (!paths.length) return <div className="h-full grid place-items-center text-white/40">لا توجد ملفات بعد</div>;

  return (
    <div className="h-full flex" dir="ltr">
      <nav className="w-56 shrink-0 border-r border-ink-700 overflow-y-auto scroll-thin p-2 text-sm">
        {paths.map((p) => (
          <button
            key={p}
            onClick={() => setSelected(p)}
            className={`w-full text-left rounded-md px-2 py-1.5 font-mono truncate ${
              selected === p ? "bg-ink-700 text-white" : "text-white/60 hover:bg-ink-800"
            }`}
          >
            {ICON[p.split(".").pop() ?? ""] ?? "📄"} {p}
            {p === writing && <span className="ml-1 text-brand-300 animate-pulse">●</span>}
          </button>
        ))}
      </nav>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="px-4 py-2 text-xs text-white/40 border-b border-ink-700 font-mono flex justify-between">
          <span>{selected}</span>
          <span>{content.split("\n").length} lines{readOnly ? "" : " · editable"}</span>
        </div>
        <textarea
          value={content}
          readOnly={readOnly || isWriting}
          onChange={(e) => selected && onChange(selected, e.target.value)}
          spellCheck={false}
          className="code-area flex-1 w-full resize-none bg-ink-950 text-[13px] leading-6 text-emerald-50/90 p-4 outline-none scroll-thin"
          aria-label={`محتوى ${selected}`}
        />
      </div>
    </div>
  );
}
