// Natural sound effects synthesized in the browser (no samples, no music):
// whoosh for transitions, pop for titles, click for captions/cuts, soft impact for emphasis, riser before a hook.
export type SfxKind = "whoosh" | "pop" | "click" | "impact" | "riser" | "swipe";
export const SFX_KINDS: SfxKind[] = ["whoosh", "pop", "click", "impact", "riser", "swipe"];

const cache = new Map<SfxKind, Promise<AudioBuffer>>();

function noise(ctx: BaseAudioContext, dur: number) {
  const b = ctx.createBuffer(1, Math.ceil(dur * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const n = ctx.createBufferSource(); n.buffer = b; return n;
}

async function render(kind: SfxKind): Promise<AudioBuffer> {
  const dur = { whoosh: 0.55, pop: 0.18, click: 0.06, impact: 0.6, riser: 1.2, swipe: 0.32 }[kind];
  const ctx = new OfflineAudioContext(1, Math.ceil(dur * 48000), 48000);
  const g = ctx.createGain(); g.connect(ctx.destination);
  const t = 0;
  if (kind === "whoosh" || kind === "swipe" || kind === "riser") {
    const n = noise(ctx, dur), f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = kind === "swipe" ? 2.5 : 1.2;
    const [a, b] = kind === "riser" ? [300, 5000] : kind === "swipe" ? [2500, 600] : [400, 3200];
    f.frequency.setValueAtTime(a, t);
    f.frequency.exponentialRampToValueAtTime(b, t + dur * (kind === "whoosh" ? 0.45 : 0.95));
    if (kind === "whoosh") f.frequency.exponentialRampToValueAtTime(500, t + dur);
    const peak = kind === "riser" ? dur * 0.95 : dur * 0.4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(kind === "riser" ? 0.35 : 0.5, t + peak);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g); n.start(t);
  } else if (kind === "pop") {
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); o.start(t); o.stop(t + dur);
  } else if (kind === "click") {
    const n = noise(ctx, dur), f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2500;
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g); n.start(t);
  } else {
    // impact: low thump + short noise body
    const o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.4);
    const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.8, t + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + dur);
    const n = noise(ctx, 0.15), f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1200;
    g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    n.connect(f).connect(g); n.start(t);
  }
  return ctx.startRendering();
}

export function sfxBuffer(kind: SfxKind) {
  if (!cache.has(kind)) cache.set(kind, render(kind));
  return cache.get(kind)!;
}
