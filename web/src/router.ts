// Tiny path router: /, /pricing, /editor, /projects, /works, /login.
import { useSyncExternalStore } from "react";

const subs = new Set<() => void>();
const snap = () => location.pathname + location.search;
window.addEventListener("popstate", () => subs.forEach((f) => f()));

export function go(to: string) {
  if (to === snap()) return;
  history.pushState(null, "", to);
  window.scrollTo(0, 0);
  subs.forEach((f) => f());
}
export function useRoute() {
  const s = useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, snap);
  const u = new URL(s, location.origin);
  return { path: u.pathname.replace(/\/+$/, "") || "/", params: u.searchParams };
}
export function linkProps(to: string) {
  return {
    href: to,
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const hash = to.split("#")[1];
      if (to.startsWith("/#") && location.pathname === "/") { e.preventDefault(); document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }); return; }
      e.preventDefault(); go(to.split("#")[0] || "/");
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 60);
    },
  };
}
