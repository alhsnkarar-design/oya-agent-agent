"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth, fetchMe, type Me } from "@/lib/cloud";
import { IconFolder, IconLogout } from "./icons";

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!me) return <div className="h-8 w-16" />;
  if (!me.user) {
    const next = typeof window !== "undefined" ? pathname + window.location.search : "/";
    return (
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="whitespace-nowrap text-sm px-2 text-white/70 hover:text-white transition"
      >
        Log in
      </Link>
    );
  }
  const initials = me.user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 hover:bg-white/5 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full btn-primary text-xs font-bold">{initials}</span>
        {!compact && <span className="text-sm max-w-32 truncate text-white/80">{me.user.name}</span>}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-60 glass rounded-2xl p-1.5 shadow-2xl animate-fade-up">
          <div className="px-3 py-2.5">
            <div className="text-sm font-medium truncate">{me.user.name}</div>
            <div className="text-xs text-white/45 truncate">{me.user.email}</div>
          </div>
          <div className="my-1 h-px bg-white/10" />
          <Link href="/#projects" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5">
            <IconFolder size={16} /> My projects
          </Link>
          <button
            onClick={async () => {
              await auth.logout();
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
          >
            <IconLogout size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
