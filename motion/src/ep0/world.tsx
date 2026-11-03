// The 3D world for episode 0: six stations along -Z that one camera flies through.
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { random, spring } from "remotion";
import * as THREE from "three";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { applyPose, impactAt, poseAt, speedAt, STARTS, ZS } from "./camera";

const GOLD = "#F2A72B", TEAL = "#2BD9B4", CORAL = "#FF5E62", VIOLET = "#8E6BFF", AZURE = "#4C8DFF", ROSE = "#FF5AAE";
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t: number) => 1 - Math.pow(1 - t, 3);
const sp = (f: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 140, mass: 0.7, ...cfg } });

/* ---------- shared helpers ---------- */

let dotTex: THREE.Texture | null = null;
function dot() {
  if (dotTex) return dotTex;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.35, "rgba(255,255,255,.6)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  dotTex = new THREE.CanvasTexture(c);
  return dotTex;
}

/** A points cloud whose positions/colours are recomputed every frame. */
function useCloud(n: number) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, [n]);
}
const Cloud: React.FC<{ geo: THREE.BufferGeometry; size?: number; opacity?: number }> = ({ geo, size = 0.06, opacity = 1 }) => (
  <points geometry={geo} frustumCulled={false}>
    <pointsMaterial size={size} map={dot()} vertexColors transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
  </points>
);
const touch = (g: THREE.BufferGeometry) => {
  g.attributes.position.needsUpdate = true;
  g.attributes.color.needsUpdate = true;
};
const col = new THREE.Color();

/** Expanding glowing ring in 3D. */
const ShockRing: React.FC<{ f: number; at: number; color: string; r0?: number; r1?: number; z?: number; y?: number; x?: number }> = ({ f, at, color, r0 = 1, r1 = 7, z = 0, y = 0, x = 0 }) => {
  const l = f - at;
  if (l < 0 || l > 30) return null;
  const p = eo(l / 30);
  const r = r0 + (r1 - r0) * p;
  return (
    <mesh position={[x, y, z]}>
      <torusGeometry args={[r, 0.05 * (1 - p) + 0.005, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={1 - p} toneMapped={false} />
    </mesh>
  );
};

/** One-shot particle burst. */
const BurstCloud: React.FC<{ f: number; at: number; n?: number; seed: string; pos: [number, number, number]; speed?: number; colors?: string[] }> = ({
  f, at, n = 400, seed, pos, speed = 0.12, colors = [GOLD, TEAL, ROSE, AZURE, VIOLET],
}) => {
  const geo = useCloud(n);
  const l = f - at;
  if (l < 0 || l > 60) return null;
  const P = geo.attributes.position.array as Float32Array, C = geo.attributes.color.array as Float32Array;
  for (let i = 0; i < n; i++) {
    const th = random(`${seed}t${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`${seed}p${i}`) - 1);
    const v = speed * (0.4 + random(`${seed}v${i}`));
    const d = (v * (1 - Math.exp(-l / 12)) * 12);
    P[i * 3] = pos[0] + Math.sin(ph) * Math.cos(th) * d;
    P[i * 3 + 1] = pos[1] + Math.sin(ph) * Math.sin(th) * d - 0.0016 * l * l;
    P[i * 3 + 2] = pos[2] + Math.cos(ph) * d;
    col.set(colors[i % colors.length]).multiplyScalar(1.6 * (1 - l / 60));
    C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
  }
  touch(geo);
  return <Cloud geo={geo} size={0.07} />;
};

/* ---------- environment: stars, warp streaks, floor ---------- */

const STAR_N = 2600;
const Environment: React.FC<{ f: number }> = ({ f }) => {
  const stars = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < STAR_N; i++) {
      let x = 0, y = 0, k = 0;
      do { x = (random(`sx${i}-${k}`) - 0.5) * 30; y = (random(`sy${i}-${k}`) - 0.5) * 22; k++; } while (Math.hypot(x, y * 0.8) < 3.2 && k < 50);
      a.push(x, y, 80 - random(`sz${i}`) * 360);
    }
    return a;
  }, []);
  const pts = useCloud(STAR_N);
  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(STAR_N * 6), 3));
    return g;
  }, []);
  const P = pts.attributes.position.array as Float32Array, C = pts.attributes.color.array as Float32Array;
  const L = lines.attributes.position.array as Float32Array;
  const v = speedAt(f);
  const streak = Math.min(14, v * 2.2);
  for (let i = 0; i < STAR_N; i++) {
    const x = stars[i * 3], y = stars[i * 3 + 1], z = stars[i * 3 + 2];
    P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z;
    col.set(i % 7 === 0 ? GOLD : i % 11 === 0 ? VIOLET : "#ffffff").multiplyScalar(0.5 + random(`sb${i}`) * 0.7);
    C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
    L[i * 6] = x; L[i * 6 + 1] = y; L[i * 6 + 2] = z; L[i * 6 + 3] = x; L[i * 6 + 4] = y; L[i * 6 + 5] = z + streak;
  }
  touch(pts);
  lines.attributes.position.needsUpdate = true;
  return (
    <>
      <Cloud geo={pts} size={0.08} />
      {streak > 0.4 && (
        <lineSegments geometry={lines} frustumCulled={false}>
          <lineBasicMaterial color="#cfc6ff" transparent opacity={Math.min(0.8, streak / 6)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      )}
      <gridHelper args={[60, 60, "#3b2f73", "#1b1736"]} position={[0, -4.2, -100]} scale={[1, 1, 8]} />
    </>
  );
};

/* ---------- 1 · zero: particles gather into a golden torus (the 0) ---------- */

const ZERO_N = 1800;
const Zero: React.FC<{ f: number }> = ({ f }) => {
  const R = 1.25, r = 0.2, z = ZS[0];
  const data = useMemo(() => Array.from({ length: ZERO_N }, (_, i) => {
    const u = random(`zu${i}`) * Math.PI * 2, v = random(`zv${i}`) * Math.PI * 2;
    const th = random(`zt${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`zp${i}`) - 1), d = 6 + random(`zd${i}`) * 10;
    return { t: [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)], s: [Math.sin(ph) * Math.cos(th) * d, Math.sin(ph) * Math.sin(th) * d, Math.cos(ph) * d] };
  }), []);
  const geo = useCloud(ZERO_N);
  const g = eio(c01(f / 24));
  if (f < 40) {
    const P = geo.attributes.position.array as Float32Array, C = geo.attributes.color.array as Float32Array;
    data.forEach((d, i) => {
      const sw = (1 - g) * 2.2;
      const sx = d.s[0] * Math.cos(sw) - d.s[1] * Math.sin(sw), sy = d.s[0] * Math.sin(sw) + d.s[1] * Math.cos(sw);
      P[i * 3] = sx + (d.t[0] - sx) * g; P[i * 3 + 1] = sy + (d.t[1] - sy) * g; P[i * 3 + 2] = z + d.s[2] + (d.t[2] - d.s[2]) * g;
      col.set(i % 3 ? GOLD : TEAL).multiplyScalar(1.4);
      C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
    });
    touch(geo);
  }
  const s = f < 20 ? 0 : sp(f - 20, { damping: 9, stiffness: 200 });
  const hit = Math.max(0, 1 - (f - 22) / 14) * (f >= 22 ? 1 : 0);
  const gy = sp(f - 30, { damping: 14 });
  return (
    <group position={[0, 0, z]}>
      {f < 40 && <Cloud geo={geo} size={0.07} opacity={1 - c01((f - 22) / 14)} />}
      <mesh scale={s} rotation={[0.25 + Math.sin(f / 40) * 0.1, f / 120, 0]}>
        <torusGeometry args={[R, r, 64, 200]} />
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.18} emissive={GOLD} emissiveIntensity={0.12 + hit * 1.8} />
      </mesh>
      <mesh scale={gy} rotation={[f / 50, 0.6, f / 70]}>
        <torusGeometry args={[1.6, 0.014, 8, 200]} />
        <meshBasicMaterial color={"#fff1cf"} toneMapped={false} />
      </mesh>
      <mesh scale={gy} rotation={[1.2, f / 45, 0.3]}>
        <torusGeometry args={[1.82, 0.011, 8, 200]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </mesh>
      <ShockRing f={f} at={22} color={GOLD} r0={1.3} r1={6} />
      <ShockRing f={f} at={27} color={"#ffffff"} r0={1.3} r1={4.5} />
      <pointLight position={[2, 2, 4]} intensity={60 + hit * 200} color={GOLD} />
      <pointLight position={[-3, -2, 3]} intensity={30} color={VIOLET} />
    </group>
  );
};

/* ---------- 2 · ledger: steps, a coin, and a crystal that shatters ---------- */

export const LEDGER_Y = [1.45, 0, -1.45];
export const LEDGER_X = -0.95;
const SHARDS = 18;
const Ledger: React.FC<{ f: number }> = ({ f }) => {
  const l = f - STARTS[1];
  const z = ZS[1];
  const ins = [8, 30, 52].map((a) => sp(l - a, { damping: 13 }));
  const fly = (i: number) => ({
    position: [LEDGER_X - (1 - ins[i]) * 6, LEDGER_Y[i] + (1 - ins[i]) * 1.5, (1 - ins[i]) * 5] as [number, number, number],
    rotation: [(1 - ins[i]) * 2, (1 - ins[i]) * -3, 0] as [number, number, number],
    scale: Math.max(0.001, ins[i]),
  });
  const shatter = l - 60;
  return (
    <group position={[0, 0, z]}>
      {/* steps */}
      <group {...fly(0)}>
        {[0, 1, 2, 3].map((k) => {
          const s = sp(l - 12 - k * 5, { damping: 11 });
          return (
            <mesh key={k} position={[-0.5 + k * 0.34, -0.35 + k * 0.23, 0]} scale={Math.max(0.001, s)} rotation={[0.3, 0.5 + l / 60, 0]}>
              <boxGeometry args={[0.28, 0.28, 0.28]} />
              <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.9} metalness={0.4} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
      {/* coin */}
      <group {...fly(1)}>
        <group rotation={[0, l * 0.12, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.12, 72]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.2} emissive={GOLD} emissiveIntensity={0.3} />
          </mesh>
          <mesh><torusGeometry args={[0.6, 0.05, 12, 72]} /><meshStandardMaterial color={"#ffd88a"} metalness={1} roughness={0.15} emissive={GOLD} emissiveIntensity={0.6} /></mesh>
          <mesh><torusGeometry args={[0.38, 0.025, 8, 60]} /><meshStandardMaterial color={"#ffd88a"} metalness={1} roughness={0.2} emissive={GOLD} emissiveIntensity={0.5} /></mesh>
        </group>
      </group>
      {/* crystal → shards */}
      <group {...fly(2)}>
        {shatter < 0 ? (
          <mesh rotation={[l / 25, l / 18, 0]}>
            <icosahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color={CORAL} emissive={CORAL} emissiveIntensity={0.7} flatShading metalness={0.3} roughness={0.2} />
          </mesh>
        ) : (
          Array.from({ length: SHARDS }).map((_, k) => {
            const th = random(`sh${k}`) * Math.PI * 2, ph = Math.acos(2 * random(`sp${k}`) - 1);
            const d = (0.35 + random(`sd${k}`) * 0.7) * (1 - Math.exp(-shatter / 8));
            return (
              <mesh key={k} position={[Math.sin(ph) * Math.cos(th) * d, Math.sin(ph) * Math.sin(th) * d - shatter * shatter * 0.0004, Math.cos(ph) * d]} rotation={[shatter * 0.2 * random(`r1${k}`), shatter * 0.15, k]}>
                <tetrahedronGeometry args={[0.13 + random(`ss${k}`) * 0.1, 0]} />
                <meshStandardMaterial color={CORAL} emissive={CORAL} emissiveIntensity={1.2 * Math.max(0.35, 1 - shatter / 40)} flatShading />
              </mesh>
            );
          })
        )}
      </group>
      <pointLight position={[1, 1, 3]} intensity={50} color={"#ffffff"} />
      <pointLight position={[LEDGER_X, LEDGER_Y[2], 1]} intensity={shatter >= 0 ? Math.max(0, 120 - shatter * 6) : 0} color={CORAL} />
      <BurstCloud f={l} at={60} seed="cr" n={260} pos={[LEDGER_X, LEDGER_Y[2], 0]} colors={[CORAL, ROSE, "#ffffff"]} />
      <BurstCloud f={l} at={42} seed="co" n={160} pos={[LEDGER_X, LEDGER_Y[1], 0]} speed={0.07} colors={[GOLD, "#ffe3a3"]} />
    </group>
  );
};

/* ---------- 3 · project: a screen, a timeline that builds itself, and a beam ---------- */

export const SCREEN_Y = 0.95, TRACK_Y = -0.65, PROMPT_Y = -1.5;
const CLIP_W = [0.55, 0.35, 0.7, 0.35, 0.5];
const CLIP_C = [AZURE, VIOLET, TEAL, ROSE, GOLD];
const Project: React.FC<{ f: number }> = ({ f }) => {
  const l = f - STARTS[2];
  const z = ZS[2];
  const win = sp(l - 4, { damping: 15 });
  const lit = sp(l - 96, { damping: 10 });
  const beam = c01((l - 80) / 10);
  const beamFade = 1 - c01((l - 92) / 12);
  const total = CLIP_W.reduce((a, b) => a + b, 0) + 0.06 * (CLIP_W.length - 1);
  let x = total / 2;
  const slots = CLIP_W.map((w) => { const cx = x - w / 2; x -= w + 0.06; return cx; });
  return (
    <group position={[0, 0, z]} rotation={[(1 - win) * 0.9, (1 - win) * -0.8 + Math.sin(l / 30) * 0.05, 0]}>
      {/* screen */}
      <group position={[0, SCREEN_Y - (1 - win) * 3, 0]}>
        <mesh>
          <planeGeometry args={[3.0, 1.7]} />
          <meshStandardMaterial color={"#0b0916"} emissive={GOLD} emissiveIntensity={lit * 0.12} metalness={0.2} roughness={0.6} />
        </mesh>
        {[[0, 0.87, 3.1, 0.04], [0, -0.87, 3.1, 0.04], [1.52, 0, 0.04, 1.78], [-1.52, 0, 0.04, 1.78]].map(([px, py, w, h], k) => (
          <mesh key={k} position={[px, py, 0.01]}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color={lit > 0.5 ? GOLD : VIOLET} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* track + clips */}
      <mesh position={[0, TRACK_Y, -0.05]}>
        <boxGeometry args={[total + 0.3, 0.42, 0.08]} />
        <meshStandardMaterial color={"#15122a"} metalness={0.6} roughness={0.35} />
      </mesh>
      {CLIP_W.map((w, i) => {
        const s = sp(l - 84 - i * 3, { damping: 12 });
        const sx = (random(`cx${i}`) - 0.5) * 12, sy = (random(`cy${i}`) - 0.5) * 8;
        return (
          <mesh key={i} position={[slots[i] + (1 - s) * sx, TRACK_Y + (1 - s) * sy, (1 - s) * 6 + 0.02]} rotation={[(1 - s) * 3, (1 - s) * 2, 0]} scale={Math.max(0.001, s)}>
            <boxGeometry args={[w, 0.3, 0.1]} />
            <meshStandardMaterial color={CLIP_C[i]} emissive={CLIP_C[i]} emissiveIntensity={0.9} />
          </mesh>
        );
      })}
      {/* beam from the prompt to the screen */}
      {beam > 0 && beamFade > 0 && (
        <mesh position={[0, PROMPT_Y + ((SCREEN_Y - 0.85 - PROMPT_Y) * beam) / 2, 0.1]} scale={[1, Math.max(0.001, beam), 1]}>
          <cylinderGeometry args={[0.035, 0.035, SCREEN_Y - 0.85 - PROMPT_Y, 12]} />
          <meshBasicMaterial color={"#ffd27a"} transparent opacity={beamFade} toneMapped={false} />
        </mesh>
      )}
      <ShockRing f={l} at={96} color={GOLD} r0={0.4} r1={4} y={SCREEN_Y} z={0.05} />
      <BurstCloud f={l} at={96} seed="pj" n={300} pos={[0, SCREEN_Y, 0.2]} />
      <pointLight position={[0, 1, 3]} intensity={40 + lit * 60} color={"#ffffff"} />
    </group>
  );
};

/* ---------- 4 · name: thousands of particles assemble "Zifidit." ---------- */

function sampleText(text: string, font: string) {
  const c = document.createElement("canvas");
  c.width = 1400; c.height = 360;
  const g = c.getContext("2d")!;
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#fff";
  g.fillText(text, 700, 180);
  const full = g.measureText(text).width;
  const dotFrom = 700 - full / 2 + g.measureText(text.slice(0, -1)).width;
  const img = g.getImageData(0, 0, 1400, 360).data;
  const out: { x: number; y: number; dot: boolean }[] = [];
  for (let y = 0; y < 360; y += 3) for (let x = 0; x < 1400; x += 3) if (img[(y * 1400 + x) * 4 + 3] > 140) out.push({ x, y, dot: x >= dotFrom - 4 });
  return out;
}
export const NAME_BAR_Y = -1.05;
const Name: React.FC<{ f: number }> = ({ f }) => {
  const l = f - STARTS[3];
  const z = ZS[3];
  const pts = useMemo(() => sampleText("Zifidit.", "800 230px HarakaKufi, sans-serif"), []);
  const n = pts.length;
  const geo = useCloud(n);
  const P = geo.attributes.position.array as Float32Array, C = geo.attributes.color.array as Float32Array;
  const scale = 4.0 / 1400;
  const lockGlow = Math.max(0, 1 - Math.max(0, l - 28) / 18) * (l >= 28 ? 1 : 0);
  pts.forEach((p, i) => {
    const tx = (p.x - 700) * scale, ty = -(p.y - 180) * scale + 0.45;
    const th = random(`nt${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`np${i}`) - 1), d = 4 + random(`nd${i}`) * 9;
    const sx = Math.sin(ph) * Math.cos(th) * d, sy = Math.sin(ph) * Math.sin(th) * d, sz = Math.cos(ph) * d;
    const k = eio(c01((l - 2 - random(`nk${i}`) * 10) / 18));
    const sw = (1 - k) * 3;
    const rx = sx * Math.cos(sw) - sy * Math.sin(sw), ry = sx * Math.sin(sw) + sy * Math.cos(sw);
    const shimmer = Math.sin(l / 6 + p.x * 0.05) * 0.015 * c01((l - 30) / 10);
    P[i * 3] = rx + (tx - rx) * k; P[i * 3 + 1] = ry + (ty - ry) * k; P[i * 3 + 2] = sz * (1 - k) + shimmer;
    col.set(p.dot ? GOLD : "#ffffff").multiplyScalar((p.dot ? 1.6 : 1.05) + lockGlow * 1.4);
    C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
  });
  touch(geo);
  // construction bar, filled from the right (RTL)
  const bar = sp(l - 44, { damping: 14 });
  const pct = 0.38 * eo(c01((l - 44) / 50));
  const BW = 2.6;
  const fillW = Math.max(0.001, BW * pct);
  const edge = BW / 2 - fillW;
  const sparks = useCloud(120);
  const S = sparks.attributes.position.array as Float32Array, SC = sparks.attributes.color.array as Float32Array;
  for (let k = 0; k < 120; k++) {
    const born = 46 + (k % 40) * 1.4, age = l - born;
    const alive = age >= 0 && age < 14 && l < 104;
    const a = Math.PI / 2 + (random(`ka${k}`) - 0.5) * 2.4, v = 0.03 + random(`kv${k}`) * 0.05;
    S[k * 3] = edge + Math.cos(a) * v * age; S[k * 3 + 1] = NAME_BAR_Y + Math.sin(a) * v * age - 0.002 * age * age; S[k * 3 + 2] = 0.1;
    col.set("#ffd27a").multiplyScalar(alive ? 2 * (1 - age / 14) : 0);
    SC[k * 3] = col.r; SC[k * 3 + 1] = col.g; SC[k * 3 + 2] = col.b;
  }
  touch(sparks);
  return (
    <group position={[0, 0, z]}>
      <Cloud geo={geo} size={0.045} />
      <ShockRing f={l} at={28} color={GOLD} r0={1.5} r1={9} />
      <ShockRing f={l} at={32} color={"#ffffff"} r0={1.5} r1={6} />
      <BurstCloud f={l} at={28} seed="nm" n={420} pos={[0, 0.45, 0]} speed={0.16} />
      <group position={[0, NAME_BAR_Y, 0]} scale={[1, Math.max(0.001, bar), 1]}>
        <mesh><boxGeometry args={[BW, 0.14, 0.06]} /><meshStandardMaterial color={"#1a1630"} metalness={0.5} roughness={0.4} /></mesh>
        <mesh position={[BW / 2 - fillW / 2, 0, 0.04]}><boxGeometry args={[fillW, 0.12, 0.05]} /><meshBasicMaterial color={GOLD} toneMapped={false} /></mesh>
      </group>
      <Cloud geo={sparks} size={0.05} />
      <pointLight position={[0, 0, 3]} intensity={30} color={GOLD} />
    </group>
  );
};

/* ---------- 5 · fork: a light line splits into success and failure ---------- */

export const UP_END: [number, number] = [-1.35, 1.65], DOWN_END: [number, number] = [-1.35, -1.65];
const Fork: React.FC<{ f: number }> = ({ f }) => {
  const l = f - STARTS[4];
  const z = ZS[4];
  const curves = useMemo(() => {
    const V = (x: number, y: number, zz: number) => new THREE.Vector3(x, y, zz);
    const stem = new THREE.CatmullRomCurve3([V(2.6, 0, -0.5), V(1.6, 0, 0.1), V(0.5, 0, 0)]);
    const up = new THREE.CatmullRomCurve3([V(0.5, 0, 0), V(-0.1, 0.25, 0.35), V(-0.8, 1.2, 0.25), V(UP_END[0], UP_END[1], 0)]);
    const down = new THREE.CatmullRomCurve3([V(0.5, 0, 0), V(-0.1, -0.25, 0.35), V(-0.8, -1.2, 0.25), V(DOWN_END[0], DOWN_END[1], 0)]);
    const tube = (c: THREE.CatmullRomCurve3) => new THREE.TubeGeometry(c, 220, 0.05, 12, false);
    return { stem, up, down, gs: tube(stem), gu: tube(up), gd: tube(down) };
  }, []);
  const ps = eio(c01((l - 4) / 24)), pu = eo(c01((l - 26) / 30)), pd = eo(c01((l - 70) / 30));
  const draw = (g: THREE.TubeGeometry, p: number) => { g.setDrawRange(0, Math.floor((g.index!.count / 6) * p) * 6); return g; };
  const head = (c: THREE.CatmullRomCurve3, p: number, color: string) => {
    if (p <= 0.001 || p >= 0.999) return null;
    const q = c.getPointAt(p);
    return (
      <group position={q}>
        <mesh><sphereGeometry args={[0.11, 24, 24]} /><meshBasicMaterial color={"#ffffff"} toneMapped={false} /></mesh>
        <pointLight intensity={30} color={color} distance={4} />
      </group>
    );
  };
  const fall = l - 100;
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={draw(curves.gs, ps)}><meshBasicMaterial color={"#f5f3ff"} toneMapped={false} /></mesh>
      <mesh geometry={draw(curves.gu, pu)}><meshBasicMaterial color={TEAL} toneMapped={false} /></mesh>
      <mesh geometry={draw(curves.gd, pd)}><meshBasicMaterial color={CORAL} toneMapped={false} /></mesh>
      {head(curves.stem, ps, "#ffffff")}
      {head(curves.up, pu, TEAL)}
      {head(curves.down, pd, CORAL)}
      <mesh position={[0.5, 0, 0]} scale={Math.max(0.001, ps)}><sphereGeometry args={[0.14, 24, 24]} /><meshBasicMaterial color={"#ffffff"} toneMapped={false} /></mesh>
      {/* success: bars rising at the top end */}
      {[0, 1, 2].map((k) => {
        const s = sp(l - 58 - k * 4, { damping: 12 });
        const h = [0.35, 0.6, 0.9][k] * s;
        return (
          <mesh key={k} position={[UP_END[0] + 0.55 + k * 0.28, UP_END[1] - 0.35 + h / 2, -0.2]}>
            <boxGeometry args={[0.18, Math.max(0.001, h), 0.18]} />
            <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.9} />
          </mesh>
        );
      })}
      <ShockRing f={l} at={56} color={TEAL} r0={0.2} r1={2.5} x={UP_END[0]} y={UP_END[1]} />
      <BurstCloud f={l} at={56} seed="up" n={220} pos={[UP_END[0], UP_END[1], 0]} speed={0.08} colors={[TEAL, "#ffffff", AZURE]} />
      {/* failure: the end cracks into falling shards */}
      {fall >= 0 && Array.from({ length: 14 }).map((_, k) => {
        const vx = (random(`fx${k}`) - 0.3) * 0.05, vy = random(`fy${k}`) * 0.04;
        return (
          <mesh key={k} position={[DOWN_END[0] + vx * fall, DOWN_END[1] + vy * fall - 0.0018 * fall * fall, (random(`fz${k}`) - 0.5) * 0.5]} rotation={[fall * 0.15, fall * 0.1 * random(`fr${k}`), k]}>
            <tetrahedronGeometry args={[0.07 + random(`fs${k}`) * 0.08, 0]} />
            <meshStandardMaterial color={CORAL} emissive={CORAL} emissiveIntensity={1.1} flatShading />
          </mesh>
        );
      })}
      <ShockRing f={l} at={100} color={CORAL} r0={0.2} r1={2.2} x={DOWN_END[0]} y={DOWN_END[1]} />
      <pointLight position={[0, 0, 3]} intensity={25} color={"#ffffff"} />
    </group>
  );
};

/* ---------- 6 · follow: a portal that pulses when the button is tapped ---------- */

const Follow: React.FC<{ f: number }> = ({ f }) => {
  const l = f - STARTS[5];
  const z = ZS[5];
  const s = sp(l, { damping: 14 });
  const hit = l >= 58 ? Math.max(0, 1 - (l - 58) / 16) : 0;
  return (
    <group position={[0, 0, z]}>
      <mesh scale={s} rotation={[0.2, l / 90, l / 60]}>
        <torusGeometry args={[1.55, 0.05, 16, 220]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.9 + hit * 2} />
      </mesh>
      <mesh scale={s} rotation={[1.1, -l / 70, 0]}>
        <torusGeometry args={[1.75, 0.016, 8, 220]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
      <mesh scale={s} rotation={[-0.6, 0.4, l / 50]}>
        <torusGeometry args={[1.95, 0.01, 8, 220]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </mesh>
      <ShockRing f={l} at={58} color={GOLD} r0={0.6} r1={7} />
      <ShockRing f={l} at={62} color={"#ffffff"} r0={0.6} r1={5} />
      <BurstCloud f={l} at={58} seed="fo" n={500} pos={[0, 0, 0.3]} speed={0.15} />
      <pointLight position={[0, 0, 3]} intensity={30 + hit * 120} color={GOLD} />
    </group>
  );
};

/* ---------- rig + post ---------- */

const Rig: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  applyPose(camera as THREE.PerspectiveCamera, poseAt(f));
  return null;
};

export const World: React.FC<{ f: number }> = ({ f }) => {
  const v = speedAt(f);
  const ab = 0.0006 + Math.min(0.006, v * 0.0012) + impactAt(f) * 0.006;
  const near = (i: number) => f > STARTS[i] - 30 && f < (STARTS[i + 1] ?? 9999) + 20;
  return (
    <>
      <color attach="background" args={["#05040b"]} />
      <fog attach="fog" args={["#05040b", 10, 48]} />
      <ambientLight intensity={0.25} />
      <Rig f={f} />
      <Environment f={f} />
      {near(0) && <Zero f={f} />}
      {near(1) && <Ledger f={f} />}
      {near(2) && <Project f={f} />}
      {near(3) && <Name f={f} />}
      {near(4) && <Fork f={f} />}
      {near(5) && <Follow f={f} />}
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.25} luminanceThreshold={0.42} luminanceSmoothing={0.25} mipmapBlur />
        <ChromaticAberration offset={new THREE.Vector2(ab, ab * 0.6)} radialModulation={false} modulationOffset={0} />
        <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        <Vignette darkness={0.75} offset={0.28} />
      </EffectComposer>
    </>
  );
};
