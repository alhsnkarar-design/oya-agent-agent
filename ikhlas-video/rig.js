'use strict';
/* =====================================================================
   شخصيات كرتونية بلا ملامح وجه (لا عيون ولا أنف ولا فم)
   هيكل عظمي ثنائي الأبعاد + حركيات عكسية (IK) للذراعين والساقين.
   المشاعر تُعبَّر عنها بلغة الجسد: ميل الرأس، انحناء الظهر، الإيماءات.
   ===================================================================== */
const TAU = Math.PI * 2;
var RIG_T = 0; // global clock for natural micro-motion (set by the page each frame)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eOut = t => 1 - Math.pow(1 - clamp(t), 3);
const eInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eBack = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function shade(hex, k) { // k<0 darker, k>0 lighter
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function ik(ax, ay, tx, ty, L1, L2, bend) {
  let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy) || 1e-6;
  const dc = clamp(d, Math.abs(L1 - L2) + 1e-4, L1 + L2 - 1e-4);
  const a = Math.atan2(dy, dx), A = Math.acos(clamp((L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc), -1, 1));
  const ang = a + bend * A, jx = ax + Math.cos(ang) * L1, jy = ay + Math.sin(ang) * L1;
  const b2 = Math.atan2(ty - jy, tx - jx);
  return { jx, jy, ex: jx + Math.cos(b2) * L2, ey: jy + Math.sin(b2) * L2, a2: b2 };
}
function seg(c, x1, y1, x2, y2, w, col) {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ---------------- character styles ---------------- */
const ADULT = { T: .95, sw: .31, hw: .25, neck: .12, headR: .32, up: .48, fore: .46, thigh: .56, shin: .54, armW: .19, legW: .23 };
const CHILD = { T: .72, sw: .24, hw: .2, neck: .07, headR: .36, up: .36, fore: .34, thigh: .4, shin: .38, armW: .16, legW: .19 };
const STYLES = {
  worker: { P: ADULT, skin: '#b9825a', shirt: '#3f6ea3', sleeve: 'short', pants: '#4b4d57', shoe: '#5b3b22', boots: true, glove: '#d4ac62',
    vest: '#f08a24', helmet: '#f2c230', hair: '#2b1d16', beltTools: true },
  boss: { P: ADULT, skin: '#d9a982', shirt: '#f3f3f1', sleeve: 'long', sleeveCol: '#2b3040', pants: '#2b3040', shoe: '#141414', jacket: '#2b3040', tie: '#a12a36',
    hair: '#231914', watch: true, belly: .06 },
  child: { P: CHILD, skin: '#b9825a', shirt: '#eaa83a', sleeve: 'short', pants: '#36588a', shorts: true, shoe: '#d9534f', hair: '#2b1d16', backpack: '#3fa37c' },
};

/* ---------------- default pose ---------------- */
function basePose(st) {
  const P = st.P, hipH = (P.thigh + P.shin) * .985, shY = -P.T + .1;
  return { lean: 0, head: 0, nod: 0, hipH, hipX: 0, bob: 0, back: false, face: 1, sq: 0,
    handL: [-P.sw - .1, shY + P.up + P.fore - .04], handR: [P.sw + .1, shY + P.up + P.fore - .04],
    footL: [-.11, hipH], footR: [.11, hipH], liftL: 0, liftR: 0, elbowL: 1, elbowR: -1, kneeL: -1, kneeR: 1, propR: null, propL: null };
}

/* ---------------- draw ---------------- */
// x,y: ground point; s: pixels per unit
function drawChar(c, x, y, s, st, pose) {
  const P = st.P, p = Object.assign(basePose(st), pose);
  c.save(); c.translate(x, y); c.scale(s * p.face, s);
  // ground shadow
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(p.hipX * .6, 0, .55, .07, 0, 0, TAU); c.fill();
  const hipY = -p.hipH + p.bob;
  c.translate(p.hipX, hipY);
  const out = shade(st.pants, -.45);
  // ---- legs (hip frame; y down) ----
  const leg = (side, foot, lift, bend) => {
    const hx = side * P.hw * .55, fx = foot[0], fy = foot[1] - lift;
    const k = ik(hx, 0, fx, fy, P.thigh, P.shin, bend);
    const col = side < 0 ? shade(st.pants, -.12) : st.pants;
    seg(c, hx, 0, k.jx, k.jy, P.legW + .02, out); seg(c, k.jx, k.jy, k.ex, k.ey, P.legW + .02, out);
    seg(c, hx, 0, k.jx, k.jy, P.legW, col);
    if (st.shorts) { seg(c, k.jx, k.jy, k.ex, k.ey, P.legW * .75, st.skin); }
    else seg(c, k.jx, k.jy, k.ex, k.ey, P.legW, col);
    // shoe
    c.save(); c.translate(k.ex, k.ey); c.fillStyle = side < 0 ? shade(st.shoe, -.2) : st.shoe;
    const sh = st.boots ? .13 : .1;
    c.beginPath(); c.moveTo(-.07, -sh); c.lineTo(.05, -sh); c.quadraticCurveTo(.2, -.06, .2, .02); c.lineTo(-.09, .02); c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-.09, .0, .29, .025);
    c.restore();
  };
  leg(-1, p.footL, p.liftL, p.kneeL > 0 ? -1 : 1); leg(1, p.footR, p.liftR, p.kneeR > 0 ? -1 : 1);
  if (st.robe) { // long thobe: skirt from hips to just above the ankles, swinging with the legs
    const sit = p.hipH < .6, mid = (p.footL[0] + p.footR[0]) / 2, hem = sit ? p.hipH - .02 : p.hipH - .16, fl = sit ? .55 : P.hw + .1 + Math.abs(p.footL[0] - p.footR[0]) * .45;
    c.fillStyle = shade(st.shirt, -.06); c.beginPath(); c.moveTo(-P.hw - .03, -.06); c.lineTo(P.hw + .03, -.06);
    c.quadraticCurveTo(P.hw + .08 + mid * .3, hem * .6, mid * .5 + fl, hem); c.lineTo(mid * .5 - fl, hem); c.quadraticCurveTo(-P.hw - .08 + mid * .3, hem * .6, -P.hw - .03, -.06); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = .02; c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.1)'; c.beginPath(); c.moveTo(mid * .2, .05); c.lineTo(mid * .5, hem); c.stroke(); }
  if (st.apron && !p.back) { c.fillStyle = st.apron; c.fillRect(-P.hw - .02, -.04, P.hw * 2 + .04, P.thigh * .95); c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-P.hw * .5, .12, P.hw, .14); }

  // ---- torso frame ----
  c.save(); c.rotate(p.lean);
  const T = P.T, shY = -T + .1, sw = P.sw;
  const arm = (side, hand, bend, front) => {
    const ax = side * sw, ay = shY + .02;
    // natural micro-motion: hands are never perfectly still
    const T = RIG_T + x * .0131 + side * 1.7;
    const hx = hand[0] + Math.sin(T * 1.3) * .012, hy = hand[1] + Math.sin(T * 1.9 + 1) * .01;
    const k = ik(ax, ay, hx, hy, P.up, P.fore, bend);
    const sl = shade(st.sleeve === 'long' ? (st.sleeveCol || st.shirt) : st.shirt, front ? 0 : -.15), dim = front ? 0 : -.15;
    // one smooth curve shoulder → elbow → wrist (no hard hinge), tapering toward the wrist
    const qx = lerp(k.jx, 2 * k.jx - (ax + k.ex) / 2, .5), qy = lerp(k.jy, 2 * k.jy - (ay + k.ey) / 2, .5);
    const pt = t => [(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * qx + t * t * k.ex, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * qy + t * t * k.ey];
    const N = 14, sleeveEnd = st.sleeve === 'short' ? .42 : 1, wAt = t => P.armW * (1.04 - .3 * t);
    c.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N, [x0, y0] = pt(t0), [x1, y1] = pt(t1);
      c.strokeStyle = pass === 0 ? 'rgba(0,0,0,.3)' : (t0 < sleeveEnd ? sl : shade(st.skin, dim)); c.lineWidth = wAt(t0) + (pass === 0 ? .024 : 0);
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    }
    if (st.sleeve === 'short') { const [cx0, cy0] = pt(.42); c.fillStyle = sl; c.beginPath(); c.arc(cx0, cy0, wAt(.42) * .56, 0, TAU); c.fill(); }
    else { const [cx0, cy0] = pt(.9), [cx1, cy1] = pt(.97); c.strokeStyle = shade(st.sleeve === 'long' ? (st.sleeveCol || st.shirt) : st.shirt, (front ? 0 : -.15) - .16); c.lineWidth = wAt(.92) * 1.05; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx1, cy1); c.stroke(); }
    const [px0, py0] = pt(.86), ang = Math.atan2(k.ey - py0, k.ex - px0);
    if (st.watch && side > 0) { const [wx, wy] = pt(.84); c.fillStyle = '#d6b25e'; c.beginPath(); c.arc(wx, wy, .05, 0, TAU); c.fill(); }
    // hand: palm + rounded fingers + thumb, oriented along the forearm
    const hc = st.glove ? shade(st.glove, dim) : shade(st.skin, dim), th = (bend > 0 ? 1 : -1);
    c.save(); c.translate(k.ex, k.ey); c.rotate(ang);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(.075, 0, .108, .083, 0, 0, TAU); c.fill();
    c.fillStyle = hc; c.beginPath(); c.ellipse(.07, 0, .095, .07, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(.135, .005, .05, .062, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(.05, -.068 * th, .03, .048, -.6 * th, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = .01; c.beginPath(); c.moveTo(.11, -.035); c.lineTo(.16, -.03); c.moveTo(.11, .03); c.lineTo(.16, .028); c.stroke();
    c.restore();
    k.ex += Math.cos(ang) * .08; k.ey += Math.sin(ang) * .08;
    return k;
  };
  // back arm (behind torso)
  const kL = arm(-1, p.handL, p.elbowL, false);
  if (p.propL) { c.save(); c.translate(kL.ex, kL.ey); p.propL(c); c.restore(); }
  // backpack (behind)
  if (st.backpack && !p.back) { c.fillStyle = shade(st.backpack, -.2); rr(c, -sw - .02, shY + .02, sw * 2 + .04, T * .72, .1); c.fill(); }
  // torso body
  const top = shY - .06, bot = .04, belly = st.belly || 0;
  c.beginPath();
  c.moveTo(-sw, top + .06); c.quadraticCurveTo(-sw, top, -sw + .08, top);
  c.lineTo(sw - .08, top); c.quadraticCurveTo(sw, top, sw, top + .06);
  c.quadraticCurveTo(sw + belly, -T * .35, P.hw + .02, bot); c.lineTo(-P.hw - .02, bot);
  c.quadraticCurveTo(-sw - belly, -T * .35, -sw, top + .06); c.closePath();
  c.fillStyle = st.shirt; c.fill(); c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = .02; c.stroke();
  if (st.robe && !p.back) { c.save(); c.clip(); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = .02; c.beginPath(); c.moveTo(0, top + .02); c.lineTo(0, shY + .4); c.stroke(); c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, shY + .12 + i * .1, .018, 0, TAU); c.fill(); } c.restore(); }
  if (st.apron && !p.back) { c.save(); c.clip(); c.fillStyle = st.apron; c.fillRect(-sw * .62, shY + .12, sw * 1.24, T); c.strokeStyle = st.apron; c.lineWidth = .04; c.beginPath(); c.moveTo(-sw * .55, shY + .14); c.lineTo(-sw * .4, top); c.moveTo(sw * .55, shY + .14); c.lineTo(sw * .4, top); c.stroke(); c.restore(); }
  if (st.patches && !p.back) { c.save(); c.clip(); c.fillStyle = shade(st.shirt, .25); c.fillRect(-sw * .7, shY + .3, .14, .12); c.fillStyle = shade(st.shirt, -.25); c.fillRect(sw * .2, shY + .55, .12, .14); c.restore(); }
  c.save(); c.clip();
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-sw - .1, top, .16, T + .2); // side shade
  if (p.back) {
    if (st.jacket) { c.fillStyle = st.jacket; c.fillRect(-1, -2, 2, 3); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-.01, top, .02, T); }
    if (st.vest) { c.fillStyle = st.vest; c.fillRect(-1, top + .03, 2, 3); c.fillStyle = '#eaeaea'; c.fillRect(-1, shY + .3, 2, .05); c.fillRect(-1, shY + .48, 2, .05); }
    if (st.backpack) { c.fillStyle = st.backpack; rr(c, -sw * .85, shY + .04, sw * 1.7, T * .66, .08); c.fill(); c.fillStyle = shade(st.backpack, -.2); rr(c, -sw * .6, shY + .3, sw * 1.2, T * .25, .05); c.fill(); }
  } else {
    if (st.vest) {
      c.fillStyle = st.vest;
      c.beginPath(); c.moveTo(-1, top); c.lineTo(-.07, top); c.lineTo(-.04, .1); c.lineTo(-1, .1); c.fill();
      c.beginPath(); c.moveTo(1, top); c.lineTo(.07, top); c.lineTo(.04, .1); c.lineTo(1, .1); c.fill();
      c.fillStyle = '#ececec'; c.fillRect(-1, shY + .3, .94, .05); c.fillRect(.06, shY + .3, 1, .05); c.fillRect(-1, shY + .48, .95, .05); c.fillRect(.05, shY + .48, 1, .05);
      c.fillStyle = shade(st.vest, -.25); c.fillRect(-.16, shY + .12, .1, .12); // pocket
    }
    if (st.jacket) {
      c.fillStyle = st.tie; c.beginPath(); c.moveTo(-.035, top + .05); c.lineTo(.035, top + .05); c.lineTo(.055, shY + .55); c.lineTo(0, shY + .64); c.lineTo(-.055, shY + .55); c.closePath(); c.fill();
      c.fillStyle = shade(st.tie, -.25); c.beginPath(); c.moveTo(-.045, top + .02); c.lineTo(.045, top + .02); c.lineTo(.03, top + .08); c.lineTo(-.03, top + .08); c.fill();
      c.fillStyle = st.jacket;
      c.beginPath(); c.moveTo(-1, top); c.lineTo(-.1, top); c.lineTo(-.07, shY + .5); c.lineTo(-.1, .1); c.lineTo(-1, .1); c.fill();
      c.beginPath(); c.moveTo(1, top); c.lineTo(.1, top); c.lineTo(.07, shY + .5); c.lineTo(.1, .1); c.lineTo(1, .1); c.fill();
      c.strokeStyle = shade(st.jacket, .25); c.lineWidth = .015; c.beginPath(); c.moveTo(-.1, top); c.lineTo(-.18, shY + .25); c.lineTo(-.07, shY + .5); c.moveTo(.1, top); c.lineTo(.18, shY + .25); c.lineTo(.07, shY + .5); c.stroke();
      c.fillStyle = '#e8e2d0'; c.beginPath(); c.moveTo(.16, shY + .2); c.lineTo(.24, shY + .2); c.lineTo(.2, shY + .26); c.fill(); // pocket square
    }
    if (st.backpack) { c.strokeStyle = shade(st.backpack, -.1); c.lineWidth = .06; c.beginPath(); c.moveTo(-sw * .55, top); c.lineTo(-sw * .5, shY + .5); c.moveTo(sw * .55, top); c.lineTo(sw * .5, shY + .5); c.stroke(); }
  }
  c.restore();
  // belt
  c.fillStyle = shade(st.pants, -.35); c.fillRect(-P.hw - .03, -.04, P.hw * 2 + .06, .07);
  if (st.beltTools && !p.back) { c.fillStyle = '#8a5a2b'; rr(c, P.hw - .08, -.03, .14, .16, .03); c.fill(); c.fillStyle = '#9aa0a6'; c.fillRect(P.hw - .03, -.12, .025, .1); }

  // ---- neck & head (no facial features) ----
  c.save(); c.translate(0, -T); c.rotate(p.head);
  c.fillStyle = shade(st.skin, -.12); c.fillRect(-.07, -P.neck - .02, .14, P.neck + .06);
  if (st.jacket && !p.back) { c.fillStyle = st.shirt; c.beginPath(); c.moveTo(-.1, .02); c.lineTo(0, -.04); c.lineTo(.1, .02); c.lineTo(.04, .07); c.lineTo(-.04, .07); c.fill(); }
  const hy = -P.neck - P.headR * .92 + p.nod * .06, R = P.headR;
  c.translate(0, hy); c.rotate(p.nod * .25);
  // ears
  c.fillStyle = shade(st.skin, -.06);
  c.beginPath(); c.ellipse(-R * .97, .03, R * .16, R * .22, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(R * .97, .03, R * .16, R * .22, 0, 0, TAU); c.fill();
  // head
  const hg = c.createRadialGradient(-R * .35, -R * .4, R * .1, 0, 0, R * 1.1);
  hg.addColorStop(0, shade(st.skin, .12)); hg.addColorStop(1, shade(st.skin, -.1));
  c.fillStyle = hg; c.beginPath(); c.ellipse(0, 0, R * .9, R * 1.04, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = .018; c.stroke();
  // hair
  if (st.hair && !st.helmet) {
    c.fillStyle = st.hair; c.beginPath();
    if (p.back) { c.ellipse(0, -.02, R * .92, R * 1.0, 0, 0, TAU); }
    else { c.ellipse(0, -R * .3, R * .93, R * .78, 0, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(R * .6, -R * .55, -R * .1, -R * .5); c.quadraticCurveTo(-R * .7, -R * .45, -R * .9, -R * .2); }
    c.fill();
  }
  if (st.cap) { c.fillStyle = st.cap; c.beginPath(); c.ellipse(0, -R * .42, R * .9, R * .62, 0, Math.PI, 0); c.fill(); c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = .015; for (let i = 1; i < 4; i++) { c.beginPath(); c.ellipse(0, -R * .42, R * .9 * i / 4, R * .62, 0, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } c.fillStyle = shade(st.cap, -.08); c.fillRect(-R * .9, -R * .46, R * 1.8, R * .09); }
  if (st.helmet) {
    c.fillStyle = st.helmet;
    c.beginPath(); c.ellipse(0, -R * .3, R * 1.0, R * .85, 0, Math.PI, 0); c.fill();
    c.fillStyle = shade(st.helmet, -.18); c.beginPath(); c.ellipse(0, -R * .28, R * 1.22, R * .14, 0, 0, TAU); c.fill();
    c.fillStyle = shade(st.helmet, .3); c.fillRect(-R * .1, -R * 1.12, R * .2, R * .82);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-R * .45, -R * .75, R * .18, R * .1, -.6, 0, TAU); c.fill();
  }
  c.restore();
  // front arm last
  const kR = arm(1, p.handR, p.elbowR, true);
  if (p.propR) { c.save(); c.translate(kR.ex, kR.ey); p.propR(c); c.restore(); }
  c.restore(); // torso
  c.restore();
  return { hip: [x + p.hipX * s * p.face, y + hipY * s] };
}

/* ---------------- props (drawn at hand, unit space) ---------------- */
const PROPS = {
  cane: c => { c.strokeStyle = '#6b4a2a'; c.lineWidth = .05; c.lineCap = 'round'; c.beginPath(); c.moveTo(-.08, -.08); c.quadraticCurveTo(0, -.18, .04, -.06); c.lineTo(.12, 1.0); c.stroke(); },
  sword: c => { c.save(); c.rotate(-.15); c.fillStyle = '#c9a046'; c.fillRect(-.12, -.03, .24, .05); c.fillStyle = '#5a3a20'; c.fillRect(-.025, 0, .05, .16); c.fillStyle = '#dfe3e8'; c.beginPath(); c.moveTo(-.035, -.03); c.lineTo(.035, -.03); c.lineTo(.02, -.95); c.lineTo(0, -1.02); c.lineTo(-.02, -.95); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-.005, -.9, .01, .85); c.restore(); },
  book: c => { c.save(); c.rotate(-.1); c.fillStyle = '#6b2a2a'; c.fillRect(-.24, -.04, .48, .04); c.fillStyle = '#f5ecd6'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-.12, -.05, -.23, -.03); c.lineTo(-.23, -.3); c.quadraticCurveTo(-.12, -.33, 0, -.27); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(.12, -.05, .23, -.03); c.lineTo(.23, -.3); c.quadraticCurveTo(.12, -.33, 0, -.27); c.closePath(); c.fill(); c.fillStyle = 'rgba(60,40,20,.35)'; for (let i = 0; i < 4; i++) { c.fillRect(-.2, -.25 + i * .05, .15, .012); c.fillRect(.04, -.25 + i * .05, .15, .012); } c.restore(); },
  bag: c => { c.fillStyle = '#c9a46a'; c.beginPath(); c.moveTo(-.2, .02); c.lineTo(.2, .02); c.lineTo(.24, .42); c.lineTo(-.24, .42); c.fill(); c.strokeStyle = '#8a6a3a'; c.lineWidth = .03; c.beginPath(); c.arc(0, .02, .1, Math.PI, 0); c.stroke(); c.fillStyle = '#d9534f'; c.beginPath(); c.arc(-.07, -.02, .08, 0, TAU); c.fill(); c.fillStyle = '#5aa04a'; c.beginPath(); c.arc(.08, -.03, .07, 0, TAU); c.fill(); },
  coins: c => { c.fillStyle = '#e8c766'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, -i * .045, .1, .035, 0, 0, TAU); c.fill(); c.strokeStyle = '#a8862e'; c.lineWidth = .012; c.stroke(); } },
  sack: c => { c.fillStyle = '#a07a4a'; c.beginPath(); c.ellipse(-.05, -.22, .3, .22, -.3, 0, TAU); c.fill(); c.strokeStyle = '#6b4a2a'; c.lineWidth = .025; c.stroke(); c.beginPath(); c.moveTo(.15, -.38); c.lineTo(.22, -.44); c.stroke(); },
  dagger: c => { c.save(); c.rotate(-.25); c.fillStyle = '#4a2e1c'; c.fillRect(-.03, -.02, .06, .17); c.fillStyle = '#c9a046'; c.fillRect(-.08, -.05, .16, .035); c.fillStyle = '#d6dae0'; c.beginPath(); c.moveTo(-.035, -.05); c.lineTo(.035, -.05); c.lineTo(0, -.42); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(-.006, -.38, .012, .3); c.restore(); },
  daggerRed: c => { PROPS.dagger(c); c.save(); c.rotate(-.25); c.fillStyle = '#8e1414'; c.beginPath(); c.moveTo(-.025, -.2); c.lineTo(.025, -.2); c.lineTo(0, -.42); c.fill(); c.restore(); },
  date: c => { c.fillStyle = '#5a2a14'; c.beginPath(); c.ellipse(0, -.03, .035, .055, 0, 0, TAU); c.fill(); },
  brick: c => { c.fillStyle = '#b5502e'; rr(c, -.26, -.12, .52, .24, .03); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = .015; c.stroke(); c.fillStyle = '#c96a44'; c.fillRect(-.24, -.11, .48, .05); },
  envelope: c => { c.save(); c.rotate(-.2); c.fillStyle = '#e8c766'; rr(c, -.2, -.13, .4, .26, .02); c.fill(); c.strokeStyle = '#a8862e'; c.lineWidth = .02; c.beginPath(); c.moveTo(-.2, -.12); c.lineTo(0, .02); c.lineTo(.2, -.12); c.stroke(); c.restore(); },
  briefcase: c => { c.fillStyle = '#5a3a24'; rr(c, -.22, .02, .44, .3, .04); c.fill(); c.strokeStyle = '#3a2416'; c.lineWidth = .04; c.beginPath(); c.arc(0, .02, .07, Math.PI, 0); c.stroke(); c.fillStyle = '#d6b25e'; c.fillRect(-.03, .1, .06, .04); },
  phone: c => { c.fillStyle = '#111'; rr(c, -.05, -.1, .1, .2, .02); c.fill(); c.fillStyle = '#4a7ab8'; c.fillRect(-.04, -.08, .08, .15); },
};
function sweat(c, x, y, s, t, a = 1) { // emotion cue: sweat drops
  for (let i = 0; i < 2; i++) {
    const ph = (t * .8 + i * .5) % 1, dx = x + (i ? 1 : -1) * s * .36, dy = y + ph * s * .35;
    c.save(); c.globalAlpha = a * (1 - ph); c.fillStyle = '#7fc4ff'; c.beginPath(); c.moveTo(dx, dy - s * .07); c.quadraticCurveTo(dx + s * .05, dy + s * .02, dx, dy + s * .04); c.quadraticCurveTo(dx - s * .05, dy + s * .02, dx, dy - s * .07); c.fill(); c.restore();
  }
}
function heart(c, x, y, s, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#ff6b81'; c.beginPath(); c.moveTo(x, y + s * .35); c.bezierCurveTo(x - s * 1.1, y - s * .35, x - s * .5, y - s * 1.05, x, y - s * .45); c.bezierCurveTo(x + s * .5, y - s * 1.05, x + s * 1.1, y - s * .35, x, y + s * .35); c.fill(); c.restore(); }
function sparkle(c, x, y, s, a = 1) { c.save(); c.globalAlpha = a; c.fillStyle = '#ffe28a'; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .25 : s, an = i * Math.PI / 4; c.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); } c.fill(); c.restore(); }

/* ---------------- reusable motions (return pose overrides) ---------------- */
const MOVES = {
  idle(st, t) { const b = Math.sin(t * 2.2), w = Math.sin(t * .75); return { bob: b * .012, hipX: w * .025, lean: -w * .02, head: Math.sin(t * .9) * .05 + w * .02, handL: [-st.P.sw - .1, -st.P.T + .1 + st.P.up + st.P.fore - .05 + b * .01], handR: [st.P.sw + .1, -st.P.T + .1 + st.P.up + st.P.fore - .05 - b * .01] }; },
  walk(st, t, speed = 1, carry = false) {
    const P = st.P, ph = t * 5.5 * speed, s1 = Math.sin(ph), c1 = Math.cos(ph), hipH = (P.thigh + P.shin) * .97;
    const stride = .26;
    const o = { bob: -Math.abs(Math.sin(ph)) * .035 + .02, lean: .05 + Math.sin(ph * 2) * .018, head: .02 + Math.sin(ph * 2 + .6) * .025, hipX: Math.sin(ph) * .012,
      footL: [-s1 * stride, hipH], footR: [s1 * stride, hipH], liftL: Math.max(0, c1) * .12, liftR: Math.max(0, -c1) * .12, kneeL: 1, kneeR: 1 };
    if (carry) { o.handL = [.22, -P.T + .62]; o.handR = [.34, -P.T + .62]; o.elbowL = 1; o.elbowR = 1; o.lean = -.04; }
    else { o.handL = [s1 * .28 - .05, -P.T + .1 + P.up + P.fore - .1]; o.handR = [-s1 * .28 + .05, -P.T + .1 + P.up + P.fore - .1]; o.elbowL = 1; o.elbowR = 1; }
    return o;
  },
  wipe(st, t) { // wipe sweat from forehead
    const P = st.P, k = (Math.sin(t * 2.4) + 1) / 2, fy = -P.T - P.neck - P.headR * 1.25;
    return { handR: [lerp(-.15, .25, k), fy], elbowR: 1, head: -.12 + k * .08, lean: -.03 };
  },
  tired(st, t) { // bent, hands on knees, heavy breathing
    const P = st.P, br = Math.sin(t * 3.2) * .02;
    const h = (P.thigh + P.shin) * .88;
    return { lean: .1 + br, head: .06, nod: 1.2, hipH: h, bob: br * 2, footL: [-.26, h], footR: [.26, h], kneeL: -1, kneeR: 1,
      handL: [-.3, .02], handR: [.3, .02], elbowL: 1, elbowR: -1 };
  },
  sad(st, t) { const P = st.P; return { head: .12, nod: 1, lean: .04, bob: Math.sin(t * 1.5) * .008, handL: [-P.sw - .04, -P.T + .1 + P.up + P.fore - .1], handR: [P.sw + .04, -P.T + .1 + P.up + P.fore - .1], elbowL: 1, elbowR: -1 }; },
  wait(st, t) { // "wait…" raised palm
    const P = st.P; return { handR: [P.sw + .32, -P.T - .02 + Math.sin(t * 3) * .02], elbowR: 1, head: -.08, lean: -.04 };
  },
  give(st, t, k) { // extends arm to give
    const P = st.P; return { handR: [lerp(P.sw + .1, P.sw + .78, k), lerp(-P.T + .1 + P.up + P.fore - .05, -P.T + .35, k)], elbowR: 1, lean: .1 * k, head: .06 * k, propR: k > .05 ? PROPS.envelope : null };
  },
  receive(st, t, k) { // both hands forward, slight bow
    const P = st.P; return { handL: [lerp(-P.sw - .1, P.sw + .5, k), lerp(-P.T + 1.05, -P.T + .42, k)], handR: [lerp(P.sw + .1, P.sw + .58, k), lerp(-P.T + 1.05, -P.T + .38, k)], elbowL: 1, elbowR: 1, lean: .14 * k, head: .12 * k };
  },
  cheer(st, t) { // happy jump, arms up
    const P = st.P, j = Math.max(0, Math.sin(t * 6)), up = -P.T - P.neck - P.headR * 2.2;
    return { bob: -j * .28, handL: [-P.sw - .28, up + Math.sin(t * 6) * .05], handR: [P.sw + .28, up - Math.sin(t * 6) * .05], elbowL: -1, elbowR: 1, head: Math.sin(t * 3) * .1, liftL: j * .06, liftR: j * .06 };
  },
  handOnChest(st, t) { const P = st.P; return { handR: [-.05, -P.T + .32], elbowR: -1, head: .14, nod: .4, lean: .06 }; },
  sit(st, t) { // sitting on chair facing right
    const P = st.P, sh = P.thigh * .0 + P.shin + .1;
    return { hipH: sh, footL: [P.thigh * .95, sh], footR: [P.thigh * 1.0, sh], kneeL: -1, kneeR: -1, handL: [P.sw + .3, -P.T + .62], handR: [P.sw + .38, -P.T + .58], elbowL: 1, elbowR: 1, lean: .03 };
  },
};
function chair(c, x, y, s, turn, front) { // office chair; turn: 0 facing right, 1 back to camera
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!front) {
    c.fillStyle = '#222'; c.fillRect(-.03, -.62, .06, .5);
    for (const dx of [-.35, 0, .35]) { c.fillStyle = '#333'; c.fillRect(dx - .02, -.14, .04, .1); c.beginPath(); c.arc(dx, -.03, .05, 0, TAU); c.fill(); }
    c.fillStyle = '#1f1f24'; c.fillRect(-.4, -.16, .8, .05);
    c.fillStyle = '#5b2b2b'; rr(c, -.42, -.72, .84, .14, .06); c.fill();
  }
  if (front || turn > .02) {
    const w = lerp(.16, .78, turn), xx = lerp(-.42, -.39, turn);
    c.fillStyle = '#6b3030'; rr(c, xx, -1.75, w, 1.08, .14); c.fill(); c.strokeStyle = '#3e1a1a'; c.lineWidth = .02; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, xx + .05, -1.68, w * .3, .9, .1); c.fill();
  }
  c.restore();
}

function desk(c, x, y, s, t) { // office desk in front of a seated character
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#4a3020'; c.fillRect(-1.08, -1.02, 2.16, .1);
  const g = c.createLinearGradient(0, -.92, 0, 0); g.addColorStop(0, '#6b4630'); g.addColorStop(1, '#3a2418');
  c.fillStyle = g; c.fillRect(-1.03, -.92, 2.06, .92);
  c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = .02; c.strokeRect(-.95, -.82, .9, .72); c.strokeRect(.05, -.82, .9, .72);
  c.fillStyle = '#d6b25e'; c.fillRect(-.57, -.48, .14, .03); c.fillRect(.43, -.48, .14, .03);
  // laptop
  c.fillStyle = '#2a2d36'; c.beginPath(); c.moveTo(.35, -1.02); c.lineTo(.95, -1.02); c.lineTo(1.0, -1.06); c.lineTo(.3, -1.06); c.fill();
  c.fillStyle = '#3a3e4a'; c.beginPath(); c.moveTo(.42, -1.06); c.lineTo(.88, -1.06); c.lineTo(.95, -1.42); c.lineTo(.49, -1.42); c.fill();
  c.fillStyle = 'rgba(120,170,255,' + (.25 + .05 * Math.sin(t * 3)) + ')'; c.beginPath(); c.moveTo(.46, -1.09); c.lineTo(.85, -1.09); c.lineTo(.91, -1.39); c.lineTo(.52, -1.39); c.fill();
  // papers & pen
  c.fillStyle = '#f2efe6'; c.save(); c.translate(-.6, -1.04); c.rotate(-.06); c.fillRect(-.25, -.03, .5, .03); c.restore();
  c.fillStyle = '#efe9da'; c.save(); c.translate(-.55, -1.07); c.rotate(.04); c.fillRect(-.25, -.03, .5, .03); c.restore();
  c.restore();
}
