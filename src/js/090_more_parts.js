/* ============ MORE MACHINERY: FOUR MORE CHASSIS, FIVE MORE HULLS, FOUR MORE COCKPITS, AND WEAPONS IN FAMILIES — THE SAME GUN IN TWO OR THREE MARKS ============ */
PARTS.legs.lgt = {
  name: 'SPRINTER LT', desc: 'Ultralight biped · the fastest thing on two legs', tons: 7, armor: 30, speed: 14.5, cap: 38, turn: 2.1, twist: 2.0,
  build: m => walker(m, {
    hipY: 4.6, waistY: .8, sx: 1.2, L1: 2.2, L2: 2.4, w: .7, footH: .6, stride: 4.4, lift: 1, duty: .52, bob: .16, sway: .12, cadence: 1.3,
    pelvis: p => { tbox(p, m.sec, 1.9, .9, 1.6, .75, .8, 0, .2, 0); box(p, m.joint, 2.7, .4, .5); cyl(p, m.joint, .65, .75, .45, 0, .75, 0); box(p, m.acc, 1.2, .12, .1, 0, .3, .82); },
    thigh: p => limb(p, m, 2.2, .7, { tx: .6, tz: .7 }),
    shin: p => { limb(p, m, 2.4, .55, { mat: m.sec, tx: .8, stripe: 1 }); cyl(p, M.chrome, .05, .05, 1.8, 0, -1.2, -.34); },
    foot: p => { cyl(p, m.joint, .32, .32, .85, 0, 0, 0, 0, 0, PI / 2); tbox(p, m.pri, .9, .5, 2.1, .7, .5, 0, -.32, .5); box(p, m.blk, .95, .14, 2.15, 0, -.53, .5); },
  })
};
PARTS.legs.sup = {
  name: 'GOLIATH SX', desc: 'Superheavy biped · carries anything, slowly', tons: 34, armor: 150, speed: 4.6, cap: 135, turn: .85, twist: 1.4,
  build: m => walker(m, {
    hipY: 6.6, waistY: 1.4, sx: 2.7, L1: 2.8, L2: 3.2, w: 1.75, footH: 1.05, stride: 2.8, lift: .6, duty: .68, bob: .14, sway: .34, cadence: .62,
    pelvis: p => {
      tbox(p, m.sec, 5, 1.9, 3.4, .85, .85, 0, .4, 0); box(p, m.joint, 6, .8, 1); cyl(p, m.joint, 1.6, 1.8, .7, 0, 1.4, 0, 0, 0, 0, 12);
      tbox(p, m.pri, 2.2, 1.9, .6, .75, 1, 0, -.2, 1.85, PI - .1); box(p, M.hazard, 2.24, .3, .62, 0, .5, 1.82, -.1);
      for (const s of [-1, 1]) { tbox(p, m.pri, .7, 2.8, 3, 1, .7, s * 4, -.7, 0, PI, 0, s * .1); box(p, m.glow, .1, .2, 1.6, s * 4.36, 0, .3); }
    },
    thigh: p => { limb(p, m, 2.8, 1.75, { tx: .85, stripe: 1 }); tbox(p, m.sec, 2.3, 1.1, 2.6, .8, .8, 0, -.4, 0); },
    shin: p => { limb(p, m, 3.2, 1.8, { tx: 1.2, tz: 1.15, plate: 1 }); tbox(p, m.pri, 2.2, 1.5, .9, .7, .6, 0, .2, 1.05); box(p, m.glow, 1.1, .12, .1, 0, -1.9, 1.7); },
    foot: p => { footFlat(p, m, 1.8, 1.05, 4.2); for (const s of [-1, 1]) { tbox(p, m.sec, .6, .8, 1.5, .6, .5, s * 1.45, -.65, 2.2, 0, s * .3, 0); tbox(p, m.sec, .6, .7, 1.2, .6, .5, s * 1.3, -.7, -1.6, 0, PI - s * .3, 0); } },
  })
};
PARTS.legs.hex = {
  name: 'SCARAB HX', desc: 'Six-leg walker · sure-footed gun deck', tons: 26, armor: 105, speed: 9, cap: 95, turn: 1.5, twist: PI,
  build: m => {
    const g = new THREE.Group(), H = 3.8, R = 4.0, fH = .3, pel = grp(g, 0, H, 0), legs = [], u = g.userData;
    tbox(pel, m.sec, 4.2, 1.3, 7.4, .8, .85, 0, 0, 0); tbox(pel, m.blk, 3.4, .7, 6.6, .8, .85, 0, -.9, 0, PI); cyl(pel, m.joint, 1.6, 1.7, .7, 0, .9, 0); tbox(pel, m.pri, 3, 1, 2, .7, .5, 0, .1, 4.1, PI / 2 - .2);
    box(pel, m.acc, 4.24, .14, 5, 0, .2, 0); for (const s of [-1, 1]) { box(pel, m.glow, .5, .16, .1, s * 1, .1, 4.75); cyl(pel, m.blk, .2, .2, 1.4, s * 1.3, .9, -3.3, .3); }
    [[1, 1], [-1, 1], [1, 0], [-1, 0], [1, -1], [-1, -1]].forEach(([sx, sz], i) => legs.push(mkLeg(pel, m, {
      x: sx * 2.1, z: sz * 2.9, yaw: Math.atan2(sx, sz * .8), L1: 3.2, L2: 4.6, w: .75, radial: true, phase: (i === 0 || i === 3 || i === 4) ? 0 : .5,
      thigh: p => limb(p, m, 3.2, .8, { tx: .6, stripe: 1 }),
      shin: p => { limb(p, m, 4.6, .65, { tx: .4, tz: .5, mat: m.pri }); tbox(p, m.sec, 1, 1.1, .8, .5, .6, 0, .3, .2); },
      foot: p => { cyl(p, m.joint, .1, .5, .8, 0, .15, 0, 0, 0, 0, 6); cyl(p, m.blk, .65, .75, .22, 0, -.19, 0, 0, 0, 0, 8); },
    })));
    Object.assign(u, { hip: grp(pel, 0, 1.25, 0), legs, stride: 3, duty: .6, footR: 5.6 });
    u.anim = gs => {
      const A = Math.abs(gs.eff), S = 3 * (gs.sk || 1) * gs.eff, lift = 1.2 * Math.min(1, A * 2.5);
      pel.position.y = H + Math.sin(gs.phase * 2 * TAU) * .06 * A + Math.sin(gs.t * 1.3) * .04 - (gs.sag || 0) * 1.5; pel.rotation.z = Math.sin(gs.phase * TAU) * .015 * A + (gs.sag || 0) * .09;
      for (const L of legs) {
        const p = (gs.phase + L.phase) % 1, [fz, fy] = gaitFoot(p, .6, S, lift);
        solveLeg(L, -fz * Math.sin(L.yaw), -(pel.position.y - fH) + fy, R + fz * Math.cos(L.yaw));
        const dn = p < .6; if (dn && !L.down && A > .05 && u.onStep) u.onStep(L); L.down = dn;
      }
    };
    u.anim({ phase: 0, eff: 0, t: 0 });
    return g;
  }
};
PARTS.legs.hov = {
  name: 'SKIMMER HV', desc: 'Hover skirt · quick and thin-skinned', tons: 12, armor: 48, speed: 15, cap: 56, turn: 2.2, twist: PI, tracked: true, hover: true,
  build: m => {
    const g = new THREE.Group(), u = g.userData, body = grp(g, 0, 1.6, 0), fans = [];
    cyl(body, m.sec, 3.4, 3.9, 1.1, 0, .55, 0, 0, PI / 8, 0, 8); cyl(body, m.blk, 3.95, 3.5, .7, 0, -.3, 0, 0, PI / 8, 0, 8); cyl(body, m.pri, 2.4, 3.3, .9, 0, 1.5, 0, 0, PI / 8, 0, 8); cyl(body, m.joint, 1.3, 1.5, .5, 0, 2.2, 0, 0, 0, 0, 12);
    cyl(body, m.acc, 3.44, 3.44, .12, 0, 1.06, 0, 0, PI / 8, 0, 8);
    for (const [x, z] of [[2.1, 2.1], [-2.1, 2.1], [-2.1, -2.1], [2.1, -2.1]]) {
      cyl(body, m.joint, 1.05, 1.05, .5, x, 1.25, z, 0, 0, 0, 12); const f = grp(body, x, 1.52, z); for (let i = 0; i < 3; i++) box(f, m.blk, 1.8, .05, .22, 0, 0, 0, 0, i * PI / 3, 0); fans.push(f);
      noShadow(cyl(body, m.glow, .9, .9, .06, x, -.68, z, 0, 0, 0, 12));
    }
    for (const s of [-1, 1]) { tbox(body, m.pri, .5, 1.3, 2.2, 1, .5, s * 2.2, 1.9, -2.9, .2); box(body, m.glow, .5, .16, .1, s * 1.1, .8, 3.56); }
    Object.assign(u, { hip: grp(body, 0, 2.45, 0), legs: [], cadence: 1, footR: 4, tracked: true });
    u.anim = gs => { const d = gs.dt || 0, sag = gs.sag || 0; for (const f of fans) f.rotation.y += d * (14 + Math.abs(gs.eff) * 22) * (1 - sag); body.position.y = 1.6 + Math.sin(gs.t * 2.1) * .14 * (1 - sag) - sag * 1.2; body.rotation.x = gs.eff * .07; body.rotation.z = -(gs.turn || 0) * .06 + sag * .12; };
    return g;
  }
};

PARTS.torso.wsp = {
  name: 'WASP CAB', desc: 'Ultralight strike cab', tons: 6, armor: 32, cool: 5, sinks: 2,
  build: m => {
    const g = torsoBase(m, .7, { head: [0, 1.95, .8], arm: [1.8, 1.35, 0], back: [0, 1.4, -1.5], sr: .45 });
    tbox(g, m.pri, 2.2, 1.3, 2.8, .7, .75, 0, 1.45, .1); tbox(g, m.sec, 1.9, .7, 2.4, .75, .8, 0, .75, .1, PI);
    tbox(g, m.pri, 1.5, .9, 1.2, .45, .4, 0, 1.25, 1.9, PI / 2);
    for (const s of [-1, 1]) { box(g, m.acc, .1, .5, 1.6, s * 1.12, 1.5, .1); box(g, m.glow, .08, .1, 1.1, s * 1.0, 1.95, .3); cyl(g, m.blk, .22, .26, .9, s * .55, 1.5, -1.6, PI / 2); box(g, m.joint, .9, .4, .6, s * 1.25, 1.35, 0); tbox(g, m.sec, 1.6, .12, 1.3, .3, .6, s * 1.5, 2, -.9, 0, 0, s * .5); }
    vents(g, m, 3, 1.2, 0, 1.1, -1.32);
    return g;
  }
};
PARTS.torso.cen = {
  name: 'CENTURION', desc: 'Medium line hull · barrel chest', tons: 18, armor: 95, cool: 8, sinks: 4,
  build: m => {
    const g = torsoBase(m, 1.1, { head: [0, 4.0, .2], arm: [3.2, 2.9, 0], back: [0, 2.3, -1.9] });
    tbox(g, m.sec, 2.4, 1.3, 2.2, 1.3, 1.15, 0, 1.15, 0); cyl(g, m.pri, 2.15, 1.75, 2.3, 0, 2.75, 0, 0, PI / 8, 0, 8);
    tbox(g, m.pri, 2.6, 1.6, .7, .8, .7, 0, 2.7, 1.75, -.1); box(g, m.acc, 2.7, .16, .2, 0, 2.05, 2.05); box(g, m.glow, .5, .4, .1, 0, 2.9, 2.1);
    for (const s of [-1, 1]) { tbox(g, m.pri, 1.9, .9, 2.8, .7, .8, s * 2.5, 3.95, 0, 0, 0, s * -.12); box(g, m.acc, 1.95, .12, 2.85, s * 2.5, 3.52, 0, 0, 0, s * -.12); vents(g, m, 3, .7, s * 1.25, 2.3, 2.02); cyl(g, m.blk, .22, .22, .9, s * 1.2, 4.1, -1.3); }
    cyl(g, m.joint, 1.0, 1.25, .5, 0, 3.75, .1, 0, 0, 0, 10); box(g, m.joint, 3, 1.7, .6, 0, 2.6, -1.75); box(g, M.hazard, 1, .3, .05, 1.1, 3.35, 1.86, -.1);
    return g;
  }
};
PARTS.torso.rhn = {
  name: 'RHINO', desc: 'Heavy ram hull · sloped prow', tons: 24, armor: 130, cool: 9, sinks: 4,
  build: m => {
    const g = torsoBase(m, 1.35, { head: [0, 4.15, 1.2], arm: [3.75, 2.6, -.2], back: [0, 2.7, -2.75], sr: .85 });
    tbox(g, m.sec, 3.2, 1.3, 2.8, 1.25, 1.15, 0, 1.15, 0);
    const w = tbox(g, m.pri, 5.2, 2.4, 5, .8, .7, 0, 2.9, 0); w.rotation.x = .12;
    tbox(g, m.pri, 4.2, 2.2, 2.4, .35, .2, 0, 2.2, 3.3, PI / 2 + .12); box(g, m.acc, 4.3, .2, .3, 0, 1.75, 3.5); tbox(g, m.sec, 3.4, .9, 3, .8, .7, 0, 4.35, -.9);
    for (const s of [-1, 1]) { tbox(g, m.sec, .7, 2.2, 4.4, 1, .7, s * 2.85, 2.8, -.2, 0, 0, s * -.15); box(g, m.glow, .1, .14, 2.4, s * 2.14, 4.06, 1); vents(g, m, 4, 1, s * 1.5, 2.3, -2.72); box(g, M.hazard, .72, .3, 1.6, s * 2.9, 1.9, .8); cyl(g, m.blk, .3, .26, 1.3, s * 1.4, 5, -1.9); }
    box(g, m.joint, 4.2, 2.1, .7, 0, 2.6, -2.4);
    return g;
  }
};
PARTS.torso.orb = {
  name: 'ORBWEAVER', desc: 'Reactor sphere · runs cold', tons: 15, armor: 75, cool: 10, sinks: 5,
  build: m => {
    const g = torsoBase(m, 1, { head: [0, 4.75, .2], arm: [3.0, 2.5, 0], back: [0, 2.5, -2.3], sr: .6 });
    cyl(g, m.sec, 1.2, 1.4, .8, 0, .9, 0, 0, 0, 0, 10); sph(g, m.pri, 2.3, 0, 2.5, 0, 1, .92, 1);
    cyl(g, m.joint, 2.42, 2.42, .34, 0, 2.5, 0, 0, 0, 0, 20); cyl(g, m.acc, 2.46, 2.46, .1, 0, 2.5, 0, 0, 0, 0, 20);
    cyl(g, m.blk, .8, .8, .3, 0, 2.5, 2.2, PI / 2, 0, 0, 14); noShadow(cyl(g, m.glow, .6, .6, .1, 0, 2.5, 2.34, PI / 2, 0, 0, 14));
    for (const s of [-1, 1]) { box(g, m.joint, 1.3, .6, .8, s * 2.4, 2.5, 0); for (let i = 0; i < 3; i++) box(g, m.glow, .08, .5, .1, s * (1.0 + i * .35), 3.55 - i * .22, 1.62 - i * .3, -.6, s * .4, 0); cyl(g, m.blk, .28, .28, 1.1, s * 1.1, 4.4, -.9, -.3); }
    cyl(g, m.sec, .9, 1.1, .5, 0, 4.5, .2); box(g, m.joint, 2, 1.4, .7, 0, 2.5, -2.1); vents(g, m, 4, 1.4, 0, 2, -2.47);
    return g;
  }
};
PARTS.torso.ctd = {
  name: 'CITADEL', desc: 'Superheavy gun tower', tons: 34, armor: 185, cool: 11, sinks: 6,
  build: m => {
    const g = torsoBase(m, 1.65, { head: [0, 6.5, .9], arm: [4.6, 3.6, 0], back: [0, 3.2, -2.9], sr: 1.05 });
    tbox(g, m.sec, 4, 1.5, 3.4, 1.25, 1.1, 0, 1.25, 0); box(g, m.pri, 6.6, 3.2, 4.4, 0, 3.6, 0); tbox(g, m.pri, 5.2, 1.3, 3.8, .8, .8, 0, 5.85, 0);
    tbox(g, m.sec, 5, 2.6, .8, .9, .6, 0, 3.4, 2.4, -.08); for (let i = 0; i < 4; i++) box(g, m.blk, 3.8, .16, .2, 0, 2.6 + i * .55, 2.86 - i * .04, -.08);
    box(g, m.acc, 6.7, .22, 4.5, 0, 2.2, 0); box(g, m.acc, 6.7, .22, 4.5, 0, 5.0, 0);
    for (const s of [-1, 1]) { tbox(g, m.pri, 2.6, 1.3, 4.2, .75, .8, s * 3.2, 5.9, 0); box(g, M.hazard, 2.62, .3, 4.22, s * 3.2, 5.35, 0); noShadow(cyl(g, m.glow, .35, .35, .1, s * 2.7, 4.3, 2.26, PI / 2)); cyl(g, m.blk, .4, .34, 1.8, s * 2.2, 6.9, -1.6); box(g, m.sec, .5, 3, 3.6, s * 3.5, 3.6, 0); }
    box(g, m.joint, 5, 2.8, .8, 0, 3.6, -2.5); cyl(g, M.chrome, .05, .05, 3.6, -2.6, 8, -1.4);
    return g;
  }
};

PARTS.head.mon = {
  name: 'CYCLOPS', desc: 'Single great optic', tons: 2.5, armor: 20, sensor: 70,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .6, .75, .4, 0, .2, 0);
    cyl(g, m.pri, .95, 1.05, 1.5, 0, 1.1, 0, 0, 0, 0, 10); tbox(g, m.sec, 2, .5, 2, .8, .8, 0, 1.95, 0);
    cyl(g, m.blk, .62, .62, .3, 0, 1.1, .9, Z, 0, 0, 14); noShadow(cyl(g, m.glow, .46, .46, .1, 0, 1.1, 1.04, Z, 0, 0, 14)); cyl(g, m.blk, .2, .2, .12, 0, 1.1, 1.08, Z);
    for (const s of [-1, 1]) box(g, m.acc, .16, 1.1, .9, s * 1.02, 1.05, -.1); cyl(g, M.chrome, .03, .03, 1.6, -.7, 2.9, -.5);
    return g;
  }
};
PARTS.head.kab = {
  name: 'KABUTO', desc: 'Horned war helm', tons: 3.5, armor: 30, sensor: 50,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .65, .8, .4, 0, .2, 0);
    tbox(g, m.pri, 1.9, 1.3, 2.1, .7, .75, 0, 1.05, 0); tbox(g, m.sec, 2.3, .4, 2.5, .8, .8, 0, .55, -.1, PI);
    box(g, m.blk, 1.5, .3, .12, 0, 1.0, .98); noShadow(box(g, m.glow, 1.2, .12, .1, 0, 1.0, 1.02));
    for (const s of [-1, 1]) { tbox(g, m.acc, .22, 1.9, .5, .2, .4, s * 1, 2.35, .45, -.25, 0, s * -.5); tbox(g, m.sec, .5, .9, 1.8, .7, .7, s * 1.15, .7, -.2, 0, 0, s * -.35); }
    tbox(g, m.acc, .5, .7, .3, .3, .5, 0, 1.95, .95, -.2); tbox(g, m.sec, .5, .4, 1.9, .6, .7, 0, 1.85, -.2);
    return g;
  }
};
PARTS.head.bnk = {
  name: 'PILLBOX', desc: 'Armoured bunker cockpit', tons: 5, armor: 46, sensor: 35,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .9, 1.05, .35, 0, .18, 0, 0, 0, 0, 10);
    tbox(g, m.pri, 2.6, 1.3, 2.6, .78, .78, 0, 1, 0); box(g, m.sec, 2.7, .3, 2.7, 0, .5, 0); box(g, m.blk, 2, .22, .14, 0, 1.15, 1.2, -.14); noShadow(box(g, m.glow, 1.7, .08, .1, 0, 1.15, 1.25, -.14));
    for (const s of [-1, 1]) { box(g, m.blk, .14, .22, 1.2, s * 1.2, 1.15, .3, 0, 0, s * .14); for (let i = 0; i < 2; i++) cyl(g, m.joint, .14, .14, .12, s * .8, 1.7, -.5 + i, 0, 0, 0, 6); }
    cyl(g, m.sec, .5, .6, .3, 0, 1.8, -.2, 0, 0, 0, 8); cyl(g, m.blk, .1, .1, .5, 0, 2.1, -.2);
    return g;
  }
};
PARTS.head.fly = {
  name: 'DRAGONFLY', desc: 'Twin-bubble scout optics', tons: 1.5, armor: 8, sensor: 90,
  build: m => {
    const g = new THREE.Group(); cyl(g, m.joint, .45, .55, .4, 0, .2, 0); tbox(g, m.sec, 1.3, .6, 1.5, .8, .8, 0, .7, -.1);
    for (const s of [-1, 1]) { sph(g, m.glass, .62, s * .55, .95, .5, 1, .9, 1.15); cyl(g, m.joint, .64, .64, .08, s * .55, .95, .2, Z, 0, 0, 12); cyl(g, M.chrome, .025, .025, 1.6, s * .5, 1.9, -.6, -.5, 0, s * -.3); }
    noShadow(box(g, m.glow, .12, .12, .5, 0, 1.05, .9)); tbox(g, m.pri, .9, .4, 1.2, .6, .6, 0, 1.2, -.5);
    return g;
  }
};

PARTS.back.lrk = {
  name: 'ARBALEST LRM-20', desc: 'F: twenty long-range missiles, lofted', tons: 9, armor: 10, fx: 'rack',
  weapon: { type: 'missile', name: 'ARBALEST LRM-20', dmg: 6, cd: 6.5, heat: 24, speed: 85, salvo: 20, spread: .1, turn: 4, life: 8, loft: .5, reach: 600, snd: 'missile' },
  build: m => {
    const g = new THREE.Group(), mz = []; box(g, m.joint, 3.4, .7, .8, 0, .2, -.4);
    const b = grp(g, 0, 1.6, -.5, -.5); tbox(b, m.pri, 3.6, 1.7, 2.6, .95, .95, 0, 0, 0); box(b, m.blk, 3.3, 1.4, .1, 0, 0, 1.3); box(b, M.hazard, 3.62, .2, 2.62, 0, -.7, 0);
    for (let i = 0; i < 10; i++) cyl(b, M.redGlow, .16, .16, .06, -1.3 + (i % 5) * .65, (i > 4 ? .32 : -.32), 1.36, PI / 2);
    for (const s of [-1, 1]) mz.push(grp(b, s * .8, 0, 1.5)); g.userData.muzzles = mz; return g;
  }
};
PARTS.back.art = {
  name: 'LONG TOM', desc: 'F: one siege shell, high arc', tons: 12, armor: 12, fx: 'gun',
  weapon: { type: 'lob', name: 'LONG TOM', dmg: 120, cd: 7, heat: 20, speed: 78, blast: 17, reach: 520, big: 1.7, snd: 'mortar' },
  build: m => {
    const g = new THREE.Group(); box(g, m.joint, 2.6, 1.6, .9, 0, .2, -.5); const b = grp(g, 1.1, 1.6, -.6, -.55);
    box(b, m.sec, 1.3, 1.3, 3, 0, 0, 0); cyl(b, m.blk, .34, .4, 6.4, 0, 0, 4, PI / 2, 0, 0, 10); cyl(b, m.joint, .52, .52, 1, 0, 0, 6.9, PI / 2, 0, 0, 10); cyl(b, m.pri, .6, .6, 1.6, 0, 0, 1.6, PI / 2, 0, 0, 10);
    box(g, m.pri, 1.5, 1.2, 1.2, -1, .5, -.9); box(g, M.hazard, 1.52, .2, 1.22, -1, 1, -.9);
    g.userData.muzzles = [grp(b, 0, 0, 7.5)]; return g;
  }
};
PARTS.back.shd = {
  name: 'AEGIS PROJECTOR', desc: 'A shield that soaks hits and recharges', tons: 7, armor: 10, fx: 'shield',
  build: m => {
    const g = new THREE.Group(); box(g, m.sec, 2.8, 1.6, .8, 0, .2, -.4); cyl(g, m.joint, .5, .6, .8, 0, 1.3, -.5, 0, 0, 0, 10);
    const r = grp(g, 0, 2.1, -.5, -.5); cyl(r, m.pri, 1.5, 1.5, .16, 0, 0, 0, 0, 0, 0, 20); noShadow(cyl(r, m.glow, 1.3, 1.3, .2, 0, 0, 0, 0, 0, 0, 20)); cyl(r, m.blk, 1.1, 1.1, .24, 0, 0, 0, 0, 0, 0, 20); box(r, m.acc, 3.2, .1, .2); r.userData.tick = dt => r.rotation.y += dt * 1.2;
    for (const s of [-1, 1]) { tbox(g, m.pri, .5, 1.9, .7, .4, .5, s * 1.5, 1.1, -.5, 0, 0, s * -.4); box(g, m.glow, .1, .8, .1, s * 1.1, .2, -.82); }
    return g;
  }
};
PARTS.back.ecm = {
  name: 'GHOST ECM', desc: 'Breaks missile locks · spoils their aim', tons: 3, armor: 4, fx: 'ecm',
  build: m => {
    const g = new THREE.Group(); box(g, m.sec, 2.2, 1.3, .8, 0, .1, -.4); box(g, m.blk, 1.6, .9, .3, 0, .1, -.86);
    for (const [x, h, a] of [[-.8, 3.2, -.2], [-.25, 4.1, -.08], [.35, 3.6, .1], [.85, 2.6, .25]]) cyl(g, M.chrome, .035, .035, h, x + a * h * .5, .7 + h / 2, -.5, 0, 0, -a);
    const l = noShadow(sph(g, m.glow, .18, -.41, 4.9, -.5)); l.userData.tick = (dt, t) => l.scale.setScalar(Math.sin(t * 5) > .5 ? 1.5 : .6);
    for (let i = 0; i < 3; i++) box(g, m.glow, .3, .08, .06, -.4 + i * .4, .3, -1.02);
    return g;
  }
};
PARTS.back.bst = {
  name: 'OVERDRIVE TURBINE', desc: 'Speed +12% · a sprint runs a third cooler', tons: 5, armor: 6, fx: 'boost',
  build: m => {
    const g = new THREE.Group(); box(g, m.joint, 2.8, 1.4, .6, 0, .2, -.3);
    for (const s of [-1, 1]) {
      cyl(g, m.pri, .75, .85, 2, s * .9, .3, -1.2, Z, 0, 0, 12); cyl(g, m.blk, .66, .5, .5, s * .9, .3, -2.3, Z, 0, 0, 12); noShadow(cyl(g, m.glow, .4, .4, .06, s * .9, .3, -2.52, Z, 0, 0, 12)); cyl(g, m.acc, .87, .87, .12, s * .9, .3, -.6, Z, 0, 0, 12);
      const f = grp(g, s * .9, .3, -.18); for (let i = 0; i < 4; i++) box(f, m.blk, 1.3, .16, .05, 0, 0, 0, 0, 0, i * PI / 4); f.userData.tick = dt => f.rotation.z += dt * 9;
    }
    box(g, m.sec, .5, .5, 1.6, 0, .9, -1.1); return g;
  }
};

/* ---- weapon families. L is the mark, 1 to 3: the same gun with more barrel, more rounds or more reactor behind it ---- */
const armLp = L => (m, s) => {
  const k = .76 + L * .09, g = armBase(m, s, k), u = g.userData, p = u.pitch, len = 1.6 + L * .7;
  box(p, m.sec, .95 * k, 1.15 * k, 2.3, 0, -.5, .2); box(p, m.pri, .16, .8 * k, 1.7, s * .56 * k, -.5, .3);
  cyl(p, m.joint, .2 + L * .03, .27 + L * .03, len, 0, -.5, 1.3 + len / 2, Z); cyl(p, m.glow, .16 + L * .03, .16 + L * .03, .1, 0, -.5, 1.36 + len, Z);
  for (let i = 0; i <= L; i++) cyl(p, m.glow, .33 + L * .03, .33 + L * .03, .08, 0, -.5, 1.55 + i * .42, Z);
  for (let i = 0; i < L; i++) cyl(p, m.blk, .15, .15, 1.5, (i - (L - 1) / 2) * .34, -1.2 * k, .2, Z);
  for (let i = 0; i < 3; i++) box(p, m.blk, 1.05 * k, .06, 1.1, 0, -.5 + i * .2, -.55);
  u.muzzle = grp(p, 0, -.5, 1.45 + len); return g;
};
const armBm = L => (m, s) => {
  const k = .85 + L * .1, g = armBase(m, s, k), u = g.userData, p = u.pitch, r = .5 + L * .12;
  cyl(p, m.sec, r * 1.25, r * 1.4, 2.2, 0, -.6, .1, Z, 0, 0, 12); cyl(p, m.pri, r * 1.5, r * 1.5, .7, 0, -.6, -.7, Z, 0, 0, 12);
  cyl(p, m.joint, r * 1.5, r * .9, 1.1, 0, -.6, 1.75, Z, 0, 0, 12); noShadow(cyl(p, m.glow, r * .8, r * .8, .08, 0, -.6, 2.32, Z, 0, 0, 12));
  for (let i = 0; i < 3; i++) { const a = i * TAU / 3 + PI / 6; box(p, m.blk, .14, .14, 1.9 + L * .3, Math.cos(a) * r * 1.2, -.6 + Math.sin(a) * r * 1.2, 2.5); }
  const core = noShadow(sph(p, m.glow, r * .42, 0, -.6, 3.3 + L * .15)); core.userData.tick = (dt, t) => core.scale.setScalar(.8 + Math.min(1, u.fireT * 4) * .7 + Math.sin(t * 14) * .06);
  for (let i = 0; i < L; i++) cyl(p, M.chrome, .07, .07, 1.8, s * (r * 1.3 + .1), -.25 - i * .3, -.2, Z);
  u.muzzle = grp(p, 0, -.6, 3.45 + L * .15); return g;
};
const armMg = L => (m, s) => {
  const g = armBase(m, s, .72), u = g.userData, p = u.pitch;
  box(p, m.sec, .8, .9, 2, 0, -.45, .1); cyl(p, m.pri, .5, .5, .5, -s * .1, -1.05, -.1, 0, 0, Z, 10);
  for (let i = 0; i < L; i++) { const x = L > 1 ? (i - .5) * .44 : 0; cyl(p, m.blk, .08, .08, 2.6, x, -.45, 2.3, Z, 0, 0, 8); cyl(p, m.joint, .14, .14, 1.1, x, -.45, 1.6, Z, 0, 0, 8); cyl(p, m.joint, .12, .12, .2, x, -.45, 3.5, Z, 0, 0, 8); }
  box(p, m.acc, .82, .1, .5, 0, -.45, .8);
  u.muzzle = grp(p, 0, -.45, 3.65); return g;
};
const armAc = L => (m, s) => {
  const k = .88 + L * .1, g = armBase(m, s, k), u = g.userData, p = u.pitch, r = .2 + L * .09, len = 3.2 + L * .5;
  box(p, m.sec, 1.25 * k, 1.5 * k, 2.8, 0, -.65, -.1); box(p, m.blk, .5, .7 * k, 1.5, -s * .78 * k, -.9, -.2);
  cyl(p, m.joint, r * 1.7, r * 1.9, 1.3, 0, -.65, 1.9, Z, 0, 0, 10); cyl(p, m.blk, r, r * 1.1, len, 0, -.65, 1.4 + len / 2, Z, 0, 0, 10);
  box(p, m.joint, r * 3.4, r * 2.2, .6, 0, -.65, 1.3 + len); for (const sx of [-1, 1]) box(p, m.blk, .08, r * 1.4, .34, sx * r * 1.74, -.65, 1.3 + len);
  box(p, m.acc, 1.27 * k, .13, .6, 0, -.65, .9); if (L > 1) cyl(p, M.chrome, .09, .09, 1.6, s * .3, -.65 + r * 2.2, 2.2, Z);
  u.muzzle = grp(p, 0, -.65, 1.7 + len); return g;
};
const armSg = L => (m, s) => {
  const g = armBase(m, s, .9), u = g.userData, p = u.pitch, n = L + 1;
  box(p, m.sec, 1.2, 1.3, 2.4, 0, -.6, 0); tbox(p, m.pri, 1.3, .9, 1.2, .8, .7, 0, -.6, -1.3, -Z);
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * .5; cyl(p, m.blk, .24, .26, 2.2, x, -.6, 2.2, Z, 0, 0, 10); cyl(p, m.joint, .29, .29, .22, x, -.6, 3.25, Z, 0, 0, 10); }
  box(p, m.joint, n * .5 + .3, .25, .5, 0, -.6, 2.4); box(p, m.acc, 1.22, .12, .5, 0, -.6, .7); cyl(p, m.blk, .2, .2, 1.6, 0, -1.25, 1.3, Z);
  u.muzzle = grp(p, 0, -.6, 3.4); return g;
};
const armSr = L => (m, s) => {
  const g = armBase(m, s, .85), u = g.userData, p = u.pitch, h = .5 + L * .55;
  tbox(p, m.pri, 1.5, h, 2.2, .95, .95, 0, -.3 - h / 2, .5); box(p, m.blk, 1.34, h - .16, .1, 0, -.3 - h / 2, 1.61); box(p, m.sec, 1, .8, .8, 0, -.7, -.9); box(p, M.hazard, 1.52, .16, 2.22, 0, -.3 - h + .1, .5);
  for (let i = 0; i < L * 2; i++) { const x = (i % 2 - .5) * .62, y = -.58 - Math.floor(i / 2) * .55; cyl(p, m.joint, .2, .2, .12, x, y, 1.66, Z, 0, 0, 8); cyl(p, M.redGlow, .12, .12, .06, x, y, 1.72, Z, 0, 0, 8); }
  u.muzzle = grp(p, 0, -.3 - h / 2, 1.9); return g;
};
const armLr = L => (m, s) => {
  const g = armBase(m, s, .95), u = g.userData, p = u.pitch, w = L * .46 + .5, b = grp(p, 0, -.7, .2, -.32);
  box(p, m.sec, 1.1, 1, 1.4, 0, -.7, -.9);
  tbox(b, m.pri, w, 2.5, 2.6, .96, .96, 0, 0, .4); box(b, m.blk, w - .14, 2.3, .1, 0, 0, 1.71); box(b, M.hazard, w + .02, .18, 2.62, 0, -1.15, .4); box(b, m.acc, w + .02, .1, 2.62, 0, 1.2, .4);
  for (let i = 0; i < L * 5; i++) cyl(b, M.redGlow, .13, .13, .06, (i % L - (L - 1) / 2) * .46, (Math.floor(i / L) - 2) * .46, 1.77, Z, 0, 0, 6);
  u.muzzle = grp(b, 0, 0, 2); return g;
};
const armRk = L => (m, s) => {
  const g = armBase(m, s, .85), u = g.userData, p = u.pitch, r = .62 + L * .16, y = -.3 - r;
  cyl(p, m.pri, r, r, 2.6, 0, y, .5, Z, 0, 0, 12); cyl(p, m.blk, r * .92, r * .92, .08, 0, y, 1.82, Z, 0, 0, 12); cyl(p, m.sec, r * .7, r, .7, 0, y, -1.1, Z, 0, 0, 12); cyl(p, m.acc, r * 1.02, r * 1.02, .14, 0, y, 1.2, Z, 0, 0, 12);
  for (let i = 0; i < L * 6; i++) { const ring = i < 6 ? .45 : .82, a = i * TAU / 6 + (i < 6 ? 0 : PI / 6); cyl(p, M.redGlow, .1, .1, .06, Math.cos(a) * r * ring, y + Math.sin(a) * r * ring, 1.86, Z, 0, 0, 6); }
  u.muzzle = grp(p, 0, y, 2); return g;
};
const armPr = L => (m, s) => {
  const k = .7 + L * .1, g = armBase(m, s, k + .1), u = g.userData, p = u.pitch;
  cyl(p, m.sec, .62 * k, .7 * k, 2.4, 0, -.55, .2, Z, 0, 0, 10); box(p, m.pri, 1.3 * k, .5, 1.6, 0, -.05, -.3); cyl(p, m.joint, .42 * k, .55 * k, 1.5, 0, -.55, 2.1, Z, 0, 0, 10);
  for (let i = 0; i < L + 1; i++) cyl(p, m.glow, .6 * k, .6 * k, .1, 0, -.55, .5 + i * .45, Z, 0, 0, 10);
  for (const sy of [-1, 1]) box(p, m.pri, .2, .3, 1.2 + L * .2, 0, -.55 + sy * .5 * k, 3 + L * .1);
  const orb = noShadow(sph(p, m.glow, .24 * k + .04, 0, -.55, 3 + L * .1)); orb.userData.tick = (dt, t) => orb.scale.setScalar(1 - Math.min(1, u.fireT * 2) * .6 + Math.sin(t * 11) * .08);
  cyl(p, m.blk, .13, .13, 1.6, s * .6 * k, -.9, -.2, Z);
  u.muzzle = grp(p, 0, -.55, 3.4 + L * .2); return g;
};
const armGs = L => (m, s) => {
  const k = .85 + L * .1, g = armBase(m, s, k), u = g.userData, p = u.pitch, len = 3.6 + L * .9;
  box(p, m.sec, 1.3 * k, 1.5 * k, 2.6, 0, -.6, -.3); tbox(p, m.pri, 1.4 * k, .5, 2.2, .7, .7, 0, -.6 - .95 * k, -.3, PI);
  cyl(p, m.joint, .2 + L * .04, .2 + L * .04, len, 0, -.6, 1 + len / 2, Z, 0, 0, 10);
  for (let i = 0; i < 3 + L; i++) { const z = 1.5 + i * (len - .8) / (2 + L); cyl(p, m.pri, .46 + L * .06, .46 + L * .06, .34, 0, -.6, z, Z, 0, 0, 12); cyl(p, m.glow, .48 + L * .06, .48 + L * .06, .07, 0, -.6, z, Z, 0, 0, 12); }
  cyl(p, m.acc, .34 + L * .05, .3 + L * .05, .4, 0, -.6, 1 + len, Z, 0, 0, 10); sph(p, m.blk, .55 * k, s * .5 * k, -.3, -1.3); cyl(p, m.blk, .16, .16, 1.8, -s * .6 * k, -1, -.2, Z);
  u.muzzle = grp(p, 0, -.6, 1.3 + len); return g;
};
const armFl = L => (m, s) => {
  const k = .78 + L * .1, g = armBase(m, s, k), u = g.userData, p = u.pitch, nb = Math.min(L + 1, 3);
  box(p, m.sec, 1 * k, 1.1 * k, 2, 0, -.55, 0);
  for (let i = 0; i < nb; i++) { const x = (i - (nb - 1) / 2) * .62 * k; cyl(p, M.yellow, .28 * k, .28 * k, 1.8, x, -1.35 * k, -.1, Z, 0, 0, 10); sph(p, M.yellow, .28 * k, x, -1.35 * k, .8); }
  cyl(p, m.joint, .2, .24, 1.8 + L * .3, 0, -.55, 1.9, Z, 0, 0, 8); cyl(p, m.blk, .42 + L * .05, .26, .9, 0, -.55, 3 + L * .3, Z, 0, 0, 10);
  const pl = noShadow(cyl(p, M.amber, .1, .02, .5, 0, -.3, 3.3 + L * .3, Z)); pl.userData.tick = () => pl.scale.set(1 + rand(-.2, .2), .8 + rand(.4), 1);
  cyl(p, M.chrome, .05, .05, 2.2, s * .3, -.95, 1.2, Z); box(p, M.hazard, 1.02 * k, .16, .8, 0, -.55, -.3);
  u.muzzle = grp(p, 0, -.55, 3.5 + L * .3); return g;
};
/* an arm with an elbow, for the things that hit. u.swing runs from 1 to 0 through a blow: back, through, and home again. A saw (u.grind) just reaches out while it is running */
function armMelee(m, s, k, rest = .3) {
  const g = armBase(m, s, k), u = g.userData, p = u.pitch; limb(p, m, 2.3 * k, .95 * k, { stripe: 1 });
  const el = grp(p, 0, -2.3 * k, 0); cyl(el, m.joint, .6 * k, .6 * k, 1.3 * k, 0, 0, 0, 0, 0, Z);
  const fa = grp(el, 0, 0, 0, -Z + rest); limb(fa, m, 2.4 * k, .9 * k, { tx: 1.1, mat: m.sec }); const wr = grp(fa, 0, -2.5 * k, 0); cyl(wr, m.joint, .55 * k, .45 * k, .5, 0, .1, 0);
  u.swing = 0; u.ext = 0; u.melee = true;
  el.userData.tick = dt => {
    let a = 0;
    if (u.grind) a = (u.ext = damp(u.ext, u.fireT > 0 ? 1 : 0, 8, dt)) * .7;
    else if (u.swing > 0) { u.swing = Math.max(0, u.swing - dt * (u.swingK || 2.2)); const q = 1 - u.swing; a = q < .22 ? -q / .22 * .9 : q < .45 ? -.9 + (q - .22) / .23 * 1.7 : .8 * (1 - (q - .45) / .55); }
    fa.rotation.x = -Z + rest + a * .8; p.rotation.x -= a * .55;
  };
  return { g, u, p, fa, wr };
}
const armFs = L => (m, s) => {
  const k = .9 + L * .14, { g, u, wr } = armMelee(m, s, k);
  tbox(wr, m.pri, 1.5 * k, 1.5 * k, 1.5 * k, .85, .85, 0, -.9 * k, 0, PI); box(wr, m.acc, 1.54 * k, .16, 1.54 * k, 0, -.5 * k, 0);
  for (let i = 0; i < 4; i++) box(wr, m.joint, .3 * k, .5 * k, .34 * k, (i - 1.5) * .37 * k, -1.75 * k, .2 * k);
  box(wr, M.hazard, 1.52 * k, .3, 1.52 * k, 0, -1.3 * k, 0); cyl(wr, M.chrome, .09, .09, 1.6 * k, s * .5 * k, .6, -.5 * k);
  u.muzzle = grp(wr, 0, -1.9 * k, 0); u.swingK = 2.4; return g;
};
const armSw = L => (m, s) => {
  const k = .88 + L * .14, { g, u, wr } = armMelee(m, s, k, .15), r = 1.2 + L * .35;
  box(wr, m.sec, .9 * k, 1.6 * k, 1 * k, 0, -.7 * k, 0); box(wr, m.joint, .3, r + .4, .5, s * .3, -1.4 * k - r * .5, 0);
  const d = grp(wr, 0, -1.5 * k - r * .6, 0); cyl(d, M.steel, r, r, .12, 0, 0, 0, 0, 0, Z, 20); cyl(d, m.blk, r * .35, r * .35, .3, 0, 0, 0, 0, 0, Z, 10);
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; box(d, M.chrome, .1, .34, .2, 0, Math.cos(a) * r, Math.sin(a) * r, a); }
  d.userData.tick = dt => { u.spin = damp(u.spin, u.fireT > 0 ? 34 : 3, 5, dt); d.rotation.x += u.spin * dt; };
  tbox(wr, m.pri, .5 * k, r * 1.1, r * 1.3, .9, .5, -s * .5, -1.3 * k - r * .3, -r * .35);
  u.muzzle = grp(wr, 0, -1.5 * k - r * 1.3, 0); u.grind = true; return g;
};
const armTb = L => (m, s) => {
  const k = .86 + L * .12, { g, u, wr } = armMelee(m, s, k, .2), len = 4.2 + L * 1.2, edge = glowMat(0xff6a1a, 2.2);
  box(wr, m.sec, .8 * k, 1.2 * k, .9 * k, 0, -.5 * k, 0); box(wr, m.acc, 1.5 * k, .22, .5, 0, -1.15 * k, 0);
  tbox(wr, M.steel, .16, len, .9 * k, 1, .12, 0, -1.2 * k - len / 2, 0, PI); noShadow(box(wr, edge, .06, len * .94, .12, 0, -1.2 * k - len / 2, .42 * k));
  cyl(wr, M.chrome, .07, .07, 1.4, -s * .3, .2, -.4 * k);
  wr.userData.tick = dt => { edge.emissiveIntensity = damp(edge.emissiveIntensity, u.swing > 0 ? 7 : 2.2, 6, dt); };
  u.muzzle = grp(wr, 0, -1.2 * k - len * .7, 0); u.swingK = 2; return g;
};
const armMaul = (m, s) => {
  const { g, u, wr } = armMelee(m, s, 1.15, .1);
  box(wr, m.sec, .9, 1.3, .9, 0, -.5, 0); cyl(wr, m.joint, .22, .22, 3.6, 0, -2.2, 0, 0, 0, 0, 8);
  const hd = grp(wr, 0, -4.2, 0); tbox(hd, m.pri, 2, 1.7, 3.2, .85, .9, 0, 0, 0); box(hd, M.hazard, 2.02, .3, 3.22, 0, -.5, 0);
  for (const z of [-1, 1]) { box(hd, m.joint, 1.7, 1.4, .4, 0, 0, z * 1.7); for (let i = 0; i < 4; i++) tbox(hd, M.steel, .3, .5, .3, .2, .2, (i % 2 - .5) * .8, (i > 1 ? .35 : -.35), z * 2.1, z * Z); }
  u.muzzle = grp(hd, 0, 0, 0); u.swingK = 1.5; return g;
};
const armMt = L => (m, s) => {
  const k = .9 + L * .12, g = armBase(m, s, k), u = g.userData, p = u.pitch, r = .42 + L * .12;
  box(p, m.sec, 1.3 * k, 1.2 * k, 2.2, 0, -.6, -.1); cyl(p, m.joint, .9 * k, .9 * k, 1.3 * k, 0, -.6, .9, 0, 0, Z, 10);
  const t = grp(p, 0, -.6, .9, -.6); cyl(t, m.blk, r, r * 1.15, 2.6 + L * .4, 0, 0, 1.4, Z, 0, 0, 12); cyl(t, m.pri, r * 1.3, r * 1.3, .5, 0, 0, .6, Z, 0, 0, 12); cyl(t, m.acc, r * 1.18, r * 1.18, .16, 0, 0, 2.6 + L * .4, Z, 0, 0, 12);
  for (let i = 0; i < L + 1; i++) cyl(p, M.yellow, .22, .22, .8, -s * .75 * k, -.3 - i * .5, -.3, Z, 0, 0, 8);
  u.muzzle = grp(t, 0, 0, 2.9 + L * .4); return g;
};
const armAr = L => (m, s) => {
  const k = .85 + L * .12, g = armBase(m, s, k), u = g.userData, p = u.pitch, n = L + 1;
  cyl(p, m.sec, .7 * k, .8 * k, 2, 0, -.6, 0, Z, 0, 0, 10); for (let i = 0; i < 4; i++) cyl(p, M.chrome, .82 * k, .82 * k, .1, 0, -.6, -.6 + i * .4, Z, 0, 0, 14);
  for (let i = 0; i < n; i++) { const a = i * TAU / n + PI / 2, x = Math.cos(a) * .5 * k, y = Math.sin(a) * .5 * k; box(p, m.joint, .16, .16, 2.4, x, -.6 + y, 2.1); box(p, m.pri, .22, .22, .5, x * .7, -.6 + y * .7, 3.4); }
  const orb = noShadow(sph(p, m.glow, .26 * k, 0, -.6, 3.3)); orb.userData.tick = () => orb.scale.setScalar(.7 + Math.random() * .5 + Math.min(1, u.fireT * 3));
  sph(p, m.blk, .6 * k, 0, -.6, -1.3);
  u.muzzle = grp(p, 0, -.6, 3.5); return g;
};
const armIo = L => (m, s) => {
  const k = .9 + L * .12, g = armBase(m, s, k), u = g.userData, p = u.pitch, len = 4 + L * .8;
  sph(p, m.sec, .95 * k, 0, -.6, -.5); cyl(p, m.acc, .97 * k, .97 * k, .14, 0, -.6, -.5, Z, 0, 0, 16); box(p, m.pri, 1.2 * k, .5, 1.4, 0, .1, -.4);
  cyl(p, m.joint, .26, .3, len, 0, -.6, .2 + len / 2, Z, 0, 0, 10);
  for (let i = 0; i < 3 + L; i++) { const z = 1 + i * (len - 1.2) / (2 + L), r = .62 - i * .06; cyl(p, m.blk, r, r, .1, 0, -.6, z, Z, 0, 0, 12); cyl(p, m.glow, r * .8, r * .8, .12, 0, -.6, z, Z, 0, 0, 12); }
  for (const sy of [-1, 1]) box(p, m.pri, .12, .2, len * .7, 0, -.6 + sy * .5, .6 + len * .4);
  u.muzzle = grp(p, 0, -.6, .4 + len); return g;
};
/* [id, mark, family, name, what it says in the stores, tons, armor, value in thousands, rarity, weapon, model] */
const ARM_FAM = [
  ['lp1', 1, 'lp', 'PULSE LASER I', 'Hitscan · quick pulses', 3, 12, 18, 0, { type: 'laser', dmg: 7, cd: .3, heat: 2.6, range: 200, bw: .12, bl: .1 }, armLp(1)],
  ['lp2', 2, 'lp', 'PULSE LASER II', 'Hitscan · quick pulses', 5, 16, 32, 0, { type: 'laser', dmg: 10, cd: .3, heat: 3.8, range: 230, bw: .16, bl: .1 }, armLp(2)],
  ['lp3', 3, 'lp', 'PULSE LASER III', 'Hitscan · quick pulses', 7, 20, 54, 1, { type: 'laser', dmg: 14, cd: .3, heat: 5.4, range: 260, bw: .2, bl: .1 }, armLp(3)],
  ['bm1', 1, 'bm', 'BEAMER I', 'A beam for as long as you hold it', 4, 14, 24, 0, { type: 'beam', dmg: 2.4, cd: .1, heat: 1, range: 170, bw: .2 }, armBm(1)],
  ['bm2', 2, 'bm', 'BEAMER II', 'A beam for as long as you hold it', 7, 18, 44, 1, { type: 'beam', dmg: 3.8, cd: .1, heat: 1.6, range: 200, bw: .28 }, armBm(2)],
  ['bm3', 3, 'bm', 'BEAMER III', 'A beam for as long as you hold it', 10, 22, 70, 2, { type: 'beam', dmg: 5.6, cd: .1, heat: 2.5, range: 230, bw: .38 }, armBm(3)],
  ['mg1', 1, 'mg', 'MACHINE GUN I', 'Close-in hose · barely warm', 2, 10, 12, 0, { type: 'bullet', dmg: 1.8, cd: .07, heat: .12, speed: 190, spread: .03, life: .8, small: 1, snd: 'mg', reach: 150 }, armMg(1)],
  ['mg2', 2, 'mg', 'MACHINE GUN II', 'Twin hose · barely warm', 4, 14, 22, 0, { type: 'bullet', dmg: 1.8, cd: .045, heat: .12, speed: 190, spread: .032, life: .8, small: 1, snd: 'mg', reach: 150 }, armMg(2)],
  ['ac1', 1, 'ac', 'AUTOCANNON I', 'Light shell · long reach', 6, 18, 26, 0, { type: 'bullet', dmg: 12, cd: .5, heat: 1.6, speed: 240, spread: .008, big: 1.2, snd: 'cannon', reach: 600 }, armAc(1)],
  ['ac2', 2, 'ac', 'AUTOCANNON II', 'Explosive shell', 9, 22, 44, 1, { type: 'bullet', dmg: 26, cd: .9, heat: 4, speed: 210, spread: .008, big: 1.6, blast: 3.5, snd: 'ac', reach: 600 }, armAc(2)],
  ['ac3', 3, 'ac', 'AUTOCANNON III', 'Heavy explosive shell', 13, 28, 68, 2, { type: 'bullet', dmg: 56, cd: 1.8, heat: 9, speed: 180, spread: .006, big: 2.2, blast: 6, snd: 'ac', reach: 540 }, armAc(3)],
  ['sg1', 1, 'sg', 'SHOTGUN I', 'Six pellets · point blank', 4, 16, 16, 0, { type: 'flak', dmg: 4.5, cd: 1, heat: 4, speed: 170, salvo: 6, spread: .07, life: .7, reach: 120 }, armSg(1)],
  ['sg2', 2, 'sg', 'SHOTGUN II', 'Nine pellets · point blank', 6, 20, 28, 0, { type: 'flak', dmg: 4.5, cd: 1.1, heat: 6, speed: 170, salvo: 9, spread: .08, life: .7, reach: 120 }, armSg(2)],
  ['sg3', 3, 'sg', 'SHOTGUN III', 'Twelve heavy pellets', 9, 26, 46, 1, { type: 'flak', dmg: 5.5, cd: 1.3, heat: 9, speed: 170, salvo: 12, spread: .09, life: .7, reach: 120 }, armSg(3)],
  ['sr1', 1, 'sr', 'SRM-2', 'Short-range missiles · fast, hit hard', 3, 12, 18, 0, { type: 'missile', dmg: 15, cd: 1.8, heat: 4, speed: 115, salvo: 2, spread: .04, turn: 1.4, life: 2.2, blast: 5, reach: 250 }, armSr(1)],
  ['sr2', 2, 'sr', 'SRM-4', 'Short-range missiles · fast, hit hard', 5, 16, 32, 0, { type: 'missile', dmg: 15, cd: 2.1, heat: 8, speed: 115, salvo: 4, spread: .05, turn: 1.4, life: 2.2, blast: 5, reach: 250 }, armSr(2)],
  ['sr3', 3, 'sr', 'SRM-6', 'Short-range missiles · fast, hit hard', 8, 20, 50, 1, { type: 'missile', dmg: 15, cd: 2.4, heat: 12, speed: 115, salvo: 6, spread: .06, turn: 1.4, life: 2.2, blast: 5, reach: 250 }, armSr(3)],
  ['lr1', 1, 'lr', 'LRM-5', 'Long-range missiles · lofted, they find their own way', 5, 12, 26, 0, { type: 'missile', dmg: 6, cd: 3, heat: 6, speed: 85, salvo: 5, spread: .08, turn: 4, life: 8, loft: .45, reach: 600 }, armLr(1)],
  ['lr2', 2, 'lr', 'LRM-10', 'Long-range missiles · lofted, they find their own way', 8, 16, 46, 1, { type: 'missile', dmg: 6, cd: 3.6, heat: 11, speed: 85, salvo: 10, spread: .09, turn: 4, life: 8, loft: .45, reach: 600 }, armLr(2)],
  ['lr3', 3, 'lr', 'LRM-15', 'Long-range missiles · lofted, they find their own way', 12, 20, 70, 2, { type: 'missile', dmg: 6, cd: 4.2, heat: 16, speed: 85, salvo: 15, spread: .1, turn: 4, life: 8, loft: .45, reach: 600 }, armLr(3)],
  ['rk1', 1, 'rk', 'ROCKET POD I', 'Six unguided rockets', 4, 14, 16, 0, { type: 'missile', dmg: 9, cd: 3, heat: 6, speed: 130, salvo: 6, spread: .06, turn: 0, life: 2.4, blast: 5, reach: 300 }, armRk(1)],
  ['rk2', 2, 'rk', 'ROCKET POD II', 'Twelve unguided rockets', 7, 18, 30, 0, { type: 'missile', dmg: 9, cd: 3.6, heat: 11, speed: 130, salvo: 12, spread: .075, turn: 0, life: 2.4, blast: 5, reach: 300 }, armRk(2)],
  ['pr1', 1, 'pr', 'PLASMA RIFLE I', 'Bolts that burst · runs warm', 5, 16, 28, 0, { type: 'plasma', dmg: 14, cd: .8, heat: 6, speed: 110, blast: 4, big: .45, reach: 300 }, armPr(1)],
  ['pr2', 2, 'pr', 'PLASMA RIFLE II', 'Bolts that burst · runs hot', 8, 20, 46, 1, { type: 'plasma', dmg: 22, cd: .9, heat: 9, speed: 110, blast: 5, big: .55, reach: 300 }, armPr(2)],
  ['pr3', 3, 'pr', 'PLASMA RIFLE III', 'Bolts that burst · runs very hot', 11, 24, 70, 2, { type: 'plasma', dmg: 32, cd: 1, heat: 13, speed: 110, blast: 6, big: .65, reach: 300 }, armPr(3)],
  ['gs1', 1, 'gs', 'GAUSS RIFLE I', 'Slug at range · almost no heat', 8, 16, 40, 1, { type: 'rail', dmg: 24, cd: 2, heat: 3, range: 360 }, armGs(1)],
  ['gs2', 2, 'gs', 'GAUSS RIFLE II', 'Heavy slug at range', 13, 20, 66, 1, { type: 'rail', dmg: 48, cd: 3, heat: 6, range: 440 }, armGs(2)],
  ['gs3', 3, 'gs', 'GAUSS RIFLE III', 'The longest reach there is', 18, 24, 98, 2, { type: 'rail', dmg: 80, cd: 4.2, heat: 10, range: 520, bw: .4 }, armGs(3)],
  ['fl1', 1, 'fl', 'FLAMER I', 'A cone of fire · it cooks what it touches', 3, 14, 14, 0, { type: 'flame', dmg: 2.2, cd: .1, heat: .8, range: 44, burn: 3 }, armFl(1)],
  ['fl2', 2, 'fl', 'FLAMER II', 'A cone of fire · it cooks what it touches', 5, 18, 26, 0, { type: 'flame', dmg: 3.4, cd: .1, heat: 1.2, range: 54, burn: 5 }, armFl(2)],
  ['fl3', 3, 'fl', 'FLAMER III', 'A wall of fire', 8, 22, 44, 1, { type: 'flame', dmg: 5, cd: .1, heat: 1.8, range: 64, burn: 8 }, armFl(3)],
  ['fs1', 1, 'fs', 'POWER FIST I', 'Melee · one heavy blow', 6, 40, 20, 0, { type: 'melee', dmg: 60, cd: 1.6, heat: 2, range: 15, arc: .7 }, armFs(1)],
  ['fs2', 2, 'fs', 'POWER FIST II', 'Melee · one very heavy blow', 10, 60, 38, 1, { type: 'melee', dmg: 105, cd: 2, heat: 3, range: 17, arc: .7 }, armFs(2)],
  ['sw1', 1, 'sw', 'RIPSAW I', 'Melee · grinds for as long as it touches', 7, 30, 30, 1, { type: 'melee', dmg: 7, cd: .12, heat: .5, range: 15, arc: .5, grind: 1 }, armSw(1)],
  ['sw2', 2, 'sw', 'RIPSAW II', 'Melee · grinds for as long as it touches', 11, 40, 52, 2, { type: 'melee', dmg: 11, cd: .12, heat: .7, range: 17, arc: .5, grind: 1 }, armSw(2)],
  ['tb1', 1, 'tb', 'THERMAL BLADE I', 'Melee · a sweep that cuts everything in reach', 6, 26, 34, 1, { type: 'melee', dmg: 75, cd: 2.2, heat: 9, range: 18, arc: 1.2, sweep: 1, burn: 4 }, armTb(1)],
  ['tb2', 2, 'tb', 'THERMAL BLADE II', 'Melee · a sweep that cuts everything in reach', 9, 34, 58, 2, { type: 'melee', dmg: 125, cd: 2.6, heat: 13, range: 21, arc: 1.2, sweep: 1, burn: 7 }, armTb(2)],
  ['mau', 3, 'mau', 'WRECKING MAUL', 'Melee · staggers whatever it lands on', 14, 55, 64, 2, { type: 'melee', dmg: 180, cd: 3.6, heat: 4, range: 19, arc: .6, stun: 1.6 }, armMaul],
  ['mt1', 1, 'mt', 'MORTAR I', 'Lobbed shell · over the hill', 7, 16, 30, 0, { type: 'lob', dmg: 36, cd: 2.4, heat: 5, speed: 62, blast: 9, reach: 380, snd: 'mortar' }, armMt(1)],
  ['mt2', 2, 'mt', 'MORTAR II', 'Heavy lobbed shell', 11, 20, 54, 1, { type: 'lob', dmg: 64, cd: 3.4, heat: 9, speed: 62, blast: 13, reach: 380, big: 1.3, snd: 'mortar' }, armMt(2)],
  ['ar1', 1, 'ar', 'ARC PROJECTOR I', 'Lightning that jumps to a second target', 7, 16, 40, 1, { type: 'arc', dmg: 18, cd: 1.1, heat: 8, range: 150, chain: 2 }, armAr(1)],
  ['ar2', 2, 'ar', 'ARC PROJECTOR II', 'Lightning that jumps twice more', 10, 20, 66, 2, { type: 'arc', dmg: 28, cd: 1.3, heat: 12, range: 180, chain: 3 }, armAr(2)],
  ['io1', 1, 'io', 'ION CANNON I', 'A bolt that stalls what it hits', 9, 18, 48, 1, { type: 'ion', dmg: 32, cd: 2.4, heat: 13, speed: 260, stun: .8, reach: 420 }, armIo(1)],
  ['io2', 2, 'io', 'ION CANNON II', 'A bolt that stalls what it hits', 13, 22, 80, 2, { type: 'ion', dmg: 56, cd: 3.2, heat: 20, speed: 260, stun: 1.4, reach: 420, big: 1.3 }, armIo(2)],
];
for (const [id, lv, fam, name, desc, tons, armor, , , weapon, build] of ARM_FAM) PARTS.arm[id] = { name, desc, tons, armor, lv, fam, weapon: { name, ...weapon }, build };

