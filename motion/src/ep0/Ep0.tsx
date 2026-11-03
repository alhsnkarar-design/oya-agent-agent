// Episode 0 of the "business from zero" series: the announcement reel (9:16).
// Scene lengths assume a calm Egyptian read (~2 words/s); retime once the voice is recorded.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { iris } from "@remotion/transitions/iris";
import { FONT, loadFonts } from "../theme";
import { Burst, Chip, clamp, PAL, Stage, T, useSpring } from "../promo/kit";
import { Atmosphere, Camera, Flash, GlitchBox, LightLeak, MaskWords, rgbSplit, Shockwave, Streaks, useImpact } from "./fx";

const CX = 540, CY = 960;

/* 1 · «قررت أبني بزنس من الصفر… قدامكم.»
   Particles gather into a ring, a slot counter spins and slams onto 0, then the camera goes live. */
const Zero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gather = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ring = interpolate(frame, [18, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const slam = spring({ frame: frame - 22, fps, config: { damping: 10, stiffness: 220 } });
  const hit = useImpact(22, 14);
  const live = spring({ frame: frame - 64, fps, config: { damping: 11 } });
  const blink = Math.floor(frame / 10) % 2 === 0 ? 1 : 0.25;
  const digit = frame < 10 ? "" : frame < 22 ? String(1 + Math.floor(random(`d${Math.floor(frame / 2)}`) * 9)) : "0";
  const R = 190, C = 2 * Math.PI * R;
  const corner = (r: number) => ({
    position: "absolute" as const, width: 90, height: 90, borderColor: PAL.ink, borderStyle: "solid", borderWidth: "6px 0 0 6px", borderTopLeftRadius: 18,
    opacity: live * 0.85, transform: `rotate(${r}deg) scale(${1.4 - live * 0.4})`,
  });
  return (
    <Stage tintA={PAL.accent} tintB={PAL.azure}>
      <Camera zoom={[1.08, 1]} dur={60} shakes={[{ at: 22, amp: 16 }, { at: 66, amp: 8 }]}>
        <div style={{ position: "absolute", top: 300, insetInline: 70 }}>
          <MaskWords text="قررت أبني بزنس من الصفر…" accent={["الصفر"]} />
        </div>
        {/* particles converge into the ring */}
        {gather < 1 && Array.from({ length: 48 }).map((_, i) => {
          const a = (i / 48) * Math.PI * 2;
          const sx = random(`zx${i}`) * 1080, sy = random(`zy${i}`) * 1920;
          const x = interpolate(gather, [0, 1], [sx, CX + Math.cos(a) * R]);
          const y = interpolate(gather, [0, 1], [sy, CY + Math.sin(a) * R]);
          const c = [PAL.accent, PAL.teal, PAL.violet][i % 3];
          return <div key={i} style={{ position: "absolute", left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: 99, background: c, boxShadow: `0 0 16px ${c}`, opacity: 1 - ring }} />;
        })}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <svg width={460} height={460} style={{ position: "absolute", filter: `drop-shadow(0 0 ${10 + hit * 30}px ${PAL.accent}88)` }}>
            <circle cx={230} cy={230} r={R} fill="none" stroke="#ffffff22" strokeWidth={14} strokeDasharray={`${C * ring} ${C}`} transform="rotate(-90 230 230)" />
            <circle cx={230} cy={230} r={R} fill="none" stroke={PAL.accent} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${C * 0.04 * ring} ${C}`} transform="rotate(-90 230 230)" />
          </svg>
          <div style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 220, lineHeight: 1, color: frame < 22 ? PAL.soft : PAL.ink,
            transform: `scale(${frame < 22 ? 0.8 : 1.7 - slam * 0.7})`, textShadow: rgbSplit(hit * 18), filter: frame < 22 ? "blur(2px)" : undefined,
          }}>
            {digit}
          </div>
        </AbsoluteFill>
        <div style={{ top: 170, right: 60, ...corner(90) }} />
        <div style={{ top: 170, left: 60, ...corner(0) }} />
        <div style={{ bottom: 170, left: 60, ...corner(-90) }} />
        <div style={{ bottom: 170, right: 60, ...corner(180) }} />
        <div style={{ position: "absolute", bottom: 470, insetInline: 0, display: "grid", justifyItems: "center", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: live, transform: `scale(${0.6 + live * 0.4})`, fontFamily: FONT, fontWeight: 800, fontSize: T.tiny, color: PAL.ink, direction: "ltr" }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: PAL.coral, opacity: blink, boxShadow: `0 0 24px ${PAL.coral}` }} />
            REC
          </div>
          <MaskWords text="قدامكم." delay={68} size={T.title + 10} accent={["قدامكم"]} />
        </div>
      </Camera>
      <Shockwave at={22} color={PAL.accent} size={560} />
      <Streaks at={22} color={PAL.accent} seed="z" />
      <Flash at={22} peak={0.35} />
      <Flash at={64} color={PAL.coral} peak={0.18} />
    </Stage>
  );
};

/* 2 · «كل خطوة، كل جنيه، وكل غلطة… هتشوفوها هنا.»
   Three cards fly in on a 3D swing and land hard; the mistake card glitches. */
const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { t: "كل خطوة", c: PAL.teal, at: 8 },
    { t: "كل جنيه", c: PAL.accent, at: 30 },
    { t: "وكل غلطة", c: PAL.coral, at: 52 },
  ];
  return (
    <Stage tintA={PAL.teal} tintB={PAL.coral}>
      <Camera zoom={[1, 1.05]} shakes={rows.map((r) => ({ at: r.at + 9, amp: 7 })).concat([{ at: 62, amp: 14 }])}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: 1400 }}>
          <div style={{ display: "grid", gap: 34, width: 780, transformStyle: "preserve-3d" }}>
            {rows.map((r, i) => {
              const s = spring({ frame: frame - r.at, fps: 30, config: { damping: 12, stiffness: 150 } });
              const local = frame - r.at;
              const glow = interpolate(local, [8, 12, 40], [0, 1, 0.35], clamp);
              const sh = interpolate(local, [8, 30], [-30, 130], clamp);
              const card = (
                <div dir="rtl" style={{
                  display: "flex", alignItems: "center", gap: 28, padding: "30px 36px", borderRadius: 28,
                  background: `linear-gradient(135deg, ${PAL.panel2}, ${PAL.panel})`, border: `2px solid ${r.c}${glow > 0.5 ? "cc" : "55"}`,
                  boxShadow: `0 20px 60px -30px ${r.c}, 0 0 ${glow * 60}px -10px ${r.c}`, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sh - 15}%, #ffffff22 ${sh}%, transparent ${sh + 15}%)` }} />
                  <div style={{ width: 92, height: 92, borderRadius: 24, background: `${r.c}22`, display: "grid", placeItems: "center", flex: "none", perspective: 400 }}>
                    {i === 0 && (
                      <div style={{ display: "flex", gap: 8, direction: "ltr" }}>
                        {[0, 1, 2].map((k) => {
                          const on = local > 12 + k * 7;
                          return <span key={k} style={{ width: 16, height: 16, borderRadius: 99, background: on ? r.c : "#ffffff25", boxShadow: on ? `0 0 14px ${r.c}` : undefined, transform: `scale(${on ? 1 + interpolate(local - 12 - k * 7, [0, 4, 10], [0.6, 0, 0], clamp) : 1})` }} />;
                        })}
                      </div>
                    )}
                    {i === 1 && (
                      <div style={{ width: 58, height: 58, borderRadius: 99, background: `radial-gradient(circle at 35% 30%, #FFE3A3, ${r.c} 60%, #A86A0E)`, color: "#3A2404", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 30, transform: `rotateY(${local * 14}deg)`, boxShadow: `0 0 24px ${r.c}88` }}>ج</div>
                    )}
                    {i === 2 && (
                      <svg width={56} height={56} style={{ filter: `drop-shadow(0 0 8px ${r.c})` }}>
                        <path d="M10 10 L46 46 M46 10 L10 46" stroke={r.c} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - interpolate(local, [4, 16], [0, 1], clamp)} />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: T.title, color: PAL.ink, textShadow: i === 2 ? rgbSplit(interpolate(local, [10, 24], [12, 0], clamp)) : undefined }}>{r.t}</div>
                </div>
              );
              return (
                <div key={i} style={{
                  opacity: Math.min(1, s * 1.4),
                  transform: `translateX(${(1 - s) * -260}px) translateZ(${(1 - s) * 300}px) rotateY(${(1 - s) * -75}deg) rotateZ(${(1 - s) * -6}deg)`,
                }}>
                  {i === 2 ? <GlitchBox at={60} len={14}>{card}</GlitchBox> : card}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", bottom: 380, insetInline: 60 }}>
          <MaskWords text="هتشوفوها هنا." delay={86} accent={["هنا"]} />
        </div>
      </Camera>
      <Burst at={40} x="50%" y="50%" seed="coin" count={22} spread={300} />
      <Flash at={60} color={PAL.coral} peak={0.28} />
      <Shockwave at={92} y="76%" color={PAL.accent} size={360} />
    </Stage>
  );
};

/* 3 · «أول مشروع: موقع بيعمل المونتاج والموشن جرافيكس… بكلمة منك.»
   A browser swings in in 3D; one typed line shoots a beam up and the timeline builds itself. */
const Project: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame: frame - 8, fps, config: { damping: 15 } });
  const prompt = "اعمل موشن لعنوان الحلقة";
  const typed = Math.floor(interpolate(frame, [34, 76], [0, prompt.length], clamp));
  const clips = [PAL.azure, PAL.violet, PAL.teal, PAL.rose, PAL.accent];
  const beam = interpolate(frame, [80, 90], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const beamFade = interpolate(frame, [92, 104], [1, 0], clamp);
  const out = spring({ frame: frame - 96, fps, config: { damping: 10, stiffness: 180 } });
  const hit = useImpact(96, 14);
  const armed = frame > 76 && frame < 96;
  const rx = interpolate(win, [0, 1], [38, 10]) + Math.sin(frame / 25) * 2;
  const ry = interpolate(win, [0, 1], [-28, -6]) + Math.cos(frame / 30) * 3;
  return (
    <Stage tintA={PAL.violet} tintB={PAL.azure}>
      <Camera zoom={[1, 1.07]} dur={150} shakes={[{ at: 96, amp: 12 }]}>
        <div style={{ position: "absolute", top: 230, insetInline: 70, display: "grid", justifyItems: "center", gap: 18 }}>
          <Chip color={PAL.violet} ink="#fff" delay={0}>أول مشروع</Chip>
          <MaskWords text="موقع بيعمل المونتاج والموشن جرافيكس" delay={4} size={T.sub + 6} stagger={3} />
        </div>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: 120, perspective: 1600 }}>
          <div style={{
            width: 880, borderRadius: 30, background: PAL.panel, position: "relative", opacity: Math.min(1, win * 1.4),
            transform: `translateY(${(1 - win) * 260}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
            boxShadow: `0 60px 120px -40px #000, 0 0 0 2px #ffffff12, 0 0 ${80 + hit * 120}px -30px ${PAL.violet}`,
          }}>
            <div style={{ display: "flex", gap: 10, padding: "20px 24px", background: PAL.panel2, direction: "ltr", alignItems: "center", borderRadius: "30px 30px 0 0" }}>
              {[PAL.coral, PAL.accent, PAL.teal].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c }} />)}
              <span style={{ marginLeft: 20, fontFamily: FONT, fontWeight: 700, fontSize: T.tiny - 4, color: PAL.soft }}>Zifidit</span>
            </div>
            <div style={{ padding: 34, display: "grid", gap: 30, position: "relative" }}>
              <div style={{ height: 230, borderRadius: 20, background: "#06050C", display: "grid", placeItems: "center", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${PAL.accent}${hit > 0 ? "55" : "18"}, transparent 60%)`, opacity: out }} />
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: PAL.accent, opacity: Math.min(1, out * 1.5), transform: `scale(${0.3 + out * 0.7}) rotate(${(1 - out) * -10}deg)`, whiteSpace: "nowrap", textShadow: rgbSplit(hit * 14) ?? `0 0 30px ${PAL.accent}88` }}>
                  الحلقة 0
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, height: 46, direction: "ltr" }}>
                {clips.map((c, i) => {
                  const s = spring({ frame: frame - 86 - i * 3, fps, config: { damping: 12 } });
                  return <div key={i} style={{ flex: [3, 2, 4, 2, 3][i], borderRadius: 10, background: c, opacity: s, transform: `translateY(${(1 - s) * 110}px) scale(${0.4 + s * 0.6})`, boxShadow: `0 0 ${(1 - s) * 30 + 6}px ${c}` }} />;
                })}
              </div>
              <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 18, background: "#0E0C18", border: `2px solid ${PAL.violet}${armed ? "ff" : "66"}`, boxShadow: armed ? `0 0 40px ${PAL.violet}` : undefined, fontFamily: FONT, fontWeight: 600, fontSize: T.small, color: PAL.ink, minHeight: 44 }}>
                <span>{prompt.slice(0, typed)}</span>
                <span style={{ width: 3, height: 36, background: PAL.accent, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
              </div>
              {/* the beam: prompt → preview */}
              <div style={{ position: "absolute", left: "50%", bottom: 120, width: 14, marginLeft: -7, height: 300 * beam, opacity: beamFade, borderRadius: 99, background: `linear-gradient(to top, ${PAL.violet}, ${PAL.accent})`, boxShadow: `0 0 40px ${PAL.accent}, 0 0 80px ${PAL.violet}` }} />
            </div>
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", bottom: 250, insetInline: 60 }}>
          <MaskWords text="بكلمة منك." delay={106} accent={["بكلمة"]} />
        </div>
      </Camera>
      <Flash at={96} peak={0.3} />
      <Streaks at={96} x={540} y={890} color={PAL.accent} seed="p" />
      <Burst at={96} y="46%" seed="proj" count={30} spread={380} />
    </Stage>
  );
};

/* 4 · «اسمه زيفيديت. ولسه بنبنيه.»
   The letters fly in from everywhere and lock together; a construction bar throws sparks. */
const Name: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const letters = "Zifidit".split("");
  const lock = 4 + letters.length * 2 + 6;
  const hit = useImpact(lock, 16);
  const bar = useSpring(44, { damping: 14 });
  const pct = interpolate(frame, [44, 96], [0, 38], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sweep = interpolate(frame, [lock, lock + 22], [-20, 120], clamp);
  return (
    <Stage tintA={PAL.accent} tintB={PAL.violet}>
      <Camera zoom={[1.1, 1]} dur={40} shakes={[{ at: lock, amp: 18 }]}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 80 }}>
          <div style={{ position: "relative", display: "flex", fontFamily: FONT, fontWeight: 800, fontSize: 124, color: PAL.ink, direction: "ltr", textShadow: rgbSplit(hit * 16) ?? `0 0 40px ${PAL.accent}55` }}>
            {[...letters, "."].map((l, i) => {
              const s = spring({ frame: frame - 4 - i * 2, fps, config: { damping: 13, stiffness: 160 } });
              const sx = (random(`nx${i}`) - 0.5) * 1400, sy = (random(`ny${i}`) - 0.5) * 1600;
              return (
                <span key={i} style={{
                  display: "inline-block", color: l === "." ? PAL.accent : undefined, opacity: Math.min(1, s * 2),
                  transform: `translate(${(1 - s) * sx}px, ${(1 - s) * sy}px) rotate(${(1 - s) * (random(`nr${i}`) - 0.5) * 540}deg) scale(${1 + (1 - s) * 1.5})`,
                  filter: `blur(${(1 - Math.min(1, s)) * 14}px)`,
                }}>{l}</span>
              );
            })}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 12}%, #ffffffaa ${sweep}%, transparent ${sweep + 12}%)`, mixBlendMode: "overlay" }} />
          </div>
          <div style={{ display: "grid", justifyItems: "center", gap: 26, opacity: bar, transform: `translateY(${(1 - bar) * 40}px)` }}>
            <div style={{ position: "relative", width: 640, height: 34 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 99, overflow: "hidden", background: "#ffffff12", border: "2px solid #ffffff1f" }}>
                <div style={{
                  height: "100%", width: `${pct}%`, marginInlineStart: "auto", borderRadius: 99,
                  background: `repeating-linear-gradient(45deg, ${PAL.accent} 0 22px, #1A1204 22px 44px)`, backgroundPosition: `${frame * 2}px 0`,
                  boxShadow: `0 0 30px ${PAL.accent}`,
                }} />
              </div>
              {/* sparks off the leading edge */}
              {frame >= 46 && Array.from({ length: 18 }).map((_, k) => {
                const born = 46 + k * 3, age = frame - born;
                if (age < 0 || age > 16) return null;
                const a = -Math.PI / 2 + (random(`sa${k}`) - 0.5) * 2.2;
                const v = 6 + random(`sv${k}`) * 8;
                return <div key={k} style={{ position: "absolute", left: `${100 - pct}%`, top: 17, width: 6, height: 6, borderRadius: 99, background: "#FFE3A3", boxShadow: `0 0 10px ${PAL.accent}`, opacity: 1 - age / 16, transform: `translate(${Math.cos(a) * v * age}px, ${Math.sin(a) * v * age + age * age * 0.6}px)` }} />;
              })}
            </div>
            <MaskWords text="ولسه بنبنيه." delay={52} size={T.sub + 6} weight={700} color={PAL.soft} accent={["بنبنيه"]} />
          </div>
        </AbsoluteFill>
      </Camera>
      <Shockwave at={lock} y="44%" color={PAL.accent} size={700} />
      <Streaks at={lock} y={850} color={PAL.ink} seed="n" count={36} />
      <Flash at={lock} peak={0.45} />
      <Burst at={lock} y="44%" seed="name" count={44} spread={520} />
    </Stage>
  );
};

/* 5 · «لو نجح، هتعرفوا إزاي. ولو فشل… هتعرفوا ليه.»
   One glowing line splits into two futures; the camera follows each path. */
const bez = (t: number, p: number[][]) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
};
const UP = [[620, 960], [480, 960], [420, 640], [120, 560]];
const DOWN = [[620, 960], [480, 960], [420, 1280], [120, 1360]];
const dPath = (p: number[][]) => `M${p[0][0]} ${p[0][1]} C ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]}, ${p[3][0]} ${p[3][1]}`;

const Fork: React.FC = () => {
  const frame = useCurrentFrame();
  const stem = interpolate(frame, [4, 28], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const up = interpolate(frame, [26, 56], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const down = interpolate(frame, [70, 100], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const camY = interpolate(frame, [26, 56, 70, 100, 130], [0, 140, 140, -140, -60], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const head = (p: number, path: number[][], c: string) => {
    if (p <= 0 || p >= 1) return null;
    const [x, y] = bez(p, path);
    return <circle cx={x} cy={y} r={14} fill="#fff" style={{ filter: `drop-shadow(0 0 16px ${c}) drop-shadow(0 0 30px ${c})` }} />;
  };
  const trail = (p: number, path: number[][], c: string, seed: string) =>
    Array.from({ length: 14 }).map((_, k) => {
      const t = p - k * 0.025;
      if (p >= 1 || t <= 0) return null;
      const [x, y] = bez(t, path);
      return <circle key={seed + k} cx={x + (random(`${seed}${k}`) - 0.5) * 26} cy={y + (random(`${seed}y${k}`) - 0.5) * 26} r={5 - k * 0.3} fill={c} opacity={1 - k / 14} />;
    });
  const label = (text: string, sub: string, c: string, delay: number, top: number, glitch?: number) => {
    const inner = (
      <div style={{ display: "grid", gap: 10 }}>
        <MaskWords text={text} delay={delay} color={c} style={{ justifyContent: "flex-start" }} />
        <MaskWords text={sub} delay={delay + 10} size={T.sub} weight={700} style={{ justifyContent: "flex-start" }} />
      </div>
    );
    return <div style={{ position: "absolute", top, left: 70, width: 470 }}>{glitch !== undefined ? <GlitchBox at={glitch} len={16}>{inner}</GlitchBox> : inner}</div>;
  };
  return (
    <Stage tintA={PAL.teal} tintB={PAL.coral}>
      <Camera zoom={[1, 1.04]} y={camY} shakes={[{ at: 100, amp: 14 }]}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d="M1000 960 L620 960" stroke={PAL.ink} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - stem} style={{ filter: "drop-shadow(0 0 10px #fff8)" }} />
          <path d={dPath(UP)} stroke={PAL.teal} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - up} style={{ filter: `drop-shadow(0 0 14px ${PAL.teal})` }} />
          <path d={dPath(DOWN)} stroke={PAL.coral} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - down} style={{ filter: `drop-shadow(0 0 14px ${PAL.coral})` }} />
          {trail(up, UP, PAL.teal, "tu")}
          {trail(down, DOWN, PAL.coral, "td")}
          {head(up, UP, PAL.teal)}
          {head(down, DOWN, PAL.coral)}
          <circle cx={620} cy={960} r={18 * stem} fill={PAL.ink} style={{ filter: "drop-shadow(0 0 16px #fff)" }} />
          {up >= 1 && <circle cx={120} cy={560} r={16} fill={PAL.teal} style={{ filter: `drop-shadow(0 0 16px ${PAL.teal})` }} />}
          {down >= 1 && <circle cx={120} cy={1360} r={16} fill={PAL.coral} style={{ filter: `drop-shadow(0 0 16px ${PAL.coral})` }} />}
          {/* cracks where "failure" lands */}
          {frame >= 100 && [0, 1, 2, 3, 4].map((k) => {
            const a = -0.9 + k * 0.45, L = 150 * interpolate(frame, [100, 110], [0, 1], clamp);
            const mx = 120 + Math.cos(a) * L * 0.5 + (random(`ck${k}`) - 0.5) * 30, my = 1360 + Math.sin(a) * L * 0.5;
            return <path key={k} d={`M120 1360 L${mx} ${my} L${120 + Math.cos(a) * L} ${1360 + Math.sin(a) * L}`} stroke={PAL.coral} strokeWidth={4} fill="none" opacity={0.8} />;
          })}
        </svg>
        {label("لو نجح،", "هتعرفوا إزاي.", PAL.teal, 30, 380)}
        {label("ولو فشل…", "هتعرفوا ليه.", PAL.coral, 74, 1400, 100)}
        <Shockwave at={56} x={120} y={560} color={PAL.teal} size={300} />
        <Burst at={56} x="11%" y="29%" seed="up" count={30} spread={300} />
      </Camera>
      <Flash at={56} color={PAL.teal} peak={0.2} />
      <Flash at={100} color={PAL.coral} peak={0.3} />
    </Stage>
  );
};

/* 6 · «تابع عشان تشوف هيحصل إيه.» — the follow button gets tapped, and episode 1 waits behind blur */
const Follow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = useSpring(22, { damping: 10 });
  const tap = spring({ frame: frame - 58, fps, config: { damping: 9, stiffness: 200 } });
  const cursorY = interpolate(frame, [34, 56], [300, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cursorX = interpolate(frame, [34, 56], [160, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const followed = frame >= 58;
  const next = spring({ frame: frame - 74, fps, config: { damping: 14 } });
  const shine = interpolate(frame, [86, 116], [-30, 130], clamp);
  return (
    <Stage tintA={PAL.accent} tintB={PAL.violet}>
      <Camera zoom={[1, 1.05]} dur={130} shakes={[{ at: 58, amp: 10 }]}>
        <div style={{ position: "absolute", top: 330, insetInline: 40 }}>
          <MaskWords text="تابع عشان تشوف هيحصل إيه." size={T.title - 10} accent={["تابع"]} />
        </div>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "relative", transform: `scale(${btn * (1 - Math.sin(Math.min(1, tap) * Math.PI) * 0.1)})` }}>
            <div dir="rtl" style={{
              fontFamily: FONT, fontWeight: 800, fontSize: T.sub + 4, padding: "26px 80px", borderRadius: 999,
              background: followed ? PAL.panel2 : PAL.accent, color: followed ? PAL.ink : "#1A1204",
              border: followed ? `2px solid ${PAL.teal}` : "2px solid transparent",
              boxShadow: followed ? `0 0 40px -6px ${PAL.teal}` : `0 20px 60px -15px ${PAL.accent}, 0 0 ${20 + Math.sin(frame / 5) * 14}px ${PAL.accent}88`,
            }}>
              {followed ? "بتتابع ✓" : "تابع"}
            </div>
            <div style={{ position: "absolute", left: "62%", top: "55%", transform: `translate(${cursorX}px, ${cursorY}px) scale(${frame >= 56 && frame < 62 ? 0.85 : 1})`, opacity: interpolate(frame, [32, 38, 72, 82], [0, 1, 1, 0], clamp) }}>
              <svg width={60} height={60} viewBox="0 0 24 24"><path d="M5 2 L19 13 L12 14 L15 21 L12 22 L9 15 L4 19 Z" fill="#fff" stroke="#000" strokeWidth={1} /></svg>
            </div>
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", bottom: 300, insetInline: 0, display: "grid", justifyItems: "center", perspective: 900 }}>
          <div style={{ position: "relative", width: 540, height: 210, borderRadius: 28, overflow: "hidden", background: PAL.panel, border: "2px solid #ffffff1a", boxShadow: `0 30px 80px -30px #000, 0 0 60px -20px ${PAL.violet}`, opacity: next, transform: `translateY(${(1 - next) * 80}px) rotateX(${(1 - next) * 50}deg)` }}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", filter: "blur(16px)" }}>
              <div style={{ display: "flex", gap: 10, transform: `translateX(${Math.sin(frame / 14) * 40}px)` }}>
                {[PAL.teal, PAL.violet, PAL.coral, PAL.azure].map((c) => <div key={c} style={{ width: 92, height: 92, borderRadius: 18, background: c }} />)}
              </div>
            </div>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${shine - 14}%, #ffffff30 ${shine}%, transparent ${shine + 14}%)` }} />
            <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", gap: 16, alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: T.sub, color: PAL.ink }}>
              <svg width={34} height={34} viewBox="0 0 24 24"><rect x={4} y={10} width={16} height={12} rx={3} fill={PAL.accent} /><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke={PAL.accent} strokeWidth={2.6} fill="none" /></svg>
              الحلقة 1 · قريب
            </div>
          </div>
        </div>
      </Camera>
      <Shockwave at={58} color={PAL.accent} size={420} />
      <Flash at={58} peak={0.3} />
      <Burst at={58} y="50%" seed="follow" count={50} spread={520} />
    </Stage>
  );
};

export const EP0_SCENES = [
  { C: Zero, d: 112 }, { C: Ledger, d: 140 }, { C: Project, d: 150 },
  { C: Name, d: 104 }, { C: Fork, d: 140 }, { C: Follow, d: 130 },
];
const T_LEN = 12;
export const EP0_FRAMES = EP0_SCENES.reduce((n, s) => n + s.d, 0) - T_LEN * (EP0_SCENES.length - 1);
const STARTS = EP0_SCENES.map((_, i) => EP0_SCENES.slice(0, i).reduce((n, s) => n + s.d - T_LEN, 0));

export const Ep0: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => { loadFonts().then(() => continueRender(h)).catch((e) => cancelRender(e)); }, [h]);
  const frame = useCurrentFrame();
  const transitions = [
    wipe({ direction: "from-right" }), slide({ direction: "from-bottom" }), iris({ width: 1080, height: 1920 }),
    wipe({ direction: "from-left" }), fade(),
  ];
  const badge = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: PAL.bg }}>
      <TransitionSeries>
        {EP0_SCENES.map(({ C, d }, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={d}><C /></TransitionSeries.Sequence>
            {i < EP0_SCENES.length - 1 && (
              <TransitionSeries.Transition presentation={transitions[i] as never} timing={linearTiming({ durationInFrames: T_LEN })} />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Atmosphere />
      {/* light leaks + soft flashes on every cut */}
      {STARTS.slice(1).map((s, i) => (
        <React.Fragment key={i}>
          <LightLeak at={s - 10} len={34} color={[PAL.accent, PAL.violet, PAL.rose, PAL.teal, PAL.accent][i]} />
          <Flash at={s + 4} peak={0.12} len={8} />
        </React.Fragment>
      ))}
      {/* series badge: the same in every episode so people recognise the show */}
      <div dir="rtl" style={{ position: "absolute", top: 110, insetInline: 0, display: "flex", justifyContent: "center", opacity: badge }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: PAL.ink, background: "#ffffff10", border: "1px solid #ffffff22", padding: "10px 24px", borderRadius: 999 }}>
          بزنس من الصفر · <span style={{ color: PAL.accent }}>الحلقة 0</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 26, color: "#8C88A3", direction: "ltr" }}>@zifidit</div>
    </AbsoluteFill>
  );
};
