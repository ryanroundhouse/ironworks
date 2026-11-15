/* ============ PEOPLE: MECH BAY GROUND CREW ============ */
const hSpot = (x, z, yaw, acts, look, y = 0) => ({ x, z, yaw, acts, look, y, by: null });
{
  const sc = HG.scene, R = mulberry(19), hw = HG.W / 2;
  /* walkways: two side aisles joined by three cross aisles; everything else is reached from the nearest node */
  const N = HG.nodes = {}, E = HG.edges = {}, link = (a, b) => { (E[a] = E[a] || []).push(b); (E[b] = E[b] || []).push(a); };
  [-46, -34, -20, -4, 10, 25, 40].forEach((z, i) => { N['l' + i] = [-22, z]; N['r' + i] = [22, z]; if (i) { link('l' + (i - 1), 'l' + i); link('r' + (i - 1), 'r' + i); } });
  N.f = [0, -20]; N.b = [0, 25]; N.k = [0, 40]; link('l2', 'f'); link('f', 'r2'); link('l5', 'b'); link('b', 'r5'); link('l6', 'k'); link('k', 'r6'); link('b', 'k');
  const nearest = (x, z) => { let best = null, bd = 1e9; for (const k in N) { const d = Math.hypot(N[k][0] - x, N[k][1] - z); if (d < bd) { bd = d; best = k; } } return best; };
  const route = (ax, az, bx, bz, h) => {
    if (h.deck || Math.hypot(bx - ax, bz - az) < 9) return [{ x: bx, z: bz }];
    const a = nearest(ax, az), b = nearest(bx, bz), prev = { [a]: null }, Q = [a]; while (Q.length) { const n = Q.shift(); if (n === b) break; for (const m of E[n]) if (!(m in prev)) { prev[m] = n; Q.push(m); } }
    const ids = []; for (let n = b; n; n = prev[n]) ids.unshift(n); const P = ids.map(k => ({ x: N[k][0] + h.lane[0], z: N[k][1] + h.lane[1] })), dd = (p, q) => Math.hypot(p.x - q.x, p.z - q.z), A = { x: ax, z: az }, B = { x: bx, z: bz };
    if (P.length > 1 && dd(A, P[1]) < dd(P[0], P[1])) P.shift(); if (P.length > 1 && dd(P[P.length - 2], B) < dd(P[P.length - 2], P[P.length - 1])) P.pop(); P.push(B); return P;
  };
  const W = HG.crowd = new Crowd({ route, circ: [[0, 0, 11.7], [-23.6, 47.6, 3.4], [26, -51, 3.6], [-25, -54, 2.4], [8, 54, 2.2], [38, 40, 2.2], [-39, -52, 2.2], [21.5, 52.7, 2], [-10.5, 57.7, 2], [37.5, -21.3, 2], [-35.5, 8.7, 2], [39.5, 9.7, 2], [-16.46, 18.36, 1.25], [-15, 17, 1.25], [-13.54, 15.64, 1.25]], box: [[13.3, -3.8, 18.8, 3.8], [-18.8, -3.8, -13.3, 3.8], [-4.1, 10.2, 4.1, 14.4], [-4.1, -14.4, 4.1, -10.2]], poi: HG.mechLook = V3(0, 9, 0) });
  HG.spots = { tech: [], view: [], crate: [], deck: [[], []] };
  /* work pieces: an armour plate on trestles beside each bay, two benches against the walls */
  const plate = (x, z, ry) => { const g = grp(sc, x, 0, z, 0, ry, 0); for (const s of [-1, 1]) { box(g, M.yellow, .08, .62, .7, s * .55, .31, 0); box(g, M.dark, .5, .06, .8, s * .55, .03, 0); } box(g, pick([M.steel, M.rust, M.blue]), 1.5, .09, .95, 0, .68, 0, .05, 0, 0); box(g, M.dark, .3, .2, .22, .5, .78, -.2); return g; };
  HG.bays.forEach((b, i) => {
    const s = i % 2 ? 1 : -1, z = -34 + Math.floor(i / 2) * 30, look = { x: s * 33, y: b.mech.height * .62, z };
    HG.spots.tech.push(hSpot(s * 26.9, z + [-3, 2.5, -1][i % 3], s * PI / 2, [['inspect', 10, 20]], look));
    const pz = z + (i % 2 ? 6.4 : -6.4), px = s * 27.6; plate(px + s * .95, pz, PI / 2); HG.spots.tech.push(hSpot(px, pz, s * PI / 2, [['crouch', 9, 18, { weld: 1 }], ['weld', 7, 13, { weld: 1 }], ['wrench', 6, 11]]));
    HG.spots.view.push(hSpot(s * 25.6, z + 4.6 * (i % 2 ? -1 : 1), s * PI / 2, [['inspect', 7, 12], ['watch', 5, 9]], look));
  });
  for (const s of [-1, 1]) {
    const g = grp(sc, s * 41.7, 0, 13.5); box(g, M.dark, 1.1, .08, 4.2, 0, .98, 0); for (const z of [-1.9, 1.9]) box(g, M.girder, .9, .94, .12, 0, .47, z); box(g, M.girder, .08, 1.4, 4.2, s * .5, 1.7, 0); box(g, M.red, .7, .34, .46, 0, 1.19, -1.5); box(g, M.steel, .28, .22, .3, 0, 1.13, 1.2); cyl(g, M.chrome, .05, .05, .5, -s * .2, 1.22, .4, PI / 2); box(g, M.rust, .5, .1, .8, -s * .05, 1.07, .2, 0, .4, 0);
    for (let i = 0; i < 5; i++) box(g, i % 2 ? M.steel : M.yellow, .04, .34, .06, s * .44, 1.6 + (i % 2) * .12, -1.2 + i * .55);
    HG.spots.tech.push(hSpot(s * 40.5, 13.5 + .25, s * PI / 2, [['wrench', 8, 15], ['weld', 6, 11, { weld: 1 }], ['type', 5, 8]])); W.box.push(s > 0 ? [41.1, 11.3, 43, 15.7] : [-43, 11.3, -41.1, 15.7]);
  }
  /* the control desk was built at mech scale, so its operator works from a raised step */
  { const cg = grp(sc, -15, 0, 17, 0, .75, 0), gm = repMat(TX.grate, 5, 2, { metalness: .45, roughness: .75 }); box(cg, gm, 3.6, .1, 1.6, 0, .75, 1.95); for (const x of [-1.72, 1.72]) { for (const z of [1.2, 2.7]) box(cg, M.yellow, .09, 1.85, .09, x, .925, z); box(cg, M.yellow, .06, .06, 1.5, x, 1.82, 1.95); box(cg, M.yellow, .06, .06, 1.5, x, 1.3, 1.95); } for (let i = 0; i < 3; i++) box(cg, M.girder, 1.5, .08, .36, 0, .58 - i * .2, 2.93 + i * .36); }
  W.groundY = (x, z) => { const dx = x + 15, dz = z - 17, c = Math.cos(.75), s = Math.sin(.75), lx = dx * c - dz * s, lz = dx * s + dz * c; return Math.abs(lx) > 1.8 || lz < 1.1 || lz > 3.85 ? 0 : lz < 2.75 ? .8 : .8 * (3.85 - lz) / 1.1; };
  HG.spots.console = hSpot(-13.807, 18.28, .75 + PI, [['type', 10, 24], ['watch', 4, 8], ['think', 3, 5]]); HG.spots.console.via = [-12, 20.22];
  for (const [x, z, a] of [[9, 19, 0], [-16.5, -10, 0], [14.5, -17, 0], [-13, -18, 0], [17.5, 13, 0], [-9, 21.5, 0]]) HG.spots.view.push(hSpot(x, z, Math.atan2(-x, -z), [['inspect', 7, 13], ['watch', 5, 10], ['think', 3, 5]], HG.mechLook));
  for (const [x, z, tx, tz] of [[-20.6, 43.6, -23.6, 47.6], [22.4, -47.4, 26, -51], [35.4, 37.6, 38, 40], [-22.4, -51.2, -25, -54], [10.6, 52, 8, 54], [-37.2, -49.4, -39, -52]]) HG.spots.crate.push(hSpot(x, z, Math.atan2(tx - x, tz - z), [['pick', 2, 3]]));
  [-1, 1].forEach((s, i) => { const D = HG.spots.deck[i]; D.push(hSpot(s * 14.25, -1.3, -s * PI / 2, [['inspect', 8, 15], ['watch', 6, 10]], HG.mechLook, 12.1), hSpot(s * 14.25, 1.6, -s * PI / 2, [['tablet', 6, 12], ['watch', 5, 9]], HG.mechLook, 12.1), hSpot(s * 17.85, 2.1, s * PI / 2, [['watch', 6, 12]], null, 12.1), hSpot(s * 16.2, -2.9, PI, [['tablet', 5, 9], ['watch', 4, 8]], null, 12.1)); });

  /* the radio the crew keep on the control desk — the source of the music in the bay */
  const rg = HG.radio = grp(sc, -12.97, 1.925, 15.73, 0, .75 + .35, 0), rb = std({ color: 0x6d2a1c, roughness: .55, metalness: .2 }), cream = std({ color: 0xcfc3a2, roughness: .7 });
  box(rg, rb, .66, .34, .2, 0, .17, 0); box(rg, cream, .6, .1, .21, 0, .27, .006); box(rg, M.black, .28, .2, .02, -.15, .13, .1); HG.radioDial = glowMat(0xffb060, 1.2); noShadow(box(rg, HG.radioDial, .36, .05, .02, .06, .275, .112));
  HG.radioCone = glowMat(0xff8a2a, .4); const cone = noShadow(cyl(rg, HG.radioCone, .085, .085, .02, -.15, .13, .105, PI / 2, 0, 0, 16)); HG.radioRing = cone; for (const x of [.1, .22]) cyl(rg, M.chrome, .028, .028, .03, x, .1, .11, PI / 2, 0, 0, 10);
  cyl(rg, M.chrome, .006, .006, .9, .22, .76, -.05, 0, 0, -.5, 5); cyl(rg, M.chrome, .012, .012, .5, 0, .39, 0, 0, 0, PI / 2, 5); HG.radioPos = V3(-12.97, 2.1, 15.73);

  /* the crew */
  const techSpots = HG.spots.tech, mk = (seed, o, job, spots) => { const L = lookOf(seed), h = new Human(L, { scene: sc, role: 'mech', far: true, ...o }); h.lane = [rand(-.9, .9), rand(-.9, .9)]; h.job = job; h.spots = spots; W.add(h); return h; };
  function* tech(h) { yield* hRoam(h, h.spots, 2); }
  function* porter(h) {
    const C = HG.spots.crate; let cur = pick(C);
    for (;;) { yield* hGo(h, cur.x, cur.z); yield* hFace(h, cur.yaw); yield* hDo(h, 'pick', 1.6); h.carry = true; h.box.visible = true; let nx; do nx = pick(C); while (nx === cur); cur = nx; yield* hGo(h, cur.x, cur.z); yield* hFace(h, cur.yaw); yield* hDo(h, 'pick', 1.5); h.carry = false; h.box.visible = false; yield* hDo(h, 'watch', rand(3, 8)); if (Math.random() < .4) yield* hVisit(h, pick(HG.spots.view)); }
  }
  function* desk(h) { for (;;) { yield* hVisit(h, HG.spots.console, 2); if (Math.random() < .45) yield* hVisit(h, pick(HG.spots.view)); } }
  function* marshal(h) { const S = [hSpot(14.6, -40, -PI / 2, [['watch', 8, 15]]), hSpot(15, -27, -PI / 2, [['watch', 6, 12]]), hSpot(-14.6, -42, PI / 2, [['watch', 6, 12]]), hSpot(13.6, -55, -2.2, [['watch', 6, 10]])]; yield* hRoam(h, S, 1); }
  /* DEPLOY: everyone clears the launch lane and watches the machine walk out; the marshal waves it through the door */
  function* clear(h) {
    const p = h.g.position; h.carry = false; if (h.box) h.box.visible = false; h.seat = null; h.path = []; h.faceTo = null;
    if (h.job === marshal) { h.look = HG.mechLook; yield* hGo(h, 14, -37, { run: true, direct: true }); yield* hFace(h, -PI / 2); while (HG.alarmOn) { h.setAct('marshal', { go: HG.walk > 0 }); yield; } }
    else { if (Math.abs(p.x) < 15 && p.z < 17) { const sx = p.x < 0 ? -1 : 1; let tz = clamp(p.z + rand(-2, 2), -52, 15); if (Math.abs(tz) < 5.6) tz = tz < 0 ? -5.6 : 5.6; yield* hGo(h, sx * rand(19.5, 21.5), tz, { run: true, direct: true }); } h.look = HG.mechLook; h.faceTo = Math.atan2(-p.x, -20 - p.z); while (HG.alarmOn) { h.setAct('watch'); yield; } }
    h.look = null; h.setAct('stand');
  }
  HG.clear = clear;
  const A = mk(101, { x: -27, z: -31, yaw: 1, props: { l: 'tablet' } }, tech, techSpots.filter((s, i) => i % 3 === 0 || i > 11)), B2 = mk(202, { x: 27, z: 20, yaw: -1, props: { r: 'torch' }, fit: { mask: 1, hat: null, gloves: '#2a2c2f' } }, tech, techSpots.filter(s => s.acts[0][0] !== 'inspect'));
  const C2 = mk(303, { x: 27.5, z: -10, yaw: -1.5, props: { r: 'wrench' } }, tech, techSpots), D2 = mk(404, { x: -21, z: 43, yaw: 2 }, porter), E2 = mk(505, { x: -13.807, z: 18.28, y: .8, yaw: .75 + PI, fit: { hat: null, vest: null, ear: 0, headset: 1 } }, desk);
  const F2 = mk(606, { x: 9, z: 20, yaw: PI, props: { l: 'clip' }, fit: { hat: 'hard', hatCol: '#d8d8d2', vest: '#c9d223', top: '#2d3440', bot: '#2d3440' } }, function* (h) { yield* hRoam(h, HG.spots.view, 2); });
  const G2 = mk(707, { x: 14.6, z: -40, yaw: -PI / 2, props: { r: 'baton', l: 'baton' }, fit: { hat: 'hard', hatCol: '#cf5a18', vest: '#e06a16', ear: 1 } }, marshal);
  const d0 = mk(808, { x: -14.25, z: -1.3, y: 12.1, yaw: PI / 2, props: { l: 'tablet' } }, function* (h) { yield* hRoam(h, HG.spots.deck[0], 2); }), d1 = mk(909, { x: 17.85, z: 2.1, y: 12.1, yaw: PI / 2, props: { r: 'wrench' } }, function* (h) { yield* hRoam(h, HG.spots.deck[1], 2); }); d0.deck = d1.deck = true;
  D2.box = grp(D2.spine, 0, .14 * D2.k, .31 * D2.k); box(D2.box, M.rust, .46, .34, .36); box(D2.box, M.dark, .48, .05, .38, 0, .12, 0); D2.box.visible = false;
  for (const h of W.list) { h.brain = h.job; h.co = h.job(h); }
  HG.weldL = new THREE.PointLight(0x9fdcff, 0, 9, 1.8); sc.add(HG.weldL);
  HG.staff = (dt, t) => {
    HG.mechLook.set(0, 0, 0); player.root.localToWorld(HG.mechLook); HG.mechLook.y += player.height * .6; W.cam.copy(HG.camera.position); W.beat = music.beat();
    if (HG.alarmOn !== HG.wasAlarm) { HG.wasAlarm = HG.alarmOn; for (const h of W.list) if (!h.deck) { for (const s of [...HG.spots.tech, ...HG.spots.view, ...HG.spots.crate, HG.spots.console]) if (s.by === h) s.by = null; h.co = HG.alarmOn ? clear(h) : h.job(h); if (!HG.alarmOn) { h.look = null; h.run = false; } } else h.look = HG.alarmOn ? HG.mechLook : null; }
    W.update(dt);
    /* welding: sparks, a flickering light and the mask coming down */
    let lit = null; for (const h of W.list) { const P = h.arm[0].prop; if (!P || P.kind !== 'torch') continue; const on = h.ao.weld && h.at > 1.6 && h.speed < .05 && Math.sin(t * 1.3 + h.L.seed) > -.35 && Math.random() < .85; P.glow.material.emissiveIntensity = on ? rand(4, 9) : 0; if (on) { P.tip.getWorldPosition(_v); lit = _v; if (Math.random() < .5) sparks(HG.fx, _v, 2, 3.2, 3, 3.4, 5); if (Math.random() < .012) sfx.play('weld'); } }
    HG.weldL.intensity = lit ? rand(5, 20) : 0; if (lit) HG.weldL.position.copy(lit);
    const b = W.beat, pulse = b < 0 ? 0 : Math.pow(1 - b, 3); HG.radioCone.emissiveIntensity = .3 + 2.2 * pulse; HG.radioDial.emissiveIntensity = b < 0 ? rand(.2, 1.6) : 1.1 + .25 * Math.sin(t * 9); HG.radioRing.scale.x = HG.radioRing.scale.z = 1 + .12 * pulse;
    for (const h of W.list) if (h.arm[0].prop && h.arm[0].prop.kind === 'baton') for (const a of h.arm) a.prop.glow.material.emissiveIntensity = h.act === 'marshal' ? 3.2 : .35;
  };
}

