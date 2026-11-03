import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { FONT } from "../theme";
import { Burst, Chip, clamp, FeatureHead, PAL, Phone, Stage, T, useSpring, Words } from "./kit";

const CLIP_COLORS = [PAL.azure, PAL.coral, PAL.teal, PAL.violet, PAL.accent, PAL.rose];

/* 1 · Hook: a pile of messy clips snaps into a clean timeline */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = spring({ frame: frame - 34, fps, config: { damping: 13, stiffness: 120 } });
  const widths = [150, 90, 210, 120, 170, 100, 140, 190, 80, 160].map((w) => w * 0.55);
  const total = widths.reduce((a, b) => a + b + 8, -8);
  const lefts: number[] = [];
  widths.reduce((acc, w) => { lefts.push(acc); return acc + w + 8; }, 0);
  return (
    <Stage tintA={PAL.coral}>
      <div style={{ position: "absolute", top: 300, insetInline: 60 }}>
        <Words text="مونتاج فيديو واحد بياخد منك ساعات؟" size={T.title} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 900, height: 120 }}>
          {widths.map((w, i) => {
            const startX = (random(`x${i}`) - 0.5) * 760;
            const startY = (random(`y${i}`) - 0.5) * 620;
            const rot = (random(`r${i}`) - 0.5) * 70;
            const enter = spring({ frame: frame - i * 2, fps, config: { damping: 12 } });
            const tx = interpolate(snap, [0, 1], [startX, lefts[i] - total / 2]);
            const ty = interpolate(snap, [0, 1], [startY, 0]);
            const r = interpolate(snap, [0, 1], [rot, 0]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute", left: "50%", top: 30, width: w, height: 60, borderRadius: 12,
                  background: CLIP_COLORS[i % CLIP_COLORS.length], opacity: enter,
                  transform: `translate(${tx}px, ${ty}px) rotate(${r}deg) scale(${enter})`,
                  boxShadow: `0 10px 30px -10px ${CLIP_COLORS[i % CLIP_COLORS.length]}`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 420, insetInline: 60 }}>
        <Words text="خليه دقايق." delay={52} size={T.title + 8} accentWords={["دقايق"]} />
      </div>
      <Burst at={40} y="50%" seed="hook" count={26} spread={360} />
    </Stage>
  );
};

/* 2 · Problem: four jobs pile up while a clock spins */
export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const jobs = [
    { t: "قص السكتات", c: PAL.coral },
    { t: "كابشن", c: PAL.accent },
    { t: "موشن جرافيكس", c: PAL.violet },
    { t: "3 مقاسات", c: PAL.azure },
  ];
  const spin = frame * 14;
  return (
    <Stage tintA={PAL.violet} tintB={PAL.coral}>
      <div style={{ position: "absolute", top: 300, insetInline: 60 }}>
        <Words text="ومع كل فيديو، نفس الشغل من الأول." size={T.title} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 640, height: 520 }}>
          <svg width="180" height="180" viewBox="0 0 100 100" style={{ position: "absolute", left: "50%", top: -40, marginLeft: -90, opacity: 0.9 }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke={PAL.soft} strokeWidth="5" />
            <line x1="50" y1="50" x2="50" y2="16" stroke={PAL.ink} strokeWidth="5" strokeLinecap="round" transform={`rotate(${spin} 50 50)`} />
            <line x1="50" y1="50" x2="72" y2="50" stroke={PAL.accent} strokeWidth="5" strokeLinecap="round" transform={`rotate(${spin / 12} 50 50)`} />
          </svg>
          {jobs.map((j, i) => {
            const s = useSpring(8 + i * 9, { damping: 10 });
            return (
              <div
                key={i}
                dir="rtl"
                style={{
                  position: "absolute", left: "50%", top: 190 + i * 78, width: 520, marginLeft: -260, height: 64, borderRadius: 16,
                  background: PAL.panel2, borderInlineStart: `8px solid ${j.c}`, display: "flex", alignItems: "center", paddingInline: 24,
                  fontFamily: FONT, fontSize: T.small, fontWeight: 700, color: PAL.ink,
                  opacity: Math.min(1, s * 1.3), transform: `translateX(${(1 - s) * 200}px) rotate(${(1 - s) * -6 + Math.sin(frame / 6 + i) * 0.8}deg)`,
                }}
              >
                {j.t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 3 · Reveal: the name with a light sweep and a burst */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(4, { damping: 11, stiffness: 120 });
  const sweep = interpolate(frame, [10, 40], [-30, 130], clamp);
  return (
    <Stage tintA={PAL.accent} tintB={PAL.azure}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30, flexDirection: "column" }}>
        <div
          style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 132, color: PAL.ink, letterSpacing: 1, position: "relative",
            transform: `scale(${0.7 + s * 0.3})`, opacity: Math.min(1, s * 1.4),
            backgroundImage: `linear-gradient(100deg, ${PAL.ink} ${sweep - 12}%, #FFFFFF ${sweep}%, ${PAL.ink} ${sweep + 12}%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 40px ${PAL.accent}55)`,
          }}
        >
          Zifidit<span style={{ WebkitTextFillColor: PAL.accent }}>.</span>
        </div>
        <Words text="المونتاج والموشن جرافيكس، بكلمة منك." delay={20} size={T.sub} weight={600} color={PAL.soft} accentWords={["بكلمة"]} />
      </AbsoluteFill>
      <Burst at={8} seed="rev" count={44} spread={520} />
    </Stage>
  );
};

/* 4 · Auto montage: playhead scans, silences flash red and collapse */
export const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const segs = [9, 4, 13, 6, 7, 3, 15, 7, 11, 5, 8];
  const scan = interpolate(frame, [22, 70], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cut = interpolate(frame, [74, 104], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const secs = Math.round(252 + (167 - 252) * cut);
  return (
    <Stage tintA={PAL.teal} tintB={PAL.azure}>
      <FeatureHead n="1" label="مونتاج تلقائي" color={PAL.teal} line="ارفع الخام، والسكتات بتتشال لوحدها." />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: 900, position: "relative", marginTop: 200 }}>
          <div style={{ display: "flex", height: 110, borderRadius: 18, overflow: "hidden", background: PAL.panel }}>
            {segs.map((w, i) => {
              const gap = i % 2 === 1;
              const lit = gap && scan > (i + 0.5) / segs.length;
              return (
                <div
                  key={i}
                  style={{
                    flex: `${gap ? w * (1 - cut) : w} 1 0`, position: "relative", overflow: "hidden",
                    background: gap ? (lit ? "rgba(255,94,98,.85)" : "rgba(255,94,98,.25)") : PAL.teal,
                    boxShadow: lit ? `0 0 30px ${PAL.coral}` : "none",
                  }}
                >
                  {!gap && (
                    <div style={{ position: "absolute", inset: "22% 4%", display: "flex", alignItems: "center", gap: 3 }}>
                      {Array.from({ length: Math.round(w * 2) }).map((_, k) => (
                        <i key={k} style={{ flex: 1, height: `${30 + Math.abs(Math.sin((frame + k * 7 + i * 13) / 5)) * 70}%`, background: "rgba(10,20,20,.45)", borderRadius: 2 }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", top: -16, bottom: -16, width: 4, borderRadius: 4, background: "#fff", right: `${scan * 100}%`, boxShadow: "0 0 20px #fff", opacity: cut > 0.9 ? 0 : 1 }} />
          <div dir="rtl" style={{ marginTop: 50, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: FONT }}>
            <span style={{ fontSize: T.small, color: PAL.soft, fontWeight: 600 }}>{cut > 0.98 ? "بعد القص التلقائي" : "الفيديو الخام"}</span>
            <span style={{ fontSize: 84, fontWeight: 800, color: PAL.teal, direction: "ltr" }}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span>
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 5 · Motion from a description: typed prompt, then a generated ad builds inside a phone */
export const FromText: React.FC = () => {
  const frame = useCurrentFrame();
  const prompt = "إعلان لعرض الجمعة، ألوان دافية";
  const shown = prompt.slice(0, Math.round(interpolate(frame, [10, 52], [0, prompt.length], clamp)));
  const appear = useSpring(60, { damping: 13 });
  const title = useSpring(74, { damping: 12 });
  const badge = useSpring(88, { damping: 9 });
  return (
    <Stage tintA={PAL.azure} tintB={PAL.accent}>
      <FeatureHead n="2" label="موشن من وصف" color={PAL.azure} line="اكتب فكرتك، يطلع لك موشن جاهز." />
      <div dir="rtl" style={{ position: "absolute", top: 560, insetInline: 110, height: 92, borderRadius: 22, background: PAL.panel2, display: "flex", alignItems: "center", gap: 18, paddingInline: 28, boxShadow: `inset 0 0 0 2px ${PAL.azure}66` }}>
        <svg width="34" height="34" viewBox="0 0 24 24" style={{ transform: `rotate(${frame * 4}deg)`, flex: "none" }}>
          <path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" fill={PAL.azure} />
        </svg>
        <span style={{ fontFamily: FONT, fontSize: T.small, color: PAL.ink, fontWeight: 600 }}>{shown}</span>
        <i style={{ width: 3, height: 38, background: PAL.azure, opacity: frame % 16 < 8 ? 1 : 0 }} />
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 200 }}>
        <div style={{ transform: `translateY(${(1 - appear) * 300}px) scale(${0.8 + appear * 0.2})`, opacity: appear }}>
          <Phone w={420}>
            <AbsoluteFill style={{ background: "linear-gradient(160deg, #5A2A12, #C4622A 55%, #F2A72B)" }} />
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ position: "absolute", width: 140 + k * 60, height: 140 + k * 60, borderRadius: "50%", border: "3px solid rgba(255,255,255,.35)", left: "50%", top: "38%", transform: `translate(-50%, -50%) scale(${interpolate(frame, [62 + k * 6, 110 + k * 6], [0.2, 1.3], clamp)})`, opacity: interpolate(frame, [62 + k * 6, 120 + k * 6], [0.9, 0], clamp) }} />
            ))}
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 18, flexDirection: "column" }}>
              <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", transform: `translateX(${(1 - title) * 260}px)`, opacity: title, textShadow: "0 8px 30px rgba(0,0,0,.35)" }}>عرض الجمعة</div>
              <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#3A1A05", background: "#FFF3D6", padding: "10px 22px", borderRadius: 12, transform: `scale(${badge}) rotate(${(1 - badge) * -12}deg)` }}>خصم 20%</div>
            </AbsoluteFill>
          </Phone>
        </div>
      </AbsoluteFill>
      <Burst at={90} y="70%" seed="ft" count={30} spread={300} />
    </Stage>
  );
};

/* 6 · Voice editing: spoken commands change the video live */
export const Voice: React.FC = () => {
  const frame = useCurrentFrame();
  const cmds = [
    { at: 8, t: "«كبّر العنوان»" },
    { at: 56, t: "«لوّنه دهبي»" },
    { at: 100, t: "«دخّله من اليمين»" },
  ];
  const active = [...cmds].reverse().find((c) => frame >= c.at) ?? cmds[0];
  const big = interpolate(frame, [30, 44], [0, 1], clamp);
  const gold = interpolate(frame, [78, 90], [0, 1], clamp);
  const slide = interpolate(frame, [118, 136], [1, 0], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const reslide = frame >= 116 ? slide : 0;
  const talking = cmds.some((c) => frame >= c.at && frame < c.at + 22);
  return (
    <Stage tintA={PAL.coral} tintB={PAL.violet}>
      <FeatureHead n="3" label="تعديل بالصوت" color={PAL.coral} line="قول، وهو بيعدّل قدامك." />
      <div style={{ position: "absolute", top: 600, insetInline: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }} dir="rtl">
        <div style={{ position: "relative", width: 92, height: 92 }}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${PAL.coral}`, transform: `scale(${1 + ((frame + k * 10) % 30) / 18})`, opacity: talking ? 1 - ((frame + k * 10) % 30) / 30 : 0 }} />
          ))}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: PAL.coral, display: "grid", placeItems: "center" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="#160F2E" strokeWidth="2.2" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="#160F2E" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div key={active.t} style={{ fontFamily: FONT, fontSize: T.sub, fontWeight: 700, color: PAL.ink, background: PAL.panel2, padding: "16px 28px", borderRadius: 22, transform: `scale(${0.86 + 0.14 * spring({ frame: frame - active.at, fps: 30, config: { damping: 11 } })})`, opacity: Math.min(1, 0.35 + spring({ frame: frame - active.at, fps: 30, config: { damping: 11 } })) }}>
          {active.t}
        </div>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 200 }}>
        <Phone w={400}>
          <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 70% 20%, #3B2A7A, #120C30 70%)" }} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
              dir="rtl"
              style={{
                fontFamily: FONT, fontWeight: 800, color: gold > 0 ? `rgb(${Math.round(245 + (242 - 245) * gold)}, ${Math.round(243 + (167 - 243) * gold)}, ${Math.round(255 + (43 - 255) * gold)})` : PAL.ink,
                fontSize: 42 + big * 20, whiteSpace: "nowrap", transform: `translateX(${reslide * 300}px)`, opacity: 1 - reslide * 0.8,
                textShadow: gold > 0.5 ? `0 0 30px ${PAL.accent}88` : "none",
              }}
            >
              عرض الجمعة
            </div>
          </AbsoluteFill>
        </Phone>
      </AbsoluteFill>
    </Stage>
  );
};

/* 7 · Dialect captions: word-by-word karaoke, dialect chips cycle */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    { d: "مصري", t: "النهارده هقولكم على تلات حاجات مهمة", c: PAL.accent },
    { d: "خليجي", t: "اليوم بقولكم ثلاث أشياء مهمة وايد", c: PAL.rose },
    { d: "شامي", t: "اليوم رح احكيلكن عن تلات شغلات مهمة", c: PAL.azure },
  ];
  const per = 36;
  const li = Math.min(lines.length - 1, Math.floor(Math.max(0, frame - 14) / per));
  const L = lines[li];
  const words = L.t.split(" ");
  const wi = Math.floor(((Math.max(0, frame - 14) % per) / per) * (words.length + 1));
  return (
    <Stage tintA={PAL.accent} tintB={PAL.rose}>
      <FeatureHead n="4" label="كابشن بلهجتك" color={PAL.accent} line="كلمة بكلمة، على توقيت الكلام." />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 200 }}>
        <Phone w={420}>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, #1B1638, #0B0A12)" }} />
          <div style={{ position: "absolute", left: "50%", top: "26%", width: 160, height: 160, marginLeft: -80, borderRadius: "50%", background: "radial-gradient(circle at 50% 38%, #F6D4A8 0 24%, transparent 25%), radial-gradient(circle at 50% 100%, #4C8DFF 0 48%, transparent 49%), #2A1E5C", boxShadow: `0 0 0 ${8 + Math.abs(Math.sin(frame / 4)) * 14}px ${L.c}33` }} />
          <div dir="rtl" style={{ position: "absolute", bottom: 150, insetInline: 22, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 10px", fontFamily: FONT, fontSize: 30, fontWeight: 800 }}>
            {words.map((w, i) => (
              <span key={i} style={{ padding: "2px 8px", borderRadius: 8, color: i === wi ? "#160F2E" : "#fff", background: i === wi ? L.c : "transparent", transform: i === wi ? "scale(1.12)" : "none" }}>{w}</span>
            ))}
          </div>
          <div dir="rtl" style={{ position: "absolute", bottom: 70, insetInline: 0, display: "flex", justifyContent: "center", gap: 10 }}>
            {lines.map((l, i) => (
              <span key={i} style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, padding: "6px 14px", borderRadius: 999, color: i === li ? "#160F2E" : PAL.soft, background: i === li ? l.c : "rgba(255,255,255,.08)" }}>{l.d}</span>
            ))}
          </div>
        </Phone>
      </AbsoluteFill>
    </Stage>
  );
};

/* 8 · Every platform: one frame morphs between three ratios */
export const Platforms: React.FC = () => {
  const frame = useCurrentFrame();
  const ratios = [
    { r: 9 / 16, l: "ريلز وتيك توك" },
    { r: 16 / 9, l: "يوتيوب" },
    { r: 1, l: "إنستجرام" },
  ];
  const step = Math.min(2, Math.floor(Math.max(0, frame - 10) / 30));
  const prev = ratios[Math.max(0, step - 1)].r;
  const cur = ratios[step].r;
  const t = interpolate((Math.max(0, frame - 10) % 30), [0, 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const r = step === 0 ? cur : prev + (cur - prev) * t;
  const area = 330000;
  const h = Math.sqrt(area / r);
  const w = h * r;
  return (
    <Stage tintA={PAL.rose} tintB={PAL.azure}>
      <FeatureHead n="5" label="مقاس لكل منصة" color={PAL.rose} line="نفس الفيديو، لكل منصة، بضغطة." />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
        <div style={{ width: w, height: h, borderRadius: 26, background: "linear-gradient(150deg, #FF5AAE, #8E6BFF 60%, #4C8DFF)", display: "grid", placeItems: "center", boxShadow: "0 40px 90px -30px rgba(255,90,174,.6)" }}>
          <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: "#fff" }}>عرض الجمعة</div>
        </div>
        <div style={{ marginTop: 44 }}>
          <Chip key={step} color={PAL.rose} delay={10 + step * 30}>{ratios[step].l}</Chip>
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* 9 · Call to action */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const name = useSpring(4, { damping: 12 });
  const btn = useSpring(26, { damping: 9 });
  const pulse = 1 + Math.max(0, Math.sin((frame - 40) / 7)) * 0.04;
  return (
    <Stage tintA={PAL.accent} tintB={PAL.violet}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 40 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 104, color: PAL.ink, opacity: name, transform: `translateY(${(1 - name) * 40}px)` }}>
          Zifidit<span style={{ color: PAL.accent }}>.</span>
        </div>
        <Words text="احجز مكانك في النسخة الأولى" delay={12} size={T.sub + 6} weight={700} />
        <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 800, fontSize: T.sub, color: "#1A1204", background: PAL.accent, padding: "24px 56px", borderRadius: 999, transform: `scale(${btn * pulse})`, boxShadow: `0 20px 60px -15px ${PAL.accent}` }}>
          اكتب Zifidit في الكومنتات
        </div>
        <Chip color={PAL.teal} delay={44}>أول 100: خصم 50% لمدة 3 شهور</Chip>
      </AbsoluteFill>
      <Burst at={28} y="58%" seed="cta" count={50} spread={560} />
    </Stage>
  );
};
