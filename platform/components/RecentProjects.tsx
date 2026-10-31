"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cloud, fetchMe } from "@/lib/cloud";
import { deleteProject, listProjects } from "@/lib/storage";
import { IconCloud, IconExternal, IconTrash } from "./icons";

interface Row {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: number;
  publishedSlug: string | null;
}

export function RecentProjects() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [cloudMode, setCloudMode] = useState(false);

  const load = async () => {
    const me = await fetchMe();
    if (me.user) {
      setCloudMode(true);
      const list = await cloud.list().catch(() => []);
      setRows(list.map((p) => ({ ...p, updatedAt: Date.parse(p.updatedAt) })));
    } else {
      setRows(
        listProjects().map((p) => ({
          id: p.id,
          name: p.name,
          fileCount: Object.keys(p.files).length,
          updatedAt: p.updatedAt,
          publishedSlug: null,
        })),
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!rows?.length) return null;
  return (
    <section id="projects" className="max-w-6xl mx-auto px-5 py-10 scroll-mt-20">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl font-semibold tracking-tight">Your projects</h2>
        <span className="flex items-center gap-1.5 text-xs text-white/40">
          {cloudMode ? <><IconCloud size={14} /> Synced to your account</> : "Saved in this browser · log in to sync"}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rows.slice(0, 12).map((p) => (
          <div key={p.id} className="group panel rounded-2xl p-4 flex flex-col gap-2 transition hover:border-white/20">
            <Link href={`/build?id=${p.id}`} className="font-medium hover:text-brand-300 truncate">
              {p.name}
            </Link>
            <div className="text-xs text-white/40">
              {p.fileCount} files · edited {new Date(p.updatedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </div>
            {p.publishedSlug && (
              <a href={`/s/${p.publishedSlug}/`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-emerald-300 hover:underline truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> /s/{p.publishedSlug}/ <IconExternal size={12} />
              </a>
            )}
            <div className="flex gap-2 mt-auto pt-2">
              <Link href={`/build?id=${p.id}`} className="text-sm rounded-full btn-ghost px-3 py-1">
                Open
              </Link>
              <button
                onClick={async () => {
                  if (!confirm(`Delete “${p.name}”?${p.publishedSlug ? " Its published site will go offline too." : ""}`)) return;
                  if (cloudMode) await cloud.remove(p.id).catch(() => {});
                  else deleteProject(p.id);
                  load();
                }}
                className="ml-auto grid h-7 w-7 place-items-center rounded-full text-white/30 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-300"
                aria-label={`Delete ${p.name}`}
              >
                <IconTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
