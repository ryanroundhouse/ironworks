/* ============ MECH PARTS: LEGS (2-bone IK gait) ============ */
const PARTS = { legs: {}, torso: {}, head: {}, arm: {}, back: {} };

/* armoured limb segment hanging along -Y from the parent pivot */
function limb(p, m, len, w, o = {}) {
  box(p, m.joint, w * .5, len, w * .55, 0, -len / 2, 0);
  tbox(p, o.mat || m.pri, w * 1.15, len * .8, w * 1.3, o.tx ?? .72, o.tz ?? .78, 0, -len * .47, o.fz ?? w * .1, o.up ? 0 : PI, 0, 0);
  cyl(p, M.chrome, w * .08, w * .08, len * .72, 0, -len * .5, -w * .62);
  cyl(p, m.blk, w * .15, w * .15, len * .36, 0, -len * .3, -w * .62);
  if (o.stripe) box(p, m.acc, w * 1.19, len * .06, w * 1.34, 0, -len * .16, o.fz ?? w * .1);
  if (o.plate) tbox(p, m.sec, w * 1.35, len * .55, w * .3, .8, 1, 0, -len * .35, w * .82, PI);
}
function mkLeg(parent, m, o) {
  const root = grp(parent, o.x, o.y || 0, o.z || 0, 0, o.yaw || 0, 0), yawP = grp(root), hipP = grp(yawP);
  cyl(hipP, m.joint, o.w * .72, o.w * .72, o.w * 1.5, 0, 0, 0, 0, 0, PI / 2);
  cyl(hipP, m.acc, o.w * .4, o.w * .4, o.w * 1.56, 0, 0, 0, 0, 0, PI / 2);
  o.thigh(hipP, o.side);
  const kneeP = grp(hipP, 0, -o.L1, 0);
  cyl(kneeP, m.joint, o.w * .6, o.w * .6, o.w * 1.36, 0, 0, 0, 0, 0, PI / 2);
  o.shin(kneeP, o.side);
  const ankP = grp(kneeP, 0, -o.L2, 0);
  o.foot(ankP, o.side);
  return { root, yawP, hipP, kneeP, ankP, L1: o.L1, L2: o.L2, rev: !!o.rev, radial: !!o.radial, phase: o.phase || 0, yaw: o.yaw || 0, down: true };
}
/* target is in leg-root local space (y<0 is down, +z forward/outward) */
function solveLeg(L, tx, ty, tz) {
  let f = tz;
  if (L.radial) { L.yawP.rotation.y = Math.atan2(tx, tz); f = Math.hypot(tx, tz); }
  const d = clamp(Math.hypot(f, ty), Math.abs(L.L1 - L.L2) + .05, L.L1 + L.L2 - .02), a = Math.atan2(f, -ty);
  const hi = Math.acos(clamp((L.L1 * L.L1 + d * d - L.L2 * L.L2) / (2 * L.L1 * d), -1, 1));
  const kb = PI - Math.acos(clamp((L.L1 * L.L1 + L.L2 * L.L2 - d * d) / (2 * L.L1 * L.L2), -1, 1));
  const s = L.rev ? -1 : 1, th = -(a + s * hi), kn = s * kb;
  L.hipP.rotation.x = th; L.kneeP.rotation.x = kn; L.ankP.rotation.x = -(th + kn);
}
function gaitFoot(p, duty, S, lift) {
  if (p < duty) return [lerp(S / 2, -S / 2, p / duty), 0];
  const u = (p - duty) / (1 - duty); return [lerp(-S / 2, S / 2, smooth(u)), Math.sin(PI * u) * lift];
}
function footFlat(p, m, w, h, len) {
  cyl(p, m.joint, w * .45, w * .45, w * 1.2, 0, 0, 0, 0, 0, PI / 2);
  tbox(p, m.sec, w * 1.5, h, len, .8, .7, 0, -h / 2, len * .18);
  tbox(p, m.pri, w * 1.3, h * .8, len * .45, .7, .6, 0, -h * .3, len * .52);
  box(p, m.blk, w * 1.55, h * .25, len * 1.02, 0, -h + h * .125, len * .18);
  box(p, m.joint, w * .6, h * .7, len * .3, 0, -h * .55, -len * .42);
}
function footClaw(p, m, w, h) {
  cyl(p, m.joint, w * .5, w * .5, w * 1.3, 0, 0, 0, 0, 0, PI / 2);
  box(p, m.sec, w * .8, h * 1.1, w * .7, 0, -h * .5, w * .3, -.5);
  box(p, m.joint, w * 1.3, .35, w * 1.3, 0, -h + .2, w * .7);
  for (const a of [-.38, .38]) tbox(p, m.pri, w * .55, .5, w * 2.4, .6, .5, Math.sin(a) * w * 1.2, -h + .25, w * 1.6, 0, a, 0);
  tbox(p, m.pri, w * .5, .45, w * 1.5, .6, .5, 0, -h + .22, -w * .7, 0, PI, 0);
}
/* generic two-legged walker; o describes proportions + draw callbacks */
function walker(m, o) {
  const g = new THREE.Group(), pel = grp(g, 0, o.hipY, 0), legs = [];
  o.pelvis(pel);
  for (const s of [-1, 1]) legs.push(mkLeg(pel, m, { ...o, x: s * o.sx, side: s, phase: s < 0 ? 0 : .5 }));
  const hip = grp(pel, 0, o.waistY, 0), u = g.userData;
  Object.assign(u, { hip, legs, stride: o.stride, duty: o.duty, footR: o.sx + o.w });
  u.anim = gs => {
    const A = Math.abs(gs.eff), S = o.stride * (gs.sk || 1) * gs.eff, lift = o.lift * Math.min(1, A * 2.5);
    pel.position.y = o.hipY - Math.cos(gs.phase * 2 * TAU) * o.bob * A - (1 - Math.cos(gs.t * 1.5)) * .03 - (gs.sag || 0) * o.hipY * .34;
    pel.position.x = Math.sin(gs.phase * TAU) * o.sway * A; pel.rotation.z = -Math.sin(gs.phase * TAU) * .03 * A + (gs.sag || 0) * .09; pel.rotation.x = .04 * gs.eff;
    for (const L of legs) {
      const p = (gs.phase + L.phase) % 1, [fz, fy] = gaitFoot(p, o.duty, S, lift);
      solveLeg(L, 0, -(pel.position.y - o.footH) + fy, fz + (o.restZ || 0));
      const dn = p < o.duty; if (dn && !L.down && A > .05 && u.onStep) u.onStep(L); L.down = dn;
    }
  };
  u.anim({ phase: 0, eff: 0, t: 0 });
  return g;
}

PARTS.legs.bip = {
  name: 'STRIDER M2', desc: 'Humanoid biped · balanced', tons: 14, armor: 60, speed: 9, cap: 60, turn: 1.5, twist: 2.1,
  build: m => walker(m, {
    hipY: 5.6, waistY: 1.05, sx: 1.55, L1: 2.7, L2: 2.8, w: 1, footH: .75, stride: 4.2, lift: .9, duty: .6, bob: .12, sway: .2, cadence: .95,
    pelvis: p => { tbox(p, m.sec, 2.7, 1.3, 2, .8, .85, 0, .3, 0); box(p, m.joint, 3.5, .5, .6); cyl(p, m.joint, .95, 1.05, .5, 0, 1.0, 0); tbox(p, m.pri, 1.1, 1.1, .45, .7, 1, 0, .05, 1.1, PI - .15); box(p, m.blk, 1.6, .5, .5, 0, .2, -1.1); },
    thigh: p => limb(p, m, 2.7, 1, { stripe: 1 }),
    shin: p => { limb(p, m, 2.8, .9, { plate: 1, tx: .8 }); tbox(p, m.pri, 1.1, .9, .5, .7, .6, 0, .1, .55); },
    foot: p => footFlat(p, m, 1, .75, 2.9),
  })
};
PARTS.legs.rap = {
  name: 'RAPTOR RJ-7', desc: 'Reverse-joint · fast scout', tons: 10, armor: 42, speed: 13, cap: 45, turn: 1.9, twist: 1.9,
  build: m => walker(m, {
    hipY: 5.9, waistY: .9, sx: 1.7, L1: 2.9, L2: 3.1, w: .85, footH: 1.5, rev: true, restZ: .5, stride: 5.0, lift: 1.3, duty: .55, bob: .2, sway: .14, cadence: 1.15,
    pelvis: p => { tbox(p, m.sec, 2.4, 1.1, 2.6, .75, .7, 0, .2, .1); box(p, m.joint, 3.8, .45, .55); cyl(p, m.joint, .8, .9, .5, 0, .85, 0); cyl(p, M.chrome, .12, .12, 3, 0, -.2, -.9, 0, 0, PI / 2); },
    thigh: p => { limb(p, m, 2.9, 1.15, { tx: .5, tz: .55, stripe: 1 }); tbox(p, m.sec, .35, 1.6, 1.5, 1, .6, .55, -.9, 0, PI); },
    shin: p => { limb(p, m, 3.1, .62, { mat: m.sec, tx: .9 }); cyl(p, M.chrome, .07, .07, 2.4, .3, -1.5, .3); cyl(p, M.chrome, .07, .07, 2.4, -.3, -1.5, .3); },
    foot: p => footClaw(p, m, .85, 1.5),
  })
};
PARTS.legs.hvy = {
  name: 'TITAN HD', desc: 'Heavy biped · assault frame', tons: 26, armor: 110, speed: 5.5, cap: 100, turn: 1.0, twist: 1.6,
  build: m => walker(m, {
    hipY: 6.0, waistY: 1.25, sx: 2.3, L1: 2.5, L2: 3.0, w: 1.45, footH: .95, stride: 3.0, lift: .7, duty: .66, bob: .16, sway: .3, cadence: .72,
    pelvis: p => {
      tbox(p, m.sec, 4.2, 1.6, 2.8, .85, .85, 0, .35, 0); box(p, m.joint, 5, .7, .8); cyl(p, m.joint, 1.35, 1.5, .6, 0, 1.2, 0, 0, 0, 0, 10);
      tbox(p, m.pri, 1.7, 1.5, .5, .75, 1, 0, -.1, 1.5, PI - .12); box(p, m.acc, 1.72, .14, .52, 0, .3, 1.47, -.12);
      for (const s of [-1, 1]) tbox(p, m.pri, .5, 2.2, 2.4, 1, .7, s * 3.35, -.5, 0, PI, 0, s * .12);   // hip skirts
    },
    thigh: p => limb(p, m, 2.5, 1.45, { tx: .8, stripe: 1 }),
    shin: p => { limb(p, m, 3.0, 1.5, { tx: 1.15, tz: 1.1, plate: 1 }); tbox(p, m.pri, 1.8, 1.2, .7, .7, .6, 0, .15, .85); box(p, m.glow, .9, .1, .1, 0, -1.7, 1.42); },
    foot: p => { footFlat(p, m, 1.5, .95, 3.6); for (const s of [-1, 1]) tbox(p, m.sec, .5, .7, 1.2, .6, .5, s * 1.2, -.6, 1.9, 0, s * .3, 0); },
  })
};
PARTS.legs.quad = {
  name: 'ARACHNE QD', desc: 'Four-leg walker · stable', tons: 22, armor: 90, speed: 8, cap: 85, turn: 1.6, twist: PI,
  build: m => {
    const g = new THREE.Group(), H = 4.3, R = 4.4, fH = .3, pel = grp(g, 0, H, 0), legs = [], u = g.userData;
    cyl(pel, m.sec, 2.5, 3, 1.3, 0, 0, 0, 0, PI / 8, 0, 8); cyl(pel, m.joint, 1.5, 1.6, .7, 0, .9, 0); cyl(pel, m.blk, 2, 1.4, .7, 0, -.9, 0, 0, PI / 8, 0, 8);
    cyl(pel, m.glow, .5, .5, .1, 0, -1.27, 0); for (let i = 0; i < 4; i++) box(pel, m.acc, .9, .25, .2, Math.sin(i * PI / 2) * 2.72, .1, Math.cos(i * PI / 2) * 2.72, 0, i * PI / 2, 0);
    for (const [sx, sz] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) legs.push(mkLeg(pel, m, {
      x: sx * 1.9, z: sz * 1.9, yaw: Math.atan2(sx, sz), L1: 3.6, L2: 5, w: .85, radial: true, phase: sx * sz > 0 ? 0 : .5,
      thigh: p => { limb(p, m, 3.6, .9, { tx: .6, stripe: 1 }); },
      shin: p => { limb(p, m, 5, .75, { tx: .45, tz: .5, mat: m.pri }); tbox(p, m.sec, 1.1, 1.3, .9, .5, .6, 0, .3, .2); },
      foot: p => { cyl(p, m.joint, .1, .55, .9, 0, .15, 0, 0, 0, 0, 6); cyl(p, m.blk, .75, .85, .22, 0, -.19, 0, 0, 0, 0, 8); },
    }));
    Object.assign(u, { hip: grp(pel, 0, 1.25, 0), legs, stride: 3.2, duty: .62, footR: 5.5 });
    u.anim = gs => {
      const A = Math.abs(gs.eff), S = 3.2 * (gs.sk || 1) * gs.eff, lift = 1.4 * Math.min(1, A * 2.5);
      pel.position.y = H + Math.sin(gs.phase * 2 * TAU) * .08 * A + Math.sin(gs.t * 1.3) * .05 - (gs.sag || 0) * 1.7;
      pel.rotation.z = Math.sin(gs.phase * TAU) * .02 * A + (gs.sag || 0) * .08;
      for (const L of legs) {
        const p = (gs.phase + L.phase) % 1, [fz, fy] = gaitFoot(p, .62, S, lift);
        solveLeg(L, -fz * Math.sin(L.yaw), -(pel.position.y - fH) + fy, R + fz * Math.cos(L.yaw));
        const dn = p < .62; if (dn && !L.down && A > .05 && u.onStep) u.onStep(L); L.down = dn;
      }
    };
    u.anim({ phase: 0, eff: 0, t: 0 });
    return g;
  }
};
PARTS.legs.trk = {
  name: 'CRAWLER MK-IV', desc: 'Twin tracks · siege platform', tons: 30, armor: 130, speed: 10, cap: 110, turn: 1.2, twist: PI, tracked: true,
  build: m => {
    const g = new THREE.Group(), u = g.userData, wheels = [], tex = [];
    tbox(g, m.sec, 4.4, 1.5, 6, .8, .8, 0, 1.9, 0); tbox(g, m.pri, 3.6, .9, 2, .85, .5, 0, 1.6, 3.2, 0, 0, 0); cyl(g, m.joint, 1.7, 1.9, .7, 0, 2.95, 0, 0, 0, 0, 12);
    for (const s of [-1, 1]) { box(g, m.glow, .5, .22, .1, s * 1.2, 1.75, 4.18); cyl(g, m.blk, .22, .22, 1.6, s * 1.6, 2.6, -2.9, .3); cyl(g, m.joint, .28, .28, .3, s * 1.6, 3.35, -2.66, .3); }
    for (const s of [-1, 1]) {
      const pod = grp(g, s * 3.05, 0, 0), t = TX.tread.clone(); t.needsUpdate = true; t.repeat.set(1, 9); tex.push(t);
      const tm = std({ map: t, color: 0x9a9a9a, metalness: .6, roughness: .75 });
      box(pod, tm, 1.5, 2, 7.2, 0, 1, 0); for (const z of [-3.6, 3.6]) cyl(pod, m.blk, 1, 1, 1.5, 0, 1, z, 0, 0, PI / 2, 16);
      for (let i = 0; i < 5; i++) wheels.push(cyl(pod, m.joint, .55, .55, .3, s * .8, .62, -2.8 + i * 1.4, 0, 0, PI / 2, 10));
      for (const z of [-3.6, 3.6]) { wheels.push(cyl(pod, m.joint, .75, .75, .34, s * .8, 1.15, z, 0, 0, PI / 2, 8)); cyl(pod, m.acc, .25, .25, .4, s * .8, 1.15, z, 0, 0, PI / 2, 6); }
      tbox(pod, m.pri, .28, 1.2, 7.4, 1, .86, s * .9, 1.75, 0); box(pod, m.pri, 1.95, .2, 8, 0, 2.2, 0); box(pod, M.hazard, 1.96, .22, .7, 0, 2.2, 3.7); box(pod, m.joint, 1.2, .7, 1.4, -s * 1.1, 1.6, 0);
    }
    Object.assign(u, { hip: grp(g, 0, 3.3, 0), legs: [], cadence: 1, footR: 4, tracked: true });
    u.anim = gs => {
      const d = (gs.dt || 0) * 1.5;
      tex[0].offset.y -= (gs.amt + gs.turn * .6) * d; tex[1].offset.y -= (gs.amt - gs.turn * .6) * d;
      for (const w of wheels) w.rotation.x += gs.eff * d * 4;
      u.hip.position.y = 3.3 + (Math.abs(gs.eff) > .05 ? Math.sin(gs.t * 31) * .012 : 0); g.rotation.z = (gs.sag || 0) * .07; g.rotation.x = -(gs.sag || 0) * .05;
    };
    return g;
  }
};

/* ============ MECH PARTS: TORSOS ============ (origin = waist ring, +Z forward) */
function torsoBase(m, r, o) {
  const g = new THREE.Group(), u = g.userData;
  cyl(g, m.joint, r, r * 1.08, .5, 0, .25, 0, 0, 0, 0, 12); cyl(g, m.blk, r * .8, r * .8, .3, 0, .6, 0);
  u.head = grp(g, ...o.head); u.armL = grp(g, -o.arm[0], o.arm[1], o.arm[2] || 0); u.armR = grp(g, o.arm[0], o.arm[1], o.arm[2] || 0); u.back = grp(g, ...o.back);
  for (const s of [-1, 1]) { cyl(g, m.joint, o.sr || .7, o.sr || .7, .7, s * (o.arm[0] - .45), o.arm[1], o.arm[2] || 0, 0, 0, PI / 2); }   // shoulder sockets
  return g;
}
const vents = (g, m, n, w, x, y, z, dy = .22, rx = 0) => { for (let i = 0; i < n; i++) box(g, m.blk, w, .1, .12, x, y + i * dy, z, rx); };

PARTS.torso.pod = {
  name: 'KITE POD', desc: 'Light recon fuselage', tons: 9, armor: 45, cool: 6,
  build: m => {
    const g = torsoBase(m, .8, { head: [0, 1.75, 1.5], arm: [2.15, 1.5, .1], back: [0, 1.5, -2.1], sr: .55 });
    tbox(g, m.pri, 2.7, 1.5, 4.6, .75, .8, 0, 1.6, .2); tbox(g, m.sec, 2.5, .8, 4.2, .7, .75, 0, .75, .2, PI);
    tbox(g, m.pri, 1.9, 1, 1.6, .5, .4, 0, 1.2, 3, PI / 2);                       // nose
    box(g, m.acc, 2.74, .12, 3.2, 0, 1.1, .2); box(g, m.glow, .12, .12, 1.8, 1.36, 1.5, .6); box(g, m.glow, .12, .12, 1.8, -1.36, 1.5, .6);
    for (const s of [-1, 1]) { cyl(g, m.blk, .32, .38, 1.3, s * .9, 1.5, -2.5, PI / 2); cyl(g, m.glow, .2, .2, .05, s * .9, 1.5, -3.16, PI / 2); box(g, m.joint, 1.2, .5, .7, s * 1.5, 1.5, .1); }
    cyl(g, M.chrome, .04, .04, 2.4, .9, 3.2, -1.4, -.25); cyl(g, m.blk, .3, .3, .5, 0, .5, 2.2, PI / 2); cyl(g, m.glass, .2, .2, .1, 0, .5, 2.47, PI / 2);
    return g;
  }
};
PARTS.torso.bas = {
  name: 'BASTION', desc: 'Medium brawler hull', tons: 16, armor: 85, cool: 8,
  build: m => {
    const g = torsoBase(m, 1.05, { head: [0, 3.55, .35], arm: [3.05, 2.75, 0], back: [0, 2.2, -1.75] });
    tbox(g, m.sec, 2.6, 1.2, 2.2, 1.35, 1.2, 0, 1.1, 0); tbox(g, m.pri, 4.4, 2.1, 3, .82, .8, 0, 2.6, 0);
    tbox(g, m.pri, 3.2, 1.5, .7, .8, .6, 0, 2.5, 1.55, -.12); box(g, m.acc, 3.3, .14, .2, 0, 1.95, 1.9);
    for (const s of [-1, 1]) { tbox(g, m.sec, 1.2, 1.5, .5, .7, .6, s * 1.45, 2.55, 1.72, -.1, s * -.25); vents(g, m, 4, .8, s * 1.45, 2.2, 1.98); tbox(g, m.pri, 1.5, .6, 2.6, .7, .8, s * 2.2, 3.75, 0); }
    box(g, m.glow, .5, .5, .1, 0, 2.6, 1.93); box(g, m.joint, 3.4, 1.6, .5, 0, 2.5, -1.6); cyl(g, m.blk, .25, .25, .8, 1.6, 3.9, -1.2); cyl(g, m.blk, .25, .25, .8, -1.6, 3.9, -1.2);
    box(g, M.hazard, .9, .3, .05, -1.4, 3.3, 1.42, -.12);
    return g;
  }
};
PARTS.torso.jug = {
  name: 'JUGGERNAUT', desc: 'Assault reactor block', tons: 28, armor: 150, cool: 10,
  build: m => {
    const g = torsoBase(m, 1.5, { head: [0, 4.35, .7], arm: [4.0, 3.3, 0], back: [0, 2.9, -2.2], sr: .95 });
    tbox(g, m.sec, 3.6, 1.4, 3, 1.3, 1.15, 0, 1.2, 0); tbox(g, m.pri, 6, 2.6, 4, .85, .82, 0, 3.2, 0);
    cyl(g, m.joint, 1.25, 1.25, .5, 0, 2.9, 1.85, PI / 2, 0, 0, 16); cyl(g, m.glow, .8, .8, .1, 0, 2.9, 2.11, PI / 2, 0, 0, 16);                     // reactor port
    const fan = grp(g, 0, 2.9, 2.2); for (let i = 0; i < 6; i++) box(fan, m.blk, .22, 1.9, .06, 0, 0, 0, 0, 0, i * PI / 6); fan.userData.tick = dt => fan.rotation.z += dt * 2.5;
    for (const s of [-1, 1]) {
      tbox(g, m.pri, 2.3, 1, 3.6, .7, .75, s * 2.6, 4.95, 0); tbox(g, m.sec, 1.6, 2.2, .6, .8, .7, s * 2.1, 3.1, 2.05, -.1, s * -.2); vents(g, m, 6, 1.1, s * 2.1, 2.5, 2.38);
      box(g, m.acc, .3, 2.5, 3.2, s * 2.98, 3.2, 0); cyl(g, m.blk, .34, .3, 1.5, s * 1.9, 5, -1.7); box(g, m.glow, .9, .1, .1, s * 2.1, 4.15, 2.3);
    }
    box(g, m.joint, 4.6, 2.3, .7, 0, 3.1, -2.1); tbox(g, m.sec, 2.2, 1.1, 1.6, .7, .7, 0, 4.9, .3);
    return g;
  }
};
PARTS.torso.sti = {
  name: 'STILETTO', desc: 'Low-profile sniper wedge', tons: 13, armor: 65, cool: 9,
  build: m => {
    const g = torsoBase(m, .95, { head: [0, 2.75, 1.25], arm: [2.6, 2.1, -.2], back: [0, 2.0, -2.1], sr: .6 });
    tbox(g, m.sec, 2.2, 1, 2.4, 1.2, 1.2, 0, 1.05, 0);
    const w = tbox(g, m.pri, 3.6, 1.7, 4.8, .7, .55, 0, 2.2, .2); w.rotation.x = .08;
    tbox(g, m.pri, 3.0, 1.5, 2.2, .3, .1, 0, 1.85, 3.2, PI / 2 + .1);                  // prow blade
    for (const s of [-1, 1]) { tbox(g, m.sec, .5, 1.3, 4.4, 1, .6, s * 1.9, 2.1, 0, 0, 0, s * -.25); box(g, m.glow, .08, .1, 3, s * 1.62, 2.75, .6, .08); box(g, m.acc, .1, .5, 1.2, s * 2.12, 2.2, 1.2); tbox(g, m.sec, .9, .4, 2.5, .6, .5, s * 1, 3.2, -1.2); }
    box(g, m.joint, 2.6, 1.3, .6, 0, 2.1, -2.2); vents(g, m, 5, 2, 0, 1.7, -2.52);
    cyl(g, M.chrome, .04, .04, 3.2, -1.3, 4.4, -1.6, -.2);
    return g;
  }
};
PARTS.torso.brd = {
  name: 'BROADSIDE', desc: 'Wide weapons carrier', tons: 21, armor: 105, cool: 9,
  build: m => {
    const g = torsoBase(m, 1.3, { head: [0, 2.75, 1.25], arm: [4.25, 1.9, 0], back: [0, 2.4, -1.5] });
    tbox(g, m.sec, 3, 1, 2.6, 1.3, 1.1, 0, 1, 0); tbox(g, m.pri, 6.6, 1.5, 3.6, .9, .8, 0, 2.05, 0); tbox(g, m.sec, 4.4, .5, 3, .85, .8, 0, 3.0, -.2);
    tbox(g, m.pri, 2.6, 1.2, 1.4, .7, .4, 0, 1.9, 2.1, PI / 2 - .2);
    for (const s of [-1, 1]) {
      tbox(g, m.pri, 1.6, 2.2, 3.2, .8, .8, s * 3.0, 2.2, 0); box(g, M.hazard, 1.62, .3, 3.22, s * 3.0, 1.35, 0); vents(g, m, 5, 1.1, s * 3.0, 1.8, 1.62);
      box(g, m.glow, .6, .12, .1, s * 1.8, 2.5, 1.82); cyl(g, m.blk, .5, .5, .3, s * 3, 3.4, .4); cyl(g, m.joint, .3, .3, .5, s * 3, 3.5, .4);
    }
    box(g, m.joint, 5.2, 1.4, .6, 0, 2, -1.7);
    return g;
  }
};

/* ============ HEADS ============ (origin = neck mount) */
PARTS.head.can = {
  name: 'BUBBLE CANOPY', desc: 'Wide-view cockpit', tons: 2, armor: 12, sensor: 55,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .75, .9, .3, 0, .15, 0);
    sph(g, m.glass, 1, 0, .35, .1, .95, .8, 1.25);
    for (const a of [-.6, 0, .6]) box(g, m.sec, .09, .09, 2.2, Math.sin(a) * .95, .35 + Math.cos(a) * .78, .1);
    box(g, m.sec, 2, .12, .12, 0, .8, .2, 0, 0, 0); tbox(g, m.pri, 1.7, .6, 1.2, .8, .7, 0, .4, -.95); box(g, m.glow, .1, .1, .1, .5, .85, -1.2);
    return g;
  }
};
PARTS.head.vis = {
  name: 'VISOR HELM', desc: 'Armoured slit cockpit', tons: 3, armor: 26, sensor: 45,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .6, .7, .4, 0, .2, 0);
    tbox(g, m.pri, 1.7, 1.2, 1.8, .8, .8, 0, .95, 0); tbox(g, m.sec, 1.8, .5, 1.9, .9, .9, 0, .55, .05, PI);
    box(g, m.glow, 1.3, .16, .1, 0, 1.05, .82, -.1); box(g, m.blk, 1.5, .34, .12, 0, 1.05, .78, -.1);
    for (const s of [-1, 1]) { cyl(g, m.joint, .28, .28, .3, s * .95, .95, -.1, 0, 0, PI / 2); cyl(g, M.chrome, .03, .03, 1.5, s * 1.02, 1.8, -.3); }
    tbox(g, m.acc, .3, .35, 1.4, .6, .8, 0, 1.7, -.1);
    return g;
  }
};
PARTS.head.dom = {
  name: 'ORACLE DOME', desc: 'Sweeping sensor turret', tons: 2.5, armor: 16, sensor: 85,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.sec, 1, 1.1, .55, 0, .28, 0, 0, 0, 0, 12); cyl(g, m.acc, 1.02, 1.02, .1, 0, .5, 0);
    const d = grp(g, 0, .55, 0); sph(d, m.pri, .95, 0, 0, 0, 1, .7, 1); cyl(d, m.blk, .34, .34, .5, 0, .28, .72, PI / 2); cyl(d, m.glow, .24, .24, .08, 0, .28, .98, PI / 2); box(d, m.joint, .3, .3, .9, .6, .45, 0);
    d.userData.tick = (dt, t) => d.rotation.y = Math.sin(t * .7) * 1.1;
    return g;
  }
};
PARTS.head.skl = {
  name: 'WARLORD MASK', desc: 'Command head · twin optics', tons: 4, armor: 34, sensor: 60,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .7, .85, .4, 0, .2, 0);
    tbox(g, m.pri, 2, 1.4, 2, .75, .8, 0, 1.1, 0); tbox(g, m.sec, 1.5, .8, .7, .7, .5, 0, .6, .95, PI);          // jaw
    for (const s of [-1, 1]) { box(g, m.glow, .42, .2, .1, s * .45, 1.25, .93, 0, 0, s * -.25); tbox(g, m.acc, .25, 1.3, .5, .3, .5, s * .95, 2.0, -.3, 0, 0, s * -.3); box(g, m.sec, .3, .9, 1.3, s * 1.08, .95, -.1); }
    box(g, m.blk, 1.3, .1, .1, 0, .75, 1.02); box(g, m.blk, 1.3, .1, .1, 0, .55, .98); tbox(g, m.sec, .5, .5, 1.8, .6, .7, 0, 1.95, -.1);
    return g;
  }
};
PARTS.head.arr = {
  name: 'ARGUS ARRAY', desc: 'Multi-lens spotter rig', tons: 2, armor: 10, sensor: 100,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .5, .6, .5, 0, .25, 0);
    tbox(g, m.sec, 2.6, .7, 1.3, .9, .8, 0, .8, 0);
    for (const [x, r] of [[-.85, .26], [-.25, .18], [.35, .32], [.95, .16]]) { cyl(g, m.blk, r + .06, r + .06, .4, x, .8, .7, PI / 2); cyl(g, m.glow, r, r, .06, x, .8, .91, PI / 2); }
    cyl(g, M.chrome, .035, .035, 2.6, -1.1, 2.3, -.4); cyl(g, M.chrome, .035, .035, 1.7, 1.1, 1.9, -.4); box(g, M.redGlow, .1, .1, .1, -1.1, 3.6, -.4);
    const r = grp(g, .5, 1.3, -.3); cyl(r, m.joint, .08, .08, .4, 0, 0, 0); box(r, m.pri, 1.1, .5, .08, 0, .4, 0, -.2); r.userData.tick = dt => r.rotation.y += dt * 3;
    return g;
  }
};

/* ============ BACK UNITS ============ (origin = rear hardpoint, -Z is behind) */
PARTS.back.jet = {
  name: 'JUMP JETS', desc: 'SPACE to boost', tons: 4, armor: 5, fx: 'jets',
  build: m => {
    const g = new THREE.Group(), fl = []; box(g, m.sec, 3, 1.5, .8, 0, 0, -.4); box(g, m.acc, 3.04, .14, .84, 0, .4, -.4);
    for (const s of [-1, 1]) {
      const n = grp(g, s * 1.15, -.2, -1, .35); cyl(n, m.pri, .55, .6, 1.5, 0, 0, 0); cyl(n, m.blk, .62, .42, .7, 0, -1, 0); cyl(n, m.joint, .64, .64, .12, 0, .3, 0);
      const f = cyl(n, M.cyan, .34, .02, 2.6, 0, -2.5, 0); f.castShadow = false; f.visible = false; fl.push(f);
    }
    g.userData.flames = fl; g.userData.tick = (dt, t) => { for (const f of fl) if (f.visible) f.scale.set(1 + rand(-.15, .15), rand(.7, 1.15), 1); };
    return g;
  }
};
PARTS.back.rak = {
  name: 'SWARM RACK', desc: 'F: 8-missile salvo', tons: 6, armor: 8, fx: 'rack',
  weapon: { type: 'missile', name: 'SWARM RACK', dmg: 11, cd: 3.2, heat: 16, speed: 70, salvo: 8, spread: .09 },
  build: m => {
    const g = new THREE.Group(), mz = []; box(g, m.joint, 3.6, .6, .7, 0, .3, -.4);
    for (const s of [-1, 1]) {
      const b = grp(g, s * 1.5, 1.2, -.3, -.3); tbox(b, m.pri, 1.5, 1.4, 2.4, .9, .95, 0, 0, 0); box(b, m.blk, 1.3, 1.2, .1, 0, 0, 1.2); box(b, M.hazard, 1.52, .2, 2.42, 0, -.55, 0);
      for (let i = 0; i < 4; i++) cyl(b, M.redGlow, .2, .2, .06, (i % 2 - .5) * .6, (i > 1 ? .28 : -.28), 1.26, PI / 2);
      mz.push(grp(b, 0, 0, 1.4));
    }
    g.userData.muzzles = mz; return g;
  }
};
PARTS.back.rad = {
  name: 'LONGWAVE RADAR', desc: 'Doubles radar range', tons: 3, armor: 4, fx: 'radar',
  build: m => {
    const g = new THREE.Group(); box(g, m.sec, 2, 1.2, .8, 0, 0, -.4); cyl(g, m.joint, .14, .18, 2.6, 0, 1.7, -.5);
    const d = grp(g, 0, 3.1, -.5); sph(d, m.pri, 1.2, 0, 0, 0, 1, .28, 1).rotation.x = PI / 2 - .25; cyl(d, M.chrome, .03, .03, .9, 0, .1, .45, PI / 2 - .25); box(d, M.redGlow, .12, .12, .12, 0, .22, .9);
    d.userData.tick = dt => d.rotation.y += dt * 1.8;
    box(g, m.glow, .1, .5, .1, .7, .1, -.82); box(g, m.glow, .1, .5, .1, -.7, .1, -.82);
    return g;
  }
};
PARTS.back.snk = {
  name: 'CRYO SINKS', desc: 'Cooling +70%', tons: 5, armor: 6, fx: 'sinks',
  build: m => {
    const g = new THREE.Group(); box(g, m.joint, 3.2, 2, .5, 0, .2, -.3);
    for (const s of [-1, 1]) { for (let i = 0; i < 7; i++) box(g, m.sec, 1.3, .08, 1.1, s * .85, -.6 + i * .27, -1); box(g, m.glow, .12, 1.8, .12, s * .85, .2, -.75); cyl(g, m.blk, .3, .3, 2.2, s * 1.75, .2, -.7); }
    return g;
  }
};
PARTS.back.plt = {
  name: 'REACTIVE PLATE', desc: 'Armor +35%', tons: 8, armor: 70, fx: 'plate',
  build: m => {
    const g = new THREE.Group(); tbox(g, m.pri, 3.6, 2.4, .7, .85, .7, 0, .2, -.5); box(g, M.hazard, 3.1, .3, .1, 0, -.5, -.88);
    for (const s of [-1, 1]) { tbox(g, m.sec, 1.5, 1.5, .6, .8, .7, s * 2.2, .9, -.2, 0, s * .5); for (let i = 0; i < 3; i++) cyl(g, m.blk, .13, .13, .7, s * (.5 + i * .42), 1.7, -.5, -.5); }
    for (let i = 0; i < 6; i++) box(g, m.joint, .4, .4, .12, -1.25 + (i % 3) * 1.25, .7 - Math.floor(i / 3) * .7, -.88);
    return g;
  }
};

/* ============ MECH PARTS: ARMS / WEAPONS ============ (origin = shoulder socket, s = -1 left / +1 right) */
function armBase(m, s, w = 1) {
  const g = new THREE.Group(), u = g.userData;
  sph(g, m.joint, .62 * w, s * .35 * w, 0, 0);
  const p = u.pitch = grp(g, s * 1.2 * w, 0, 0);
  tbox(p, m.pri, 1.6 * w, .9 * w, 2.2 * w, .7, .7, s * .1, .8 * w, 0); box(p, m.acc, 1.62 * w, .1, 1.7 * w, s * .1, .42 * w, 0);
  Object.assign(u, { side: s, recoil: 0, fireT: 0, spin: 0 });
  return g;
}
const Z = PI / 2;   // rx that lays a cylinder along +Z
PARTS.arm.las = {
  name: 'HELIOS BEAM LASER', desc: 'Hitscan · precise', tons: 5, armor: 18,
  weapon: { type: 'laser', name: 'HELIOS LASER', dmg: 16, cd: .55, heat: 7, range: 260 },
  build: (m, s) => {
    const g = armBase(m, s, .9), u = g.userData, p = u.pitch;
    box(p, m.sec, 1.1, 1.3, 2.8, 0, -.5, .3); cyl(p, m.joint, .3, .38, 2.8, 0, -.5, 3, Z); cyl(p, m.glow, .24, .24, .1, 0, -.5, 4.42, Z);
    for (let i = 0; i < 4; i++) cyl(p, m.glow, .44, .44, .1, 0, -.5, 1.9 + i * .55, Z);
    for (let i = 0; i < 5; i++) box(p, m.blk, 1.4, .07, 1.5, 0, -.95 + i * .22, -.3);
    cyl(p, m.blk, .12, .12, 2.2, s * .5, -.2, 1.6, Z); box(p, m.pri, .2, 1, 2, s * .62, -.5, .5);
    u.muzzle = grp(p, 0, -.5, 4.5); return g;
  }
};
PARTS.arm.acn = {
  name: 'VULCAN ROTARY', desc: 'Sustained fire · low heat', tons: 9, armor: 24,
  weapon: { type: 'bullet', name: 'VULCAN ROTARY', dmg: 4.5, cd: .085, heat: .7, speed: 210, spread: .017 },
  build: (m, s) => {
    const g = armBase(m, s), u = g.userData, p = u.pitch;
    box(p, m.sec, 1.3, 1.5, 2.4, 0, -.6, 0); cyl(p, m.pri, .85, .85, 1, s * .2, -.3, -1.2, 0, 0, Z, 12); box(p, m.blk, .4, .5, 1.6, s * .75, -.9, -.2);
    const r = grp(p, 0, -.6, 2.9); for (let i = 0; i < 6; i++) cyl(r, m.blk, .1, .1, 3.4, Math.cos(i * PI / 3) * .3, Math.sin(i * PI / 3) * .3, 0, Z, 0, 0, 8);
    for (const z of [-1.4, 0, 1.5]) cyl(r, m.joint, .48, .48, .22, 0, 0, z, Z);
    r.userData.tick = dt => { u.spin = damp(u.spin, u.fireT > 0 ? 30 : 0, 4, dt); r.rotation.z += u.spin * dt; };
    box(p, m.acc, 1.34, .14, .6, 0, -.6, .9);
    u.muzzle = grp(p, 0, -.6, 4.7); return g;
  }
};
PARTS.arm.mis = {
  name: 'HORNET POD', desc: 'Guided 4-missile salvo', tons: 8, armor: 22,
  weapon: { type: 'missile', name: 'HORNET POD', dmg: 12, cd: 2.4, heat: 12, speed: 75, salvo: 4, spread: .06 },
  build: (m, s) => {
    const g = armBase(m, s), u = g.userData, p = u.pitch;
    tbox(p, m.pri, 2, 2, 3, .92, .95, 0, -.7, .5); box(p, m.blk, 1.8, 1.8, .1, 0, -.7, 2.01); box(p, M.hazard, 2.02, .25, 3.02, 0, -1.5, .5); box(p, m.sec, 1.2, 1.2, 1, 0, -.7, -1.3);
    for (let i = 0; i < 9; i++) { const x = (i % 3 - 1) * .55, y = -.7 + (Math.floor(i / 3) - 1) * .55; cyl(p, m.joint, .22, .22, .12, x, y, 2.05, Z, 0, 0, 8); cyl(p, M.redGlow, .13, .13, .06, x, y, 2.12, Z, 0, 0, 8); }
    box(p, m.sec, 2.1, .12, 1, 0, .34, 1.6, .5);                                  // raised cover
    u.muzzle = grp(p, 0, -.7, 2.3); return g;
  }
};
PARTS.arm.pls = {
  name: 'NOVA PROJECTOR', desc: 'Heavy plasma · very hot', tons: 11, armor: 26,
  weapon: { type: 'plasma', name: 'NOVA PROJECTOR', dmg: 46, cd: 2.0, heat: 24, speed: 85 },
  build: (m, s) => {
    const g = armBase(m, s, 1.05), u = g.userData, p = u.pitch;
    cyl(p, m.sec, .8, .9, 2.6, 0, -.6, .3, Z, 0, 0, 12); cyl(p, m.pri, .95, .95, .9, 0, -.6, -.4, Z, 0, 0, 12); cyl(p, m.joint, .55, .7, 1.6, 0, -.6, 2.3, Z);
    for (let i = 0; i < 3; i++) cyl(p, m.glow, .74 - i * .07, .74 - i * .07, .12, 0, -.6, 1.75 + i * .5, Z);
    for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + PI / 2; tbox(p, m.pri, .22, 1.6, .35, .4, .6, Math.cos(a) * .62, -.6 + Math.sin(a) * .62, 3.2, Z); }
    const orb = sph(p, m.glow, .34, 0, -.6, 3.25); orb.userData.tick = (dt, t) => orb.scale.setScalar(1 - Math.min(1, u.fireT * 2) * .7 + Math.sin(t * 9) * .08);
    cyl(p, m.blk, .18, .18, 2, s * .85, -.1, 0, Z); cyl(p, m.blk, .18, .18, 2, s * .85, -1.1, 0, Z);
    u.muzzle = grp(p, 0, -.6, 3.6); return g;
  }
};
PARTS.arm.gau = {
  name: 'LONGBOW RAIL', desc: 'Hypervelocity slug', tons: 12, armor: 20,
  weapon: { type: 'rail', name: 'LONGBOW RAIL', dmg: 38, cd: 2.6, heat: 5, range: 420 },
  build: (m, s) => {
    const g = armBase(m, s), u = g.userData, p = u.pitch;
    box(p, m.sec, 1.3, 1.6, 3, 0, -.6, -.2); tbox(p, m.pri, 1.4, .6, 2.6, .7, .7, 0, -1.55, -.2, PI);
    for (const y of [-.25, -.95]) box(p, m.joint, .34, .22, 5.6, 0, y, 3.6); box(p, m.glow, .1, .3, 5.2, 0, -.6, 3.5);
    for (let i = 0; i < 5; i++) { box(p, m.pri, .7, 1.1, .2, 0, -.6, 1.6 + i * 1.05); }
    box(p, m.acc, .72, 1.12, .22, 0, -.6, 6.2); tbox(p, m.sec, .2, 1.4, 1.6, 1, .4, 0, .2, -1.6); cyl(p, m.blk, .3, .3, 1.4, s * .7, -.6, -.8, Z);
    u.muzzle = grp(p, 0, -.6, 6.5); return g;
  }
};
PARTS.arm.claw = {
  name: 'RIPPER CLAW', desc: 'Manipulator + scatter gun', tons: 8, armor: 34,
  weapon: { type: 'flak', name: 'RIPPER SCATTER', dmg: 5, cd: 1.1, heat: 7, speed: 160, salvo: 8, spread: .075 },
  build: (m, s) => {
    const g = armBase(m, s), u = g.userData, p = u.pitch, fingers = [];
    limb(p, m, 2.3, .95, { stripe: 1 }); const el = grp(p, 0, -2.3, 0); cyl(el, m.joint, .6, .6, 1.3, 0, 0, 0, 0, 0, Z);
    const fa = grp(el, 0, 0, 0, -Z + .25); limb(fa, m, 2.4, .9, { tx: 1.1, mat: m.sec }); const wr = grp(fa, 0, -2.5, 0); cyl(wr, m.joint, .55, .45, .5, 0, .1, 0);
    for (let i = 0; i < 3; i++) { const f = grp(wr, Math.cos(i * TAU / 3) * .38, -.1, Math.sin(i * TAU / 3) * .38, 0, -i * TAU / 3, 0); const k = grp(f); tbox(k, m.pri, .28, 1.1, .4, .5, .5, .1, -.55, 0, PI); tbox(k, m.acc, .2, .7, .3, .2, .3, -.08, -1.3, 0, PI, 0, -.5); fingers.push(k); }
    wr.userData.tick = (dt, t) => { const o = .25 + Math.sin(t * 1.3) * .2 + u.recoil * .5; for (const k of fingers) k.rotation.z = o; };
    cyl(fa, m.blk, .2, .24, 1.6, 0, -2, .62); cyl(fa, m.joint, .28, .28, .3, 0, -2.7, .62);
    u.muzzle = grp(fa, 0, -3, .62, Z); return g;
  }
};

