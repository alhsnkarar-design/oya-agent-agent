"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteProject, listProjects, type Project } from "@/lib/storage";

export function RecentProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    setProjects(listProjects());
  }, []);
  if (!projects.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      <h2 className="text-2xl font-bold mb-6">مشاريعك</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.slice(0, 9).map((p) => (
          <div key={p.id} className="panel rounded-2xl p-5 flex flex-col gap-3">
            <Link href={`/build?id=${p.id}`} className="font-semibold hover:text-brand-300 truncate">
              {p.name}
            </Link>
            <div className="text-xs text-white/40">
              {Object.keys(p.files).length} ملفات · آخر تعديل {new Date(p.updatedAt).toLocaleDateString("ar")}
            </div>
            <div className="flex gap-2 mt-auto">
              <Link href={`/build?id=${p.id}`} className="text-sm rounded-lg bg-ink-700 px-3 py-1.5 hover:bg-ink-600">
                فتح
              </Link>
              <button
                onClick={() => {
                  if (confirm(`حذف «${p.name}»؟`)) {
                    deleteProject(p.id);
                    setProjects(listProjects());
                  }
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
