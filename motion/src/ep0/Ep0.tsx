// Episode 0 of the "business from zero" series: the announcement reel (9:16).
// A real 3D world (three.js + bloom) that one camera flies through, with Arabic type laid over it in HTML
// so letters stay joined. Labels are pinned to 3D objects by projecting through the same camera.
// Scene lengths assume a calm Egyptian read (~2 words/s); retime once the voice is recorded.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, Sequence, spring, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { FONT, loadFonts } from "../theme";
import { clamp, PAL, T } from "../promo/kit";
import { Flash, GlitchBox, LightLeak, MaskWords, rgbSplit } from "./fx";
import { DURS, FOV, H, IMPACTS, project, STARTS, TOTAL, W, ZS } from "./camera";
import { DOWN_END, LEDGER_X, LEDGER_Y, NAME_BAR_Y, PROMPT_Y, SCREEN_Y, UP_END, World } from "./world";

export const EP0_FRAMES = TOTAL;

const sp = (f: number, damping = 13) => spring({ frame: f, fps: 30, config: { damping, stiffness: 150, mass: 0.7 } });
const inScene = (f: number, i: number) => f >= STARTS[i] && f < STARTS[i] + DURS[i];

/** Text pinned to a projected 3D point. */
const Pin: React.FC<{ x: number; y: number; children: React.ReactNode; anchor?: "start" | "center"; width?: number }> = ({ x, y, children, anchor = "start", width = 560 }) => (
  <div style={{ position: "absolute", left: anchor === "center" ? x - width / 2 : x, top: y, width, transform: "translateY(-50%)" }}>{children}</div>
);

const Overlay: React.FC<{ f: number; i: number }> = ({ f, i: only }) => {
  const els: React.ReactNode[] = [];

  /* 1 · zero */
  if (only === 0 && inScene(f, 0)) {
    const live = sp(f - 64, 11);
    const blink = Math.floor(f / 10) % 2 === 0 ? 1 : 0.25;
    const corner = (r: number, pos: React.CSSProperties) => (
      <div style={{ position: "absolute", width: 90, height: 90, borderColor: PAL.ink, borderStyle: "solid", borderWidth: "6px 0 0 6px", borderTopLeftRadius: 18, opacity: live * 0.85, transform: `rotate(${r}deg) scale(${1.4 - live * 0.4})`, ...pos }} />
    );
    els.push(
      <React.Fragment key="a">
        <div style={{ position: "absolute", top: 300, insetInline: 70 }}>
          <MaskWords text="قررت أبني بزنس من الصفر…" delay={6} accent={["الصفر"]} />
        </div>
        {corner(90, { top: 170, right: 60 })}{corner(0, { top: 170, left: 60 })}{corner(-90, { bottom: 170, left: 60 })}{corner(180, { bottom: 170, right: 60 })}
        <div style={{ position: "absolute", bottom: 430, insetInline: 0, display: "grid", justifyItems: "center", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: live, transform: `scale(${0.6 + live * 0.4})`, fontFamily: FONT, fontWeight: 800, fontSize: T.tiny, color: PAL.ink, direction: "ltr" }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: PAL.coral, opacity: blink, boxShadow: `0 0 24px ${PAL.coral}` }} />
            REC
          </div>
          <MaskWords text="قدامكم." delay={68} size={T.title + 10} accent={["قدامكم"]} />
        </div>
      </React.Fragment>,
    );
  }

  /* 2 · ledger: labels pinned beside each 3D object */
  if (only === 1 && inScene(f, 1)) {
    const l = f - STARTS[1];
    const rows = [{ t: "كل خطوة", c: PAL.teal, at: 12 }, { t: "كل جنيه", c: PAL.accent, at: 34 }, { t: "وكل غلطة", c: PAL.coral, at: 56 }];
    els.push(
      <React.Fragment key="b">
        {rows.map((r, i) => {
          const p = project(f, LEDGER_X + 0.85, LEDGER_Y[i], ZS[1]);
          const label = <MaskWords text={r.t} delay={r.at} accent={[r.t.split(" ").pop()!]} accentColor={r.c} style={{ justifyContent: "flex-end", textShadow: i === 2 ? rgbSplit(interpolate(l, [60, 74], [14, 0], clamp)) : undefined }} />;
          return <Pin key={i} x={p.x} y={p.y} width={1040 - p.x}>{i === 2 ? <GlitchBox at={60} len={14}>{label}</GlitchBox> : label}</Pin>;
        })}
        <div style={{ position: "absolute", bottom: 220, insetInline: 60 }}>
          <MaskWords text="هتشوفوها هنا." delay={86} accent={["هنا"]} />
        </div>
      </React.Fragment>,
    );
  }

  /* 3 · project */
  if (only === 2 && inScene(f, 2)) {
    const l = f - STARTS[2];
    const prompt = "اعمل موشن لعنوان الحلقة";
    const typed = Math.floor(interpolate(l, [34, 76], [0, prompt.length], clamp));
    const armed = l > 76 && l < 96;
    const bar = sp(l - 26, 14);
    const out = sp(l - 96, 10);
    const hit = l >= 96 ? Math.max(0, 1 - (l - 96) / 14) : 0;
    const pp = project(f, 0, PROMPT_Y, ZS[2]);
    const ps = project(f, 0, SCREEN_Y, ZS[2]);
    const chip = sp(l, 11);
    els.push(
      <React.Fragment key="c">
        <div style={{ position: "absolute", top: 210, insetInline: 70, display: "grid", justifyItems: "center", gap: 18 }}>
          <span dir="rtl" style={{ fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: "#fff", background: PAL.violet, padding: "10px 22px", borderRadius: 999, transform: `scale(${0.6 + chip * 0.4})`, opacity: chip, boxShadow: `0 0 30px ${PAL.violet}` }}>أول مشروع</span>
          <MaskWords text="موقع بيعمل المونتاج والموشن جرافيكس" delay={4} size={T.sub + 6} stagger={3} />
        </div>
        <Pin x={pp.x} y={pp.y} anchor="center" width={820}>
          <div dir="rtl" style={{
            display: "flex", alignItems: "center", gap: 16, padding: "22px 28px", borderRadius: 20, opacity: bar, transform: `translateY(${(1 - bar) * 60}px)`,
            background: "rgba(20,16,38,.72)", backdropFilter: "blur(10px)", border: `2px solid ${PAL.violet}${armed ? "ff" : "77"}`,
            boxShadow: armed ? `0 0 50px ${PAL.violet}, inset 0 0 30px ${PAL.violet}55` : "0 20px 60px -20px #000", fontFamily: FONT, fontWeight: 600, fontSize: T.small, color: PAL.ink, minHeight: 46,
          }}>
            <span style={{ color: PAL.accent, fontWeight: 800 }}>✦</span>
            <span>{prompt.slice(0, typed)}</span>
            <span style={{ width: 3, height: 36, background: PAL.accent, opacity: Math.floor(l / 8) % 2 ? 1 : 0 }} />
          </div>
        </Pin>
        {l >= 96 && (
          <Pin x={ps.x} y={ps.y} anchor="center" width={700}>
            <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 72, color: PAL.accent, opacity: Math.min(1, out * 1.5), transform: `scale(${0.3 + out * 0.7}) rotate(${(1 - out) * -8}deg)`, textShadow: rgbSplit(hit * 16) ?? `0 0 40px ${PAL.accent}aa` }}>الحلقة 0</div>
          </Pin>
        )}
        <div style={{ position: "absolute", bottom: 230, insetInline: 60 }}>
          <MaskWords text="بكلمة منك." delay={106} accent={["بكلمة"]} />
        </div>
      </React.Fragment>,
    );
  }

  /* 4 · name */
  if (only === 3 && inScene(f, 3)) {
    const p = project(f, 0, NAME_BAR_Y - 0.45, ZS[3]);
    els.push(
      <Pin key="d" x={p.x} y={p.y} anchor="center" width={800}>
        <MaskWords text="ولسه بنبنيه." delay={52} size={T.sub + 6} weight={700} color={PAL.soft} accent={["بنبنيه"]} />
      </Pin>,
    );
  }

  /* 5 · fork */
  if (only === 4 && inScene(f, 4)) {
    const u = project(f, UP_END[0], UP_END[1], ZS[4]);
    const d = project(f, DOWN_END[0], DOWN_END[1], ZS[4]);
    const block = (a: string, b: string, c: string, delay: number) => (
      <div style={{ display: "grid", gap: 8 }}>
        <MaskWords text={a} delay={delay} color={c} style={{ justifyContent: "flex-end" }} />
        <MaskWords text={b} delay={delay + 10} size={T.sub} weight={700} style={{ justifyContent: "flex-end" }} />
      </div>
    );
    els.push(
      <React.Fragment key="e">
        <div style={{ position: "absolute", left: Math.max(50, u.x - 40), top: u.y - 240, width: 620 }}>{block("لو نجح،", "هتعرفوا إزاي.", PAL.teal, 30)}</div>
        <div style={{ position: "absolute", left: Math.max(50, d.x - 40), top: d.y + 110, width: 620 }}>
          <GlitchBox at={100} len={16}>{block("ولو فشل…", "هتعرفوا ليه.", PAL.coral, 74)}</GlitchBox>
        </div>
      </React.Fragment>,
    );
  }

  /* 6 · follow */
  if (only === 5 && inScene(f, 5)) {
    const l = f - STARTS[5];
    const btn = sp(l - 22, 10);
    const tap = sp(l - 58, 9);
    const followed = l >= 58;
    const cursorY = interpolate(l, [34, 56], [300, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    const cursorX = interpolate(l, [34, 56], [160, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    const next = sp(l - 74, 14);
    const shine = interpolate(l, [86, 116], [-30, 130], clamp);
    els.push(
      <React.Fragment key="f">
        <div style={{ position: "absolute", top: 330, insetInline: 40 }}>
          <MaskWords text="تابع عشان تشوف هيحصل إيه." size={T.title - 10} accent={["تابع"]} />
        </div>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "relative", transform: `scale(${btn * (1 - Math.sin(Math.min(1, tap) * Math.PI) * 0.1)})` }}>
            <div dir="rtl" style={{
              fontFamily: FONT, fontWeight: 800, fontSize: T.sub + 4, padding: "26px 80px", borderRadius: 999,
              background: followed ? "rgba(20,16,38,.8)" : PAL.accent, color: followed ? PAL.ink : "#1A1204", backdropFilter: "blur(8px)",
              border: followed ? `2px solid ${PAL.teal}` : "2px solid transparent",
              boxShadow: followed ? `0 0 50px -6px ${PAL.teal}` : `0 20px 60px -15px ${PAL.accent}, 0 0 ${24 + Math.sin(l / 5) * 14}px ${PAL.accent}aa`,
            }}>
              {followed ? "بتتابع ✓" : "تابع"}
            </div>
            <div style={{ position: "absolute", left: "62%", top: "55%", transform: `translate(${cursorX}px, ${cursorY}px) scale(${l >= 56 && l < 62 ? 0.85 : 1})`, opacity: interpolate(l, [32, 38, 72, 82], [0, 1, 1, 0], clamp) }}>
              <svg width={60} height={60} viewBox="0 0 24 24"><path d="M5 2 L19 13 L12 14 L15 21 L12 22 L9 15 L4 19 Z" fill="#fff" stroke="#000" strokeWidth={1} /></svg>
            </div>
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", bottom: 290, insetInline: 0, display: "grid", justifyItems: "center", perspective: 900 }}>
          <div style={{ position: "relative", width: 540, height: 200, borderRadius: 28, overflow: "hidden", background: "rgba(20,16,38,.7)", backdropFilter: "blur(12px)", border: "2px solid #ffffff22", boxShadow: `0 30px 80px -30px #000, 0 0 60px -20px ${PAL.violet}`, opacity: next, transform: `translateY(${(1 - next) * 80}px) rotateX(${(1 - next) * 50}deg)` }}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", filter: "blur(16px)" }}>
              <div style={{ display: "flex", gap: 10, transform: `translateX(${Math.sin(l / 14) * 40}px)` }}>
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
      </React.Fragment>,
    );
  }
  return <>{els}</>;
};

export const Ep0: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => { loadFonts().then(() => { setReady(true); continueRender(h); }).catch((e) => cancelRender(e)); }, [h]);
  const f = useCurrentFrame();
  const badge = interpolate(f, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "#05040b" }}>
      {ready && (
        <ThreeCanvas width={W} height={H} camera={{ fov: FOV, near: 0.1, far: 600, position: [0, 0, 70] }} gl={{ antialias: true }}>
          <World f={f} />
        </ThreeCanvas>
      )}
      {/* the Overlay pins text to the scene: frame numbers inside are global, except MaskWords delays (local per scene) */}
      {STARTS.map((s, i) => (
        <SceneLocal key={i} from={s} dur={DURS[i]} i={i} />
      ))}
      {IMPACTS.map((im) => <Flash key={im.at} at={im.at} peak={0.22} len={9} />)}
      {STARTS.slice(1).map((s, i) => <LightLeak key={s} at={s - 16} len={34} color={[PAL.accent, PAL.violet, PAL.rose, PAL.teal, PAL.accent][i]} />)}
      <div dir="rtl" style={{ position: "absolute", top: 110, insetInline: 0, display: "flex", justifyContent: "center", opacity: badge }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: PAL.ink, background: "rgba(255,255,255,.07)", border: "1px solid #ffffff22", padding: "10px 24px", borderRadius: 999, backdropFilter: "blur(8px)" }}>
          بزنس من الصفر · <span style={{ color: PAL.accent }}>الحلقة 0</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 26, color: "#8C88A3", direction: "ltr" }}>@zifidit</div>
    </AbsoluteFill>
  );
};

/** Each scene's overlay runs inside a Sequence so MaskWords/GlitchBox get a scene-local clock,
    while projection uses the global frame. */
const SceneLocal: React.FC<{ from: number; dur: number; i: number }> = ({ from, dur, i }) => (
  <Sequence from={from} durationInFrames={dur} layout="none">
    <OverlayAt from={from} i={i} />
  </Sequence>
);
const OverlayAt: React.FC<{ from: number; i: number }> = ({ from, i }) => (
  <AbsoluteFill style={{ pointerEvents: "none", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.85))" }}><Overlay f={useCurrentFrame() + from} i={i} /></AbsoluteFill>
);
