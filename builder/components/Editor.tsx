"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentEvent } from "../lib/events";
import type { ChatItem } from "../lib/store";

type ProjectData = {
  id: string;
  name: string;
  version: number;
  files: Record<string, string>;
  chat: ChatItem[];
};

export default function Editor({ id }: { id: string }) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [activeFile, setActiveFile] = useState<string>("App.js");
  const [previewKey, setPreviewKey] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
    if (!res.ok) {
      setNotFound(true);
      return null;
    }
    const data = (await res.json()) as ProjectData;
    setProject(data);
    setChat(data.chat);
    return data;
  }, [id]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;
      setBusy(true);
      setInput("");
      setPreviewError(null);
      setChat((c) => [...c, { role: "user", text: message }, { role: "assistant", text: "", files: [] }]);

      const update = (fn: (a: Extract<ChatItem, { role: "assistant" }>) => void) =>
        setChat((c) => {
          const copy = c.slice();
          const last = { ...(copy[copy.length - 1] as Extract<ChatItem, { role: "assistant" }>) };
          last.files = [...last.files];
          fn(last);
          copy[copy.length - 1] = last;
          return copy;
        });

      try {
        const res = await fetch(`/api/projects/${id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        if (!res.ok || !res.body) {
          update((a) => (a.error = res.status === 409 ? "هناك طلب قيد التنفيذ." : "تعذّر إرسال الرسالة."));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const e = JSON.parse(line) as AgentEvent;
            if (e.type === "text") update((a) => (a.text += e.text));
            else if (e.type === "file") update((a) => a.files.push(e.path));
            else if (e.type === "error") update((a) => (a.error = e.message));
          }
        }
      } catch {
        update((a) => (a.error = "انقطع الاتصال."));
      } finally {
        await load();
        setPreviewKey((k) => k + 1);
        setBusy(false);
      }
    },
    [busy, id, load],
  );

  // Load the project; on a fresh project, send the prompt from the landing page.
  useEffect(() => {
    load().then((data) => {
      if (!data || started.current) return;
      started.current = true;
      const first = sessionStorage.getItem(`first-prompt:${id}`);
      if (first && data.chat.length === 0) {
        sessionStorage.removeItem(`first-prompt:${id}`);
        send(first);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Errors thrown inside the preview iframe.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data as { source?: string; type?: string; message?: string };
      if (d?.source !== "bannaa-preview") return;
      if (d.type === "error") setPreviewError(d.message || "خطأ غير معروف");
      if (d.type === "ready") setPreviewError(null);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [chat]);

  if (notFound) {
    return (
      <div className="empty-state">
        المشروع غير موجود. <a href="/" style={{ color: "var(--accent)" }}>العودة للرئيسية</a>
      </div>
    );
  }

  const files = project?.files ?? {};
  const fileNames = Object.keys(files).sort((a, b) => (a === "App.js" ? -1 : b === "App.js" ? 1 : a.localeCompare(b)));
  const shownFile = files[activeFile] != null ? activeFile : fileNames[0];

  return (
    <div className="editor">
      <header className="editor-top">
        <a href="/" className="brand">
          <span className="brand-mark">ب</span>
        </a>
        <div className="title">{project?.name ?? "…"}</div>
        <span className="pill">الإصدار {project?.version ?? 0}</span>
      </header>

      <div className="editor-body">
        <aside className="chat">
          <div className="messages" ref={messagesRef}>
            {chat.length === 0 && !busy && <div className="empty-state">اكتب ما تريد بناءه.</div>}
            {chat.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="msg user">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="msg assistant">
                  {m.text ||
                    (busy && i === chat.length - 1 ? (
                      <span className="thinking">
                        <span className="dot" /> يفكّر ويكتب الكود…
                      </span>
                    ) : null)}
                  {m.files.length > 0 && (
                    <div className="files">
                      {Array.from(new Set(m.files)).map((f) => (
                        <span key={f} className="pill">
                          ✎ {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.error && <div className="err">{m.error}</div>}
                </div>
              ),
            )}
          </div>
          <div className="composer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                rows={1}
                value={input}
                placeholder="اطلب تعديلاً: أضف صفحة، غيّر الألوان…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                aria-label="رسالة"
              />
              <button className="btn btn-sm" type="submit" disabled={busy || !input.trim()}>
                إرسال
              </button>
            </form>
          </div>
        </aside>

        <section className="stage">
          <div className="tabs">
            <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>
              المعاينة
            </button>
            <button className={tab === "code" ? "active" : ""} onClick={() => setTab("code")}>
              الكود
            </button>
            <span className="spacer" />
            <button className="btn-ghost btn btn-sm" onClick={() => setPreviewKey((k) => k + 1)}>
              ↻ إعادة تحميل
            </button>
          </div>

          {tab === "preview" ? (
            <div className="preview-wrap">
              <div>
                {previewError && (
                  <div className="preview-error">
                    <div>
                      في التطبيق خطأ
                      <code>{previewError.split("\n")[0]}</code>
                    </div>
                    <button
                      className="btn btn-sm"
                      disabled={busy}
                      onClick={() => send(`ظهر هذا الخطأ في المعاينة، أصلحه:\n${previewError.slice(0, 1500)}`)}
                    >
                      أصلحه
                    </button>
                  </div>
                )}
                <div className="phone">
                  <div className="screen">
                  <div className="statusbar" aria-hidden="true">
                    <span>9:41</span>
                    <span>●●● ▮</span>
                  </div>
                  <iframe
                    key={`${previewKey}-${project?.version ?? 0}`}
                    src={`/preview/${id}?v=${project?.version ?? 0}-${previewKey}`}
                    title="معاينة التطبيق"
                    sandbox="allow-scripts allow-same-origin"
                  />
                  </div>
                </div>
              </div>
            </div>
          ) : fileNames.length === 0 ? (
            <div className="empty-state">لا توجد ملفات بعد.</div>
          ) : (
            <div className="code-view">
              <nav className="file-tree" aria-label="الملفات">
                {fileNames.map((f) => (
                  <button key={f} className={f === shownFile ? "active" : ""} onClick={() => setActiveFile(f)}>
                    {f}
                  </button>
                ))}
              </nav>
              <pre>{files[shownFile]}</pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
