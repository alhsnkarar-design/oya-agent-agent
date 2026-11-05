// The edit model. Source time = position in the uploaded file. Output time = position in the edited video.
// `segs` lists the source ranges that are kept, in order; everything else is derived from them.
import type { Word } from "../lib/api";
import { SFX_KINDS, type SfxKind } from "../lib/sfx";

export type Aspect = "9:16" | "1:1" | "16:9";
export type Grade = "none" | "warm" | "cool" | "cinematic" | "vivid" | "bw" | "fade";
export type CapStyle = "karaoke" | "bold" | "minimal" | "boxed";
export type Pos = "top" | "center" | "bottom";
export type Anim = "pop" | "slide" | "type" | "kinetic";
export type Seg = { s: number; e: number };
export type Overlay = { id: string; kind: "title" | "motion"; text: string; s: number; e: number; size: number; color: string; pos: Pos; anim: Anim; box: boolean };
export type Zoom = { t: number; d: number; scale: number };
export type Trans = { t: number; kind: "whip" | "flash" | "fade" };
export type Sfx = { t: number; kind: SfxKind; vol: number };
export type CapLine = { s: number; e: number; text: string; words?: Word[] };
export type DubClip = { t: number; dur: number; text: string; pcm: ArrayBuffer; rate: number };
export type FxKind = "shake" | "glow" | "light_leak" | "rgb_split" | "blur_in" | "punch" | "film_grain";
export const FX_KINDS: FxKind[] = ["shake", "glow", "light_leak", "rgb_split", "blur_in", "punch", "film_grain"];
export type Fx = { t: number; d: number; kind: FxKind; k: number };

export type Project = {
  id: string; name: string; createdAt: number; updatedAt: number;
  duration: number; width: number; height: number;
  words: Word[]; transcribed: boolean; language?: string;
  silences: Seg[];
  segs: Seg[]; aspect: Aspect; grade: Grade;
  captions: { on: boolean; style: CapStyle; color: string; pos: Pos; size: number; lines: CapLine[] | null; lang?: string };
  overlays: Overlay[]; zooms: Zoom[]; trans: Trans[]; sfx: Sfx[];
  dub: { lang: string; voice: string; clips: DubClip[] } | null;
  /** visual effects (shake, glow, light leaks, ...) */
  fx: Fx[];
  /** voice-over narration clips added on top of the original sound */
  vo: DubClip[];
  /** clean up the speaker's voice (rumble cut, presence, leveling) */
  enhance: boolean;
  origVolume: number;
  edited: boolean;
};

export const COLORS: Record<string, string> = {
  gold: "#f5b52e", white: "#ffffff", yellow: "#ffd60a", red: "#ff4d4d", blue: "#4c8dff", green: "#2bd9a0",
  pink: "#ff5aae", purple: "#9b7bff", orange: "#ff8a2a", black: "#111111", cream: "#f3ece0",
};
export const colorOf = (c?: string) => (c ? COLORS[c.toLowerCase()] ?? (/^#[0-9a-f]{3,8}$/i.test(c) ? c : COLORS.white) : COLORS.white);

export function newProject(id: string, name: string, duration: number, width: number, height: number): Project {
  return {
    id, name, createdAt: Date.now(), updatedAt: Date.now(), duration, width, height,
    words: [], transcribed: false, silences: [],
    segs: [{ s: 0, e: duration }], aspect: width >= height ? "16:9" : "9:16", grade: "none",
    captions: { on: false, style: "karaoke", color: "gold", pos: "bottom", size: 1, lines: null },
    overlays: [], zooms: [], trans: [], sfx: [], dub: null, fx: [], vo: [], enhance: false, origVolume: 1, edited: false,
  };
}

/** Fills fields added after a project was first saved. */
export function migrate(p: Project): Project {
  return { ...p, fx: p.fx ?? [], vo: p.vo ?? [], enhance: p.enhance ?? false };
}

/* ---------- time mapping ---------- */

export const outDuration = (p: Project) => p.segs.reduce((n, g) => n + (g.e - g.s), 0);

export function outToSrc(p: Project, t: number): number {
  let acc = 0;
  for (const g of p.segs) { const d = g.e - g.s; if (t < acc + d) return g.s + (t - acc); acc += d; }
  const last = p.segs[p.segs.length - 1];
  return last ? last.e : 0;
}
export function srcToOut(p: Project, s: number): number | null {
  let acc = 0;
  for (const g of p.segs) { if (s >= g.s && s <= g.e) return acc + (s - g.s); acc += g.e - g.s; }
  return null;
}
/** Output times where one kept range ends and the next begins. */
export function cutPoints(p: Project): number[] {
  const out: number[] = []; let acc = 0;
  for (let i = 0; i < p.segs.length - 1; i++) { acc += p.segs[i].e - p.segs[i].s; out.push(acc); }
  return out;
}

function normalize(segs: Seg[], dur: number): Seg[] {
  const s = segs.map((g) => ({ s: Math.max(0, g.s), e: Math.min(dur, g.e) })).filter((g) => g.e - g.s > 0.08).sort((a, b) => a.s - b.s);
  const out: Seg[] = [];
  for (const g of s) { const l = out[out.length - 1]; if (l && g.s < l.e - 0.001) l.e = Math.max(l.e, g.e); else out.push({ ...g }); }
  return out;
}
/** Remove source ranges from the kept segments. */
export function subtract(segs: Seg[], cuts: Seg[]): Seg[] {
  let cur = segs.map((g) => ({ ...g }));
  for (const c of cuts) {
    const next: Seg[] = [];
    for (const g of cur) {
      if (c.e <= g.s || c.s >= g.e) { next.push(g); continue; }
      if (c.s > g.s) next.push({ s: g.s, e: c.s });
      if (c.e < g.e) next.push({ s: c.e, e: g.e });
    }
    cur = next;
  }
  return cur.filter((g) => g.e - g.s > 0.08);
}
function intersect(segs: Seg[], keep: Seg[]): Seg[] {
  const out: Seg[] = [];
  for (const k of keep) for (const g of segs) { const s = Math.max(g.s, k.s), e = Math.min(g.e, k.e); if (e - s > 0.08) out.push({ s, e }); }
  return out;
}

/* ---------- captions ---------- */

const ENDS = /[.!?؟،,…]$/;
export function captionLines(p: Project): CapLine[] {
  if (p.captions.lines) return p.captions.lines;
  const lines: CapLine[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    lines.push({ s: cur[0].s, e: cur[cur.length - 1].e, text: cur.map((w) => w.w).join(" "), words: cur });
    cur = [];
  };
  for (const w of p.words) {
    const s = srcToOut(p, w.s), e = srcToOut(p, Math.max(w.s, w.e - 0.01));
    if (s === null || e === null) continue;
    const ow = { w: w.w, s, e: Math.max(e, s + 0.08) };
    const prev = cur[cur.length - 1];
    if (prev && (ow.s - prev.e > 0.6 || cur.length >= (p.aspect === "16:9" ? 6 : 4) || ENDS.test(prev.w))) flush();
    cur.push(ow);
  }
  flush();
  return lines;
}

/* ---------- actions (from Zifidit.Ai or the UI) ---------- */

export type Action = { type: string; [k: string]: unknown };
const num = (v: unknown, d: number) => (typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(+v) ? +v : d);
const str = (v: unknown, d: string) => (typeof v === "string" && v ? v : d);
let idc = 0;
const uid = () => "o" + Date.now().toString(36) + (idc++).toString(36);

/** Actions that need the network (handled by the editor, not here). */
export const ASYNC_ACTIONS = new Set(["dub", "translate_captions", "auto_edit", "transcribe", "voiceover"]);

export function applyAction(p0: Project, a: Action): Project {
  const p: Project = structuredClone(p0);
  const D = outDuration(p);
  const clampT = (t: number) => Math.max(0, Math.min(D, t));
  switch (a.type) {
    case "cut_silences": {
      const gap = num(a.min_gap, 0.45), pad = num(a.pad, 0.12);
      const cuts: Seg[] = [];
      for (const s of p.silences) if (s.e - s.s >= gap) cuts.push({ s: s.s + pad, e: s.e - pad });
      // gaps between words count as silence too when the audio analysis missed them
      for (let i = 1; i < p.words.length; i++) {
        const a0 = p.words[i - 1].e, b0 = p.words[i].s;
        if (b0 - a0 >= gap + 0.2) cuts.push({ s: a0 + pad, e: b0 - pad });
      }
      if (p.words.length) { cuts.push({ s: 0, e: Math.max(0, p.words[0].s - pad) }); cuts.push({ s: p.words[p.words.length - 1].e + pad + 0.2, e: p.duration }); }
      p.segs = normalize(subtract(p.segs, cuts), p.duration);
      break;
    }
    case "remove_words": {
      const idx = Array.isArray(a.indices) ? (a.indices as unknown[]).map((v) => num(v, -1)).filter((i) => i >= 0 && i < p.words.length) : [];
      const cuts = idx.map((i) => ({ s: p.words[i].s - 0.03, e: p.words[i].e + 0.03 }));
      p.segs = normalize(subtract(p.segs, normalize(cuts, p.duration)), p.duration);
      break;
    }
    case "remove_phrases": {
      // [{ range: "12-20", text: "يعني" }]: find the words inside that transcript range and cut them
      const items = Array.isArray(a.items) ? (a.items as Record<string, unknown>[]) : [];
      const norm = (x: string) => x.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[^\p{L}\p{N}\s]/gu, "").trim();
      const cuts: Seg[] = [];
      for (const it of items) {
        const m = /(\d+)\s*-\s*(\d+)/.exec(String(it.range ?? ""));
        const lo = m ? Math.max(0, +m[1]) : 0, hi = m ? Math.min(p.words.length - 1, +m[2]) : p.words.length - 1;
        const target = norm(String(it.text ?? "")).split(/\s+/).filter(Boolean);
        if (!target.length) continue;
        for (let i = lo; i <= hi - target.length + 1; i++) {
          let ok = true;
          for (let k = 0; k < target.length; k++) if (norm(p.words[i + k].w) !== target[k]) { ok = false; break; }
          if (ok) { cuts.push({ s: p.words[i].s - 0.03, e: p.words[i + target.length - 1].e + 0.03 }); if (it.all !== true) break; }
        }
      }
      if (cuts.length) p.segs = normalize(subtract(p.segs, normalize(cuts, p.duration)), p.duration);
      break;
    }
    case "remove_range": {
      const s = outToSrc(p, clampT(num(a.start, 0))), e = outToSrc(p, clampT(num(a.end, 0)));
      if (e > s) p.segs = normalize(subtract(p.segs, [{ s, e }]), p.duration);
      break;
    }
    case "keep_source_ranges": {
      const r = Array.isArray(a.ranges) ? (a.ranges as Record<string, unknown>[]).map((x) => ({ s: num(x.start, 0), e: num(x.end, 0) })).filter((x) => x.e > x.s) : [];
      if (r.length) p.segs = normalize(intersect(p.segs, r), p.duration);
      break;
    }
    case "reset_cuts": p.segs = [{ s: 0, e: p.duration }]; break;
    case "split_at": {
      const src = outToSrc(p, clampT(num(a.at, 0)));
      const i = p.segs.findIndex((g) => src > g.s + 0.1 && src < g.e - 0.1);
      if (i >= 0) p.segs.splice(i, 1, { s: p.segs[i].s, e: src }, { s: src, e: p.segs[i].e });
      break;
    }
    case "remove_segment": {
      const i = num(a.index, -1);
      if (i >= 0 && i < p.segs.length && p.segs.length > 1) p.segs.splice(i, 1);
      break;
    }
    case "set_aspect": { const r = str(a.ratio, "9:16"); if (r === "9:16" || r === "1:1" || r === "16:9") p.aspect = r; break; }
    case "color_grade": { const g = str(a.preset, "none") as Grade; if (["none", "warm", "cool", "cinematic", "vivid", "bw", "fade"].includes(g)) p.grade = g; break; }
    case "captions": {
      if (typeof a.on === "boolean") p.captions.on = a.on; else p.captions.on = true;
      if (a.style && ["karaoke", "bold", "minimal", "boxed"].includes(a.style as string)) p.captions.style = a.style as CapStyle;
      if (a.color) p.captions.color = str(a.color, p.captions.color);
      if (a.position && ["top", "center", "bottom"].includes(a.position as string)) p.captions.pos = a.position as Pos;
      if (a.size_scale) p.captions.size = Math.max(0.6, Math.min(2.2, p.captions.size * num(a.size_scale, 1)));
      if (a.original === true) { p.captions.lines = null; p.captions.lang = undefined; }
      break;
    }
    case "add_title": {
      const s = clampT(num(a.start, 0)), e = clampT(num(a.end, Math.min(D, s + 3.5)));
      p.overlays.push({
        id: uid(), kind: a.motion ? "motion" : "title", text: str(a.text, "Zifidit"), s, e: e > s ? e : Math.min(D, s + 3),
        size: Math.max(0.5, Math.min(3, num(a.size, 1))), color: str(a.color, "white"),
        pos: (["top", "center", "bottom"].includes(a.position as string) ? a.position : "top") as Pos,
        anim: (["pop", "slide", "type", "kinetic"].includes(a.anim as string) ? a.anim : "pop") as Anim, box: a.box === true,
      });
      break;
    }
    case "edit_title": {
      const tgt = str(a.target, "last");
      const list = tgt === "all" ? p.overlays : tgt === "last" ? p.overlays.slice(-1) : p.overlays.filter((o) => o.id === tgt);
      for (const o of list) {
        if (typeof a.text === "string" && a.text) o.text = a.text;
        if (a.color) o.color = str(a.color, o.color);
        if (a.size_scale) o.size = Math.max(0.4, Math.min(3.5, o.size * num(a.size_scale, 1)));
        if (a.position && ["top", "center", "bottom"].includes(a.position as string)) o.pos = a.position as Pos;
        if (a.anim && ["pop", "slide", "type", "kinetic"].includes(a.anim as string)) o.anim = a.anim as Anim;
        if (a.start !== undefined) o.s = clampT(num(a.start, o.s));
        if (a.end !== undefined) o.e = clampT(num(a.end, o.e));
        if (typeof a.box === "boolean") o.box = a.box;
      }
      break;
    }
    case "remove_titles": {
      const tgt = str(a.target, "all");
      p.overlays = tgt === "all" ? [] : tgt === "last" ? p.overlays.slice(0, -1) : p.overlays.filter((o) => o.id !== tgt);
      break;
    }
    case "add_zoom": p.zooms.push({ t: clampT(num(a.at, 0)), d: Math.max(0.4, num(a.duration, 1.6)), scale: Math.max(1.02, Math.min(1.6, num(a.scale, 1.15))) }); break;
    case "remove_zooms": p.zooms = []; break;
    case "add_transition": { const k = str(a.kind, "whip"); p.trans.push({ t: clampT(num(a.at, 0)), kind: (["whip", "flash", "fade"].includes(k) ? k : "whip") as Trans["kind"] }); break; }
    case "auto_transitions": { p.trans = cutPoints(p).filter((_, i) => i % Math.max(1, num(a.every, 3)) === 0).map((t) => ({ t, kind: "whip" as const })); break; }
    case "remove_transitions": p.trans = []; break;
    case "add_sfx": { const k = str(a.kind, "whoosh") as SfxKind; p.sfx.push({ t: clampT(num(a.at, 0)), kind: SFX_KINDS.includes(k) ? k : "whoosh", vol: Math.max(0.05, Math.min(1, num(a.volume, 0.5))) }); break; }
    case "auto_sfx": {
      const out: Sfx[] = [];
      for (const tr of p.trans) out.push({ t: Math.max(0, tr.t - 0.25), kind: tr.kind === "whip" ? "whoosh" : "swipe", vol: 0.45 });
      for (const o of p.overlays) out.push({ t: o.s, kind: "pop", vol: 0.4 });
      for (const z of p.zooms) out.push({ t: z.t, kind: "impact", vol: 0.25 });
      for (const f of p.fx) if (f.kind === "shake") out.push({ t: f.t, kind: "impact", vol: 0.35 });
      for (const o of p.overlays) if (o.anim === "type") out.push({ t: o.s, kind: "typing", vol: 0.25 });
      p.sfx = out;
      break;
    }
    case "remove_sfx": p.sfx = []; break;
    case "original_volume": p.origVolume = Math.max(0, Math.min(1, num(a.value, 1))); break;
    case "remove_dub": p.dub = null; p.origVolume = 1; break;
    case "add_effect": {
      const k = str(a.kind, "glow") as FxKind;
      const kind = FX_KINDS.includes(k) ? k : "glow";
      const dd = { shake: 0.5, glow: 1.6, light_leak: 1.8, rgb_split: 0.5, blur_in: 0.8, punch: 0.6, film_grain: D }[kind];
      const t = clampT(num(a.at, 0));
      p.fx.push({ t, d: Math.max(0.2, Math.min(D - t || dd, num(a.duration, dd))), kind, k: Math.max(0.2, Math.min(1, num(a.intensity, 0.7))) });
      break;
    }
    case "auto_effects": {
      // a light pass: soft blur-in at the start, a punch + shake on each zoom, light leaks on transitions
      const out: Fx[] = p.fx.filter((f) => f.kind === "film_grain");
      if (D > 1) out.push({ t: 0, d: 0.8, kind: "blur_in", k: 0.7 });
      for (const z of p.zooms.slice(0, 6)) out.push({ t: z.t, d: 0.5, kind: "punch", k: 0.6 });
      p.trans.forEach((tr, i) => out.push(i % 2 ? { t: Math.max(0, tr.t - 0.3), d: 1.4, kind: "light_leak", k: 0.6 } : { t: tr.t, d: 0.45, kind: "rgb_split", k: 0.6 }));
      p.fx = out;
      break;
    }
    case "remove_effects": { const k = str(a.kind, "all"); p.fx = k === "all" ? [] : p.fx.filter((f) => f.kind !== k); break; }
    case "enhance_audio": p.enhance = a.on !== false; break;
    case "remove_voiceover": p.vo = []; break;
    default: return p0;
  }
  p.edited = true;
  // keep timed items inside the new duration
  const D2 = outDuration(p);
  p.overlays = p.overlays.filter((o) => o.s < D2).map((o) => ({ ...o, e: Math.min(o.e, D2) }));
  p.zooms = p.zooms.filter((z) => z.t < D2);
  p.trans = p.trans.filter((t) => t.t < D2);
  p.sfx = p.sfx.filter((s) => s.t < D2);
  p.fx = p.fx.filter((f) => f.t < D2);
  p.vo = p.vo.filter((c) => c.t < D2);
  p.updatedAt = Date.now();
  return p;
}

/* ---------- what Zifidit.Ai sees ---------- */

export function summary(p: Project) {
  const lines: string[] = [];
  let cur: string[] = [], start = -1, first = -1;
  for (let i = 0; i < p.words.length; i++) {
    const w = p.words[i];
    if (start < 0) { start = w.s; first = i; }
    cur.push(w.w);
    if (ENDS.test(w.w) || cur.length >= 14 || i === p.words.length - 1) {
      const o = srcToOut(p, start);
      lines.push(`#${first}-${i} src ${start.toFixed(2)}-${w.e.toFixed(2)}s ${o === null ? "(cut)" : "out " + o.toFixed(2) + "s"}: ${cur.join(" ")}`);
      cur = []; start = -1;
    }
  }
  let transcript = lines.join("\n");
  if (transcript.length > 24000) transcript = transcript.slice(0, 24000) + "\n…";
  return {
    source_duration: +p.duration.toFixed(2), output_duration: +outDuration(p).toFixed(2), aspect: p.aspect, grade: p.grade,
    language: p.language ?? null, transcribed: p.transcribed,
    captions: { on: p.captions.on, style: p.captions.style, color: p.captions.color, position: p.captions.pos, translated_to: p.captions.lang ?? null },
    titles: p.overlays.map((o) => ({ id: o.id, text: o.text, start: +o.s.toFixed(2), end: +o.e.toFixed(2), color: o.color, size: o.size, position: o.pos })),
    zooms: p.zooms.length, transitions: p.trans.length, sfx: p.sfx.length, cuts: p.segs.length - 1,
    dub: p.dub ? { language: p.dub.lang, voice: p.dub.voice } : null,
    effects: p.fx.map((f) => ({ kind: f.kind, at: +f.t.toFixed(2) })), voiceovers: p.vo.map((c) => ({ at: +c.t.toFixed(2), text: c.text })),
    audio_enhanced: p.enhance, original_volume: p.origVolume,
    transcript,
  };
}
