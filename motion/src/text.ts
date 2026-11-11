// Turns a sentence into timed words. Wrap a word in *asterisks* to emphasise it.
export const FPS = 30;

export type Word = {
  text: string;
  emphasis: boolean;
  start: number; // frame the word starts entering
  length: number; // frames the word "owns" before the next one starts
};

export type Ratio = "9:16" | "1:1" | "16:9";
export type Style = "build" | "punch" | "reveal";

export const SIZES: Record<Ratio, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};

const INTRO = 8; // frames of empty background before the first word
export const HOLD = 48; // frames the finished sentence stays on screen
export const OUTRO = 14; // frames for the exit

// Arabic reading pace: short words still need ~0.33s, long ones up to ~0.7s.
function framesFor(word: string): number {
  const letters = word.replace(/[ً-ْـ]/g, "").length; // ignore tashkeel and tatweel
  return Math.round(Math.min(22, Math.max(10, 8 + letters * 1.4)));
}

export function parse(sentence: string): Word[] {
  const tokens = sentence.trim().split(/\s+/).filter(Boolean);
  let t = INTRO;
  return tokens.map((raw) => {
    const emphasis = /^\*.+\*[.،,!?؟]*$/.test(raw);
    const text = emphasis ? raw.replace(/\*/g, "") : raw;
    const length = framesFor(text) + (emphasis ? 6 : 0);
    const w = { text, emphasis, start: t, length };
    t += length;
    return w;
  });
}

export function totalFrames(words: Word[]): number {
  const last = words[words.length - 1];
  const end = last ? last.start + last.length : INTRO;
  return end + HOLD + OUTRO;
}

// Font size that keeps the whole sentence on screen for the "build" and "reveal" styles.
export function blockFontSize(words: Word[], ratio: Ratio): number {
  const chars = words.reduce((n, w) => n + w.text.length + 1, 0);
  const base = ratio === "16:9" ? 124 : ratio === "1:1" ? 118 : 150;
  if (chars <= 18) return base * 1.25;
  if (chars <= 36) return base;
  if (chars <= 60) return base * 0.8;
  if (chars <= 90) return base * 0.66;
  return base * 0.55;
}
