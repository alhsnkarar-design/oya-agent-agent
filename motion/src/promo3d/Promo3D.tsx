// Zifidit promo, 3D edition: one camera flight through nine stations, timed to the Egyptian voiceover
// (public/voiceover.wav, mixed into the render). The voice also drives the visuals (orb, bars, glow).
// Arabic text is HTML on top of the WebGL scene, pinned to 3D objects by projecting through the same camera.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { FONT, loadFonts } from "../theme";
import { clamp, PAL, T } from "../promo/kit";
import { Flash, LightLeak, MaskWords, rgbSplit } from "../ep0/fx";
import { FOV, H, W } from "../three/flight";
import { PROMO3D as F } from "./flight";
import {
  CAP_ENDS, CAP_STARTS, FAN_Y, CAR_R, CAR_Y, CARD_Y, carouselAngle, CTA_NAME_Y, DIALECT_C, frameSize, ORB_Y, PHONE_Y, PROMPT_Y, ratioAt, RATIOS, SLAB_C, SLAB_Y, STRIP_Y, World,
} from "./World";

export const PROMO3D_FRAMES = F.total;
const sp = (f: number, damping = 13) => spring({ frame: f, fps: 30, config: { damping, stiffness: 150, mass: 0.7 } });

const Pin: React.FC<{ x: number; y: number; children: React.ReactNode; width?: number; style?: React.CSSProperties }> = ({ x, y, children, width = 900, style }) => (
  <div style={{ position: "absolute", left: x - width / 2, top: y, width, transform: "translateY(-50%)", ...style }}>{children}</div>
);

/** Numbered feature label + one line, top of the frame. */
const Head: React.FC<{ n: string; label: string; color: string; line: string }> = ({ n, label, color, line }) => {
  const s = sp(useCurrentFrame() - 6, 12);
  return (
    <div style={{ position: "absolute", top: 205, insetInline: 60, display: "grid", justifyItems: "center", gap: 20 }}>
      <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontSize: T.small, fontWeight: 700, color, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: color, color: "#160F2E", display: "grid", placeItems: "center", fontSize: 24, boxShadow: `0 0 24px ${color}` }}>{n}</span>
        {label}
      </div>
      <MaskWords text={line} delay={12} size={T.sub + 6} stagger={3} />
    </div>
  );
};

const glass = (c: string, on = false): React.CSSProperties => ({
  background: "rgba(20,16,38,.72)", backdropFilter: "blur(10px)", border: `2px solid ${c}${on ? "ff" : "77"}`,
  boxShadow: on ? `0 0 50px ${c}, inset 0 0 30px ${c}55` : "0 20px 60px -20px #000", borderRadius: 20,
});

const Scene: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const l = f - F.starts[i];
  const z = F.zs[i];
  const P = (x: number, y: number) => F.project(f, x, y, z);

  if (i === 0) return (
    <>
      <div style={{ position: "absolute", top: 300, insetInline: 60 }}><MaskWords text="مونتاج فيديو واحد بياخد منك ساعات؟" delay={8} accent={["ساعات؟", "ساعات"]} /></div>
      <div style={{ position: "absolute", bottom: 440, insetInline: 60 }}><MaskWords text="خليها دقايق." delay={90} size={T.title + 10} accent={["دقايق"]} /></div>
    </>
  );

  if (i === 1) {
    const jobs = ["قص السكتات", "كابشن", "موشن جرافيكس", "3 مقاسات"];
    const at = [8, 28, 50, 74];
    return (
      <>
        {jobs.map((t, k) => { const p = P(0, SLAB_Y[k]); return <Pin key={k} x={p.x} y={p.y}><MaskWords text={t} delay={at[k] + 6} size={T.sub + 4} color={PAL.ink} accent={[t.split(" ")[0]]} accentColor={SLAB_C[k]} /></Pin>; })}
        <div style={{ position: "absolute", bottom: 330, insetInline: 60 }}><MaskWords text="وكل مرة… من الأول تاني." delay={100} accent={["الأول"]} accentColor={PAL.coral} /></div>
      </>
    );
  }

  if (i === 2) {
    const a = P(0, 1.55), b = P(0, -0.75);
    return (
      <>
        <Pin x={a.x} y={a.y}><MaskWords text="علشان كده بنعمل…" delay={12} size={T.sub + 6} color={PAL.soft} /></Pin>
        <Pin x={b.x} y={b.y}><MaskWords text="المونتاج والموشن جرافيكس… بكلمة منك." delay={92} size={T.sub} weight={700} accent={["بكلمة"]} /></Pin>
      </>
    );
  }

  if (i === 3) {
    const p = P(0, STRIP_Y - 0.95);
    const done = l >= 104;
    return (
      <>
        <Head n="1" label="مونتاج تلقائي" color={PAL.teal} line="ارمي الخام، والسكتات بتتشال لوحدها." />
        <Pin x={p.x} y={p.y}>
          <div dir="rtl" style={{ textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: T.small, color: done ? PAL.teal : PAL.soft, textShadow: done ? `0 0 24px ${PAL.teal}` : undefined }}>
            {done ? "بعد القص التلقائي ✓" : "الفيديو الخام"}
          </div>
        </Pin>
      </>
    );
  }

  if (i === 4) {
    const prompt = "إعلان لعرض الجمعة، ألوان دافية";
    const typed = Math.floor(interpolate(l, [14, 52], [0, prompt.length], clamp));
    const armed = l > 52 && l < 66;
    const bar = sp(l - 8, 14);
    const pp = P(0, PROMPT_Y), pt = P(0, PHONE_Y + 0.25), pb = P(0, PHONE_Y - 0.4);
    const title = sp(l - 74, 12), badge = sp(l - 88, 9);
    return (
      <>
        <Head n="2" label="موشن من وصف" color={PAL.azure} line="اكتب فكرتك، يطلع لك موشن جاهز." />
        <Pin x={pp.x} y={pp.y} width={860}>
          <div dir="rtl" style={{ ...glass(PAL.azure, armed), display: "flex", alignItems: "center", gap: 16, padding: "22px 28px", opacity: bar, transform: `translateY(${(1 - bar) * 60}px)`, fontFamily: FONT, fontWeight: 600, fontSize: T.small, color: PAL.ink, minHeight: 46 }}>
            <span style={{ color: PAL.accent, fontWeight: 800 }}>✦</span>
            <span>{prompt.slice(0, typed)}</span>
            <span style={{ width: 3, height: 36, background: PAL.accent, opacity: Math.floor(l / 8) % 2 ? 1 : 0 }} />
          </div>
        </Pin>
        <Pin x={pt.x} y={pt.y} width={500}><div dir="rtl" style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 60, color: "#fff", opacity: title, transform: `translateX(${(1 - title) * 200}px)`, textShadow: "0 8px 30px rgba(0,0,0,.45)" }}>عرض الجمعة</div></Pin>
        <Pin x={pb.x} y={pb.y} width={500}><div style={{ display: "flex", justifyContent: "center" }}><div dir="rtl" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#3A1A05", background: "#FFF3D6", padding: "10px 22px", borderRadius: 12, transform: `scale(${badge}) rotate(${(1 - badge) * -12}deg)` }}>خصم 20%</div></div></Pin>
      </>
    );
  }

  if (i === 5) {
    const cmds = [{ at: 92, t: "«كبّر العنوان»" }, { at: 124, t: "«خليه دهبي»" }];
    const active = [...cmds].reverse().find((c) => l >= c.at);
    const bub = active ? sp(l - active.at, 10) : 0;
    const big = interpolate(l, [100, 114], [0, 1], clamp);
    const gold = interpolate(l, [130, 142], [0, 1], clamp);
    const pc = P(0, CARD_Y), pbub = P(0, ORB_Y - 0.95);
    return (
      <>
        <Head n="3" label="تعديل بالصوت" color={PAL.coral} line="قول، وهو بيعدّل قدامك." />
        {active && (
          <Pin x={pbub.x} y={pbub.y} width={600}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div key={active.t} dir="rtl" style={{ ...glass(PAL.coral, true), padding: "16px 30px", fontFamily: FONT, fontWeight: 800, fontSize: T.small, color: PAL.ink, transform: `scale(${0.5 + bub * 0.5})`, opacity: bub }}>{active.t}</div>
            </div>
          </Pin>
        )}
        <Pin x={pc.x} y={pc.y} width={900}>
          <div dir="rtl" style={{
            textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 44 + big * 24, whiteSpace: "nowrap",
            color: gold > 0.5 ? "transparent" : "#fff", backgroundImage: gold > 0.5 ? "linear-gradient(180deg,#FFE7A8,#F2A72B 55%,#B8740F)" : undefined,
            WebkitBackgroundClip: gold > 0.5 ? "text" : undefined, backgroundClip: gold > 0.5 ? "text" : undefined,
            filter: gold > 0.5 ? `drop-shadow(0 0 ${20 * gold}px ${PAL.accent}aa)` : undefined, transform: `scale(${1 + Math.max(0, 1 - Math.abs(l - 132) / 8) * 0.08})`,
          }}>عرض الجمعة</div>
        </Pin>
      </>
    );
  }

  if (i === 6) {
    const L = [
      { d: "مصري", t: "النهارده هقولكم على تلات حاجات مهمة" },
      { d: "خليجي", t: "اليوم بقولكم ثلاث أشياء مهمة وايد" },
      { d: "شامي", t: "اليوم رح احكيلكن عن تلات شغلات مهمة" },
    ];
    let li = 0;
    CAP_STARTS.forEach((st, k) => { if (l >= st) li = k; });
    const words = L[li].t.split(" ");
    const wi = Math.floor(((l - CAP_STARTS[li]) / (CAP_ENDS[li] - CAP_STARTS[li])) * (words.length + 1));
    const ang = carouselAngle(l);
    const pcap = P(0, -1.3);
    const swap = sp(l - CAP_STARTS[li], 12);
    return (
      <>
        <Head n="4" label="كابشن بلهجتك" color={PAL.accent} line="كلمة بكلمة، على توقيت الكلام." />
        {L.map((q, k) => {
          const a = (k * Math.PI * 2) / 3;
          const x = Math.sin(a) * CAR_R, zz = Math.cos(a) * CAR_R;
          const xr = x * Math.cos(ang) + zz * Math.sin(ang), zr = -x * Math.sin(ang) + zz * Math.cos(ang);
          const facing = zr / CAR_R;
          if (facing < 0.2) return null;
          const p = F.project(f, xr, CAR_Y, z - CAR_R + zr);
          return (
            <Pin key={k} x={p.x} y={p.y} width={400}>
              <div dir="rtl" style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: T.sub + 8, color: DIALECT_C[k], opacity: (facing - 0.2) / 0.8, transform: `scale(${0.6 + facing * 0.4})`, textShadow: `0 0 30px ${DIALECT_C[k]}88` }}>{q.d}</div>
            </Pin>
          );
        })}
        <Pin x={pcap.x} y={pcap.y} width={960}>
          <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px 12px", fontFamily: FONT, fontSize: T.sub, fontWeight: 800, opacity: swap, transform: `translateY(${(1 - swap) * 30}px)` }}>
            {words.map((w, k) => (
              <span key={`${li}-${k}`} style={{
                padding: "6px 14px", borderRadius: 12, color: k === wi ? "#160F2E" : k < wi ? PAL.ink : "#ffffff55",
                background: k === wi ? DIALECT_C[li] : "transparent", boxShadow: k === wi ? `0 0 30px ${DIALECT_C[li]}` : undefined,
                transform: `scale(${k === wi ? 1.12 : 1})`,
              }}>{w}</span>
            ))}
          </div>
        </Pin>
      </>
    );
  }

  if (i === 7) {
    const { step, r } = ratioAt(l);
    const { h } = frameSize(r);
    const fan = sp(l - 72, 13);
    const pc = P(0, 0.2), pl = P(0, 0.2 - h / 2 - 0.3);
    const chip = sp(l - 10 - step * 26, 11);
    return (
      <>
        <Head n="5" label="مقاس لكل منصة" color={PAL.rose} line="نفس الفيديو، لكل منصة، بدوسة." />
        {fan < 0.05 ? (
          <>
            <Pin x={pc.x} y={pc.y}><div dir="rtl" style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff" }}>عرض الجمعة</div></Pin>
            <Pin x={pl.x} y={pl.y}><div style={{ display: "flex", justifyContent: "center" }}><span dir="rtl" style={{ fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: "#160F2E", background: PAL.rose, padding: "10px 20px", borderRadius: 999, transform: `scale(${0.6 + chip * 0.4})`, boxShadow: `0 0 24px ${PAL.rose}` }}>{RATIOS[step].l}</span></div></Pin>
          </>
        ) : (
          RATIOS.map((q, k) => {
            const p = P(0, 0.2 + FAN_Y[k] * fan);
            return (
              <Pin key={k} x={p.x} y={p.y} width={600}>
                <div style={{ display: "flex", justifyContent: "center", opacity: fan }}>
                  <span dir="rtl" style={{ fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: "#160F2E", background: [PAL.rose, PAL.azure, PAL.accent][k], padding: "8px 18px", borderRadius: 999 }}>{q.l}</span>
                </div>
              </Pin>
            );
          })
        )}
      </>
    );
  }

  // 8 · CTA
  const pn = P(0, CTA_NAME_Y - 0.75), pb = P(0, -0.6), pc = P(0, -1.35);
  const btn = sp(l - 72, 9);
  const pulse = 1 + Math.max(0, Math.sin((l - 86) / 7)) * 0.04;
  const chip = sp(l - 96, 11);
  return (
    <>
      <Pin x={pn.x} y={pn.y}><MaskWords text="احجز مكانك من دلوقتي." delay={12} size={T.sub + 8} accent={["احجز"]} /></Pin>
      <Pin x={pb.x} y={pb.y}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 800, fontSize: T.sub, color: "#1A1204", background: PAL.accent, padding: "24px 56px", borderRadius: 999, transform: `scale(${btn * pulse})`, boxShadow: `0 20px 60px -15px ${PAL.accent}, 0 0 50px ${PAL.accent}88`, textShadow: rgbSplit(Math.max(0, 1 - (l - 72) / 10) * 6) }}>
            اكتب Zifidit في الكومنتات
          </div>
        </div>
      </Pin>
      <Pin x={pc.x} y={pc.y}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span dir="rtl" style={{ fontFamily: FONT, fontWeight: 700, fontSize: T.tiny, color: "#160F2E", background: PAL.teal, padding: "10px 20px", borderRadius: 999, transform: `scale(${0.6 + chip * 0.4})`, opacity: Math.min(1, chip * 1.5) }}>أول 100: خصم 50% لمدة 3 شهور</span>
        </div>
      </Pin>
    </>
  );
};

/** Scene overlay with a scene-local clock (for MaskWords/Head) and a fade-out while the camera leaves. */
const SceneLayer: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame() + F.starts[i];
  const leave = i < F.starts.length - 1 ? F.starts[i + 1] - 14 : null;
  const o = leave === null ? 1 : interpolate(f, [leave - 2, leave + 6], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o, filter: "drop-shadow(0 6px 18px rgba(0,0,0,.85))" }}>
      <Scene i={i} f={f} />
    </AbsoluteFill>
  );
};

const VOICE = staticFile("voiceover.wav");

export const Promo3D: React.FC = () => {
  const [h] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => { loadFonts().then(() => { setReady(true); continueRender(h); }).catch((e) => cancelRender(e)); }, [h]);
  const f = useCurrentFrame();
  const audio = useAudioData(VOICE);
  const spectrum = audio ? visualizeAudio({ fps: 30, frame: f, audioData: audio, numberOfSamples: 32 }).map((v) => Math.min(1, Math.sqrt(v) * 1.6)) : new Array(32).fill(0);
  return (
    <AbsoluteFill style={{ background: "#05040b" }}>
      <Audio src={VOICE} />
      {ready && (
        <ThreeCanvas width={W} height={H} camera={{ fov: FOV, near: 0.1, far: 600, position: [0, 0, 70] }} gl={{ antialias: true }}>
          <World f={f} spectrum={spectrum} />
        </ThreeCanvas>
      )}
      {F.starts.map((s, i) => (
        <Sequence key={i} from={s} durationInFrames={F.durs[i]} layout="none"><SceneLayer i={i} /></Sequence>
      ))}
      {F.impacts.filter((im) => im.amp >= 0.12).map((im) => <Flash key={im.at} at={im.at} peak={0.2} len={9} />)}
      {F.starts.slice(1).map((s, i) => <LightLeak key={s} at={s - 16} len={34} color={[PAL.accent, PAL.violet, PAL.rose, PAL.teal][i % 4]} />)}
      <div style={{ position: "absolute", bottom: 70, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 26, color: "#8C88A3", direction: "ltr" }}>@zifidit</div>
    </AbsoluteFill>
  );
};
