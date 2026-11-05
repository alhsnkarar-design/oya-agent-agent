// Draws one output frame: crop to the aspect, zoom, color grade, transitions, titles and captions.
import { captionLines, colorOf, type CapLine, type Overlay, type Project } from "./model";

export const SIZES = { "9:16": [1080, 1920], "1:1": [1080, 1080], "16:9": [1920, 1080] } as const;
const isAr = (s: string) => /[؀-ۿ]/.test(s);
const fontFor = (s: string, weight = 800) => `${weight} {px}px ${isAr(s) ? '"Readex Pro Variable"' : '"Manrope Variable"'}, system-ui, sans-serif`;
const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

const GRADES: Record<string, string> = {
  none: "none",
  warm: "sepia(0.16) saturate(1.15) hue-rotate(-6deg) brightness(1.02)",
  cool: "saturate(1.05) hue-rotate(8deg) brightness(1.02) contrast(1.03)",
  cinematic: "contrast(1.12) saturate(0.88) brightness(0.96)",
  vivid: "saturate(1.4) contrast(1.06)",
  bw: "grayscale(1) contrast(1.12)",
  fade: "contrast(0.9) brightness(1.07) saturate(0.85)",
};

function zoomAt(p: Project, t: number) {
  let z = 1;
  for (const k of p.zooms) {
    const x = t - k.t;
    if (x < 0 || x > k.d) continue;
    const ramp = Math.min(1, x / 0.25, (k.d - x) / 0.35);
    z = Math.max(z, 1 + (k.scale - 1) * ease(ramp));
  }
  return z;
}

function drawSource(ctx: CanvasRenderingContext2D, v: CanvasImageSource, sw: number, sh: number, W: number, H: number, zoom: number, dx = 0) {
  const scale = Math.max(W / sw, H / sh) * zoom;
  const dw = sw * scale, dh = sh * scale;
  ctx.drawImage(v, (W - dw) / 2 + dx, (H - dh) / 2, dw, dh);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** Lay words out in lines that fit `maxW`, right-to-left for Arabic. */
function layout(ctx: CanvasRenderingContext2D, words: string[], maxW: number) {
  const rtl = isAr(words.join(" "));
  const space = ctx.measureText(" ").width;
  const lines: { w: string; width: number; i: number }[][] = [[]];
  let lw = 0;
  words.forEach((w, i) => {
    const width = ctx.measureText(w).width;
    if (lw && lw + space + width > maxW) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push({ w, width, i }); lw += (lw ? space : 0) + width;
  });
  return { lines, rtl, space };
}

function drawWords(ctx: CanvasRenderingContext2D, words: string[], cx: number, cy: number, maxW: number, lineH: number,
  paint: (i: number, x: number, y: number, w: number, word: string) => void) {
  const { lines, rtl, space } = layout(ctx, words, maxW);
  const total = lines.length * lineH;
  lines.forEach((ln, li) => {
    const lw = ln.reduce((n, x) => n + x.width, 0) + space * (ln.length - 1);
    let x = rtl ? cx + lw / 2 : cx - lw / 2;
    const y = cy - total / 2 + lineH * (li + 0.5);
    for (const it of ln) {
      const left = rtl ? x - it.width : x;
      paint(it.i, left, y, it.width, it.w);
      x = rtl ? x - it.width - space : x + it.width + space;
    }
  });
}

function overlayY(pos: string, H: number, aspect: string) {
  if (pos === "center") return H * 0.5;
  if (pos === "bottom") return H * (aspect === "16:9" ? 0.8 : 0.72);
  return H * (aspect === "16:9" ? 0.18 : 0.17);
}

function drawOverlay(ctx: CanvasRenderingContext2D, o: Overlay, t: number, W: number, H: number, aspect: string) {
  if (t < o.s || t > o.e) return;
  const inP = ease((t - o.s) / 0.35), outP = ease((o.e - t) / 0.25);
  const k = Math.min(inP, outP);
  const base = Math.min(W, H) * (aspect === "16:9" ? 0.075 : 0.085) * o.size;
  ctx.save();
  ctx.font = fontFor(o.text).replace("{px}", String(Math.round(base)));
  ctx.textBaseline = "middle";
  const words = o.text.split(/\s+/).filter(Boolean);
  let text = words;
  if (o.anim === "type") { const n = Math.ceil(o.text.length * Math.min(1, (t - o.s) / Math.max(0.4, o.text.length * 0.045))); text = o.text.slice(0, n).split(/\s+/); }
  const y0 = overlayY(o.pos, H, aspect);
  const lift = o.anim === "slide" ? (1 - inP) * base * 0.9 : 0;
  const sc = o.anim === "pop" ? 0.7 + 0.3 * inP + Math.sin(Math.min(1, (t - o.s) / 0.35) * Math.PI) * 0.06 : 1;
  ctx.translate(W / 2, y0 + lift); ctx.scale(sc, sc); ctx.translate(-W / 2, -y0);
  ctx.globalAlpha = k;
  const color = colorOf(o.color);
  if (o.box) {
    const { lines } = layout(ctx, words, W * 0.84);
    const lw = Math.max(...lines.map((l) => l.reduce((n, x) => n + x.width, 0))) + base * 1.2;
    const lh = lines.length * base * 1.3 + base * 0.5;
    ctx.fillStyle = "rgba(10,10,12,0.72)"; roundRect(ctx, W / 2 - lw / 2, y0 - lh / 2, lw, lh, base * 0.35); ctx.fill();
  }
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = base * 0.35; ctx.shadowOffsetY = base * 0.06;
  drawWords(ctx, text, W / 2, y0, W * 0.84, base * 1.3, (i, x, y, _w, word) => {
    if (o.anim === "kinetic") {
      const wp = ease((t - o.s - i * 0.12) / 0.25);
      if (wp <= 0) return;
      ctx.globalAlpha = k * wp;
      ctx.fillStyle = color; ctx.fillText(word, x, y + (1 - wp) * base * 0.5);
      ctx.globalAlpha = k;
      return;
    }
    ctx.fillStyle = color; ctx.fillText(word, x, y);
  });
  ctx.restore();
}

function drawCaption(ctx: CanvasRenderingContext2D, p: Project, line: CapLine, t: number, W: number, H: number) {
  const c = p.captions;
  const base = Math.min(W, H) * (p.aspect === "16:9" ? 0.052 : 0.062) * c.size * (c.style === "minimal" ? 0.8 : c.style === "bold" ? 1.15 : 1);
  const words = line.words?.map((w) => w.w) ?? line.text.split(/\s+/);
  // without word timing (translated lines), spread the highlight evenly
  const active = line.words
    ? line.words.findIndex((w) => t >= w.s && t < w.e + 0.05)
    : Math.min(words.length - 1, Math.floor(((t - line.s) / Math.max(0.1, line.e - line.s)) * words.length));
  const y = c.pos === "top" ? H * 0.2 : c.pos === "center" ? H * 0.55 : H * (p.aspect === "16:9" ? 0.85 : 0.76);
  ctx.save();
  ctx.font = fontFor(line.text, c.style === "minimal" ? 600 : 800).replace("{px}", String(Math.round(base)));
  ctx.textBaseline = "middle";
  const hi = colorOf(c.color);
  if (c.style === "boxed") {
    const { lines } = layout(ctx, words, W * 0.86);
    const lw = Math.max(...lines.map((l) => l.reduce((n, x) => n + x.width, 0) + 10 * l.length)) + base;
    const lh = lines.length * base * 1.35 + base * 0.4;
    ctx.fillStyle = "rgba(0,0,0,0.6)"; roundRect(ctx, W / 2 - lw / 2, y - lh / 2, lw, lh, base * 0.3); ctx.fill();
  }
  drawWords(ctx, words, W / 2, y, W * 0.86, base * 1.35, (i, x, yy, w, word) => {
    const on = c.style === "karaoke" ? i === active : false;
    if (on) {
      ctx.fillStyle = hi; roundRect(ctx, x - base * 0.14, yy - base * 0.62, w + base * 0.28, base * 1.24, base * 0.22); ctx.fill();
      ctx.fillStyle = "#111"; ctx.fillText(word, x, yy);
      return;
    }
    if (c.style !== "boxed") { ctx.lineWidth = base * (c.style === "minimal" ? 0.1 : 0.16); ctx.strokeStyle = "rgba(0,0,0,0.85)"; ctx.lineJoin = "round"; ctx.strokeText(word, x, yy); }
    ctx.fillStyle = c.style === "bold" && i === active ? hi : c.style === "karaoke" && i > active ? "rgba(255,255,255,0.92)" : "#fff";
    ctx.fillText(word, x, yy);
  });
  ctx.restore();
}

export type FrameOpts = { split?: number | null };

export function drawFrame(ctx: CanvasRenderingContext2D, p: Project, video: HTMLVideoElement, t: number, opts: FrameOpts = {}) {
  const [W, H] = SIZES[p.aspect];
  if (ctx.canvas.width !== W || ctx.canvas.height !== H) { ctx.canvas.width = W; ctx.canvas.height = H; }
  ctx.save();
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const sw = video.videoWidth || p.width || W, sh = video.videoHeight || p.height || H;
  const ready = video.readyState >= 2;

  // transition shake / blur
  let dx = 0, flash = 0, black = 0, blur = 0;
  for (const tr of p.trans) {
    const x = t - tr.t;
    if (Math.abs(x) > 0.2) continue;
    const k = 1 - Math.abs(x) / 0.2;
    if (tr.kind === "whip") { dx = (x < 0 ? -1 : 1) * W * 0.18 * k; blur = 18 * k; }
    if (tr.kind === "flash") flash = Math.max(flash, k * 0.85);
    if (tr.kind === "fade") black = Math.max(black, k);
  }
  if (ready) {
    const g = GRADES[p.grade] ?? "none";
    ctx.filter = [g !== "none" ? g : "", blur ? `blur(${blur.toFixed(1)}px)` : ""].join(" ").trim() || "none";
    drawSource(ctx, video, sw, sh, W, H, zoomAt(p, t), dx);
    ctx.filter = "none";
  }
  if (p.grade === "cinematic" || p.grade === "warm") {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  for (const o of p.overlays) drawOverlay(ctx, o, t, W, H, p.aspect);
  if (p.captions.on) {
    const line = captionLines(p).find((l) => t >= l.s && t < l.e + 0.15);
    if (line) drawCaption(ctx, p, line, t, W, H);
  }
  if (flash) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, W, H); }
  if (black) { ctx.fillStyle = `rgba(0,0,0,${black})`; ctx.fillRect(0, 0, W, H); }

  // before/after split: the raw frame on the start side
  if (opts.split != null && ready) {
    const rtl = document.documentElement.dir === "rtl";
    const x = W * opts.split;
    ctx.save(); ctx.beginPath();
    if (rtl) ctx.rect(x, 0, W - x, H); else ctx.rect(0, 0, x, H);
    ctx.clip(); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    drawSource(ctx, video, sw, sh, W, H, 1);
    ctx.restore();
    ctx.fillStyle = "#fff"; ctx.fillRect(x - 2, 0, 4, H);
  }
  ctx.restore();
}
