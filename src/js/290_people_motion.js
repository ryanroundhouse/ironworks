/* ============ PEOPLE: MOTION (walk cycle with foot IK, activities, fidgets, gaze, blinking) ============ */
const lerpArm = (q, i, e, sw, ab, tw, el, wr = 0, pr = 0) => { const b = QA + i * 6; q[b] += (sw - q[b]) * e; q[b + 1] += (ab - q[b + 1]) * e; q[b + 2] += (tw - q[b + 2]) * e; q[b + 3] += (el - q[b + 3]) * e; q[b + 4] += (wr - q[b + 4]) * e; q[b + 5] += (pr - q[b + 5]) * e; };
const HOLD = { tablet: [.34, -.04, .8, 1.42, 0, -1.1], clip: [.34, -.04, .8, 1.42, 0, -1.1], mug: [.3, .02, .55, 1.48, 0, .1] };
/* what a person is doing: each fills the target pose q (and the un-damped additive layer ad) */
const ACT = {
  stand() { },
  hips(h, q) { for (let i = 0; i < 2; i++) if (!h.held[i]) qArm(q, i, -.24, .5, 1.3, 1.55, .35, .9); q[6] = -.03; },
  cross(h, q) { if (h.held[0] || h.held[1]) return; qArm(q, 0, .52, -.1, 1.25, 1.82, 0, .5); qArm(q, 1, .4, -.08, 1.2, 1.66, 0, .5); q[6] = -.02; },
  back(h, q) { if (h.held[0] || h.held[1]) return; qArm(q, 0, -.36, .1, 1.5, 1.2); qArm(q, 1, -.36, .1, 1.5, 1.05); q[6] = -.05; },
  watch(h, q, ad, t) { ACT[h.habit](h, q, ad, t); },
  read(h, q, ad, t) { ACT[h.habit](h, q, ad, t); q[9] = -.16; },
  lean(h, q) { q[2] = -.13 * h.k; q[1] = -.03 * h.k; q[6] = .4; q[9] = -.22; for (let i = 0; i < 2; i++) if (!h.held[i]) qArm(q, i, .96, .2, -.1, .12, -.95, 1.35); },
  type(h, q, ad, t) {
    const r = Math.sin(t * .31 + h.L.seed) > -.5 ? 1 : 0; q[6] = .1; q[9] = r ? .16 : -.05;
    for (let i = 0; i < 2; i++) { if (h.held[i]) continue; const b = QA + i * 6; qArm(q, i, .52 + .07 * Math.sin(t * .7 + i * 2), .1, .28, 1.22, -.12, 1.25); ad[b + 3] = r * .05 * Math.sin(t * 15 + i * 2.1); ad[b + 4] = r * .17 * Math.sin(t * 19 + i * 1.3); ad[b] = r * .03 * Math.sin(t * 3.1 + i * 1.7); }
  },
  tablet(h, q, ad, t) { const tap = Math.sin(t * .5 + h.L.seed) > 0 ? 1 : 0; q[9] = .4; q[6] = .05; qArm(q, 1, .46, -.04, .86, 1.56, 0, -1.15); qArm(q, 0, .52, .02, .7, 1.5, .15, 1); ad[QA + 4] = tap * .2 * Math.sin(t * 9); ad[QA] = tap * .04 * Math.sin(t * 2.3); },
  point(h, q, ad, t) { const e = smooth(clamp(Math.sin(t * .8 + h.L.seed) * 2 + .6, 0, 1)); lerpArm(q, 0, e, 1.12 + .05 * Math.sin(t * 1.7), .12, 0, .2, 0, 1.2); if (!h.held[1]) qArm(q, 1, -.24, .5, 1.3, 1.55, .35, .9); q[9] = .05; },
  think(h, q) { if (!h.held[1]) qArm(q, 1, .32, -.1, 1.25, 1.6, 0, .5); if (!h.held[0]) qArm(q, 0, .74, -.05, .74, 2.42, .2, .3); q[9] = .1; q[11] = .07; },
  sip(h, q, ad, t) { const s = (t * .085 + h.L.seed * .37) % 1, e = smooth(clamp(Math.min(s / .05, (.24 - s) / .06), 0, 1)); lerpArm(q, 0, e, 1.02, .14, .86, 2.32, .1, .2); q[9] = -.16 * e; if (!h.held[1]) lerpArm(q, 1, 1, -.1, .3, 1.2, 1.3, .3, .8); },
  sit(h, q, ad, t) {
    const o = h.ao, k = h.k, m = o.mode || 'back'; q[1] = (o.h || .5) + .095 * k - h.hipY; q[2] = -(o.back ?? .3) * k; q[QF + 1] = q[QF + 5] = (.4 - (o.back ?? .3)) * k; q[QF] = -.03 * k; q[QF + 4] = .03 * k;
    if (m === 'fwd') { q[6] = .5; q[9] = -.3; for (let i = 0; i < 2; i++) if (!h.held[i]) qArm(q, i, .64, .12, .36, 1.18, 0, .6); }
    else if (m === 'type') { q[6] = .08; ACT.type(h, q, ad, t); q[6] = .12; }
    else { q[6] = -.14; q[9] = .05; for (let i = 0; i < 2; i++) if (!h.held[i]) qArm(q, i, .3, .05, .32, 1.15, 0, 1.2); }
  },
  crouch(h, q, ad, t) { const k = h.k; q[1] = -.4 * k; q[2] = -.04 * k; q[3] = .12; q[6] = .42; q[9] = .3; q[QF + 1] = -.3 * k; q[QF + 2] = .9; q[QF + 5] = .2 * k; qArm(q, 0, 1 + .03 * Math.sin(t * 2.3), .1, .2, .6, 0, 1.2); qArm(q, 1, .55, .15, .5, 1.3); },
  wrench(h, q, ad, t) { q[6] = .22; q[9] = .36; qArm(q, 0, .62, .1, .3, 1.15, 0, .9); ad[QA + 5] = .5 * Math.sin(t * 5); ad[QA + 3] = .12 * Math.sin(t * 5); if (!h.held[1]) qArm(q, 1, .6, .12, .25, 1.05, -.3, 1.3); },
  weld(h, q, ad, t) { q[6] = .26; q[9] = .38; qArm(q, 0, .72 + .03 * Math.sin(t * 1.9), .05, .2, .9, 0, 1.2); if (!h.held[1]) qArm(q, 1, .5, .14, .3, 1.1, -.2, 1.2); },
  inspect(h, q, ad, t) { const s = (t * .14 + h.L.seed * .13) % 1, up = smooth(clamp(Math.min(s / .08, (.5 - s) / .08), 0, 1)); ACT.tablet(h, q, ad, t); q[9] = lerp(.4, -.5, up); q[6] = lerp(.05, -.08, up); if (s > .15 && s < .32) lerpArm(q, 0, smooth(clamp(Math.min((s - .15) / .04, (.32 - s) / .04), 0, 1)), 1.85, .2, 0, .25, 0, 1); },
  carry(h, q) { q[6] = -.08; for (let i = 0; i < 2; i++) qArm(q, i, .42, -.04, .4, 1.36, 0, 0); },
  pick(h, q) { const k = h.k; q[1] = -.36 * k; q[2] = -.1 * k; q[6] = .6; q[9] = .2; q[QF + 1] = .1 * k; q[QF + 5] = -.08 * k; for (let i = 0; i < 2; i++) qArm(q, i, .95, 0, .2, .3, 0, .6); },
  marshal(h, q, ad, t) { const go = h.ao.go, b = .5 + .5 * Math.sin(t * 5.2); for (let i = 0; i < 2; i++) go ? qArm(q, i, 2.45, .32, 0, .3 + 1.05 * b, 0, 0) : qArm(q, i, .5, -.2, .9, 1.25, 0, .3); q[6] = go ? -.08 : 0; },
  chat(h, q, ad, t) { const sp = Math.sin(t * .37 + h.L.seed) > 0; ACT[h.habit](h, q, ad, t); if (sp) talkArms(h, q, ad, t, 1); h.speak = sp ? 1 : 0; },
};
function talkArms(h, q, ad, t, e) {
  const two = Math.sin(t * .43 + h.L.seed) > .25; if (!h.held[0]) lerpArm(q, 0, e, .42 + .14 * Math.sin(t * 2.3), .1, .45, 1.45 + .28 * Math.sin(t * 3.4 + 1), .12 * Math.sin(t * 4.1), .5 + .5 * Math.sin(t * 1.7));
  if (two && !h.held[1]) lerpArm(q, 1, e, .4 + .12 * Math.sin(t * 2.1 + 2), .1, .45, 1.4 + .25 * Math.sin(t * 3.1), 0, .5 + .5 * Math.sin(t * 1.5 + 1)); ad[9] += .03 * Math.sin(t * 8.5) * e; ad[11] += .02 * Math.sin(t * 2.7) * e;
}
/* small unprompted movements. [name, arms needed (1 right, 2 left), seconds, fn(h, q, ad, e, t)] */
const FIDGET = [
  ['scratch', 1, 2.6, (h, q, ad, e, t) => { lerpArm(q, 0, e, 1.28, .34, .9, 2.45, 0, .4); q[9] += .14 * e; q[11] += -.08 * e; ad[QA + 3] += .07 * e * Math.sin(t * 13); }],
  ['chin', 1, 3.4, (h, q, ad, e) => { lerpArm(q, 0, e, .74, -.05, .74, 2.42, .2, .3); q[11] += .07 * e; q[9] += .06 * e; }],
  ['wrist', 2, 2.4, (h, q, ad, e) => { lerpArm(q, 1, e, .55, -.05, .95, 1.75, 0, 1.3); q[9] += .38 * e; q[10] += .25 * e; }],
  ['stretch', 3, 2.8, (h, q, ad, e) => { for (let i = 0; i < 2; i++) lerpArm(q, i, e, 2.78, .45, 0, .45); q[6] -= .17 * e; q[9] -= .22 * e; }],
  ['neck', 0, 3, (h, q, ad, e, t) => { q[11] += .26 * e * Math.sin(t * 1.9); q[10] += .2 * e * Math.sin(t * .95); }],
  ['scan', 0, 4, (h, q, ad, e, t) => { q[10] += .8 * e * Math.sin(t * 1.1); q[7] += .18 * e * Math.sin(t * 1.1); }],
  ['hands', 3, 2.6, (h, q, ad, e, t) => { for (let i = 0; i < 2; i++) { lerpArm(q, i, e, .42, -.1, .98, 1.6, 0, .3); ad[QA + i * 6 + 3] += .05 * e * Math.sin(t * 9 + i * 3); } }],
  ['belt', 3, 2.2, (h, q, ad, e) => { for (let i = 0; i < 2; i++) lerpArm(q, i, e, .1, .16, .95, 1.2, .2, .6); q[1] += .012 * e; }],
  ['yawn', 1, 3, (h, q, ad, e) => { lerpArm(q, 0, e, .8, -.1, .86, 2.5, .1, .5); q[9] -= .12 * e; h.yawn = e; }],
  ['fold', 3, 7, (h, q, ad, e) => { lerpArm(q, 0, e, .52, -.1, 1.25, 1.82, 0, .5); lerpArm(q, 1, e, .4, -.08, 1.2, 1.66, 0, .5); }],
  ['akimbo', 3, 6, (h, q, ad, e) => { for (let i = 0; i < 2; i++) lerpArm(q, i, e, -.24, .5, 1.3, 1.55, .35, .9); }],
  ['shrug', 0, 1.6, (h, q, ad, e, t) => { q[8] += .07 * e * Math.sin(t * 4); q[1] += .01 * e; }],
];
const ARMFREE = { stand: 3, watch: 3, read: 3, sip: 2, point: 0, think: 0, hips: 0, cross: 0, back: 0 };

Object.assign(Human.prototype, {
  setAct(a, o) { if (this.act !== a) { this.act = a; this.at = 0; } this.ao = o || {}; },
  /* pose vector → skeleton. Legs are solved by IK from the pelvis to each planted foot, so crouching, sitting and weight shifts need no leg animation */
  pose() {
    const c = this.c, ad = this.ad, k = this.k, v = i => c[i] + ad[i], hp = this.hips.position, L1 = this.L1, L2 = this.L2;
    hp.set(v(0), this.hipY + v(1), v(2)); this.hips.rotation.set(v(3), v(4), v(5)); this.spine.rotation.set(v(6), v(7), v(8)); this.head.rotation.set(v(9), v(10), v(11));
    for (let i = 0; i < 2; i++) { const s = i ? 1 : -1, b = QA + i * 6, A = this.arm[i]; A.sh.rotation.set(-v(b), -s * v(b + 2), s * v(b + 1)); A.el.rotation.x = -Math.max(0, v(b + 3)); A.hand.rotation.set(0, -s * v(b + 5), -s * v(b + 4)); }
    const pp = v(3), py = v(4), pr = v(5);
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, b = QF + i * 4, G = this.gf[i], Lg = this.leg[i], pt = v(b + 2) + G[2];
      const x = s * .09 * k * (1 - .3 * this.gw) + v(b), y = this.AH + v(b + 3) + G[1] + (pt > 0 ? .11 : -.06) * k * Math.sin(pt), z = v(b + 1) + G[0] + (pt > 0 ? .11 * k * (1 - Math.cos(pt)) : 0);
      const dx = x - (hp.x + s * this.hipW * Math.cos(pr) * Math.cos(py)), dy = y - (hp.y + s * this.hipW * Math.sin(pr)), dz = z - (hp.z - s * this.hipW * Math.sin(py));
      const D = clamp(Math.hypot(dx, dy, dz), .12 * k, (L1 + L2) * .997), be = Math.atan2(dz, -dy), al = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1)), ga = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
      Lg.th.rotation.set(-(be + al) - pp, s * .13 - py, Math.atan2(dx, Math.hypot(dy, dz)) - pr); Lg.kn.rotation.x = PI - ga; Lg.ft.rotation.x = pt + be + al - (PI - ga);
    }
  },
  update(dt, W) {
    const k = this.k, q = this.q, c = this.c, ad = this.ad, g = this.g.position, talking = W.talk === this; this.dt = dt; this.t += dt; this.at += dt; const t = this.t;
    if (!talking && this.co && this.co.next().done) this.co = this.brain ? this.brain(this, W) : null;
    /* ---- travel ---- */
    let v = 0; const yaw0 = this.yaw, turn = (to, rate) => { const d = angDiff(this.yaw, to); this.yaw += clamp(d, -rate * dt, rate * dt); return d; };
    if (talking) { if (!this.seat) turn(Math.atan2(W.cam.x - g.x, W.cam.z - g.z), 2.6); }
    else if (this.path.length) {
      const p = this.path[0], dx = p.x - g.x, dz = p.z - g.z, d = Math.hypot(dx, dz), end = this.path.length === 1;
      if (d < (end ? .1 : .5)) this.path.shift();
      else { const da = turn(Math.atan2(dx, dz) + (end && d < 1 ? 0 : this.steer), 3.6); v = this.vmax * (this.run ? 2.3 : 1) * clamp(1.3 - Math.abs(da) / .75, 0, 1) * (end ? clamp(d / .6, .22, 1) : 1) * this.slow; }
    } else if (this.faceTo !== null && Math.abs(turn(this.faceTo, 2.8)) < .02) this.faceTo = null;
    this.speed = damp(this.speed, v, v > this.speed ? 3 : 7, dt); g.x += Math.sin(this.yaw) * this.speed * dt; g.z += Math.cos(this.yaw) * this.speed * dt;
    this.om = damp(this.om, Math.abs(angDiff(yaw0, this.yaw)) / Math.max(dt, .001), 8, dt); this.g.rotation.y = this.yaw;
    /* ---- gait: each foot is planted for `duty` of the cycle and travels exactly as far as the body moved, so nothing slides ---- */
    const ve = Math.max(this.speed, Math.min(.45, this.om * .17)), run = clamp((this.speed - 1.9) / .8, 0, 1), w = this.gw = clamp(ve / .45, 0, 1), amp = k * lerp(.34, .44, run) * clamp(ve / 1.2, 0, 1.12) ** .7, duty = lerp(.62, .45, run), sw = w * clamp(amp / (.3 * k), 0, 1.2);
    if (amp > .003) this.ph = (this.ph + dt * ve * duty / (2 * amp)) % 1;
    for (let i = 0; i < 2; i++) {
      const p = (this.ph + i * .5) % 1, G = this.gf[i]; let z, y = 0, pt;
      if (p < duty) { const u = p / duty; z = amp * (1 - 2 * u); pt = -.28 * (1 - smooth(clamp(u / .16, 0, 1))) + .78 * smooth(clamp((u - .6) / .4, 0, 1)); }
      else { const u = (p - duty) / (1 - duty); z = amp * (2 * smooth(u) - 1); y = Math.sin(PI * u) * k * lerp(.05, .16, run); pt = lerp(.78, -.28, smooth(clamp(u * 1.3, 0, 1))); }
      G[0] = z; G[1] = y * w; G[2] = pt * sw;
    }
    /* ---- target pose ---- */
    qNeutral(q); ad.fill(0); this.speak = 0; this.yawn = 0;
    for (let i = 0; i < 2; i++) { const P = this.arm[i].prop, H = P && HOLD[P.kind]; this.held[i] = H ? 1 : 0; if (H) qArm(q, i, ...H); }
    const moving = this.path.length > 0 || this.speed > .25, act = talking ? (this.seat ? this.act : 'watch') : moving && !this.carry ? 'stand' : this.act;
    (ACT[act] || ACT.stand)(this, q, ad, t, W); if (this.carry) ACT.carry(this, q);
    if (talking) { this.talkE = damp(this.talkE || 0, W.speaking ? 1 : 0, 5, dt); if (this.talkE > .02) talkArms(this, q, ad, t, this.talkE); this.speak = W.speaking ? 1 : 0; if (!W.speaking) ad[9] += .025 * Math.max(0, Math.sin(t * 1.3)) * Math.sin(t * 7); }
    /* weight shifts from foot to foot */
    if ((this.wsT -= dt) < 0) { this.wsT = rand(3, 9); this.wsG = this.seat || act === 'crouch' ? 0 : pick([-1, -.6, .6, 1, 0]); }
    this.ws = damp(this.ws, moving ? 0 : this.wsG, 1.6, dt); const ws = this.ws, aw = Math.abs(ws);
    q[0] += ws * .036 * k; q[1] -= aw * .012 * k; q[5] += -ws * .05; q[8] += ws * .06; q[11] += -ws * .02; q[QF + (ws > 0 ? 1 : 5)] += aw * .05 * k; q[QF + (ws > 0 ? 0 : 4)] += (ws > 0 ? -1 : 1) * aw * .02 * k;
    /* fidgets */
    const free = (ARMFREE[act] ?? 0) & ~(this.held[0] | this.held[1] * 2) | 0, calm = !moving && !talking && !this.carry && (act in ARMFREE);
    if (this.fid) { const f = this.fid, a = (this.fidA += dt), e = smooth(clamp(Math.min(a / .45, (f[2] - a) / .5), 0, 1)); if (a > f[2] || !calm) this.fid = null; else f[3](this, q, ad, e, t); }
    else if (calm && (this.fidT -= dt) < 0) { this.fidT = rand(3.5, 10); const f = pick(FIDGET); if ((f[1] & free) === f[1]) { this.fid = f; this.fidA = 0; } }
    /* nodding along to whatever the radio is playing */
    if (W.beat >= 0 && this.nodK && !moving && !talking) { const b = Math.sin(W.beat * TAU); ad[9] += .045 * b * this.nodK; q[QF + (this.L.seed % 2 ? 2 : 6)] += .16 * Math.max(0, b) * this.nodK; }
    /* ---- where the eyes go ---- */
    let lk = talking ? W.cam : this.look || this.ao.look || null, lw = lk ? 1 : 0;
    if (!lk) { if ((this.gzT -= dt) < 0) { this.gzT = rand(2.5, 8); const r = Math.random(), near = W.list.filter(o => o !== this && o.g.visible && o.g.position.distanceTo(g) < 9); this.glance = r < W.camLook ? W.cam : r < .55 && near.length ? pick(near) : r < .8 && W.poi ? W.poi : null; this.gzD = rand(1.2, 3.2); } if (this.glance && (this.gzD -= dt) > 0) { lk = this.glance; lw = moving ? .5 : .85; } }
    let hy = q[10], hpch = q[9], eyY = 0, eyP = 0;
    if (lk) {
      const tp = lk.isVector3 ? lk : lk.g ? _v4.set(lk.g.position.x, lk.g.position.y + lk.eyeY, lk.g.position.z) : _v4.set(lk.x, lk.y, lk.z), dx = tp.x - g.x, dz = tp.z - g.z, rel = angDiff(this.yaw + c[4] + c[7], Math.atan2(dx, dz));
      if (Math.abs(rel) < 1.9) { const yw = clamp(rel, -1.15, 1.15), pc = clamp(Math.atan2(g.y + this.eyeY + c[1] - tp.y, Math.hypot(dx, dz)), -.65, .7); hy = lerp(hy, yw * .82, lw); hpch = lerp(hpch, pc * .9 - c[6] * .7, lw); q[7] += yw * .16 * lw; eyY = clamp(yw - c[10], -.45, .45) * lw; eyP = clamp(pc - c[9] - c[6], -.3, .3) * lw; }
    }
    q[10] = hy; q[9] = hpch;
    /* ---- blend, then add what must not be smoothed (gait, breath, tremors) ---- */
    for (let i = 0; i < NQ; i++) c[i] = damp(c[i], q[i], i < 6 ? 5 : i < 9 ? 6 : i < 12 ? 8 : i < QF ? 7.5 : 6, dt);
    const s2 = Math.sin(TAU * this.ph), c2 = Math.cos(TAU * this.ph), br = Math.sin(t * 1.55 + this.L.seed);
    ad[1] -= k * (.03 + .03 * run) * sw * (.5 + .5 * Math.cos(2 * TAU * this.ph)); ad[0] -= .02 * k * sw * Math.sin(TAU * this.ph + .2); ad[4] += .09 * sw * c2; ad[5] -= .045 * sw * s2; ad[7] -= .15 * sw * c2; ad[8] += .035 * sw * s2; ad[6] += .03 * sw + .13 * run + br * .008; ad[10] += .06 * sw * c2; ad[9] -= br * .006;
    for (let i = 0; i < 2; i++) { const b = QA + i * 6, fr = 1 - this.held[i] * .85 - (this.carry ? 1 : 0); if (fr <= 0) continue; ad[b] += (i ? 1 : -1) * (.3 + .4 * run) * sw * c2 * fr; ad[b + 3] += ((.08 + .95 * run) * sw + .1 * sw * Math.max(0, (i ? 1 : -1) * c2)) * fr; ad[b + 1] += br * .006; }
    this.pose();
    /* ---- face ---- */
    if (this.eye) {
      if ((this.blinkT -= dt) < 0) { this.blinkT = Math.random() < .2 ? .28 : rand(1.6, 5.5); this.bl = 0; }
      this.bl += dt; const b = this.bl, lid = Math.max(b < .07 ? b / .07 : b < .11 ? 1 : Math.max(0, 1 - (b - .11) / .12), this.yawn * .8);
      if ((this.scT -= dt) < 0) { this.scT = rand(.5, 2.4); this.scY = rand(-.14, .14); this.scP = rand(-.07, .07); }
      this.eY = damp(this.eY || 0, lk ? eyY : this.scY, 22, dt); this.eP = damp(this.eP || 0, lk ? eyP : this.scP, 22, dt);
      for (const E of this.eye) { E.pv.rotation.set(this.eP, this.eY, 0); E.lp.rotation.x = lerp(-.34 + this.eP * .7, 1.02, lid); }
      const m = !this.speak ? 0 : vox.busy() ? Math.min(1.1, vox.level() * 1.7) : Math.max(0, Math.sin(t * 13.1) * .6 + Math.sin(t * 7.3 + 1) * .5); this.mo = damp(this.mo || 0, Math.max(m, this.yawn * 1.6), 26, dt);
      this.mouth.scale.set(1 - this.mo * .12, 1 + this.mo * 2.2, 1); this.mouth.position.y = this.mouthP.y - this.mo * .002 * this.he;
      this.brow.position.y = this.browY + (this.speak ? .0028 * Math.max(0, Math.sin(t * 1.9 + this.L.seed)) : 0) * this.he + this.yawn * .002 + (lid > .5 ? -.0008 : 0);
    }
    if (this.mask) { this.maskK = damp(this.maskK, act === 'crouch' || act === 'weld' ? 1 : 0, 6, dt); this.mask.rotation.x = -1.45 * (1 - this.maskK); }
    for (const A of this.arm) if (A.prop && A.prop.level) { A.hand.getWorldQuaternion(_q3); this.g.getWorldQuaternion(_q4); A.prop.g.quaternion.copy(_q3.invert()).multiply(_q4).multiply(A.prop.level); }
  },
});

/* ---- a room full of people: shared obstacles, personal space, and what there is to look at ---- */
class Crowd {
  constructor(o) { Object.assign(this, { list: [], circ: [], box: [], cam: V3(), talk: null, speaking: false, poi: null, beat: -1, camLook: 0, route: null }, o); }
  add(h) { this.list.push(h); h.W = this; return h; }
  remove(h) { const i = this.list.indexOf(h); if (i >= 0) this.list.splice(i, 1); }
  update(dt) {
    for (const h of this.list) {
      if (!h.g.visible) { h.dt = dt; if (h.co && h.co.next().done) h.co = h.brain ? h.brain(h, this) : null; continue; }
      const p = h.g.position; h.steer = 0; h.slow = 1; h.ghost = Math.max(0, h.ghost - dt);
      if (h.speed > .05) {
        if (!h.ghost) for (const o of this.list) {
          if (o === h || !o.g.visible || Math.abs(o.g.position.y - p.y) > 1) continue; const dx = o.g.position.x - p.x, dz = o.g.position.z - p.z, d = Math.hypot(dx, dz); if (d > 1.5 || d < .001) continue;
          const rel = angDiff(h.yaw, Math.atan2(dx, dz)); if (Math.abs(rel) < 1.2) { h.steer -= Math.sign(rel || 1) * (1.5 - d) * .9; if (d < .8) h.slow = Math.min(h.slow, .35 + d * .5); }
          if (d < .56) { const push = (.56 - d) * (o.speed > .05 ? .5 : 1); p.x -= dx / d * push; p.z -= dz / d * push; }
        }
        const solid = !h.deck && !h.nc && !h.ghost;
        if (solid) for (const [cx, cz, r] of this.circ) { const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < r + .3 && d > .001) { p.x += dx / d * (r + .3 - d); p.z += dz / d * (r + .3 - d); } if (d < r + 1.2) { const rel = angDiff(h.yaw, Math.atan2(-dx, -dz)); if (Math.abs(rel) < 1) h.steer -= Math.sign(rel || 1) * (r + 1.2 - d) * .8; } }
        if (solid) for (const [x0, z0, x1, z1] of this.box) if (p.x > x0 - .3 && p.x < x1 + .3 && p.z > z0 - .3 && p.z < z1 + .3) {   /* pushed out of the nearest face, and nudged along it so walkers slide round corners */
          const a = p.x - x0 + .3, b = x1 + .3 - p.x, c = p.z - z0 + .3, d = z1 + .3 - p.z, m = Math.min(a, b, c, d), sl = dt * .9; if (m === a || m === b) { p.x = m === a ? x0 - .3 : x1 + .3; p.z += (c < d ? -sl : sl); } else { p.z = m === c ? z0 - .3 : z1 + .3; p.x += (a < b ? -sl : sl); }
        }
        h.steer = clamp(h.steer, -1.1, 1.1);
      }
      h.update(dt, this); if (this.clampFn) this.clampFn(h); if (this.groundY && !h.deck) p.y = damp(p.y, this.groundY(p.x, p.z), 14, dt);
    }
  }
}
/* ---- scripting people: generators stepped once a frame read like a to-do list ---- */
function* hGo(h, x, z, o = {}) {
  if (h.seat) { h.seat = null; h.setAct('stand'); yield* hWait(h, .7); } h.run = !!o.run; h.nc = !!o.direct; h.path = h.W.route && !o.direct ? h.W.route(h.g.position.x, h.g.position.z, x, z, h) : [{ x, z }]; let stuck = 0, lx = h.g.position.x, lz = h.g.position.z;
  while (h.path.length) { yield; const p = h.g.position, m = Math.hypot(p.x - lx, p.z - lz); lx = p.x; lz = p.z; stuck = m < .12 * h.dt ? stuck + h.dt : 0; if (stuck > 2.5) { h.ghost = 2.5; stuck = 0; } } h.run = false; h.nc = false;
}
function* hWait(h, s) { let n = 0; while ((n += h.dt) < s) yield; }
function* hFace(h, yaw) { h.faceTo = yaw; let n = 0; while (h.faceTo !== null && (n += h.dt) < 3) yield; h.faceTo = null; }
function* hDo(h, act, s, o) { h.setAct(act, o); if (act === 'sit') h.seat = o; yield* hWait(h, s); }
/* walk to a spot, face it and work there for a while. A spot is { x, z, yaw, acts: [[act, min, max, opts]], look } */
function* hVisit(h, sp, n = 1) {
  sp.by = h; if (sp.via) { yield* hGo(h, sp.via[0], sp.via[1], { direct: h.g.position.y > .3 }); yield* hGo(h, sp.x, sp.z, { direct: true }); } else yield* hGo(h, sp.x, sp.z); yield* hFace(h, sp.yaw);
  for (let i = 0; i < n; i++) { const a = pick(sp.acts); yield* hDo(h, a[0], rand(a[1], a[2]), { look: sp.look, ...(a[3] || {}) }); }
  if (h.seat) { h.seat = null; h.setAct('stand'); yield* hWait(h, .8); } if (sp.via) yield* hGo(h, sp.via[0], sp.via[1], { direct: true }); sp.by = null;
}
function* hRoam(h, spots, n = 2) { let cur = null; for (;;) { const free = spots.filter(s => s !== cur && (!s.by || s.by === h)); if (!free.length) { yield* hDo(h, 'watch', 3); continue; } cur = pick(free); yield* hVisit(h, cur, 1 + (Math.random() * n | 0)); } }

