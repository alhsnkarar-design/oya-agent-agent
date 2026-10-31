import { Suspense } from "react";
import { Workspace } from "@/components/Workspace";

export const metadata = { title: "Workspace — Bannaa" };

export default function BuildPage() {
  return (
    <Suspense fallback={<div className="h-screen grid place-items-center text-white/50">Loading…</div>}>
      <Workspace />
    </Suspense>
  );
}
