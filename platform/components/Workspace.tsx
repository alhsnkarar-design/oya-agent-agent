"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyChanges, parseOutput, type FileMap, type ParsedOutput } from "@/lib/parse";
import { buildPreview, htmlPages, resolveNavigation } from "@/lib/preview";
import {
  getProject,
  newProject,
  projectNameFrom,
  saveProject,
  uid,
  type Message,
  type Project,
} from "@/lib/storage";
import { Logo } from "./Logo";
import { ChatPanel } from "./ChatPanel";
import { CodePane } from "./CodePane";

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
  const abortRef = useRef<AbortController | null>(null);
  const projectRef = useRef<Project | null>(null);
  const autoFixRef = useRef<{ armed: boolean; used: number }>({ armed: false, used: 0 });
  const startedRef = useRef(false);

  projectRef.current = project;

  const update = useCallback((fn: (p: Project) => Project) => {
    setProject((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveProject(next);
      return next;
    });
  }, []);

  // ---- provider info
  useEffect(() => {
    fetch("/api/generate")
      .then((r) => r.json())
      .then((j) => setProvider(j.provider))
      .catch(() => {});
  }, []);

  // ---- streaming generation
  const send = useCallback(
    async (prompt: string, opts: { isFix?: boolean } = {}) => {
      const p = projectRef.current;
      if (!p || !prompt.trim()) return;
      const baseFiles = p.files;
      const isEdit = Object.keys(baseFiles).length > 0;
      const userMsg: Message = { id: uid(), role: "user", content: prompt, at: Date.now() };
      const botId = uid();
      const history = p.messages.map((m) => ({ role: m.role, content: m.content }));
      update((pr) => ({
        ...pr,
        name: pr.messages.length ? pr.name : projectNameFrom(prompt),
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
          body: JSON.stringify({ prompt, files: baseFiles, history }),
        });
        if (res.status === 401) {
          const code = window.prompt("هذه المنصة محمية. أدخل رمز الدخول:");
          if (code) localStorage.setItem("bannaa:access-code", code);
          throw new Error("رمز الدخول مطلوب — أعد المحاولة بعد إدخاله");
        }
        if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || `خطأ ${res.status}`);
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
      if (status.stop === "max_tokens") content += "\n\n⚠️ توقف التوليد لأن الناتج طويل جداً. اطلب «أكمل» أو قسّم الطلب.";
      if (status.stop === "refusal") content += "\n\n⚠️ تعذّر تنفيذ هذا الطلب.";
      if (status.stop === "aborted") content += "\n\n⏹️ تم الإيقاف.";
      if (status.error) content += `\n\n❌ ${status.error}`;
      if (!content.trim()) content = "لم أتمكن من توليد ملفات. حاول إعادة صياغة الطلب.";

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
        autoFixRef.current.armed = true;
      }
    },
    [update, page],
  );

  // ---- load / create project
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const id = params.get("id");
    const existing = id ? getProject(id) : null;
    if (existing) {
      setProject(existing);
      return;
    }
    const p = newProject();
    saveProject(p);
    projectRef.current = p;
    setProject(p);
    router.replace(`/build?id=${p.id}`);
    const pending = sessionStorage.getItem("bannaa:pending-prompt");
    if (pending) {
      sessionStorage.removeItem("bannaa:pending-prompt");
      setTimeout(() => send(pending), 0);
    }
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
      send(`🩺 إصلاح تلقائي: ظهرت هذه الأخطاء عند تشغيل الصفحة «${page}». أصلح السبب الجذري:\n- ${errors.join("\n- ")}`, { isFix: true });
    }, 1500);
    return () => clearTimeout(t);
  }, [errors, busy, page, send]);

  const files = useMemo(() => {
    if (!project) return {};
    if (!live) return project.files;
    const merged = Object.keys(project.files).length ? applyChanges(project.files, live) : live.files;
    return merged;
  }, [project, live]);

  const previewDoc = useMemo(() => buildPreview(files, page), [files, page]);
  const pages = useMemo(() => htmlPages(files), [files]);
  const hasFiles = Object.keys(files).length > 0;

  const downloadZip = async () => {
    if (!project) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(project.name.replace(/[\\/:*?"<>|]/g, "-")) ?? zip;
    for (const [p, c] of Object.entries(project.files)) folder.file(p, c);
    folder.file(
      "README.md",
      `# ${project.name}\n\nتم إنشاؤه بواسطة بنّاء.\n\n## التشغيل\nافتح index.html في المتصفح.\n\n## النشر\n- Netlify Drop: اسحب المجلد إلى https://app.netlify.com/drop\n- GitHub Pages / Vercel / Cloudflare Pages: ارفع الملفات كما هي (لا يحتاج بناء).\n`,
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

  if (!project) return <div className="h-screen grid place-items-center text-white/50">جارٍ التحميل…</div>;

  return (
    <div className="h-screen flex flex-col bg-ink-950">
      {/* top bar */}
      <header className="flex items-center gap-3 border-b border-ink-700 px-4 h-14 shrink-0">
        <Logo small />
        <span className="text-white/20">/</span>
        <input
          value={project.name}
          onChange={(e) => update((p) => ({ ...p, name: e.target.value }))}
          className="bg-transparent outline-none font-semibold min-w-0 w-48 focus:bg-ink-800 rounded px-2 py-1"
          aria-label="اسم المشروع"
        />
        {provider === "demo" && (
          <span className="hidden md:inline text-xs rounded-full bg-amber-500/15 text-amber-300 px-3 py-1">
            وضع تجريبي — أضف مفتاح AI لتفعيل التوليد الحقيقي
          </span>
        )}
        <div className="flex-1" />
        <div className="relative">
          <button
            onClick={() => setShowVersions((v) => !v)}
            disabled={!project.versions.length}
            className="text-sm rounded-lg px-3 py-1.5 hover:bg-ink-800 disabled:opacity-30"
          >
            🕘 النسخ ({project.versions.length})
          </button>
          {showVersions && (
            <div className="absolute left-0 top-10 z-20 w-72 panel rounded-xl p-2 max-h-80 overflow-auto scroll-thin shadow-2xl">
              {[...project.versions].reverse().map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    update((p) => ({
                      ...p,
                      files: v.files,
                      versions: [...p.versions, { id: uid(), at: Date.now(), label: `استعادة: ${v.label}`, files: v.files }],
                    }));
                    setShowVersions(false);
                    setPage("index.html");
                  }}
                  className="w-full text-right rounded-lg px-3 py-2 hover:bg-ink-700"
                >
                  <div className="text-sm truncate">{i === 0 ? "● " : ""}{v.label}</div>
                  <div className="text-xs text-white/40">{new Date(v.at).toLocaleString("ar")}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={downloadZip} disabled={!hasFiles || busy} className="text-sm rounded-lg px-3 py-1.5 hover:bg-ink-800 disabled:opacity-30">
          ⬇️ تحميل ZIP
        </button>
        <button onClick={() => router.push("/")} className="text-sm rounded-lg btn-primary px-3 py-1.5">
          + جديد
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        <ChatPanel messages={project.messages} busy={busy} onSend={(t) => send(t)} onStop={() => abortRef.current?.abort()} live={live} />

        {/* preview / code */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 border-b border-ink-700 px-3 h-12 shrink-0">
            <div className="flex rounded-lg bg-ink-800 p-0.5 text-sm">
              {(["preview", "code"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1 ${tab === t ? "bg-ink-600" : "text-white/60"}`}>
                  {t === "preview" ? "👁️ معاينة" : "</> الكود"}
                </button>
              ))}
            </div>
            {tab === "preview" && (
              <>
                <div className="flex rounded-lg bg-ink-800 p-0.5 text-sm">
                  {(["desktop", "tablet", "mobile"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDevice(d)}
                      title={d}
                      className={`rounded-md px-2.5 py-1 ${device === d ? "bg-ink-600" : "text-white/60"}`}
                    >
                      {d === "desktop" ? "🖥️" : d === "tablet" ? "📱" : "📲"}
                    </button>
                  ))}
                </div>
                {pages.length > 1 && (
                  <select
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                    className="bg-ink-800 rounded-lg px-2 py-1 text-sm outline-none"
                    aria-label="الصفحة"
                  >
                    {pages.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
                <div className="flex-1" />
                <button onClick={openNewTab} disabled={!hasFiles} className="text-sm rounded-lg px-3 py-1 hover:bg-ink-800 disabled:opacity-30">
                  ↗ فتح في نافذة
                </button>
              </>
            )}
          </div>

          {errors.length > 0 && !busy && (
            <div className="flex items-center gap-3 bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-sm">
              <span className="text-red-300 truncate flex-1">⚠️ {errors.length} خطأ في المعاينة: {errors[0]}</span>
              <button
                onClick={() => send(`أصلح هذه الأخطاء التي ظهرت في صفحة «${page}»:\n- ${errors.join("\n- ")}`, { isFix: true })}
                className="rounded-lg bg-red-500/20 px-3 py-1 hover:bg-red-500/30 shrink-0"
              >
                🩺 أصلحها
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 relative">
            {tab === "preview" ? (
              hasFiles ? (
                <div className="h-full overflow-auto bg-ink-900 grid justify-items-center">
                  <iframe
                    key={page}
                    title="معاينة"
                    srcDoc={previewDoc}
                    sandbox="allow-scripts allow-forms allow-modals allow-popups"
                    style={{ width: WIDTH[device] }}
                    className={`h-full bg-white transition-all ${device !== "desktop" ? "my-4 rounded-2xl border-8 border-ink-700 shadow-2xl" : ""}`}
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
            {busy && live?.writing && tab === "preview" && (
              <div className="absolute bottom-4 left-4 panel rounded-xl px-4 py-2 text-sm shadow-xl">
                ✍️ يكتب <span className="font-mono text-brand-300">{live.writing}</span>
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
    <div className="h-full grid place-items-center glow-bg">
      <div className="text-center">
        {busy ? (
          <>
            <div className="mx-auto mb-5 h-14 w-14 rounded-2xl btn-primary grid place-items-center text-2xl animate-pulse">ب</div>
            <p className="text-white/70">بنّاء يصمّم مشروعك…</p>
            {writing && <p className="mt-2 font-mono text-sm text-brand-300">{writing}</p>}
            <div className="mt-6 space-y-2 w-72 mx-auto">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 rounded shimmer" style={{ width: `${90 - i * 20}%` }} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🧱</div>
            <p className="text-white/60">صِف ما تريد بناءه في المحادثة وستظهر المعاينة هنا</p>
          </>
        )}
      </div>
    </div>
  );
}
