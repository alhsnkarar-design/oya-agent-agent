// Natural sound effects synthesized in the browser (no samples, no music):
// whoosh for transitions, pop for titles, click for captions/cuts, soft impact for emphasis, riser before a hook,
// ding for a key point, camera shutter for a freeze or photo, keyboard typing under typed text, heartbeat for tension, clock tick.
export type SfxKind = "whoosh" | "pop" | "click" | "impact" | "riser" | "swipe" | "ding" | "shutter" | "typing" | "heartbeat" | "tick";
export const SFX_KINDS: SfxKind[] = ["whoosh", "pop", "click", "impact", "riser", "swipe", "ding", "shutter", "typing", "heartbeat", "tick"];

const cache = new Map<SfxKind, Promise<AudioBuffer>>();

function noise(ctx: BaseAudioContext, dur: number) {
  const b = ctx.createBuffer(1, Math.ceil(dur * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const n = ctx.createBufferSource(); n.buffer = b; return n;
}

async function render(kind: SfxKind): Promise<AudioBuffer> {
  const dur = { whoosh: 0.55, pop: 0.18, click: 0.06, impact: 0.6, riser: 1.2, swipe: 0.32, ding: 1.4, shutter: 0.22, typing: 1.2, heartbeat: 1.6, tick: 0.05 }[kind];
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
  } else if (kind === "ding") {
    // small bell: a few inharmonic partials with a long decay
    for (const [f0, a] of [[1320, 0.32], [2640, 0.12], [3560, 0.07], [4980, 0.04]] as const) {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f0;
      const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(a, t + 0.004);
      og.gain.exponentialRampToValueAtTime(0.0001, t + dur * (f0 > 2000 ? 0.5 : 1));
      o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + dur);
    }
  } else if (kind === "shutter") {
    // two mechanical clicks: the curtain opening and closing
    for (const at of [0, 0.09]) {
      const n = noise(ctx, 0.06), f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = at ? 2600 : 3800; f.Q.value = 1.4;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.6, t + at); ng.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.05);
      n.connect(f).connect(ng).connect(ctx.destination); n.start(t + at);
    }
  } else if (kind === "typing") {
    // irregular key presses
    let at = 0;
    while (at < dur - 0.06) {
      const n = noise(ctx, 0.03), f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800 + Math.random() * 1800; f.Q.value = 2;
      const ng = ctx.createGain(); ng.gain.setValueAtTime(0.25 + Math.random() * 0.2, t + at); ng.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.03);
      n.connect(f).connect(ng).connect(ctx.destination); n.start(t + at);
      at += 0.07 + Math.random() * 0.09;
    }
  } else if (kind === "heartbeat") {
    // lub-dub, twice
    for (const at of [0, 0.22, 0.8, 1.02]) {
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(70, t + at); o.frequency.exponentialRampToValueAtTime(40, t + at + 0.15);
      const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t + at); og.gain.exponentialRampToValueAtTime(at % 0.8 ? 0.45 : 0.7, t + at + 0.015);
      og.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.2);
      o.connect(og).connect(ctx.destination); o.start(t + at); o.stop(t + at + 0.22);
    }
  } else if (kind === "tick") {
    const o = ctx.createOscillator(); o.type = "square"; o.frequency.value = 3200;
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 3200; f.Q.value = 6;
    g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g); o.start(t); o.stop(t + dur);
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
