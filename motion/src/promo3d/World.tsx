// The 3D world of the promo: nine stations the camera flies through, one per voiceover line.
import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { BurstCloud, C3, c01, Cloud, col, eio, eo, nz, ParticleName, Post, Rig, ShockRing, sp, StarField, touch, useCloud } from "../three/kit";
import { PROMO3D as F } from "./flight";

const CLIP_COLORS = [C3.azure, C3.coral, C3.teal, C3.violet, C3.gold, C3.rose];

/* 1 · hook: clips tumble in zero-g around a racing clock, then snap into a clean timeline («خليها دقايق») */
export const HOOK_ROW_Y = -0.35;
const Hook: React.FC<{ l: number }> = ({ l }) => {
  const widths = [0.42, 0.26, 0.55, 0.32, 0.46, 0.28, 0.38, 0.5].map((w) => w * 0.72);
  const total = widths.reduce((a, b) => a + b + 0.05, -0.05);
  let x = total / 2;
  const slots = widths.map((w) => { const c = x - w / 2; x -= w + 0.05; return c; });
  const snap = sp(l - 84, { damping: 13, stiffness: 120 });
  const hands = l < 84 ? l * 0.45 : 84 * 0.45 + (l - 84) * 0.03;
  return (
    <group>
      {/* clock */}
      <group position={[0, 0.3, -1.6]} scale={nz(sp(l - 2, { damping: 14 }) * 0.8)}>
        <mesh><torusGeometry args={[1.35, 0.03, 12, 160]} /><meshBasicMaterial color={"#d9d2ff"} toneMapped={false} /></mesh>
        {Array.from({ length: 12 }).map((_, k) => (
          <mesh key={k} position={[Math.cos((k / 12) * Math.PI * 2) * 1.18, Math.sin((k / 12) * Math.PI * 2) * 1.18, 0]} rotation={[0, 0, (k / 12) * Math.PI * 2]}>
            <boxGeometry args={[0.12, 0.03, 0.02]} />
            <meshBasicMaterial color={"#8f86c9"} toneMapped={false} />
          </mesh>
        ))}
        <mesh rotation={[0, 0, -hands]} position={[0, 0, 0.02]}><boxGeometry args={[0.04, 1.0, 0.02]} /><meshBasicMaterial color={C3.coral} toneMapped={false} /></mesh>
        <mesh rotation={[0, 0, -hands / 12]} position={[0, 0, 0.03]}><boxGeometry args={[0.06, 0.65, 0.02]} /><meshBasicMaterial color={"#ffffff"} toneMapped={false} /></mesh>
      </group>
      {/* clips */}
      {widths.map((w, i) => {
        const enter = sp(l - i * 2, { damping: 12 });
        const sx = (random(`hx${i}`) - 0.5) * 3.2, sy = (random(`hy${i}`) - 0.5) * 3.6, sz = (random(`hz${i}`) - 0.5) * 2;
        const drift = (1 - snap);
        const px = sx + Math.sin(l / 20 + i) * 0.15 * drift, py = sy + Math.cos(l / 24 + i) * 0.15 * drift;
        const c = CLIP_COLORS[i % CLIP_COLORS.length];
        return (
          <mesh key={i} position={[px + (slots[i] - px) * snap, py + (HOOK_ROW_Y - py) * snap, sz * (1 - snap)]}
            rotation={[(l / 30 + i) * drift, (l / 22 + i * 2) * drift, (random(`hr${i}`) - 0.5) * 3 * drift]} scale={nz(enter)}>
            <boxGeometry args={[w, 0.24, 0.12]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} metalness={0.3} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, HOOK_ROW_Y, -0.1]} scale={[nz(snap), 1, 1]}>
        <boxGeometry args={[total + 0.25, 0.36, 0.06]} />
        <meshStandardMaterial color={"#15122a"} metalness={0.6} roughness={0.35} />
      </mesh>
      <ShockRing f={l} at={90} color={C3.gold} r0={0.6} r1={5} y={HOOK_ROW_Y} />
      <BurstCloud f={l} at={90} seed="hk" n={320} pos={[0, HOOK_ROW_Y, 0.2]} speed={0.12} />
      <pointLight position={[1, 2, 4]} intensity={50} color={"#ffffff"} />
    </group>
  );
};

/* 2 · problem: four heavy slabs crash down one by one, then a loop arrow spins around them («كل مرة من الأول») */
export const SLAB_Y = [1.25, 0.45, -0.35, -1.15];
export const SLAB_C = [C3.coral, C3.gold, C3.violet, C3.azure];
const Problem: React.FC<{ l: number }> = ({ l }) => {
  const at = [8, 28, 50, 74];
  const loop = c01((l - 96) / 60);
  return (
    <group>
      {SLAB_Y.map((y, i) => {
        const s = sp(l - at[i], { damping: 11, stiffness: 160 });
        const wob = Math.sin((l - at[i]) * 0.9) * Math.max(0, 1 - (l - at[i] - 8) / 14) * 0.08 * (l > at[i] + 8 ? 1 : 0);
        return (
          <group key={i} position={[0, y + (1 - s) * 6, (1 - s) * 2]} rotation={[0.18 + (1 - s) * 1.2, -0.25, wob]}>
            <mesh>
              <boxGeometry args={[2.5, 0.56, 0.3]} />
              <meshStandardMaterial color={"#1a1730"} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[1.22, 0, 0.16]}><boxGeometry args={[0.06, 0.5, 0.02]} /><meshBasicMaterial color={SLAB_C[i]} toneMapped={false} /></mesh>
            <mesh position={[0, -0.29, 0.16]}><boxGeometry args={[2.5, 0.02, 0.02]} /><meshBasicMaterial color={SLAB_C[i]} toneMapped={false} /></mesh>
            {l > at[i] + 9 && l < at[i] + 40 && <BurstCloud f={l} at={at[i] + 9} seed={`sl${i}`} n={90} pos={[0, -0.3, 0]} speed={0.05} colors={[SLAB_C[i], "#ffffff"]} />}
          </group>
        );
      })}
      {/* loop arrow */}
      {loop > 0 && (
        <group rotation={[1.2, 0, -loop * Math.PI * 4]} scale={nz(eo(c01((l - 96) / 10)))}>
          <mesh><torusGeometry args={[1.85, 0.04, 12, 160, Math.PI * 1.6]} /><meshBasicMaterial color={C3.gold} toneMapped={false} /></mesh>
          <mesh position={[Math.cos(Math.PI * 1.6) * 1.85, Math.sin(Math.PI * 1.6) * 1.85, 0]} rotation={[0, 0, Math.PI * 1.6]}>
            <coneGeometry args={[0.12, 0.3, 16]} />
            <meshBasicMaterial color={C3.gold} toneMapped={false} />
          </mesh>
        </group>
      )}
      <pointLight position={[2, 2, 4]} intensity={60} color={"#ffffff"} />
      <pointLight position={[-2, -1, 2]} intensity={30} color={C3.coral} />
    </group>
  );
};

/* 3 · reveal: the name assembles from particles («بنعمل زيفيديت») */
const Reveal: React.FC<{ l: number }> = ({ l }) => (
  <group>
    {l > 30 && <ParticleName l={l} lockAt={56} y={0.35} width={3.9} />}
    <ShockRing f={l} at={56} color={C3.gold} r0={1.5} r1={9} y={0.35} />
    <ShockRing f={l} at={60} color={"#ffffff"} r0={1.5} r1={6} y={0.35} />
    <BurstCloud f={l} at={56} seed="rv" n={480} pos={[0, 0.35, 0]} speed={0.17} />
    <pointLight position={[0, 0, 3]} intensity={30} color={C3.gold} />
  </group>
);

/* 4 · auto montage: a raw strip; silences (red) dissolve and the speech closes up («يشيلك السكتات») */
export const STRIP_Y = -0.2;
const SEG = [0.34, 0.16, 0.42, 0.22, 0.3, 0.12, 0.38, 0.2, 0.28, 0.14, 0.32];
const Montage: React.FC<{ l: number }> = ({ l }) => {
  const cut = eio(c01((l - 74) / 30));
  const gap = 0.03;
  const speech = SEG.filter((_, i) => i % 2 === 0);
  const rawTotal = SEG.reduce((a, b) => a + b + gap, -gap);
  const cutTotal = speech.reduce((a, b) => a + b + gap, -gap);
  const scale = 3.3 / rawTotal;
  let xr = rawTotal / 2, xc = cutTotal / 2;
  const grp = sp(l - 4, { damping: 15 });
  return (
    <group rotation={[-0.55 + (1 - grp) * 0.8, 0.25 * (1 - cut), 0]} position={[0, STRIP_Y, (1 - grp) * -4]}>
      <group scale={[scale, scale, scale]}>
        {SEG.map((w, i) => {
          const isSpeech = i % 2 === 0;
          const rawC = xr - w / 2; xr -= w + gap;
          let cx = rawC;
          if (isSpeech) { cx = rawC + ((xc - w / 2) - rawC) * cut; xc -= w + gap; }
          const gone = isSpeech ? 0 : cut;
          const color = isSpeech ? C3.teal : C3.coral;
          return (
            <group key={i} position={[cx, 0, 0]} scale={[1, nz(1 - gone), nz(1 - gone)]}>
              <mesh><boxGeometry args={[w, 0.5, 0.14]} /><meshStandardMaterial color={"#141126"} metalness={0.6} roughness={0.35} emissive={color} emissiveIntensity={isSpeech ? 0.08 : 0.25} /></mesh>
              {/* waveform */}
              {Array.from({ length: Math.max(2, Math.round(w / 0.035)) }).map((_, k, arr) => {
                const h = isSpeech ? 0.08 + random(`wv${i}-${k}`) * 0.34 * (0.7 + 0.3 * Math.sin(l / 5 + k)) : 0.03;
                return (
                  <mesh key={k} position={[-w / 2 + (k + 0.5) * (w / arr.length), 0, 0.09]}>
                    <boxGeometry args={[w / arr.length * 0.55, h, 0.02]} />
                    <meshBasicMaterial color={color} toneMapped={false} />
                  </mesh>
                );
              })}
            </group>
          );
        })}
      </group>
      {SEG.map((w, i) => (i % 2 ? <BurstCloud key={i} f={l} at={78 + i * 2} seed={`mg${i}`} n={70} pos={[(SEG.slice(0, i).reduce((a, b) => a + b + gap, 0) + w / 2 - rawTotal / 2) * -scale, 0, 0.1]} speed={0.06} colors={[C3.coral, C3.rose]} /> : null))}
      <pointLight position={[0, 2, 3]} intensity={40} color={"#ffffff"} />
    </group>
  );
};

/* 5 · motion from text: a phone that comes alive once the prompt beam hits it */
export const PHONE_Y = 0.15, PROMPT_Y = -2.0;
const warmTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = 64; c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, "#ff9d42"); gr.addColorStop(0.55, "#ff4f6d"); gr.addColorStop(1, "#7a2bd9");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();
const FromText: React.FC<{ l: number }> = ({ l }) => {
  const ph = sp(l - 4, { damping: 14 });
  const beam = c01((l - 56) / 8), beamFade = 1 - c01((l - 66) / 10);
  const on = sp(l - 64, { damping: 12 });
  return (
    <group>
      <group position={[0, PHONE_Y, 0]} rotation={[(1 - ph) * 1.2, -0.35 * (1 - ph) + Math.sin(l / 30) * 0.12, 0]} scale={nz(ph)}>
        <mesh><boxGeometry args={[1.5, 2.66, 0.12]} /><meshStandardMaterial color={"#14121f"} metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[0, 0, 0.065]}>
          <planeGeometry args={[1.36, 2.5]} />
          <meshBasicMaterial map={warmTex()} color={new THREE.Color().setScalar(0.08 + on * 0.92)} toneMapped={false} />
        </mesh>
        {/* generated motion: shapes spinning inside the screen */}
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[[-0.38, 0.4, 0][k], [0.75, 0.62, -0.55][k], 0.2]} rotation={[l / 20 + k, l / 15, 0]} scale={nz(sp(l - 66 - k * 4, { damping: 9 }) * 0.9)}>
            {k === 0 ? <torusKnotGeometry args={[0.14, 0.045, 80, 12]} /> : k === 1 ? <icosahedronGeometry args={[0.15, 0]} /> : <torusGeometry args={[0.24, 0.05, 12, 60]} />}
            <meshStandardMaterial color={"#fff1d6"} emissive={"#ffd27a"} emissiveIntensity={0.7} metalness={0.6} roughness={0.2} flatShading={k === 1} />
          </mesh>
        ))}
        {[0, 1, 2].map((k) => {
          const p = c01((l - 62 - k * 6) / 40);
          return p > 0 && p < 1 ? (
            <mesh key={`r${k}`} position={[0, 0.2, 0.08]}>
              <torusGeometry args={[0.2 + p * 0.9, 0.012, 8, 80]} />
              <meshBasicMaterial color={"#ffffff"} transparent opacity={(1 - p) * 0.8} toneMapped={false} />
            </mesh>
          ) : null;
        })}
      </group>
      {beam > 0 && beamFade > 0 && (
        <mesh position={[0, PROMPT_Y + ((PHONE_Y - 1.33 - PROMPT_Y) * beam) / 2 + 0.1, 0.2]} scale={[1, nz(beam), 1]}>
          <cylinderGeometry args={[0.03, 0.03, PHONE_Y - 1.33 - PROMPT_Y, 12]} />
          <meshBasicMaterial color={"#ffd27a"} transparent opacity={beamFade} toneMapped={false} />
        </mesh>
      )}
      <BurstCloud f={l} at={66} seed="ft" n={300} pos={[0, PHONE_Y, 0.3]} speed={0.12} colors={[C3.gold, C3.rose, "#ffffff"]} />
      <pointLight position={[1.5, 1.5, 3]} intensity={50} color={"#ffffff"} />
    </group>
  );
};

/* 6 · voice edit: an orb of particles that moves with the real voiceover, and a frame that obeys it */
export const ORB_Y = 1.05, CARD_Y = -1.0;
const ORB_N = 1400;
const Voice: React.FC<{ l: number; spectrum: number[] }> = ({ l, spectrum }) => {
  const geo = useCloud(ORB_N);
  const dirs = useMemo(() => Array.from({ length: ORB_N }, (_, i) => {
    const th = random(`ot${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`op${i}`) - 1);
    return [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.floor(random(`ob${i}`) * 32)];
  }), []);
  const gold = c01((l - 130) / 12);
  const big = c01((l - 100) / 14);
  const P = geo.attributes.position.array as Float32Array, C = geo.attributes.color.array as Float32Array;
  const appear = sp(l - 2, { damping: 14 });
  dirs.forEach((d, i) => {
    const amp = spectrum[d[3]] ?? 0;
    const r = (0.55 + amp * 0.9 + Math.sin(l / 8 + i) * 0.01) * appear;
    P[i * 3] = d[0] * r; P[i * 3 + 1] = ORB_Y + d[1] * r; P[i * 3 + 2] = d[2] * r;
    col.set(i % 3 === 0 ? C3.coral : i % 3 === 1 ? C3.rose : "#ffffff").lerp(new THREE.Color(C3.gold), gold).multiplyScalar(1.1 + amp * 2);
    C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
  });
  touch(geo);
  const card = sp(l - 10, { damping: 14 });
  const frameCol = new THREE.Color(C3.violet).lerp(new THREE.Color(C3.gold), gold);
  return (
    <group>
      <Cloud geo={geo} size={0.05} />
      <mesh position={[0, ORB_Y, 0]}><sphereGeometry args={[0.18 + (spectrum[2] ?? 0) * 0.2, 32, 32]} /><meshBasicMaterial color={gold > 0.5 ? "#ffe3a3" : "#ffd0dc"} toneMapped={false} /></mesh>
      <group position={[0, CARD_Y, 0]} rotation={[0.12, Math.sin(l / 40) * 0.12, 0]} scale={nz(card)}>
        <mesh><boxGeometry args={[2.3, 1.3, 0.1]} /><meshStandardMaterial color={"#120f22"} metalness={0.8} roughness={0.3} /></mesh>
        {[[0, 0.65, 2.32, 0.03], [0, -0.65, 2.32, 0.03], [1.16, 0, 0.03, 1.33], [-1.16, 0, 0.03, 1.33]].map(([px, py, w, h], k) => (
          <mesh key={k} position={[px, py, 0.06]}><planeGeometry args={[w, h]} /><meshBasicMaterial color={frameCol} toneMapped={false} /></mesh>
        ))}
        <mesh position={[0, 0, 0.051]} scale={[1 + big * 0.04, 1 + big * 0.04, 1]}>
          <planeGeometry args={[2.24, 1.24]} />
          <meshBasicMaterial color={new THREE.Color("#1d1636").lerp(new THREE.Color("#3a2606"), gold)} toneMapped={false} />
        </mesh>
      </group>
      <ShockRing f={l} at={100} color={C3.coral} r0={0.6} r1={3} y={ORB_Y} />
      <ShockRing f={l} at={132} color={C3.gold} r0={0.6} r1={3.5} y={ORB_Y} />
      <BurstCloud f={l} at={132} seed="vg" n={300} pos={[0, CARD_Y, 0.2]} speed={0.1} colors={[C3.gold, "#ffe3a3"]} />
      <pointLight position={[0, 0, 3]} intensity={40} color={"#ffffff"} />
    </group>
  );
};

/* 7 · captions: a carousel of three dialect panels that turns on each dialect name */
export const CAR_Y = 0.75, CAR_R = 1.25;
export const CAP_STARTS = [0, 79, 106], CAP_ENDS = [79, 106, 175];
export const DIALECT_C = [C3.gold, C3.rose, C3.azure];
export const carouselAngle = (l: number) => {
  let a = 0;
  [79, 106].forEach((at) => { a += eio(c01((l - at + 6) / 12)); });
  return -a * ((Math.PI * 2) / 3);
};
const Captions: React.FC<{ l: number; energy: number }> = ({ l, energy }) => {
  const ang = carouselAngle(l);
  const s = sp(l - 4, { damping: 14 });
  let li = 0;
  CAP_STARTS.forEach((st, k) => { if (l >= st) li = k; });
  return (
    <group>
      <group position={[0, CAR_Y, -CAR_R]} rotation={[0.08, ang, 0]} scale={nz(s)}>
        {[0, 1, 2].map((k) => {
          const a = (k * Math.PI * 2) / 3;
          const active = k === li;
          return (
            <group key={k} position={[Math.sin(a) * CAR_R, 0, Math.cos(a) * CAR_R]} rotation={[0, a, 0]}>
              <mesh><boxGeometry args={[1.5, 0.82, 0.06]} /><meshStandardMaterial color={"#16132a"} metalness={0.7} roughness={0.3} emissive={DIALECT_C[k]} emissiveIntensity={active ? 0.18 + energy * 0.3 : 0.03} /></mesh>
              <mesh position={[0, -0.41, 0.04]}><boxGeometry args={[1.5, 0.03, 0.02]} /><meshBasicMaterial color={DIALECT_C[k]} toneMapped={false} /></mesh>
            </group>
          );
        })}
      </group>
      {/* audio bars under the captions */}
      {Array.from({ length: 24 }).map((_, k) => {
        const h = 0.04 + Math.abs(Math.sin(l / 3 + k * 0.7)) * energy * 0.5;
        return (
          <mesh key={k} position={[-1.38 + k * 0.12, -2.0 + h / 2, 0]}>
            <boxGeometry args={[0.05, h, 0.03]} />
            <meshBasicMaterial color={DIALECT_C[li]} toneMapped={false} />
          </mesh>
        );
      })}
      <pointLight position={[0, 1.5, 3]} intensity={45} color={"#ffffff"} />
    </group>
  );
};

/* 8 · platforms: one frame morphs 9:16 → 16:9 → 1:1, then fans out into three copies («بدوسة واحدة») */
export const FAN_Y = [1.05, -0.15, -1.35];
export const RATIOS = [{ r: 9 / 16, l: "ريلز وتيك توك" }, { r: 16 / 9, l: "يوتيوب" }, { r: 1, l: "إنستجرام" }];
export const ratioAt = (l: number) => {
  const step = Math.min(2, Math.floor(Math.max(0, l - 10) / 26));
  const t = eio(c01(((l - 10) % 26) / 12));
  const prev = RATIOS[Math.max(0, step - 1)].r, cur = RATIOS[step].r;
  return { step, r: step === 0 ? cur : prev + (cur - prev) * (l - 10 >= step * 26 + 12 ? 1 : t) };
};
export const frameSize = (r: number) => {
  const area = 3.0;
  let w = Math.sqrt(area * r), h = w / r;
  if (h > 2.4) { h = 2.4; w = h * r; }
  if (w > 3.0) { w = 3.0; h = w / r; }
  return { w, h };
};
const Frame: React.FC<{ w: number; h: number; color: string; glow?: number }> = ({ w, h, color, glow = 1 }) => (
  <group>
    <mesh><boxGeometry args={[w, h, 0.05]} /><meshStandardMaterial color={"#140f26"} metalness={0.7} roughness={0.3} emissive={color} emissiveIntensity={0.06 * glow} /></mesh>
    {[[0, h / 2, w + 0.04, 0.035], [0, -h / 2, w + 0.04, 0.035], [w / 2, 0, 0.035, h + 0.04], [-w / 2, 0, 0.035, h + 0.04]].map(([px, py, ww, hh], k) => (
      <mesh key={k} position={[px, py, 0.03]}><planeGeometry args={[ww, hh]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
    ))}
  </group>
);
const Platforms: React.FC<{ l: number }> = ({ l }) => {
  const { r } = ratioAt(l);
  const { w, h } = frameSize(r);
  const fan = sp(l - 72, { damping: 13 });
  const s = sp(l - 2, { damping: 14 });
  return (
    <group position={[0, 0.2, 0]} scale={nz(s)}>
      {fan < 0.02 ? (
        <group rotation={[0.1, Math.sin(l / 25) * 0.15, 0]}><Frame w={w} h={h} color={C3.rose} /></group>
      ) : (
        RATIOS.map((q, k) => {
          const fs = frameSize(q.r);
          const sc = 0.42 + (1 - fan) * 0.58;
          return (
            <group key={k} position={[0, FAN_Y[k] * fan, -Math.abs(k - 1) * 0.3 * fan]} rotation={[0, (k - 1) * 0.35 * fan, 0]} scale={sc}>
              <Frame w={fs.w} h={fs.h} color={[C3.rose, C3.azure, C3.gold][k]} />
            </group>
          );
        })
      )}
      <ShockRing f={l} at={72} color={C3.rose} r0={0.6} r1={5} />
      <BurstCloud f={l} at={72} seed="pl" n={300} pos={[0, 0, 0.2]} speed={0.12} />
      <pointLight position={[0, 1, 3]} intensity={45} color={"#ffffff"} />
    </group>
  );
};

/* 9 · call to action: the name and a portal that pulses when the button lands */
export const CTA_NAME_Y = 1.0;
const Cta: React.FC<{ l: number; energy: number }> = ({ l, energy }) => {
  const s = sp(l, { damping: 14 });
  const hit = l >= 74 ? Math.max(0, 1 - (l - 74) / 16) : 0;
  return (
    <group>
      <ParticleName l={l} lockAt={24} y={CTA_NAME_Y} width={3.3} />
      <group position={[0, -0.75, -0.8]}>
        <mesh scale={nz(s)} rotation={[0.2, l / 90, l / 60]}>
          <torusGeometry args={[1.15, 0.045, 16, 220]} />
          <meshStandardMaterial color={C3.violet} emissive={C3.violet} emissiveIntensity={0.8 + hit * 2 + energy} />
        </mesh>
        <mesh scale={nz(s)} rotation={[1.1, -l / 70, 0]}><torusGeometry args={[1.3, 0.014, 8, 220]} /><meshBasicMaterial color={C3.gold} toneMapped={false} /></mesh>
        <mesh scale={nz(s)} rotation={[-0.6, 0.4, l / 50]}><torusGeometry args={[1.45, 0.01, 8, 220]} /><meshBasicMaterial color={C3.teal} toneMapped={false} /></mesh>
      </group>
      <ShockRing f={l} at={24} color={"#ffffff"} r0={1.2} r1={6} y={CTA_NAME_Y} />
      <ShockRing f={l} at={74} color={C3.gold} r0={0.6} r1={6} y={-0.6} />
      <BurstCloud f={l} at={74} seed="ct" n={520} pos={[0, -0.6, 0.3]} speed={0.15} />
      <pointLight position={[0, 0, 3]} intensity={30 + hit * 120} color={C3.gold} />
    </group>
  );
};

const STATIONS: React.FC<{ l: number; energy: number; spectrum: number[] }>[] = [
  ({ l }) => <Hook l={l} />, ({ l }) => <Problem l={l} />, ({ l }) => <Reveal l={l} />, ({ l }) => <Montage l={l} />,
  ({ l }) => <FromText l={l} />, ({ l, spectrum }) => <Voice l={l} spectrum={spectrum} />, ({ l, energy }) => <Captions l={l} energy={energy} />,
  ({ l }) => <Platforms l={l} />, ({ l, energy }) => <Cta l={l} energy={energy} />,
];

export const World: React.FC<{ f: number; spectrum: number[] }> = ({ f, spectrum }) => {
  const energy = spectrum.length ? spectrum.slice(0, 12).reduce((a, b) => a + b, 0) / 12 : 0;
  const v = F.speedAt(f);
  const ab = 0.0006 + Math.min(0.006, v * 0.0012) + F.impactAt(f) * 0.006;
  return (
    <>
      <color attach="background" args={["#05040b"]} />
      <fog attach="fog" args={["#05040b", 10, 48]} />
      <ambientLight intensity={0.25} />
      <Rig pose={F.poseAt(f)} />
      <StarField speed={v} energy={energy} />
      {STATIONS.map((S, i) => (F.near(i, f) ? (
        <group key={i} position={[0, 0, F.zs[i]]}><S l={f - F.starts[i]} energy={energy} spectrum={spectrum} /></group>
      ) : null))}
      <Post aberration={ab} />
    </>
  );
};
