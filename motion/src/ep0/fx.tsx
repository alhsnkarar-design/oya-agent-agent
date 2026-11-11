// Visual-effects kit for the series reels: camera moves, shockwaves, flashes, glitch, light leaks, embers.
import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../theme";
import { clamp, PAL, T } from "../promo/kit";

/** Chromatic split as a text-shadow (amount in px). */
export const rgbSplit = (a: number) => (a < 0.2 ? undefined : `${a}px 0 0 rgba(255,40,90,.85), ${-a}px 0 0 rgba(40,220,255,.85)`);

/** Decaying 0→1 pulse after `at` (1 at impact, 0 after `len`). */
export const useImpact = (at: number, len = 14) => {
  const local = useCurrentFrame() - at;
  return local < 0 ? 0 : interpolate(local, [0, len], [1, 0], clamp);
};

/** Wraps a scene: slow push-in, optional pan, and decaying shakes at impact frames. */
export const Camera: React.FC<{ zoom?: [number, number]; dur?: number; x?: number; y?: number; shakes?: { at: number; amp: number }[]; children: React.ReactNode }> = ({
  zoom = [1, 1.06], dur = 140, x = 0, y = 0, shakes = [], children,
}) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], zoom, { ...clamp, easing: Easing.inOut(Easing.sin) });
  let sx = 0, sy = 0, sr = 0;
  for (const s of shakes) {
    const l = frame - s.at;
    if (l >= 0 && l < 24) {
      const k = s.amp * Math.exp(-l / 5);
      sx += (random(`sx${s.at}-${frame}`) - 0.5) * 2 * k;
      sy += (random(`sy${s.at}-${frame}`) - 0.5) * 2 * k;
      sr += (random(`sr${s.at}-${frame}`) - 0.5) * 0.06 * k;
    }
  }
  return <AbsoluteFill style={{ transform: `translate(${x + sx}px, ${y + sy}px) scale(${z}) rotate(${sr}deg)` }}>{children}</AbsoluteFill>;
};

/** Expanding double ring. */
export const Shockwave: React.FC<{ at: number; x?: string | number; y?: string | number; color?: string; size?: number }> = ({ at, x = "50%", y = "50%", color = PAL.ink, size = 520 }) => {
  const local = useCurrentFrame() - at;
  if (local < 0 || local > 36) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[0, 5].map((d) => {
        const p = interpolate(local - d, [0, 28], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        if (local - d < 0) return null;
        return (
          <div key={d} style={{
            position: "absolute", left: x, top: y, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, borderRadius: "50%",
            border: `${(1 - p) * 22 + 1}px solid ${color}`, opacity: (1 - p) * (d ? 0.5 : 0.9), transform: `scale(${0.1 + p * 1.7})`,
            boxShadow: `0 0 40px ${color}, inset 0 0 40px ${color}`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Full-frame flash. */
export const Flash: React.FC<{ at: number; color?: string; peak?: number; len?: number }> = ({ at, color = "#fff", peak = 0.5, len = 10 }) => {
  const local = useCurrentFrame() - at;
  if (local < 0 || local > len) return null;
  return <AbsoluteFill style={{ background: color, opacity: interpolate(local, [0, 2, len], [0, peak, 0], clamp), mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/** Speed lines radiating from a point. */
export const Streaks: React.FC<{ at: number; x?: number; y?: number; color?: string; count?: number; seed?: string }> = ({ at, x = 540, y = 960, color = PAL.ink, count = 28, seed = "st" }) => {
  const local = useCurrentFrame() - at;
  if (local < 0 || local > 20) return null;
  const p = interpolate(local, [0, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * 360 + random(`${seed}a${i}`) * 10;
        const d = 120 + p * (500 + random(`${seed}d${i}`) * 300);
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y, width: 4, height: 60 + random(`${seed}h${i}`) * 140, borderRadius: 4,
            background: `linear-gradient(${color}, transparent)`, opacity: (1 - p) * 0.8,
            transform: `rotate(${a}deg) translateY(${d}px)`, transformOrigin: "50% 0",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Warm light sweeping across the frame. */
export const LightLeak: React.FC<{ at: number; len?: number; color?: string }> = ({ at, len = 36, color = PAL.accent }) => {
  const local = useCurrentFrame() - at;
  if (local < 0 || local > len) return null;
  const p = local / len;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: Math.sin(p * Math.PI) * 0.55 }}>
      <div style={{ position: "absolute", top: "-10%", left: `${-60 + p * 140}%`, width: 900, height: "120%", transform: "rotate(14deg)", background: `radial-gradient(closest-side, ${color}, ${PAL.rose}55, transparent)`, filter: "blur(40px)" }} />
    </AbsoluteFill>
  );
};

/** Slow rising embers + vignette over everything. */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 34 }).map((_, i) => {
        const sp = 0.6 + random(`es${i}`) * 1.6;
        const y = (((random(`ey${i}`) * 2100 - frame * sp) % 2100) + 2100) % 2100 - 90;
        const x = random(`ex${i}`) * 1080 + Math.sin(frame / 30 + i) * 18;
        const s = 3 + random(`ez${i}`) * 5;
        const c = [PAL.accent, PAL.violet, PAL.teal][i % 3];
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: 99, background: c, opacity: 0.18 + random(`eo${i}`) * 0.3, boxShadow: `0 0 ${s * 3}px ${c}` }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55))" }} />
    </AbsoluteFill>
  );
};

/** Horizontal-slice glitch on any box for `len` frames after `at`. */
export const GlitchBox: React.FC<{ at: number; len?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, len = 14, children, style }) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  const on = local >= 0 && local < len;
  if (!on) return <div style={style}>{children}</div>;
  const amt = (1 - local / len) * 26;
  const cuts = [0, 34, 58, 100];
  return (
    <div style={{ position: "relative", ...style }}>
      <div style={{ visibility: "hidden" }}>{children}</div>
      {cuts.slice(0, -1).map((top, k) => (
        <div key={k} style={{
          position: "absolute", inset: 0, clipPath: `inset(${top}% 0 ${100 - cuts[k + 1]}% 0)`,
          transform: `translateX(${(random(`g${k}-${frame}`) - 0.5) * 2 * amt}px)`,
          filter: k === 1 ? "hue-rotate(160deg) saturate(2)" : undefined,
        }}>
          {children}
        </div>
      ))}
    </div>
  );
};

/** Words slide up out of a mask; accent words punch and glow. Word-level keeps Arabic joined. */
export const MaskWords: React.FC<{
  text: string; delay?: number; size?: number; weight?: number; color?: string; accent?: string[]; accentColor?: string;
  stagger?: number; style?: React.CSSProperties;
}> = ({ text, delay = 0, size = T.title, weight = 800, color = PAL.ink, accent = [], accentColor = PAL.accent, stagger = 4, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.28, fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.35, color, ...style }}>
      {text.split(/\s+/).map((w, i) => {
        const at = delay + i * stagger;
        const s = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 170, mass: 0.6 } });
        const hot = accent.includes(w.replace(/[.،؟!…]/g, ""));
        const punch = hot ? interpolate(frame - at, [4, 10, 22], [0, 0.2, 0], clamp) : 0;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: `${size * 0.15}px ${size * 0.06}px`, margin: `${-size * 0.15}px ${-size * 0.06}px`, transform: `scale(${1 + punch})` }}>
            <span style={{
              display: "inline-block", transform: `translateY(${(1 - s) * 115}%) rotate(${(1 - s) * 7}deg)`,
              color: hot ? accentColor : undefined, textShadow: hot ? `0 0 ${28 * Math.min(1, s)}px ${accentColor}aa` : undefined,
            }}>
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};
