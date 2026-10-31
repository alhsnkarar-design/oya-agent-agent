"use client";
import { useEffect, useState } from "react";
import { cloud, suggestSlug } from "@/lib/cloud";
import type { Project } from "@/lib/storage";
import { IconCheck, IconCopy, IconExternal, IconGlobe, IconLoader, IconRocket, IconX } from "./icons";

export function PublishDialog(props: {
  project: Project;
  loggedIn: boolean;
  flush: () => Promise<void>;
  onClose: () => void;
  onChange: (slug: string | null) => void;
}) {
  const { project, loggedIn, flush, onClose, onChange } = props;
  const [slug, setSlug] = useState(project.publishedSlug || suggestSlug(project));
  const [url, setUrl] = useState(project.publishedSlug ? `${location.origin}/s/${project.publishedSlug}/` : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const publish = async () => {
    setBusy(true);
    setError("");
    try {
      await flush(); // publish exactly what is on screen
      const r = await cloud.publish(project.id, slug);
      setUrl(r.url);
      onChange(r.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publishing failed");
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    if (!confirm("Unpublish this site? The link will stop working.")) return;
    setBusy(true);
    try {
      await cloud.unpublish(project.id);
      setUrl("");
      onChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="relative w-full max-w-lg rounded-3xl ring-gradient bg-ink-900 p-7 shadow-[0_40px_120px_-30px_#7c3aed88]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-5 top-5 text-white/40 hover:text-white" aria-label="Close">
          <IconX size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl btn-primary">
            <IconRocket size={20} />
          </span>
          <div>
            <h2 id="publish-title" className="text-lg font-semibold">Publish your site</h2>
            <p className="text-sm text-white/45">Get a live link anyone can visit.</p>
          </div>
        </div>

        {!loggedIn ? (
          <div className="space-y-5">
            <p className="text-white/65 leading-relaxed">
              Create a free account to publish. Your current project moves into your account automatically — nothing is lost.
            </p>
            <a
              href={`/login?mode=register&next=${encodeURIComponent(`/build?id=${project.id}`)}`}
              className="block text-center btn-primary rounded-full py-3 font-semibold"
            >
              Create account to publish
            </a>
            <a
              href={`/login?next=${encodeURIComponent(`/build?id=${project.id}`)}`}
              className="block text-center text-sm text-white/50 hover:text-white"
            >
              I already have an account
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            <label className="block text-sm">
              <span className="text-white/70">Site address</span>
              <div className="mt-2 flex items-center rounded-xl bg-ink-950 border border-white/10 focus-within:border-brand-400 overflow-hidden">
                <span className="pl-3.5 text-white/35 text-sm whitespace-nowrap">{typeof location !== "undefined" ? location.host : ""}/s/</span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="flex-1 bg-transparent outline-none py-3 pr-3 font-mono text-sm"
                  aria-label="Site link"
                  maxLength={40}
                />
              </div>
              <span className="mt-1.5 block text-xs text-white/35">Lowercase letters, numbers and dashes.</span>
            </label>

            {error && (
              <p className="text-sm text-rose-200 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2" role="alert">
                {error}
              </p>
            )}

            {url && (
              <div className="rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/25 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> Your site is live
                </div>
                <a href={url} target="_blank" rel="noopener" className="flex items-center gap-2 font-mono text-sm break-all hover:underline">
                  <IconGlobe size={14} className="shrink-0 text-white/50" /> {url}
                </a>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="btn-ghost flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                  >
                    {copied ? <IconCheck size={13} /> : <IconCopy size={13} />} {copied ? "Copied" : "Copy link"}
                  </button>
                  <a href={url} target="_blank" rel="noopener" className="btn-ghost flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs">
                    <IconExternal size={13} /> Open
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener"
                    className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                  >
                    Share on WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("I just built this with Bannaa")}`}
                    target="_blank"
                    rel="noopener"
                    className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                  >
                    Share on X
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={publish}
                disabled={busy || slug.length < 3}
                className="flex-1 btn-primary flex items-center justify-center gap-2 rounded-full py-3 font-semibold disabled:opacity-40 disabled:shadow-none"
              >
                {busy ? <IconLoader size={16} /> : <IconRocket size={16} />}
                {busy ? "Publishing…" : url ? "Update live site" : "Publish now"}
              </button>
              {url && (
                <button onClick={unpublish} disabled={busy} className="rounded-full px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/10">
                  Unpublish
                </button>
              )}
            </div>
            <p className="text-xs text-white/35">Publishing takes a snapshot of your project. After making changes, click “Update live site”.</p>
          </div>
        )}
      </div>
    </div>
  );
}
