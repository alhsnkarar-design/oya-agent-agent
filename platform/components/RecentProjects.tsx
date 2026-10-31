"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cloud, fetchMe } from "@/lib/cloud";
import { deleteProject, listProjects } from "@/lib/storage";

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
    <section id="projects" className="max-w-6xl mx-auto px-5 py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold">مشاريعك</h2>
        <span className="text-xs text-white/40">{cloudMode ? "☁️ محفوظة في حسابك" : "💾 محفوظة في هذا المتصفح"}</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.slice(0, 12).map((p) => (
          <div key={p.id} className="panel rounded-2xl p-5 flex flex-col gap-3">
            <Link href={`/build?id=${p.id}`} className="font-semibold hover:text-brand-300 truncate">
              {p.name}
            </Link>
            <div className="text-xs text-white/40">
              {p.fileCount} ملفات · آخر تعديل {new Date(p.updatedAt).toLocaleDateString("ar")}
            </div>
            {p.publishedSlug && (
              <a href={`/s/${p.publishedSlug}/`} target="_blank" rel="noopener" dir="ltr" className="text-xs text-emerald-300 hover:underline truncate text-right">
                🌐 /s/{p.publishedSlug}/
              </a>
            )}
            <div className="flex gap-2 mt-auto">
              <Link href={`/build?id=${p.id}`} className="text-sm rounded-lg bg-ink-700 px-3 py-1.5 hover:bg-ink-600">
                فتح
              </Link>
              <button
                onClick={async () => {
                  if (!confirm(`حذف «${p.name}»؟${p.publishedSlug ? " سيتوقف موقعه المنشور أيضاً." : ""}`)) return;
                  if (cloudMode) await cloud.remove(p.id).catch(() => {});
                  else deleteProject(p.id);
                  load();
                }}
                className="text-sm rounded-lg px-3 py-1.5 text-red-300/80 hover:bg-red-500/10"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
