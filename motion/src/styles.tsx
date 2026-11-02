import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./Background";
import { COLORS, FONT } from "./theme";
import { blockFontSize, HOLD, OUTRO, Ratio, Word } from "./text";

type Props = { words: Word[]; ratio: Ratio };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Directions words fly in from, cycled so neighbours never repeat.
const FROM = [
  { x: 90, y: 0 }, // from the right (reading direction)
  { x: 0, y: 70 },
  { x: -60, y: 0 },
  { x: 0, y: -60 },
];

function exitProgress(frame: number, words: Word[]) {
  const last = words[words.length - 1];
  const exitStart = last.start + last.length + HOLD;
  return interpolate(frame, [exitStart, exitStart + OUTRO], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
}

/* ───────────── build: words assemble into the sentence ───────────── */
export const Build: React.FC<Props> = ({ words, ratio }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const size = blockFontSize(words, ratio);
  const out = exitProgress(frame, words);
  const last = words[words.length - 1];
  const settle = interpolate(frame, [last.start + last.length, last.start + last.length + HOLD], [1, 1.04], clamp);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          dir="rtl"
          style={{
            width: width * 0.84,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            columnGap: size * 0.34,
            rowGap: size * 0.1,
            fontFamily: FONT,
            fontSize: size,
            lineHeight: 1.25,
            transform: `scale(${settle})`,
          }}
        >
          {words.map((w, i) => {
            const local = frame - w.start;
            const s = spring({ frame: local, fps, config: { damping: w.emphasis ? 9 : 14, stiffness: 140, mass: 0.7 } });
            const dir = FROM[i % FROM.length];
            const blur = interpolate(local, [0, 8], [14, 0], clamp);
            const exitY = interpolate(out, [0, 1], [0, -120 - (i % 3) * 40]);
            const bar = interpolate(local, [4, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  position: "relative",
                  color: w.emphasis ? COLORS.accent : COLORS.ink,
                  fontWeight: w.emphasis ? 900 : 800,
                  opacity: local < 0 ? 0 : Math.min(1, s * 1.4) * (1 - out),
                  filter: `blur(${blur + out * 10}px)`,
                  transform: `translate(${(1 - s) * dir.x}px, ${(1 - s) * dir.y + exitY}px) scale(${w.emphasis ? 0.6 + s * 0.46 : 0.85 + s * 0.15})`,
                  transformOrigin: "center",
                }}
              >
                {w.text}
                {w.emphasis && (
                  <span
                    style={{
                      position: "absolute",
                      insetInline: 0,
                      bottom: -size * 0.04,
                      height: size * 0.07,
                      borderRadius: size,
                      background: COLORS.accent,
                      transform: `scaleX(${bar})`,
                      transformOrigin: "right",
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ───────────── punch: one huge word at a time ───────────── */
export const Punch: React.FC<Props> = ({ words, ratio }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const lastIdx = words.length - 1;
  let idx = words.findIndex((w) => frame < w.start + w.length);
  if (idx === -1) idx = lastIdx;
  const w = words[idx];
  const local = frame - w.start;
  const s = spring({ frame: local, fps, config: { damping: 11, stiffness: 180, mass: 0.6 } });
  const out = exitProgress(frame, words);
  const flash = w.emphasis ? interpolate(local, [0, 3, 8], [0, 1, 0], clamp) : 0;
  const base = ratio === "16:9" ? 260 : 230;
  const fit = Math.min(base, (width * 0.86) / Math.max(2.2, w.text.length * 0.62));
  const shake = w.emphasis && local < 8 ? Math.sin(local * 2.4) * (8 - local) * 1.4 : 0;
  // A thin progress line shows how far through the sentence we are.
  const progress = interpolate(frame, [words[0].start, words[lastIdx].start + words[lastIdx].length], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <Background flash={flash} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: fit,
            fontWeight: 900,
            color: w.emphasis ? COLORS.accent : COLORS.ink,
            opacity: Math.min(1, s * 1.5) * (1 - out),
            transform: `translateX(${shake}px) scale(${1.45 - s * 0.45 + out * 0.3})`,
            filter: `blur(${interpolate(local, [0, 5], [10, 0], clamp) + out * 12}px)`,
            textShadow: w.emphasis ? `0 0 ${fit * 0.4}px ${COLORS.accent}66` : "none",
            whiteSpace: "nowrap",
          }}
        >
          {w.text}
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "20%",
          width: "60%",
          height: 6,
          borderRadius: 6,
          background: "rgba(255,255,255,.12)",
          opacity: 1 - out,
        }}
      >
        <div style={{ height: "100%", width: `${progress * 100}%`, marginInlineStart: "auto", borderRadius: 6, background: COLORS.accent }} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── reveal: lines wiped in by a moving accent bar ───────────── */
export const Reveal: React.FC<Props> = ({ words, ratio }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const size = blockFontSize(words, ratio) * 0.95;
  const out = exitProgress(frame, words);

  // Group words into lines of roughly equal length.
  const maxChars = Math.max(8, Math.floor((width * 0.84) / (size * 0.55)));
  const lines: Word[][] = [];
  let cur: Word[] = [];
  let len = 0;
  for (const w of words) {
    if (cur.length && len + w.text.length + 1 > maxChars) {
      lines.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(w);
    len += w.text.length + 1;
  }
  if (cur.length) lines.push(cur);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div dir="rtl" style={{ display: "grid", gap: size * 0.12, justifyItems: "center", fontFamily: FONT, fontSize: size, lineHeight: 1.3 }}>
          {lines.map((line, li) => {
            const start = line[0].start;
            const end = line[line.length - 1].start + line[line.length - 1].length;
            const p = interpolate(frame, [start, end], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
            const exitX = interpolate(out, [0, 1], [0, li % 2 ? 160 : -160]);
            return (
              <div key={li} style={{ position: "relative", transform: `translateX(${exitX}px)`, opacity: 1 - out }}>
                <div style={{ clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, fontWeight: 800, color: COLORS.ink, whiteSpace: "nowrap" }}>
                  {line.map((w, wi) => (
                    <span key={wi} style={{ color: w.emphasis ? COLORS.accent : COLORS.ink, fontWeight: w.emphasis ? 900 : 800 }}>
                      {w.text}
                      {wi < line.length - 1 ? " " : ""}
                    </span>
                  ))}
                </div>
                {p > 0 && p < 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8%",
                      bottom: "8%",
                      right: `${p * 100}%`,
                      width: size * 0.08,
                      borderRadius: size,
                      background: COLORS.accent,
                      boxShadow: `0 0 ${size * 0.5}px ${COLORS.accent}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
