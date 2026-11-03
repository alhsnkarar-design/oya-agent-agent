// Episode 0 of the "business from zero" series: the announcement reel (9:16).
// Scene lengths assume a calm Egyptian read (~2 words/s); retime once the voice is recorded.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { iris } from "@remotion/transitions/iris";
import { FONT, loadFonts } from "../theme";
import { Burst, Chip, clamp, PAL, Stage, T, useSpring, Words } from "../promo/kit";

/* 1 · «قررت أبني بزنس من الصفر… قدامكم.» — a zero inside an empty ring, then the camera goes live */
const Zero: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const num = useSpring(6, { damping: 12 });
  const live = useSpring(64, { damping: 11 });
  const blink = Math.floor(frame / 12) % 2 === 0 ? 1 : 0.25;
  const C = 2 * Math.PI * 190;
  const corner = (r: number) => ({
    position: "absolute" as const, width: 90, height: 90, borderColor: PAL.ink, borderStyle: "solid", opacity: live * 0.8,
    transform: `rotate(${r}deg) scale(${0.7 + live * 0.3})`,
    borderWidth: "6px 0 0 6px", borderTopLeftRadius: 18,
  });
  return (
    <Stage tintA={PAL.accent} tintB={PAL.azure}>
      <div style={{ position: "absolute", top: 300, insetInline: 70 }}>
        <Words text="قررت أبني بزنس من الصفر…" size={T.title} accentWords={["الصفر…", "الصفر"]} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg width={460} height={460} style={{ position: "absolute" }}>
          <circle cx={230} cy={230} r={190} fill="none" stroke="#ffffff14" strokeWidth={14} />
          <circle cx={230} cy={230} r={190} fill="none" stroke={PAL.accent} strokeWidth={14} strokeLinecap="round"
            strokeDasharray={`${C * 0.04 * ring} ${C}`} transform="rotate(-90 230 230)" />
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 220, color: PAL.ink, opacity: num, transform: `scale(${0.6 + num * 0.4})`, lineHeight: 1 }}>0</div>
      </AbsoluteFill>
      {/* viewfinder corners + REC: "in front of you" */}
      <div style={{ top: 170, right: 60, ...corner(90) }} />
      <div style={{ top: 170, left: 60, ...corner(0) }} />
      <div style={{ bottom: 170, left: 60, ...corner(-90) }} />
      <div style={{ bottom: 170, right: 60, ...corner(180) }} />
      <div style={{ position: "absolute", bottom: 470, insetInline: 0, display: "grid", justifyItems: "center", gap: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: live, transform: `scale(${0.6 + live * 0.4})`, fontFamily: FONT, fontWeight: 800, fontSize: T.tiny, color: PAL.ink, direction: "ltr" }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: PAL.coral, opacity: blink, boxShadow: `0 0 24px ${PAL.coral}` }} />
          REC
        </div>
        <Words text="قدامكم." delay={68} size={T.title + 10} accentWords={["قدامكم"]} />
      </div>
    </Stage>
  );
};

/* 2 · «كل خطوة، كل جنيه، وكل غلطة… هتشوفوها هنا.» — three ledger rows, each with its own motion */
const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [
    { t: "كل خطوة", c: PAL.teal, at: 8 },
    { t: "كل جنيه", c: PAL.accent, at: 30 },
    { t: "وكل غلطة", c: PAL.coral, at: 52 },
  ];
  return (
    <Stage tintA={PAL.teal} tintB={PAL.coral}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "grid", gap: 34, width: 780 }}>
          {rows.map((r, i) => {
            const s = spring({ frame: frame - r.at, fps: 30, config: { damping: 13, stiffness: 140 } });
            const local = frame - r.at;
            const shake = i === 2 ? Math.sin(local * 1.6) * interpolate(local, [6, 26], [10, 0], clamp) : 0;
            return (
              <div key={i} dir="rtl" style={{
                display: "flex", alignItems: "center", gap: 28, padding: "30px 36px", borderRadius: 28,
                background: PAL.panel, border: `2px solid ${r.c}55`, opacity: Math.min(1, s * 1.3),
                transform: `translateX(${(1 - s) * -160 + shake}px)`, boxShadow: `0 20px 60px -30px ${r.c}`,
              }}>
                <div style={{ width: 92, height: 92, borderRadius: 24, background: `${r.c}22`, display: "grid", placeItems: "center", flex: "none" }}>
                  {i === 0 && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {[0, 1, 2].map((k) => (
                        <span key={k} style={{ width: 16, height: 16, borderRadius: 99, background: local > 10 + k * 7 ? r.c : "#ffffff25" }} />
                      ))}
                    </div>
                  )}
                  {i === 1 && (
                    <div style={{ width: 56, height: 56, borderRadius: 99, background: r.c, color: "#1A1204", display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: 30, transform: `scaleX(${Math.cos(local / 6)})` }}>ج</div>
                  )}
                  {i === 2 && (
                    <svg width={56} height={56}>
                      <path d="M10 10 L46 46 M46 10 L10 46" stroke={r.c} strokeWidth={9} strokeLinecap="round"
                        strokeDasharray={120} strokeDashoffset={120 * (1 - interpolate(local, [4, 20], [0, 1], clamp))} />
                    </svg>
                  )}
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: T.title, color: PAL.ink }}>{r.t}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 380, insetInline: 60 }}>
        <Words text="هتشوفوها هنا." delay={86} size={T.title} accentWords={["هنا"]} />
      </div>
    </Stage>
  );
};

/* 3 · «أول مشروع: موقع بيعمل المونتاج والموشن جرافيكس… بكلمة منك.» — a browser where one typed line builds a timeline */
const Project: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = useSpring(10, { damping: 14 });
  const prompt = "اعمل موشن لعنوان الحلقة";
  const typed = Math.floor(interpolate(frame, [36, 80], [0, prompt.length], clamp));
  const clips = [PAL.azure, PAL.violet, PAL.teal, PAL.rose, PAL.accent];
  const out = spring({ frame: frame - 98, fps, config: { damping: 12 } });
  return (
    <Stage tintA={PAL.violet} tintB={PAL.azure}>
      <div style={{ position: "absolute", top: 230, insetInline: 70, display: "grid", justifyItems: "center", gap: 18 }}>
        <Chip color={PAL.violet} ink="#fff" delay={0}>أول مشروع</Chip>
        <Words text="موقع بيعمل المونتاج والموشن جرافيكس" delay={4} size={T.sub + 6} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: 120 }}>
        <div style={{ width: 880, borderRadius: 30, background: PAL.panel, overflow: "hidden", opacity: win, transform: `translateY(${(1 - win) * 80}px) scale(${0.9 + win * 0.1})`, boxShadow: `0 40px 100px -40px #000, 0 0 0 2px #ffffff12` }}>
          <div style={{ display: "flex", gap: 10, padding: "20px 24px", background: PAL.panel2, direction: "ltr", alignItems: "center" }}>
            {[PAL.coral, PAL.accent, PAL.teal].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 99, background: c }} />)}
            <span style={{ marginLeft: 20, fontFamily: FONT, fontWeight: 700, fontSize: T.tiny - 4, color: PAL.soft }}>Zifidit</span>
          </div>
          <div style={{ padding: 34, display: "grid", gap: 30 }}>
            <div style={{ height: 230, borderRadius: 20, background: "#06050C", display: "grid", placeItems: "center", overflow: "hidden" }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: PAL.accent, opacity: out, transform: `scale(${0.5 + out * 0.5}) rotate(${(1 - out) * -8}deg)`, whiteSpace: "nowrap" }}>
                الحلقة 0
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, height: 46, direction: "ltr" }}>
              {clips.map((c, i) => {
                const s = spring({ frame: frame - 84 - i * 3, fps, config: { damping: 13 } });
                return <div key={i} style={{ flex: [3, 2, 4, 2, 3][i], borderRadius: 10, background: c, opacity: s, transform: `scaleY(${s})` }} />;
              })}
            </div>
            <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 18, background: "#0E0C18", border: `2px solid ${PAL.violet}66`, fontFamily: FONT, fontWeight: 600, fontSize: T.small, color: PAL.ink, minHeight: 44 }}>
              <span>{prompt.slice(0, typed)}</span>
              <span style={{ width: 3, height: 36, background: PAL.accent, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 250, insetInline: 60 }}>
        <Words text="بكلمة منك." delay={106} size={T.title} accentWords={["بكلمة"]} />
      </div>
      <Burst at={98} y="47%" seed="proj" count={24} spread={340} />
    </Stage>
  );
};

/* 4 · «اسمه زيفيديت. ولسه بنبنيه.» — the name lands, then a construction bar keeps moving */
const Name: React.FC = () => {
  const frame = useCurrentFrame();
  const name = useSpring(4, { damping: 11 });
  const bar = useSpring(44, { damping: 14 });
  const sweep = interpolate(frame, [8, 30], [-20, 120], clamp);
  return (
    <Stage tintA={PAL.accent} tintB={PAL.violet}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 70 }}>
        <div style={{ position: "relative", fontFamily: FONT, fontWeight: 800, fontSize: 120, color: PAL.ink, opacity: name, transform: `scale(${0.7 + name * 0.3})`, direction: "ltr" }}>
          Zifidit<span style={{ color: PAL.accent }}>.</span>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep - 15}%, #ffffff66 ${sweep}%, transparent ${sweep + 15}%)`, mixBlendMode: "overlay" }} />
        </div>
        <div style={{ display: "grid", justifyItems: "center", gap: 26, opacity: bar, transform: `translateY(${(1 - bar) * 40}px)` }}>
          <div style={{ width: 640, height: 34, borderRadius: 99, overflow: "hidden", background: "#ffffff12", border: "2px solid #ffffff1f" }}>
            <div style={{
              height: "100%", width: `${interpolate(frame, [44, 90], [0, 38], { ...clamp, easing: Easing.out(Easing.cubic) })}%`,
              background: `repeating-linear-gradient(45deg, ${PAL.accent} 0 22px, #1A1204 22px 44px)`,
              backgroundPosition: `${frame * 2}px 0`, borderRadius: 99, marginInlineStart: "auto",
            }} />
          </div>
          <Words text="ولسه بنبنيه." delay={52} size={T.sub + 6} weight={700} color={PAL.soft} />
        </div>
      </AbsoluteFill>
      <Burst at={6} y="44%" seed="name" count={40} spread={480} />
    </Stage>
  );
};

/* 5 · «لو نجح، هتعرفوا إزاي. ولو فشل… هتعرفوا ليه.» — one line, two possible futures */
const Fork: React.FC = () => {
  const frame = useCurrentFrame();
  const stem = interpolate(frame, [4, 30], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const up = interpolate(frame, [26, 56], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const down = interpolate(frame, [70, 100], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const L = 900;
  const label = (text: string, sub: string, c: string, delay: number, top: number) => (
    <div style={{ position: "absolute", top, left: 70, width: 470, display: "grid", gap: 10 }}>
      <Words text={text} delay={delay} size={T.title} color={c} style={{ justifyContent: "flex-start" }} />
      <Words text={sub} delay={delay + 10} size={T.sub} weight={700} style={{ justifyContent: "flex-start" }} />
    </div>
  );
  return (
    <Stage tintA={PAL.teal} tintB={PAL.coral}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M1000 960 L620 960" stroke={PAL.ink} strokeWidth={10} strokeLinecap="round" fill="none" strokeDasharray={L} strokeDashoffset={L - 380 * stem} />
        <path d="M620 960 C 480 960, 420 640, 120 560" stroke={PAL.teal} strokeWidth={10} strokeLinecap="round" fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - up)} />
        <path d="M620 960 C 480 960, 420 1280, 120 1360" stroke={PAL.coral} strokeWidth={10} strokeLinecap="round" fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - down)} />
        <circle cx={620} cy={960} r={18 * stem} fill={PAL.ink} />
        {up > 0.98 && <circle cx={120} cy={560} r={16} fill={PAL.teal} />}
        {down > 0.98 && <circle cx={120} cy={1360} r={16} fill={PAL.coral} />}
      </svg>
      {label("لو نجح،", "هتعرفوا إزاي.", PAL.teal, 30, 380)}
      {label("ولو فشل…", "هتعرفوا ليه.", PAL.coral, 74, 1400)}
    </Stage>
  );
};

/* 6 · «تابع عشان تشوف هيحصل إيه.» — a follow button gets tapped, and episode 1 waits behind blur */
const Follow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = useSpring(26, { damping: 10 });
  const tap = spring({ frame: frame - 58, fps, config: { damping: 9, stiffness: 200 } });
  const cursorY = interpolate(frame, [36, 56], [260, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const followed = frame >= 58;
  const next = useSpring(76, { damping: 14 });
  return (
    <Stage tintA={PAL.accent} tintB={PAL.violet}>
      <div style={{ position: "absolute", top: 330, insetInline: 40 }}>
        <Words text="تابع عشان تشوف هيحصل إيه." size={T.title - 10} accentWords={["تابع"]} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", transform: `scale(${btn * (1 - Math.sin(Math.min(1, tap) * Math.PI) * 0.08)})` }}>
          <div dir="rtl" style={{
            fontFamily: FONT, fontWeight: 800, fontSize: T.sub + 4, padding: "26px 80px", borderRadius: 999,
            background: followed ? PAL.panel2 : PAL.accent, color: followed ? PAL.ink : "#1A1204",
            border: followed ? "2px solid #ffffff30" : "2px solid transparent", boxShadow: followed ? "none" : `0 20px 60px -15px ${PAL.accent}`,
          }}>
            {followed ? "بتتابع ✓" : "تابع"}
          </div>
          <div style={{ position: "absolute", left: "62%", top: "55%", transform: `translateY(${cursorY}px)`, opacity: interpolate(frame, [34, 40, 70, 80], [0, 1, 1, 0], clamp) }}>
            <svg width={58} height={58} viewBox="0 0 24 24"><path d="M5 2 L19 13 L12 14 L15 21 L12 22 L9 15 L4 19 Z" fill="#fff" stroke="#000" strokeWidth={1} /></svg>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 300, insetInline: 0, display: "grid", justifyItems: "center", opacity: next, transform: `translateY(${(1 - next) * 50}px)` }}>
        <div style={{ position: "relative", width: 520, height: 200, borderRadius: 28, overflow: "hidden", background: PAL.panel, border: "2px solid #ffffff14" }}>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", filter: "blur(14px)" }}>
            <div style={{ display: "flex", gap: 10 }}>{[PAL.teal, PAL.violet, PAL.coral, PAL.azure].map((c) => <div key={c} style={{ width: 90, height: 90, borderRadius: 18, background: c }} />)}</div>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: FONT, fontWeight: 800, fontSize: T.sub, color: PAL.ink }}>
            الحلقة 1 · قريب
          </div>
        </div>
      </div>
      <Burst at={58} y="50%" seed="follow" count={36} spread={420} />
    </Stage>
  );
};

export const EP0_SCENES = [
  { C: Zero, d: 112 }, { C: Ledger, d: 140 }, { C: Project, d: 150 },
  { C: Name, d: 104 }, { C: Fork, d: 140 }, { C: Follow, d: 130 },
];
const T_LEN = 12;
export const EP0_FRAMES = EP0_SCENES.reduce((n, s) => n + s.d, 0) - T_LEN * (EP0_SCENES.length - 1);

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
