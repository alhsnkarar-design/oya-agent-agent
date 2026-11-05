// Zifidit.Ai orchestration: transcription, automatic editing, commands, translation and dubbing.
import { chat, speak, transcribe, type ChatMsg, type Word } from "../lib/api";
import { blobToWav16k, chunk16k, decodeFile, findSilences, toMono16k, wavBlob } from "../lib/audio";
import { ASYNC_ACTIONS, applyAction, captionLines, outDuration, srcToOut, summary, type Action, type CapLine, type DubClip, type Project } from "./model";

export type Step = "step_audio" | "step_transcribe" | "step_plan" | "step_apply" | "step_translate" | "step_voice";
export type OnStep = (s: Step | null, k?: number) => void;

/** Fill in words with timestamps and the silence map (once per project). */
export async function ensureTranscript(p: Project, file: Blob, onStep: OnStep): Promise<Project> {
  if (p.transcribed) return p;
  onStep("step_audio");
  const buf = await decodeFile(file);
  const mono = await toMono16k(buf);
  const silences = findSilences(mono);
  const chunks = chunk16k(mono, 600);
  const words: Word[] = [];
  let language: string | undefined;
  for (let i = 0; i < chunks.length; i++) {
    onStep("step_transcribe", i / chunks.length);
    const c = chunks[i];
    const r = await transcribe(wavBlob(c.samples, 16000), c.samples.length / 16000);
    language = language ?? r.language;
    for (const w of r.words) words.push({ w: w.w, s: w.s + c.start, e: w.e + c.start });
  }
  onStep(null);
  return { ...p, words, silences, transcribed: true, language };
}

function apply(p: Project, actions: Action[]) {
  for (const a of actions) if (!ASYNC_ACTIONS.has(a.type)) p = applyAction(p, a);
  return p;
}

/** Automatic professional-style edit. */
export async function autoEdit(p: Project, file: Blob, lang: string, onStep: OnStep, extra = ""): Promise<{ p: Project; reply: string }> {
  p = await ensureTranscript(p, file, onStep);
  onStep("step_apply");
  p = applyAction(p, { type: "cut_silences", min_gap: 0.4 });
  onStep("step_plan");
  const r = await chat({ mode: "auto_edit", lang, project: summary(p), messages: [{ role: "user", content: extra || "Auto edit this video like a professional human editor." }] });
  onStep("step_apply");
  p = apply(p, r.actions as Action[]);
  if (!p.captions.on && p.words.length) p = applyAction(p, { type: "captions", on: true });
  if (!p.sfx.length) p = applyAction(p, { type: "auto_sfx" });
  onStep(null);
  return { p, reply: r.reply };
}

async function translateLines(lines: string[], target: string, lang: string, onStep: OnStep) {
  onStep("step_translate");
  const r = await chat({ mode: "translate", lang, project: { target, lines }, messages: [] });
  const out = r.lines ?? [];
  return lines.map((l, i) => (typeof out[i] === "string" && out[i] ? out[i] : l));
}

/** Sentences in output time, for dubbing. */
function sentences(p: Project): CapLine[] {
  const out: CapLine[] = [];
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, text: cur.map((w) => w.w).join(" ") }); cur = []; };
  for (const w of p.words) {
    const s = srcToOut(p, w.s), e = srcToOut(p, Math.max(w.s, w.e - 0.01));
    if (s === null || e === null) continue;
    const prev = cur[cur.length - 1];
    if (prev && (s - prev.e > 0.7 || cur.length >= 22 || /[.!?؟…]$/.test(prev.w))) flush();
    cur.push({ w: w.w, s, e });
  }
  flush();
  return out;
}

export async function translateCaptions(p: Project, file: Blob, target: string, lang: string, onStep: OnStep): Promise<Project> {
  p = await ensureTranscript(p, file, onStep);
  const base = captionLines({ ...p, captions: { ...p.captions, lines: null } });
  const tr = await translateLines(base.map((l) => l.text), target, lang, onStep);
  onStep(null);
  return { ...p, edited: true, captions: { ...p.captions, on: true, lines: base.map((l, i) => ({ s: l.s, e: l.e, text: tr[i] })), lang: target } };
}

export async function dub(p: Project, file: Blob, target: string, voice: string, lang: string, onStep: OnStep): Promise<Project> {
  p = await ensureTranscript(p, file, onStep);
  const lines = sentences(p);
  if (!lines.length) throw new Error("no_speech");
  const tr = await translateLines(lines.map((l) => l.text), target, lang, onStep);
  const clips: DubClip[] = new Array(lines.length);
  let done = 0;
  const work = lines.map((l, i) => async () => {
    const r = await speak(tr[i], voice, "Natural, warm delivery that matches a video voice-over. Keep the pace close to the original.");
    clips[i] = { t: l.s, dur: l.e - l.s, text: tr[i], pcm: r.pcm, rate: r.rate };
    onStep("step_voice", ++done / lines.length);
  });
  // three at a time
  const queue = [...work];
  await Promise.all([0, 1, 2].map(async () => { while (queue.length) await queue.shift()!(); }));
  onStep(null);
  const capLines = p.captions.on ? lines.map((l, i) => ({ s: l.s, e: l.e, text: tr[i] })) : p.captions.lines;
  return { ...p, edited: true, dub: { lang: target, voice, clips }, origVolume: 0.1, captions: { ...p.captions, lines: capLines, lang: p.captions.on ? target : p.captions.lang } };
}

export type CommandResult = { p: Project; reply: string };

/** A free-form command from the user (text or transcribed voice). */
export async function command(p: Project, file: Blob, history: ChatMsg[], text: string, lang: string, voice: string, onStep: OnStep): Promise<CommandResult> {
  // the assistant needs the words for most edits; transcribe first if this video has speech we haven't read yet
  if (!p.transcribed) p = await ensureTranscript(p, file, onStep);
  onStep("step_plan");
  const r = await chat({ mode: "chat", lang, project: summary(p), messages: [...history.slice(-8), { role: "user", content: text }] });
  onStep(null);
  let reply = r.reply;
  for (const a of r.actions as Action[]) {
    if (a.type === "auto_edit") { const x = await autoEdit(p, file, lang, onStep, typeof a.instructions === "string" ? a.instructions : text); p = x.p; reply = reply || x.reply; }
    else if (a.type === "dub") p = await dub(p, file, String(a.language ?? "English"), typeof a.voice === "string" ? a.voice : voice, lang, onStep);
    else if (a.type === "translate_captions") p = await translateCaptions(p, file, String(a.language ?? "English"), lang, onStep);
    else p = applyAction(p, a);
  }
  return { p, reply };
}

/** Transcribe a voice message (or live utterance) to text. */
export async function voiceToText(b: Blob): Promise<string> {
  const { wav, seconds } = await blobToWav16k(b);
  const r = await transcribe(wav, seconds);
  return r.text.trim();
}

export const outLen = outDuration;
