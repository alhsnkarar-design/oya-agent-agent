// Shared WebGL building blocks: glowing point clouds, shock rings, bursts, a warp-speed star field,
// text-to-particles sampling and the post-processing stack.
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { random, spring } from "remotion";
import * as THREE from "three";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { applyPose, Pose } from "./flight";

export const C3 = { gold: "#F2A72B", teal: "#2BD9B4", coral: "#FF5E62", violet: "#8E6BFF", azure: "#4C8DFF", rose: "#FF5AAE", ink: "#F5F3FF" };
export const c01 = (x: number) => Math.max(0, Math.min(1, x));
export const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eo = (t: number) => 1 - Math.pow(1 - t, 3);
export const sp = (f: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  spring({ frame: f, fps: 30, config: { damping: 12, stiffness: 140, mass: 0.7, ...cfg } });
export const nz = (v: number) => Math.max(0.001, v);

let dotTex: THREE.Texture | null = null;
export function dot() {
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

export function useCloud(n: number) {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, [n]);
}
export const Cloud: React.FC<{ geo: THREE.BufferGeometry; size?: number; opacity?: number }> = ({ geo, size = 0.06, opacity = 1 }) => (
  <points geometry={geo} frustumCulled={false}>
    <pointsMaterial size={size} map={dot()} vertexColors transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
  </points>
);
export const touch = (g: THREE.BufferGeometry) => {
  g.attributes.position.needsUpdate = true;
  g.attributes.color.needsUpdate = true;
};
export const col = new THREE.Color();

export const ShockRing: React.FC<{ f: number; at: number; color: string; r0?: number; r1?: number; x?: number; y?: number; z?: number }> = ({ f, at, color, r0 = 1, r1 = 6, x = 0, y = 0, z = 0 }) => {
  const l = f - at;
  if (l < 0 || l > 30) return null;
  const p = eo(l / 30);
  return (
    <mesh position={[x, y, z]}>
      <torusGeometry args={[r0 + (r1 - r0) * p, 0.045 * (1 - p) + 0.004, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={1 - p} toneMapped={false} />
    </mesh>
  );
};

export const BurstCloud: React.FC<{ f: number; at: number; n?: number; seed: string; pos: [number, number, number]; speed?: number; colors?: string[] }> = ({
  f, at, n = 400, seed, pos, speed = 0.12, colors = [C3.gold, C3.teal, C3.rose, C3.azure, C3.violet],
}) => {
  const geo = useCloud(n);
  const l = f - at;
  if (l < 0 || l > 60) return null;
  const P = geo.attributes.position.array as Float32Array, C = geo.attributes.color.array as Float32Array;
  for (let i = 0; i < n; i++) {
    const th = random(`${seed}t${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`${seed}p${i}`) - 1);
    const d = speed * (0.4 + random(`${seed}v${i}`)) * (1 - Math.exp(-l / 12)) * 12;
    P[i * 3] = pos[0] + Math.sin(ph) * Math.cos(th) * d;
    P[i * 3 + 1] = pos[1] + Math.sin(ph) * Math.sin(th) * d - 0.0016 * l * l;
    P[i * 3 + 2] = pos[2] + Math.cos(ph) * d;
    col.set(colors[i % colors.length]).multiplyScalar(1.6 * (1 - l / 60));
    C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
  }
  touch(geo);
  return <Cloud geo={geo} size={0.07} />;
};

/** Star field that stretches into warp streaks when the camera moves fast; `energy` (0..1, e.g. voice level) brightens it. */
export const StarField: React.FC<{ speed: number; energy?: number; length?: number; n?: number }> = ({ speed, energy = 0, length = 420, n = 2800 }) => {
  const stars = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) {
      let x = 0, y = 0, k = 0;
      do { x = (random(`sx${i}-${k}`) - 0.5) * 30; y = (random(`sy${i}-${k}`) - 0.5) * 22; k++; } while (Math.hypot(x, y * 0.8) < 3.2 && k < 50);
      a.push(x, y, 80 - random(`sz${i}`) * length);
    }
    return a;
  }, [n, length]);
  const pts = useCloud(n);
  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    return g;
  }, [n]);
  const P = pts.attributes.position.array as Float32Array, C = pts.attributes.color.array as Float32Array;
  const L = lines.attributes.position.array as Float32Array;
  const streak = Math.min(14, speed * 2.2);
  for (let i = 0; i < n; i++) {
    const x = stars[i * 3], y = stars[i * 3 + 1], z = stars[i * 3 + 2];
    P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z;
    col.set(i % 7 === 0 ? C3.gold : i % 11 === 0 ? C3.violet : "#ffffff").multiplyScalar((0.5 + random(`sb${i}`) * 0.7) * (1 + energy * 0.8));
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
      <gridHelper args={[60, 60, "#3b2f73", "#1b1736"]} position={[0, -4.2, -length / 2 + 60]} scale={[1, 1, length / 60]} />
    </>
  );
};

/** Pixels of a string drawn on a canvas, for particle typography (Latin only: Arabic stays in HTML). */
export function sampleText(text: string, font: string, step = 3) {
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
  for (let y = 0; y < 360; y += step) for (let x = 0; x < 1400; x += step) if (img[(y * 1400 + x) * 4 + 3] > 140) out.push({ x, y, dot: x >= dotFrom - 4 });
  return out;
}

/** "Zifidit." assembled from particles that swirl in from a sphere. */
export const ParticleName: React.FC<{ l: number; width?: number; y?: number; lockAt?: number }> = ({ l, width = 4, y = 0.45, lockAt = 24 }) => {
  const pts = useMemo(() => sampleText("Zifidit.", "800 230px HarakaKufi, sans-serif"), []);
  const geo = useCloud(pts.length);
  const P = geo.attributes.position.array as Float32Array, C = geo.attributes.color.array as Float32Array;
  const scale = width / 1400;
  const start = lockAt - 22;
  const glow = l >= lockAt ? Math.max(0, 1 - (l - lockAt) / 18) : 0;
  pts.forEach((p, i) => {
    const tx = (p.x - 700) * scale, ty = -(p.y - 180) * scale + y;
    const th = random(`nt${i}`) * Math.PI * 2, ph = Math.acos(2 * random(`np${i}`) - 1), d = 4 + random(`nd${i}`) * 9;
    const sx = Math.sin(ph) * Math.cos(th) * d, sy = Math.sin(ph) * Math.sin(th) * d, sz = Math.cos(ph) * d;
    const k = eio(c01((l - start - random(`nk${i}`) * 8) / 16));
    const sw = (1 - k) * 3;
    const rx = sx * Math.cos(sw) - sy * Math.sin(sw), ry = sx * Math.sin(sw) + sy * Math.cos(sw);
    const shimmer = Math.sin(l / 6 + p.x * 0.05) * 0.015 * c01((l - lockAt - 6) / 10);
    P[i * 3] = rx + (tx - rx) * k; P[i * 3 + 1] = ry + (ty - ry) * k; P[i * 3 + 2] = sz * (1 - k) + shimmer;
    col.set(p.dot ? C3.gold : "#ffffff").multiplyScalar((p.dot ? 1.6 : 1.05) + glow * 1.4);
    C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b;
  });
  touch(geo);
  return <Cloud geo={geo} size={0.045} opacity={c01((l - start + 4) / 6)} />;
};

export const Rig: React.FC<{ pose: Pose }> = ({ pose }) => {
  const { camera } = useThree();
  applyPose(camera as THREE.PerspectiveCamera, pose);
  return null;
};

export const Post: React.FC<{ aberration: number }> = ({ aberration }) => (
  <EffectComposer multisampling={0}>
    <Bloom intensity={1.2} luminanceThreshold={0.42} luminanceSmoothing={0.25} mipmapBlur />
    <ChromaticAberration offset={new THREE.Vector2(aberration, aberration * 0.6)} radialModulation={false} modulationOffset={0} />
    <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
    <Vignette darkness={0.75} offset={0.28} />
  </EffectComposer>
);
