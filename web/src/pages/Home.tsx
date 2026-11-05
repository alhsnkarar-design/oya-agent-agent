import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";
import { go, linkProps } from "../router";
import { Icon } from "../components/Icon";
import { startRecording } from "../lib/audio";
import { createProject, fmt } from "../lib/newproject";
import { setPending } from "../lib/pending";
import { toast } from "../lib/toast";
import "./home.css";

export const TARGETS = ["العربية (مصري)", "العربية (خليجي)", "العربية (شامي)", "العربية (فصحى)", "English", "Español", "Français", "Deutsch", "Türkçe", "Português", "Italiano", "हिन्दी", "Bahasa Indonesia", "Русский", "中文", "日本語", "한국어", "اردو", "فارسی"];

const GALLERY = [
  { src: "/gallery/g0.webp", ar: "مونتاج تلقائي", en: "Auto edit", dur: "0:44" },
  { src: "/gallery/g1.webp", ar: "موشن", en: "Motion", dur: "0:44" },
  { src: "/gallery/g2.webp", ar: "تعديل بالصوت", en: "Voice edit", dur: "0:44" },
  { src: "/gallery/g3.webp", ar: "كابشن بالعامية", en: "Dialect captions", dur: "0:44" },
  { src: "/gallery/g4.webp", ar: "9:16 · 1:1 · 16:9", en: "9:16 · 1:1 · 16:9", dur: "0:44" },
  { src: "/gallery/g5.webp", ar: "موشن 3D", en: "3D motion", dur: "0:24" },
] as const;

export function Home() {
  const { t, lang } = useT();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dur, setDur] = useState(0);
  const [thumb, setThumb] = useState("");
  const [target, setTarget] = useState(lang === "ar" ? TARGETS[0] : "English");
  const [rec, setRec] = useState<null | { stop: () => Promise<{ blob: Blob }>; cancel: () => void }>(null);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true; v.preload = "metadata"; v.src = url;
    v.onloadedmetadata = () => { setDur(v.duration); v.currentTime = Math.min(1, v.duration / 3); };
    v.onseeked = () => { const c = document.createElement("canvas"); c.width = 160; c.height = 90; c.getContext("2d")!.drawImage(v, 0, 0, 160, 90); setThumb(c.toDataURL("image/jpeg", 0.7)); };
    v.onerror = () => { toast(t.err_video, true); setFile(null); };
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function toggleRec() {
    if (rec) { const r = await rec.stop(); setRec(null); setVoice(r.blob); return; }
    try { setRec(await startRecording()); } catch { toast(t.err_mic, true); }
  }

  async function start(prompt = text) {
    if (!file) { toast(t.need_video); input.current?.click(); return; }
    setBusy(true);
    try {
      const id = await createProject(file);
      setPending({ id, text: prompt.trim(), voice: voice ?? undefined, target });
      go("/editor?id=" + id);
    } catch { toast(t.err_video, true); setBusy(false); }
  }

  const chip = (label: string, cmd: string) => (
    <button className="chip" onClick={() => { setText(cmd); if (file) void start(cmd); else input.current?.click(); }}>{label}</button>
  );

  return (
    <main className="home">
      <section className="hero wrap">
        <h1 className="h-display">
          {t.hero_title_a} {t.hero_title_b} <span className="swoosh">{t.hero_title_c}</span>
        </h1>
        <p className="sub">{t.hero_sub}</p>

        <div className="prompt card" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("video/")) setFile(f); }}>
          <label className="sr" htmlFor="hero-prompt">{t.prompt_ph}</label>
          <textarea id="hero-prompt" rows={2} value={text} placeholder={t.prompt_ph} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void start(); } }} />
          <div className="row">
            {file ? (
              <div className="file">
                {thumb ? <img src={thumb} alt="" /> : <span className="ph"><Icon n="film" /></span>}
                <span className="name" dir="auto">{file.name}</span>
                <span className="dur">{dur ? fmt(dur) : ""}</span>
                <button className="x" onClick={() => { setFile(null); setThumb(""); }} aria-label="remove"><Icon n="x" /></button>
              </div>
            ) : (
              <button className="file add" onClick={() => input.current?.click()}><Icon n="clip" /> {t.attach}</button>
            )}
            <input ref={input} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = ""; }} />
            <span className="grow" />
            <button className={"round" + (rec ? " live" : voice ? " has" : "")} onClick={() => void toggleRec()} aria-label={t.record} title={t.record}>
              <Icon n={rec ? "stop" : "mic"} />
            </button>
            <label className="sr" htmlFor="hero-lang">language</label>
            <select id="hero-lang" className="lang-select" value={target} onChange={(e) => setTarget(e.target.value)}>
              {TARGETS.map((x) => <option key={x}>{x}</option>)}
            </select>
            <button className="go" onClick={() => void start()} disabled={busy} aria-label={t.send}><Icon n="send" /></button>
          </div>
        </div>

        <div className="chips">
          {chip(t.chip_reel, t.chip_reel)}
          {chip(t.chip_dub, t.chip_dub)}
          {chip(t.chip_resize, t.chip_resize)}
        </div>
      </section>

      <section className="gallery wrap" aria-label="examples">
        {GALLERY.map((g, i) => (
          <figure key={i} className={"g g" + i}>
            <img src={g.src} alt="" loading="lazy" />
            <span className={"tag" + (i % 2 ? " amber" : "")}>{lang === "ar" ? g.ar : g.en}</span>
            <span className="time">{g.dur}</span>
          </figure>
        ))}
      </section>

      <section className="features wrap" id="features">
        <h2 className="h2">{t.features_title}</h2>
        <div className="fgrid">
          {(["f1", "f2", "f3", "f4", "f5", "f6"] as const).map((k, i) => (
            <article key={k} className="card f">
              <span className="n">{["film", "mic", "cc", "dub", "spark", "frame"].map((n) => <Icon key={n} n={n} />)[i]}</span>
              <h3>{t[`${k}_t`]}</h3>
              <p>{t[`${k}_p`]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq wrap" id="faq">
        <h2 className="h2">{t.faq_title}</h2>
        <Faq />
        <div className="cta-row"><a className="btn amber" {...linkProps("/editor")}>{t.get_started}</a><a className="btn" {...linkProps("/pricing")}>{t.nav_pricing}</a></div>
      </section>
      <footer className="foot wrap"><span className="logo">Zifidit</span><span className="muted">© {new Date().getFullYear()} Zifidit · {t.footer_rights}</span></footer>
    </main>
  );
}

export function Faq() {
  const { t } = useT();
  return (
    <div className="faq-list">
      {(["1", "2", "3", "4"] as const).map((n, i) => (
        <details key={n} className="card" open={i === 0}>
          <summary>{t[`q${n}`]}<Icon n="chev" /></summary>
          <p>{t[`a${n}`]}</p>
        </details>
      ))}
    </div>
  );
}
