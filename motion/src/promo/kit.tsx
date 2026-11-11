// Shared building blocks for the promo: moderate type, springs, light, particles, device frames.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "../theme";

export const PAL = {
  bg: "#0B0A12",
  ink: "#F5F3FF",
  soft: "#A9A4C4",
  accent: COLORS.accent, // saffron
  teal: "#2BD9B4",
  coral: "#FF5E62",
  azure: "#4C8DFF",
  violet: "#8E6BFF",
  rose: "#FF5AAE",
  panel: "#171525",
  panel2: "#211E33",
};

// Moderate type scale for 1080-wide frames.
export const T = { title: 66, sub: 40, small: 30, tiny: 24 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export function useSpring(delay = 0, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 150, mass: 0.7, ...cfg } });
}

/** A sentence whose words rise in one after another (word level keeps Arabic letters joined). */
export const Words: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  weight?: number;
  color?: string;
  accentWords?: string[];
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, size = T.title, weight = 800, color = PAL.ink, accentWords = [], stagger = 4, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/);
  return (
    <div
      dir="rtl"
      style={{
        display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.28,
        fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.35, color, textAlign: "center", ...style,
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 15, stiffness: 160, mass: 0.6 } });
        const hot = accentWords.includes(w.replace(/[.،؟!]/g, ""));
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: hot ? PAL.accent : undefined,
              opacity: Math.min(1, s * 1.3),
              transform: `translateY(${(1 - s) * size * 0.6}px)`,
              filter: `blur(${(1 - Math.min(1, s)) * 8}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Moving pools of light and fine grain behind every scene. */
export const Stage: React.FC<{ tintA?: string; tintB?: string; children?: React.ReactNode }> = ({ tintA = PAL.accent, tintB = PAL.violet, children }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: PAL.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px circle at ${70 + Math.sin(t * 0.6) * 10}% ${18 + Math.cos(t * 0.5) * 6}%, ${tintA}2e, transparent 70%),
                       radial-gradient(800px circle at ${25 + Math.cos(t * 0.45) * 12}% ${82 + Math.sin(t * 0.5) * 6}%, ${tintB}30, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.6) 0 1px, transparent 1px 3px)",
          transform: `translateY(${frame % 3}px)`,
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/** A burst of coloured particles starting at `at`. */
export const Burst: React.FC<{ at: number; x?: string; y?: string; count?: number; spread?: number; seed?: string }> = ({
  at, x = "50%", y = "50%", count = 36, spread = 420, seed = "b",
}) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0 || local > 50) return null;
  const cols = [PAL.accent, PAL.teal, PAL.coral, PAL.azure, PAL.violet, PAL.rose];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = (0.35 + random(`${seed}d${i}`) * 0.65) * spread;
        const p = interpolate(local, [0, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const size = 6 + random(`${seed}s${i}`) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: x, top: y, width: size, height: size * 0.6, borderRadius: 2,
              background: cols[i % cols.length],
              opacity: interpolate(local, [0, 8, 50], [0, 1, 0], clamp),
              transform: `translate(${Math.cos(a) * d * p}px, ${Math.sin(a) * d * p + p * p * 120}px) rotate(${local * 9 + i * 20}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Rounded phone frame for showing results. */
export const Phone: React.FC<{ w?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ w = 430, children, style }) => (
  <div
    style={{
      width: w, height: w * (16 / 9), borderRadius: w * 0.09, background: "#06050C", position: "relative", overflow: "hidden",
      boxShadow: `0 0 0 10px #1F1C2E, 0 40px 90px -30px rgba(0,0,0,.8), 0 0 120px -20px ${PAL.violet}55`, ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; color?: string; delay?: number; ink?: string }> = ({ children, color = PAL.accent, delay = 0, ink = "#160F2E" }) => {
  const s = useSpring(delay, { damping: 11 });
  return (
    <span
      dir="rtl"
      style={{
        display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: ink, background: color,
        padding: "10px 20px", borderRadius: 999, transform: `scale(${0.6 + s * 0.4})`, opacity: Math.min(1, s * 1.5),
      }}
    >
      {children}
    </span>
  );
};

/** Feature label shown at the top of each feature scene. */
export const FeatureHead: React.FC<{ n: string; label: string; color: string; line: string }> = ({ n, label, color, line }) => {
  const s = useSpring(0);
  return (
    <div style={{ position: "absolute", top: 210, insetInline: 70, display: "grid", justifyItems: "center", gap: 22 }}>
      <div
        dir="rtl"
        style={{
          display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontSize: T.small, fontWeight: 700, color,
          opacity: s, transform: `translateY(${(1 - s) * 20}px)`,
        }}
      >
        <span style={{ width: 44, height: 44, borderRadius: 12, background: color, color: "#160F2E", display: "grid", placeItems: "center", fontSize: 24 }}>{n}</span>
        {label}
      </div>
      <Words text={line} delay={6} size={T.title} />
    </div>
  );
};
