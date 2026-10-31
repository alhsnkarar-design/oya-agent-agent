"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, fetchMe, type Me } from "@/lib/cloud";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  if (!me) return <div className="h-8 w-20" />;
  if (!me.user) {
    const next = typeof window !== "undefined" ? pathname + window.location.search : "/";
    return (
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className={`rounded-xl border border-ink-600 hover:border-brand-400 ${compact ? "text-sm px-3 py-1.5" : "px-4 py-2 text-sm"}`}
      >
        تسجيل الدخول
      </Link>
    );
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-ink-800"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 font-bold">{me.user.name.slice(0, 1)}</span>
        {!compact && <span className="text-sm max-w-32 truncate">{me.user.name}</span>}
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-11 z-30 w-56 panel rounded-xl p-2 shadow-2xl">
          <div className="px-3 py-2 text-xs text-white/50 truncate">{me.user.email}</div>
          <Link href="/#projects" className="block rounded-lg px-3 py-2 text-sm hover:bg-ink-700">مشاريعي</Link>
          <button
            onClick={async () => {
              await auth.logout();
              window.location.href = "/";
            }}
            className="w-full text-right rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
