import { useSyncExternalStore } from "react";
type Toast = { text: string; bad?: boolean; id: number } | null;
let cur: Toast = null;
const subs = new Set<() => void>();
export function toast(text: string, bad = false, ms = 4200) {
  const id = Date.now();
  cur = { text, bad, id };
  subs.forEach((f) => f());
  setTimeout(() => { if (cur?.id === id) { cur = null; subs.forEach((f) => f()); } }, ms);
}
export function useToast() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => cur);
}
