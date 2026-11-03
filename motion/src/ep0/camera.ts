// One continuous camera flight through the 3D world (a "oner").
// Shared by the WebGL scene and the HTML overlay so labels stay pinned to 3D objects.
import { PerspectiveCamera, Vector3 } from "three";
import { random } from "remotion";

export const W = 1080, H = 1920, FOV = 40;
export const DURS = [112, 140, 150, 104, 140, 130];
export const T_LEN = 12;
export const STARTS = DURS.map((_, i) => DURS.slice(0, i).reduce((n, d) => n + d - T_LEN, 0)); // 0,100,228,366,458,586
export const TOTAL = DURS.reduce((n, d) => n + d, 0) - T_LEN * (DURS.length - 1); // 716
export const ZS = [0, -40, -80, -120, -160, -200];
const DIST = 9;

/** Global frames where something hits: the camera shakes and the image splits. */
export const IMPACTS = [
  { at: 22, amp: 0.22 },
  { at: STARTS[1] + 60, amp: 0.16 },
  { at: STARTS[2] + 96, amp: 0.14 },
  { at: STARTS[3] + 28, amp: 0.24 },
  { at: STARTS[4] + 100, amp: 0.16 },
  { at: STARTS[5] + 58, amp: 0.14 },
];

const c01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t: number) => 1 - Math.pow(1 - t, 3);

export type Pose = { pos: [number, number, number]; look: [number, number, number]; roll: number };

const SWAY = [[0.25, 0.12], [0.3, 0.1], [0.22, 0.1], [0.18, 0.08], [0.55, 0.18], [0.2, 0.1]];
const DOLLY = [1.3, 0.7, 0.8, 1.2, 0.6, 1.8];

function dwell(i: number, f: number): Pose {
  const s = STARTS[i], e = i < 5 ? STARTS[i + 1] : TOTAL;
  const t = c01((f - s) / (e - s));
  const z = ZS[i];
  const dir = i % 2 ? 1 : -1;
  const x = Math.sin(t * Math.PI) * SWAY[i][0] * dir;
  const y = Math.sin(t * Math.PI * 0.5) * SWAY[i][1];
  return { pos: [x, y, z + DIST - DOLLY[i] * eio(t)], look: [x * 0.3, 0, z], roll: Math.sin(t * Math.PI) * 0.02 * dir };
}

function base(f: number): Pose {
  if (f < 22) {
    const p = eo(f / 22);
    const d = dwell(0, f);
    return { pos: [d.pos[0], d.pos[1], lerp(70, d.pos[2], p)], look: d.look, roll: (1 - p) * 0.5 };
  }
  for (let i = 1; i < STARTS.length; i++) {
    const a = STARTS[i] - 14, b = STARTS[i] + 10;
    if (f >= a && f < b) {
      const p = eio((f - a) / (b - a));
      const A = dwell(i - 1, a), B = dwell(i, b);
      const arc = Math.sin(p * Math.PI);
      return {
        pos: [lerp(A.pos[0], B.pos[0], p) + arc * 0.6 * (i % 2 ? 1 : -1), lerp(A.pos[1], B.pos[1], p) + arc * 0.9, lerp(A.pos[2], B.pos[2], p)],
        look: [lerp(A.look[0], B.look[0], p), lerp(A.look[1], B.look[1], p), lerp(A.look[2], B.look[2], p)],
        roll: arc * 0.28 * (i % 2 ? -1 : 1),
      };
    }
  }
  let i = 0;
  for (let k = 0; k < STARTS.length; k++) if (f >= STARTS[k]) i = k;
  return dwell(i, f);
}

/** Decaying 0..1 strength of the most recent impact. */
export function impactAt(f: number) {
  let v = 0;
  for (const im of IMPACTS) {
    const l = f - im.at;
    if (l >= 0 && l < 24) v = Math.max(v, Math.exp(-l / 5) * (im.amp / 0.24));
  }
  return v;
}

export function poseAt(f: number): Pose {
  const p = base(f);
  let sx = 0, sy = 0;
  for (const im of IMPACTS) {
    const l = f - im.at;
    if (l >= 0 && l < 24) {
      const k = im.amp * Math.exp(-l / 5);
      sx += (random(`cx${im.at}-${f}`) - 0.5) * 2 * k;
      sy += (random(`cy${im.at}-${f}`) - 0.5) * 2 * k;
    }
  }
  return { pos: [p.pos[0] + sx, p.pos[1] + sy, p.pos[2]], look: p.look, roll: p.roll };
}

/** Camera speed in world units per frame (drives warp streaks and aberration). */
export function speedAt(f: number) {
  const a = base(f).pos, b = base(Math.max(0, f - 1)).pos;
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function applyPose(cam: PerspectiveCamera, p: Pose) {
  cam.position.set(...p.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...p.look);
  cam.rotateZ(p.roll);
  cam.updateMatrixWorld();
}

const projCam = new PerspectiveCamera(FOV, W / H, 0.1, 600);
/** Screen pixel position of a world point at global frame f. */
export function project(f: number, x: number, y: number, z: number) {
  applyPose(projCam, poseAt(f));
  projCam.updateProjectionMatrix();
  const v = new Vector3(x, y, z).project(projCam);
  return { x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H };
}
