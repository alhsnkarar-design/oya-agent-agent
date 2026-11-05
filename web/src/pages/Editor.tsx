import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "../i18n";
import { go, useRoute } from "../router";
import { Icon } from "../components/Icon";
import { getRow, saveProject } from "../lib/db";
import { takePending } from "../lib/pending";
import { createProject, fmt } from "../lib/newproject";
import { liveListen, pcmToBuffer, playBuffer, startRecording } from "../lib/audio";
import { ApiError, speak, type ChatMsg } from "../lib/api";
import { toast } from "../lib/toast";
import { applyAction, captionLines, outDuration, type Action, type Aspect, type Project } from "../editor/model";
import { Player } from "../editor/player";
import { autoEdit, command, voiceToText, type Step } from "../editor/ai";
import { describe } from "../editor/describe";
import "./editor.css";

type Msg = { role: "user" | "ai"; text: string; steps?: string[]; live?: Step | null; k?: number; at?: number };
type Live = { pause: () => void; resume: () => void; stop: () => void };

const VOICE = "Kore";

export default function Editor() {
  const { t, lang } = useT();
  const { params } = useRoute();
  const id = params.get("id");
  const [p, setP] = useState<Project | null>(null);
  const [file, setFile] = useState<Blob | null>(null);
  const [url, setUrl] = useState("");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [split, setSplit] = useState<number | null>(0.5);
  const [muted, setMuted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "ai", text: t.ai_hello }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<null | { stop: () => Promise<{ blob: Blob }>; cancel: () => void }>(null);
  const [live, setLive] = useState<null | "listening" | "thinking" | "speaking">(null);
  const [level, setLevel] = useState(0);
  const [exportK, setExportK] = useState<number | null>(null);
  const [tool, setTool] = useState<"select" | "cut">("select");
  const [selSeg, setSelSeg] = useState<number | null>(null);
  const undo = useRef<Project[]>([]);
  const redo = useRef<Project[]>([]);
  const history = useRef<ChatMsg[]>([]);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<Player | null>(null);
  const pRef = useRef<Project | null>(null);
  const liveRef = useRef<Live | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  pRef.current = p;

  /* load the project */
  useEffect(() => {
    if (!id) return;
    let u = "";
    (async () => {
      const row = await getRow(id);
      if (!row) { go("/editor"); return; }
      u = URL.createObjectURL(row.file);
      setFile(row.file); setUrl(u); setP(row.project);
      undo.current = []; redo.current = [];
    })();
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [id]);

  /* the player, once the video element has the file */
  useEffect(() => {
    if (!p || !url || !video.current || !canvas.current || player.current) return;
    const pl = new Player(video.current, canvas.current, p);
    pl.split = split;
    pl.onTime = (tt, pl2) => { setTime(tt); setPlaying(pl2); };
    player.current = pl;
    return () => { pl.destroy(); player.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, p === null]);

  useEffect(() => { if (player.current) { player.current.split = split; if (!playing) player.current.draw(); } }, [split, playing]);
  useEffect(() => { player.current?.setMuted(muted); }, [muted]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [msgs]);
  useEffect(() => () => { liveRef.current?.stop(); }, []);

  /* save after changes */
  useEffect(() => {
    if (!p) return;
    const h = setTimeout(() => void saveProject(p), 600);
    return () => clearTimeout(h);
  }, [p]);

  const commit = useCallback((next: Project) => {
    const cur = pRef.current;
    if (cur) { undo.current.push(cur); if (undo.current.length > 40) undo.current.shift(); }
    redo.current = [];
    setP(next); pRef.current = next;
    player.current?.setProject(next);
  }, []);

  const doUndo = () => { const prev = undo.current.pop(); if (!prev || !pRef.current) return; redo.current.push(pRef.current); setP(prev); player.current?.setProject(prev); };
  const doRedo = () => { const nx = redo.current.pop(); if (!nx || !pRef.current) return; undo.current.push(pRef.current); setP(nx); player.current?.setProject(nx); };
  const act = (a: Action) => { if (pRef.current) commit(applyAction(pRef.current, a)); };

  function errText(e: unknown) {
    if (e instanceof ApiError) {
      if (e.code === "quota") return t.err_quota;
      if (e.status === 402 || e.status === 503 || e.code === "ai_unavailable" || e.code === "not_configured") return t.err_ai_off;
    }
    if (e instanceof Error && e.message === "no_speech") return lang === "ar" ? "مفيش كلام في الفيديو ده أدبلجه." : "There is no speech in this video to dub.";
    return t.err_generic;
  }

  /** Run one request through Zifidit.Ai and show its reply with a checklist of changes. */
  const run = useCallback(async (text: string, opts: { auto?: boolean; speakReply?: boolean } = {}) => {
    const cur = pRef.current;
    if (!cur || !file) { toast(t.need_video); return; }
    const started = performance.now();
    setBusy(true);
    setMsgs((m) => [...m, ...(text ? [{ role: "user" as const, text }] : []), { role: "ai", text: "", live: "step_plan", at: started }]);
    const onStep = (s: Step | null, k?: number) => setMsgs((m) => { const c = [...m]; c[c.length - 1] = { ...c[c.length - 1], live: s, k }; return c; });
    try {
      const r = opts.auto
        ? await autoEdit(cur, file, lang, onStep, text)
        : await command(cur, file, history.current, text, lang, VOICE, onStep);
      const steps = describe(cur, r.p, lang);
      if (r.p !== cur) commit(r.p);
      history.current.push({ role: "user", content: text || "auto edit" }, { role: "assistant", content: r.reply });
      const secs = (performance.now() - started) / 1000;
      setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "ai", text: r.reply, steps, at: secs }; return c; });
      if (opts.speakReply && r.reply) {
        setLive("speaking");
        try { const s = await speak(r.reply.slice(0, 600), VOICE, "Friendly, quick, conversational."); await playBuffer(pcmToBuffer(s.pcm, s.rate)); } catch { /* the text reply is enough */ }
      }
    } catch (e) {
      setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "ai", text: errText(e) }; return c; });
    } finally {
      setBusy(false);
    }
  }, [file, lang, t, commit]);

  /* a request typed on the home page */
  useEffect(() => {
    if (!p || !file || !id) return;
    const pend = takePending(id);
    if (!pend) return;
    (async () => {
      let text = pend.text;
      if (pend.voice) { try { text = (await voiceToText(pend.voice)) || text; } catch (e) { toast(errText(e), true); } }
      const hint = pend.target ? (lang === "ar" ? ` (اللغة المطلوبة: ${pend.target})` : ` (target language: ${pend.target})`) : "";
      if (!text) await run(hint.trim(), { auto: true });
      else await run(text + hint);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p === null, file]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await run(text);
  }

  async function toggleVoiceMsg() {
    if (rec) {
      const r = await rec.stop(); setRec(null);
      try { const text = await voiceToText(r.blob); if (text) await run(text); } catch (e) { toast(errText(e), true); }
      return;
    }
    try { setRec(await startRecording()); } catch { toast(t.err_mic, true); }
  }

  async function toggleLive() {
    if (liveRef.current) { liveRef.current.stop(); liveRef.current = null; setLive(null); return; }
    try {
      const ctl = await liveListen(async (blob) => {
        ctl.pause(); setLive("thinking");
        try {
          const text = await voiceToText(blob);
          if (text) await run(text, { speakReply: true });
        } catch (e) { toast(errText(e), true); }
        if (liveRef.current) { setLive("listening"); ctl.resume(); }
      }, setLevel);
      liveRef.current = ctl; setLive("listening");
    } catch { toast(t.err_mic, true); }
  }

  async function onUpload(f: File) {
    try { const nid = await createProject(f); location.href = "/editor?id=" + nid; }
    catch { toast(t.err_video, true); }
  }

  async function download() {
    const pl = player.current;
    if (!pl || exportK !== null) return;
    toast(t.export_note, false, 6000);
    setExportK(0);
    try {
      const { blob, ext } = await pl.export((k) => setExportK(k));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `${pRef.current?.name ?? "zifidit"}-zifidit.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
      toast(t.export_done);
    } catch { toast(t.err_generic, true); }
    finally { setExportK(null); pl.split = split; pl.draw(); }
  }

  const D = p ? outDuration(p) : 0;
  const caps = useMemo(() => (p && p.captions.on ? captionLines(p) : []), [p]);

  /* ---------- no project yet: upload ---------- */
  if (!id) {
    return (
      <main className="editor-empty wrap">
        <label className="drop card" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void onUpload(f); }}>
          <Icon n="film" size={42} />
          <h1>{t.upload_title}</h1>
          <p className="muted">{t.upload_sub}</p>
          <span className="btn amber">{t.choose_file}</span>
          <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); }} />
        </label>
      </main>
    );
  }

  const stepLabel = (m: Msg) => (m.live ? t[m.live] + (m.k !== undefined ? ` ${Math.round(m.k * 100)}%` : "") + "…" : "");
  const aspects: [Aspect, string][] = [["9:16", "phone"], ["1:1", "square"], ["16:9", "wide"]];

  return (
    <main className="editor">
      {/* ---------- Zifidit.Ai ---------- */}
      <aside className="chat card" aria-label="Zifidit.Ai">
        <div className="chat-head"><span className="spark"><Icon n="spark" /></span><strong>Zifidit.Ai</strong>
          {live && <span className={"live-pill " + live}>{live === "listening" ? t.listening : live === "thinking" ? t.thinking : t.speaking}</span>}
        </div>
        <div className="msgs">
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} className="m user"><span className="av"><Icon n="user" /></span><p dir="auto">{m.text}</p></div>
          ) : (
            <div key={i} className="m ai">
              <span className="av ai"><Icon n="spark" /></span>
              <div className="body">
                {m.text && <p dir="auto">{m.text}</p>}
                {m.live && <div className="steps"><div className="st run"><span className="spin" />{stepLabel(m)}</div></div>}
                {m.steps && m.steps.length > 0 && (
                  <div className="steps">
                    {m.steps.map((s, j) => <div key={j} className="st"><span className="ok"><Icon n="check" /></span><span dir="auto">{s}</span><span className="tm">0:{String(Math.max(1, Math.round(((m.at ?? 1) * (j + 1)) / m.steps!.length))).padStart(2, "0")}</span></div>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEnd} />
        </div>
        <div className="quick">
          <button className="q" disabled={busy || !p} onClick={() => void run(lang === "ar" ? "اعمل مونتاج تلقائي احترافي" : "Auto edit it professionally", { auto: true })}>{lang === "ar" ? "مونتاج تلقائي" : "Auto edit"}</button>
          <button className="q" disabled={busy || !p} onClick={() => void run(lang === "ar" ? "شيل السكتات" : "Cut the silences")}>{lang === "ar" ? "شيل السكتات" : "Cut silences"}</button>
          <button className="q" disabled={busy || !p} onClick={() => void run(lang === "ar" ? "حط كابشن كلمة كلمة" : "Add word-by-word captions")}>{lang === "ar" ? "كابشن" : "Captions"}</button>
          <button className="q" disabled={busy || !p} onClick={() => setInput(lang === "ar" ? "دبلجه للإنجليزي" : "Dub it to Arabic")}>{lang === "ar" ? "دبلجة" : "Dub"}</button>
        </div>
        <div className="composer">
          <button className="ib" onClick={() => fileInput.current?.click()} aria-label={t.attach} title={t.attach}><Icon n="clip" /></button>
          <input ref={fileInput} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.target.value = ""; }} />
          <label className="sr" htmlFor="cmd">{t.cmd_ph}</label>
          <textarea id="cmd" rows={1} value={input} placeholder={t.cmd_ph} disabled={busy || !!live} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} />
          {input.trim() ? (
            <button className="ib send" onClick={() => void send()} disabled={busy} aria-label={t.send}><Icon n="send" /></button>
          ) : (
            <button className={"ib" + (rec ? " rec" : "")} onClick={() => void toggleVoiceMsg()} disabled={busy || !!live} aria-label={t.record} title={t.record}><Icon n={rec ? "stop" : "mic"} /></button>
          )}
        </div>
        <button className={"live-btn" + (live ? " on" : "")} onClick={() => void toggleLive()} disabled={!p}>
          <span className="lvl" style={{ transform: `scale(${1 + level * 0.8})` }} />
          <Icon n={live ? "stop" : "mic"} /> {live ? t.stop_live : t.talk_live}
        </button>
      </aside>

      {/* ---------- preview ---------- */}
      <section className="stage">
        <div className="bar">
          <button className="btn sm" onClick={doUndo} disabled={!undo.current.length}><Icon n="undo" /> {t.undo}</button>
          <button className="btn sm icon" onClick={doRedo} disabled={!redo.current.length} aria-label={t.redo}><Icon n="redo" /></button>
          <div className="aspects" role="group" aria-label="aspect">
            {aspects.map(([a, ic]) => <button key={a} className={p?.aspect === a ? "on" : ""} onClick={() => act({ type: "set_aspect", ratio: a })}><Icon n={ic} /> {a}</button>)}
          </div>
          <span className="grow" />
          <button className="btn amber" onClick={() => void download()} disabled={!p || exportK !== null}>
            <Icon n="dl" /> {exportK !== null ? `${Math.round(exportK * 100)}%` : t.download}
          </button>
        </div>
        <div className={"screen card a" + (p?.aspect ?? "16:9").replace(":", "x")}>
          <canvas ref={canvas} className="cv"
            onPointerDown={(e) => { if (split === null) return; const r = e.currentTarget.getBoundingClientRect(); const move = (x: number) => setSplit(Math.max(0.02, Math.min(0.98, (x - r.left) / r.width))); move(e.clientX); const mv = (ev: PointerEvent) => move(ev.clientX); const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); }; window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); }} />
          {split !== null && (
            <>
              <span className="lab before">{t.before}</span>
              <span className="lab after">{t.after}</span>
              <span className="handle" style={{ left: `${split * 100}%` }}><Icon n="chev" /><Icon n="chev" /></span>
            </>
          )}
          {exportK !== null && <div className="exporting"><span className="spin" /> {t.exporting} {Math.round(exportK * 100)}%</div>}
          <video ref={video} src={url || undefined} playsInline preload="auto" crossOrigin="anonymous" className="src" />
        </div>
        <div className="controls card">
          <button className="ib" onClick={() => player.current && (playing ? player.current.pause() : void player.current.play())} aria-label="play">
            <Icon n={playing ? "pause" : "play"} />
          </button>
          <span className="tc" dir="ltr">{fmt(time)} / {fmt(D)}</span>
          <span className="grow" />
          <button className={"ib" + (split !== null ? " on" : "")} onClick={() => setSplit(split === null ? 0.5 : null)} title={`${t.before} / ${t.after}`}><Icon n="frame" /></button>
          <button className={"ib" + (muted ? "" : " on")} onClick={() => setMuted(!muted)} aria-label="volume"><Icon n="vol" /></button>
          <button className={"ib" + (p?.captions.on ? " on" : "")} onClick={() => act({ type: "captions", on: !p?.captions.on })} aria-label={t.captions_on}><Icon n="cc" /></button>
          <button className="ib" onClick={() => void canvas.current?.requestFullscreen?.()} aria-label="fullscreen"><Icon n="full" /></button>
        </div>
      </section>

      {/* ---------- timeline ---------- */}
      <section className="timeline card">
        <div className="tools">
          <button className={tool === "select" ? "on" : ""} onClick={() => setTool("select")} aria-label="select"><Icon n="cursor" /></button>
          <button className={tool === "cut" ? "on" : ""} onClick={() => setTool("cut")} aria-label="cut"><Icon n="cut" /></button>
          <button disabled={selSeg === null} onClick={() => { if (selSeg !== null) { act({ type: "remove_segment", index: selSeg }); setSelSeg(null); } }} aria-label="delete"><Icon n="trash" /></button>
        </div>
        <Timeline p={p} D={D} time={time} caps={caps} tool={tool} selSeg={selSeg}
          onSeek={(x) => player.current?.seek(x)}
          onCut={(x) => act({ type: "split_at", at: x })}
          onSelect={setSelSeg}
          labels={{ v: t.track_video, c: t.track_captions, m: t.track_motion, d: t.track_dub }} />
      </section>
    </main>
  );
}

function Timeline({ p, D, time, caps, tool, selSeg, onSeek, onCut, onSelect, labels }: {
  p: Project | null; D: number; time: number; caps: { s: number; e: number; text: string }[]; tool: string; selSeg: number | null;
  onSeek: (t: number) => void; onCut: (t: number) => void; onSelect: (i: number | null) => void; labels: { v: string; c: string; m: string; d: string };
}) {
  const lane = useRef<HTMLDivElement>(null);
  if (!p || D <= 0) return <div className="tl-empty" />;
  const pct = (x: number) => `${(x / D) * 100}%`;
  const step = D <= 20 ? 2 : D <= 60 ? 10 : D <= 300 ? 30 : 60;
  const ticks: number[] = []; for (let x = 0; x <= D + 0.001; x += step) ticks.push(x);
  const tAt = (clientX: number) => {
    const r = lane.current!.getBoundingClientRect();
    const k = (clientX - r.left) / r.width;
    return Math.max(0, Math.min(D, k * D));
  };
  let acc = 0;
  const segs = p.segs.map((g, i) => { const s = acc; acc += g.e - g.s; return { i, s, e: acc }; });
  const down = (e: React.PointerEvent) => {
    const x = tAt(e.clientX);
    if (tool === "cut") { onCut(x); return; }
    onSeek(x);
    const mv = (ev: PointerEvent) => onSeek(tAt(ev.clientX));
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  return (
    <div className="tl">
      <div className="names">
        <span />
        <span><Icon n="film" /> {labels.v}</span>
        <span><Icon n="cc" /> {labels.c}</span>
        <span><Icon n="layers" /> {labels.m}</span>
        <span><Icon n="wave" /> {labels.d}</span>
      </div>
      <div className={"lanes" + (tool === "cut" ? " cutting" : "")} ref={lane} onPointerDown={down} dir="ltr">
        <div className="ruler">
          {ticks.map((x) => <span key={x} className="tick" style={{ insetInlineStart: pct(x) }}><i dir="ltr">{fmt(x)}</i></span>)}
        </div>
        <div className="trow v">
          {segs.map((s) => (
            <span key={s.i} className={"clip" + (selSeg === s.i ? " sel" : "")} style={{ insetInlineStart: pct(s.s), width: pct(s.e - s.s) }}
              onPointerDown={(e) => { if (tool === "select") { e.stopPropagation(); onSelect(s.i); onSeek(tAt(e.clientX)); } }} />
          ))}
        </div>
        <div className="trow c">
          {caps.map((c, i) => <span key={i} className="cap" style={{ insetInlineStart: pct(c.s), width: pct(Math.max(0.2, c.e - c.s)) }} dir="auto">{c.text}</span>)}
        </div>
        <div className="trow m">
          {p.overlays.map((o) => <span key={o.id} className="ov" style={{ insetInlineStart: pct(o.s), width: pct(Math.max(0.3, o.e - o.s)) }} dir="auto"><b className="dia" /><em>{o.text}</em><b className="dia end" /></span>)}
          {p.zooms.map((z, i) => <b key={"z" + i} className="dia z" style={{ insetInlineStart: pct(z.t) }} />)}
          {p.trans.map((x, i) => <b key={"t" + i} className="dia tr" style={{ insetInlineStart: pct(x.t) }} />)}
        </div>
        <div className="trow d">
          {p.dub ? p.dub.clips.map((c, i) => <span key={i} className="dub" style={{ insetInlineStart: pct(c.t), width: pct(Math.max(0.3, c.dur)) }} />) : <span className="wave-bg" />}
          {p.sfx.map((s, i) => <b key={"s" + i} className="fx" style={{ insetInlineStart: pct(s.t) }} title={s.kind} />)}
        </div>
        <span className="head" style={{ insetInlineStart: pct(time) }} />
      </div>
    </div>
  );
}
