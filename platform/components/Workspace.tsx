"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyChanges, parseOutput, type FileMap, type ParsedOutput } from "@/lib/parse";
import { buildPreview, htmlPages, resolveNavigation } from "@/lib/preview";
import { assetPath, dataUrlToBytes, type PendingImage } from "@/lib/assets";
import { cloud, fetchMe, type Me } from "@/lib/cloud";
import {
  deleteProject as deleteLocal,
  getProject,
  newProject,
  projectNameFrom,
  saveProject,
  uid,
  type Message,
  type Project,
} from "@/lib/storage";
import { Logo, LogoMark } from "./Logo";
import {
  IconAlert,
  IconCloud,
  IconCode,
  IconDownload,
  IconExternal,
  IconEye,
  IconGlobe,
  IconHistory,
  IconLoader,
  IconMonitor,
  IconPhone,
  IconPlus,
  IconRocket,
  IconSparkles,
  IconTablet,
  IconWand,
} from "./icons";
import { ChatPanel } from "./ChatPanel";
import { CodePane } from "./CodePane";
import { PENDING_IMAGES, PENDING_PROMPT } from "./HeroPrompt";
import { PublishDialog } from "./PublishDialog";
import { UserMenu } from "./UserMenu";

const END = "\u001e";
type Device = "desktop" | "tablet" | "mobile";
const WIDTH: Record<Device, string> = { desktop: "100%", tablet: "820px", mobile: "390px" };

export function Workspace() {
  const router = useRouter();
  const params = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<ParsedOutput | null>(null);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [page, setPage] = useState("index.html");
  const [errors, setErrors] = useState<string[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [showVersions, setShowVersions] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [mobileView, setMobileView] = useState<"chat" | "preview">("chat");
  const [me, setMe] = useState<Me | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState("");
  const userRef = useRef<Me["user"]>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const projectRef = useRef<Project | null>(null);
  const autoFixRef = useRef<{ armed: boolean; used: number }>({ armed: false, used: 0 });
  const startedRef = useRef(false);

  projectRef.current = project;

  // ---- persistence: account (cloud, debounced) or this browser (localStorage)
  const flushSave = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const p = projectRef.current;
    if (!p || !userRef.current) return;
    try {
      const r = await cloud.save(p);
      setSaveState("saved");
      setSaveError("");
      if (r.publishedSlug !== (p.publishedSlug ?? null)) setProject((cur) => (cur ? { ...cur, publishedSlug: r.publishedSlug } : cur));
    } catch (e) {
      setSaveState("error");
      setSaveError(e instanceof Error ? e.message : "Couldn't save");
    }
  }, []);

  const persist = useCallback(
    (p: Project) => {
      if (!userRef.current) {
        saveProject(p);
        return;
      }
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flushSave, 900);
    },
    [flushSave],
  );

  const update = useCallback(
    (fn: (p: Project) => Project) => {
      setProject((prev) => {
        if (!prev) return prev;
        const next = fn(prev);
        projectRef.current = next;
        persist(next);
        return next;
      });
    },
    [persist],
  );

  // warn before leaving with unsaved cloud changes
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (saveTimer.current) {
        e.preventDefault();
        flushSave();
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [flushSave]);

  // ---- provider info
  useEffect(() => {
    fetch("/api/generate")
      .then((r) => r.json())
      .then((j) => setProvider(j.provider))
      .catch(() => {});
  }, []);

  // ---- streaming generation
  const send = useCallback(
    async (prompt: string, opts: { isFix?: boolean; images?: PendingImage[] } = {}) => {
      const p = projectRef.current;
      if (!p || !prompt.trim()) return;
      const baseFiles = p.files;
      const isEdit = Object.keys(baseFiles).length > 0;
      // register attached images as project assets so the generated code can reference them by path
      const assets = { ...p.assets };
      const attached = (opts.images ?? []).map((img) => {
        const path = assetPath(img, assets);
        assets[path] = img.dataUrl;
        return { path, dataUrl: img.dataUrl };
      });
      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: prompt,
        at: Date.now(),
        ...(attached.length ? { images: attached.map((a) => a.path) } : {}),
      };
      const botId = uid();
      const history = p.messages.map((m) => ({ role: m.role, content: m.content }));
      update((pr) => ({
        ...pr,
        name: pr.messages.length ? pr.name : projectNameFrom(prompt),
        assets,
        messages: [...pr.messages, userMsg, { id: botId, role: "assistant", content: "", at: Date.now(), status: "streaming" }],
      }));
      setBusy(true);
      setErrors([]);
      autoFixRef.current.armed = false;
      if (!opts.isFix) autoFixRef.current.used = 0;

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      let text = "";
      let status: { stop?: string; error?: string } = {};
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          signal: ctrl.signal,
          headers: { "Content-Type": "application/json", "x-access-code": localStorage.getItem("bannaa:access-code") || "" },
          body: JSON.stringify({ prompt, files: baseFiles, history, images: attached, assets: Object.keys(assets) }),
        });
        if (res.status === 401 && (await res.clone().json().catch(() => ({}))).needLogin) {
          window.location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
          throw new Error("Log in to continue");
        }
        if (res.status === 401) {
          const code = window.prompt("This workspace is protected. Enter the access code:");
          if (code) localStorage.setItem("bannaa:access-code", code);
          throw new Error("An access code is required — try again after entering it.");
        }
        if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || `Error ${res.status}`);
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let last = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += dec.decode(value, { stream: true });
          const now = performance.now();
          if (now - last > 120) {
            last = now;
            const body = text.split(END)[0];
            const parsed = parseOutput(body);
            setLive(parsed);
            update((pr) => ({
              ...pr,
              messages: pr.messages.map((m) => (m.id === botId ? { ...m, content: parsed.plan } : m)),
            }));
          }
        }
        const [body, tail] = text.split(END);
        text = body;
        if (tail) status = JSON.parse(tail);
      } catch (e) {
        status = ctrl.signal.aborted ? { stop: "aborted" } : { stop: "error", error: e instanceof Error ? e.message : String(e) };
      }

      const parsed = parseOutput(text);
      const changed = [...Object.keys(parsed.files), ...parsed.deleted];
      const nextFiles: FileMap = isEdit ? applyChanges(baseFiles, parsed) : parsed.files;
      const failed = status.stop === "error" || (!changed.length && status.stop !== "demo");
      let content = [parsed.plan, parsed.notes].filter(Boolean).join("\n\n");
      if (status.stop === "max_tokens") content += "\n\nGeneration stopped because the output got too long. Ask me to “continue”, or split the request into smaller steps.";
      if (status.stop === "refusal") content += "\n\nI can't help with that request.";
      if (status.stop === "aborted") content += "\n\nStopped.";
      if (status.error) content += `\n\n${status.error}`;
      if (!content.trim()) content = "I couldn't generate any files. Try rephrasing your request.";

      update((pr) => ({
        ...pr,
        files: changed.length ? nextFiles : pr.files,
        versions: changed.length
          ? [...pr.versions, { id: uid(), at: Date.now(), label: prompt.slice(0, 60), files: nextFiles }]
          : pr.versions,
        messages: pr.messages.map((m) =>
          m.id === botId ? { ...m, content, status: failed ? "error" : "done", changed } : m,
        ),
      }));
      if (changed.length && !nextFiles[page]) setPage("index.html");
      setLive(null);
      setBusy(false);
      abortRef.current = null;
      if (changed.length) {
        setTab("preview");
        setMobileView("preview");
        autoFixRef.current.armed = true;
      }
    },
    [update, page],
  );

  // ---- load / create project
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      const who = await fetchMe();
      userRef.current = who.user;
      setMe(who);
      const id = params.get("id");
      let existing: Project | null = null;
      if (id && who.user) {
        existing = await cloud.get(id).catch(() => null);
        const local = existing ? null : getProject(id);
        if (local) {
          // a project started before signing in: move it into the account
          existing = local;
          await cloud.save(local).then(() => deleteLocal(id)).catch(() => {});
        }
      } else if (id) {
        existing = getProject(id);
      }
      if (existing) {
        projectRef.current = existing;
        setProject(existing);
        return;
      }
      const p = newProject();
      projectRef.current = p;
      setProject(p);
      if (who.user) await cloud.save(p).catch(() => {});
      else saveProject(p);
      router.replace(`/build?id=${p.id}`);
      const pending = sessionStorage.getItem(PENDING_PROMPT);
      if (pending) {
        let images: PendingImage[] = [];
        try {
          images = JSON.parse(sessionStorage.getItem(PENDING_IMAGES) || "[]");
        } catch {}
        sessionStorage.removeItem(PENDING_PROMPT);
        sessionStorage.removeItem(PENDING_IMAGES);
        setTimeout(() => send(pending, { images }), 0);
      }
    })();
  }, [params, router, send]);

  // ---- preview bridge (errors + navigation)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.source !== "bannaa-preview") return;
      if (d.type === "error") {
        setErrors((prev) => (prev.includes(d.message) || prev.length >= 5 ? prev : [...prev, String(d.message).slice(0, 300)]));
      } else if (d.type === "navigate") {
        const target = resolveNavigation(page, d.href);
        if (target && projectRef.current?.files[target] != null) setPage(target);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [page]);

  // ---- self-healing: one automatic fix attempt after each generation
  useEffect(() => {
    if (!errors.length || busy || !autoFixRef.current.armed || autoFixRef.current.used >= 1) return;
    const t = setTimeout(() => {
      autoFixRef.current.used += 1;
      autoFixRef.current.armed = false;
      send(`Auto-fix: these errors appeared while running “${page}”. Fix the root cause:\n- ${errors.join("\n- ")}`, { isFix: true });
    }, 1500);
    return () => clearTimeout(t);
  }, [errors, busy, page, send]);

  const files = useMemo(() => {
    if (!project) return {};
    if (!live) return project.files;
    const merged = Object.keys(project.files).length ? applyChanges(project.files, live) : live.files;
    return merged;
  }, [project, live]);

  const assets = project?.assets;
  const previewDoc = useMemo(() => buildPreview(files, page, assets ?? {}), [files, page, assets]);
  const pages = useMemo(() => htmlPages(files), [files]);
  const hasFiles = Object.keys(files).length > 0;

  const downloadZip = async () => {
    if (!project) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(project.name.replace(/[\\/:*?"<>|]/g, "-")) ?? zip;
    for (const [p, c] of Object.entries(project.files)) folder.file(p, c);
    for (const [p, url] of Object.entries(project.assets ?? {})) folder.file(p, dataUrlToBytes(url));
    folder.file(
      "README.md",
      `# ${project.name}\n\nBuilt with Bannaa.\n\n## Run\nOpen index.html in your browser.\n\n## Deploy\n- Netlify Drop: drag this folder to https://app.netlify.com/drop\n- GitHub Pages / Vercel / Cloudflare Pages: upload the files as-is (no build step).\n`,
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    // ASCII file name: some browsers reject non-Latin download names. The Arabic name is kept as the folder inside.
    const ascii = project.name.replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-");
    a.download = `bannaa-${ascii || project.id}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  const openNewTab = () => {
    const url = URL.createObjectURL(new Blob([previewDoc], { type: "text/html" }));
    window.open(url, "_blank", "noopener");
  };

  if (!project)
    return (
      <div className="h-screen grid place-items-center aurora">
        <IconLoader size={22} className="text-white/50" />
      </div>
    );

  const pageCount = pages.length;

  return (
    <div className="h-screen flex flex-col bg-ink-950">
      {/* ---------------- top bar ---------------- */}
      <header className="flex items-center gap-1.5 sm:gap-2 border-b hairline px-3 h-14 shrink-0 bg-ink-900/80">
        <Logo small />
        <span className="hidden sm:inline text-white/15 text-lg font-light">/</span>
        <input
          value={project.name}
          onChange={(e) => update((p) => ({ ...p, name: e.target.value }))}
          className="hidden sm:block bg-transparent outline-none text-sm font-medium min-w-0 w-52 rounded-lg px-2 py-1.5 hover:bg-white/5 focus:bg-white/5"
          aria-label="Project name"
        />
        <SaveBadge loggedIn={!!me?.user} state={saveState} error={saveError} />
        {provider === "demo" && (
          <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200">
            Demo mode · add an AI key to generate for real
          </span>
        )}
        <div className="flex-1" />

        <div className="relative">
          <button
            onClick={() => setShowVersions((v) => !v)}
            disabled={!project.versions.length}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/65 hover:text-white hover:bg-white/5 disabled:opacity-30"
            title="Version history"
          >
            <IconHistory size={16} /> <span className="hidden md:inline">History</span>
            <span className="rounded-md bg-white/10 px-1.5 text-[11px]">{project.versions.length}</span>
          </button>
          {showVersions && (
            <div className="absolute right-0 top-11 z-30 w-80 glass rounded-2xl p-1.5 max-h-96 overflow-auto scroll-thin shadow-2xl animate-fade-up">
              <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/40">Version history</div>
              {[...project.versions].reverse().map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    update((p) => ({
                      ...p,
                      files: v.files,
                      versions: [...p.versions, { id: uid(), at: Date.now(), label: `Restored: ${v.label}`, files: v.files }],
                    }));
                    setShowVersions(false);
                    setPage("index.html");
                  }}
                  className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-white/5 flex gap-3"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-emerald-400" : "bg-white/20"}`} />
                  <span className="min-w-0">
                    <span className="block text-sm truncate">{v.label}</span>
                    <span className="block text-xs text-white/40">
                      {i === 0 ? "Current · " : ""}
                      {new Date(v.at).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={downloadZip}
          disabled={!hasFiles || busy}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/65 hover:text-white hover:bg-white/5 disabled:opacity-30"
          title="Download ZIP"
        >
          <IconDownload size={16} /> <span className="hidden md:inline">Export</span>
        </button>
        <button
          onClick={() => router.push("/")}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/65 hover:text-white hover:bg-white/5"
          title="New project"
          aria-label="New project"
        >
          <IconPlus size={17} />
        </button>
        <button
          onClick={() => setShowPublish(true)}
          disabled={!project.files["index.html"] || busy}
          className="btn-primary flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-30 disabled:shadow-none"
        >
          {project.publishedSlug ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" /> Live
            </>
          ) : (
            <>
              <IconRocket size={15} /> Publish
            </>
          )}
        </button>
        <div className="ml-1">
          <UserMenu compact />
        </div>
      </header>

      {/* phone-sized screens: switch between chat and preview */}
      <div className="md:hidden flex border-b hairline">
        {(["chat", "preview"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={`flex-1 py-2.5 text-sm ${mobileView === v ? "text-white border-b-2 border-brand-400" : "text-white/45"}`}
          >
            {v === "chat" ? "Chat" : "Preview"}
          </button>
        ))}
      </div>

      {showPublish && (
        <PublishDialog
          project={project}
          loggedIn={!!me?.user}
          flush={flushSave}
          onClose={() => setShowPublish(false)}
          onChange={(slug) => setProject((cur) => (cur ? { ...cur, publishedSlug: slug } : cur))}
        />
      )}

      <div className="flex-1 flex min-h-0">
        <ChatPanel
          messages={project.messages}
          assets={project.assets}
          busy={busy}
          onSend={(t, images) => send(t, { images })}
          onStop={() => abortRef.current?.abort()}
          live={live}
          className={mobileView === "chat" ? "flex" : "hidden md:flex"}
        />

        {/* ---------------- preview / code ---------------- */}
        <section className={`flex-1 flex-col min-w-0 ${mobileView === "preview" ? "flex" : "hidden md:flex"}`}>
          <div className="flex items-center gap-2 border-b hairline px-3 h-12 shrink-0">
            <div className="flex rounded-lg bg-white/5 p-0.5 text-sm">
              {(["preview", "code"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${tab === t ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"}`}
                >
                  {t === "preview" ? <IconEye size={15} /> : <IconCode size={15} />}
                  {t === "preview" ? "Preview" : "Code"}
                </button>
              ))}
            </div>

            {tab === "preview" && (
              <>
                {/* fake address bar with page switcher */}
                <div className="mx-auto hidden sm:flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/45">
                  <IconGlobe size={13} className="shrink-0" />
                  <span className="truncate">{project.publishedSlug ? `/s/${project.publishedSlug}/` : "preview"}</span>
                  <span className="text-white/20">/</span>
                  {pageCount > 1 ? (
                    <select
                      value={page}
                      onChange={(e) => setPage(e.target.value)}
                      className="min-w-0 bg-transparent text-white/80 outline-none"
                      aria-label="Page"
                    >
                      {pages.map((p) => (
                        <option key={p} value={p} className="bg-ink-800">
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-white/80">{page}</span>
                  )}
                </div>
                <div className="ml-auto sm:ml-0 hidden md:flex rounded-lg bg-white/5 p-0.5">
                  {(
                    [
                      ["desktop", IconMonitor, "Desktop"],
                      ["tablet", IconTablet, "Tablet"],
                      ["mobile", IconPhone, "Phone"],
                    ] as const
                  ).map(([d, Icon, label]) => (
                    <button
                      key={d}
                      onClick={() => setDevice(d)}
                      title={label}
                      aria-label={label}
                      className={`rounded-md px-2 py-1 transition ${device === d ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"}`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={openNewTab}
                  disabled={!hasFiles}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30"
                  title="Open preview in a new tab"
                  aria-label="Open preview in a new tab"
                >
                  <IconExternal size={15} />
                </button>
              </>
            )}
          </div>

          {errors.length > 0 && !busy && (
            <div className="flex items-center gap-3 border-b border-rose-500/20 bg-rose-500/[0.08] px-4 py-2 text-sm">
              <IconAlert size={16} className="shrink-0 text-rose-300" />
              <span className="truncate flex-1 text-rose-200/90">
                {errors.length} error{errors.length > 1 ? "s" : ""} in the preview: <span className="font-mono text-xs">{errors[0]}</span>
              </span>
              <button
                onClick={() => send(`Fix these errors that appeared on “${page}”:\n- ${errors.join("\n- ")}`, { isFix: true })}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-500/30"
              >
                <IconWand size={13} /> Fix it
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 relative">
            {tab === "preview" ? (
              hasFiles ? (
                <div className={`h-full overflow-auto flex justify-center ${device === "desktop" ? "bg-ink-900" : "bg-ink-950"}`}>
                  <iframe
                    key={page}
                    title="Preview"
                    srcDoc={previewDoc}
                    sandbox="allow-scripts allow-forms allow-modals allow-popups"
                    style={{
                      width: WIDTH[device],
                      maxWidth: "100%",
                      height: device === "desktop" ? "100%" : "calc(100% - 40px)",
                      marginTop: device === "desktop" ? 0 : 20,
                    }}
                    className={`shrink-0 bg-white transition-[width] duration-300 ${
                      device !== "desktop" ? "rounded-[28px] border-[10px] border-ink-600 shadow-[0_30px_80px_-20px_#000]" : ""
                    }`}
                  />
                </div>
              ) : (
                <EmptyPreview busy={busy} writing={live?.writing ?? null} />
              )
            ) : (
              <CodePane
                files={files}
                writing={live?.writing ?? null}
                writingContent={live?.writingContent ?? ""}
                readOnly={busy}
                onChange={(path, content) => update((p) => ({ ...p, files: { ...p.files, [path]: content } }))}
              />
            )}
            {busy && live?.writing && tab === "preview" && hasFiles && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 text-sm shadow-xl flex items-center gap-2 animate-fade-up">
                <IconLoader size={14} className="text-brand-300" /> Writing <span className="font-mono text-brand-200">{live.writing}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyPreview({ busy, writing }: { busy: boolean; writing: string | null }) {
  return (
    <div className="relative h-full grid place-items-center overflow-hidden">
      <div className="absolute inset-0 aurora opacity-60" />
      <div className="absolute inset-0 grid-bg" />
      <div className="relative text-center">
        {busy ? (
          <>
            <div className="mx-auto mb-6 w-fit animate-float"><LogoMark size={56} /></div>
            <p className="text-lg font-medium">Building your project…</p>
            <p className="mt-1 text-sm text-white/45">
              {writing ? (
                <>
                  Writing <span className="font-mono text-brand-200">{writing}</span>
                </>
              ) : (
                "Planning the structure and design"
              )}
            </p>
            <div className="mt-8 space-y-2.5 w-80 mx-auto">
              {[100, 80, 60].map((w) => (
                <div key={w} className="h-2.5 rounded-full shimmer mx-auto" style={{ width: `${w}%` }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border hairline bg-white/5 text-brand-300">
              <IconSparkles size={26} />
            </div>
            <p className="text-lg font-medium">Your preview will appear here</p>
            <p className="mt-1 text-sm text-white/45">Describe what you want in the chat to get started.</p>
          </>
        )}
      </div>
    </div>
  );
}

function SaveBadge({ loggedIn, state, error }: { loggedIn: boolean; state: string; error: string }) {
  if (!loggedIn) {
    return (
      <a href="/login" className="hidden lg:inline text-xs text-white/35 hover:text-white" title="This project is only saved in this browser">
        Saved locally · Log in to sync
      </a>
    );
  }
  if (state === "saving")
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-white/45">
        <IconLoader size={12} /> Saving…
      </span>
    );
  if (state === "error")
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-rose-300" title={error}>
        <IconAlert size={13} /> {error || "Couldn't save"}
      </span>
    );
  return (
    <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-white/40">
      <IconCloud size={13} /> Saved
    </span>
  );
}
