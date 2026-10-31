"use client";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { UserMenu } from "../UserMenu";
import { IconMenu, IconX } from "../icons";

const LINKS = [
  ["Product", "#product"],
  ["Templates", "#templates"],
  ["Features", "#features"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`sticky top-0 z-40 transition-all ${scrolled ? "glass" : "border-b border-transparent"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-5">
        <Logo />
        <div className="hidden md:flex items-center gap-7 text-sm text-white/60">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-white transition">
              {label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <UserMenu />
          <a href="/build" className="hidden sm:inline-flex btn-white rounded-full px-4 py-2 text-sm font-semibold">
            Start building
          </a>
          <button className="md:hidden p-2 text-white/70" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="md:hidden glass border-t hairline px-5 py-4 flex flex-col gap-3 text-white/80">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
