/* ============ MECH ============ */
class Mech {
  constructor(cfg) {
    this.cfg = { ...cfg }; this.root = new THREE.Group(); this.mats = makeMats(cfg.paint || 0);
    this.gait = { phase: 0, amt: 0, turn: 0, eff: 0, dt: 0, t: 0 }; this.twist = 0; this.pitch = 0; this.t = rand(10); this.onStep = null; this.run = 1; this.build();
  }
  build() {
    const c = this.cfg, m = this.mats, S = this.slot = {};
    this.root.clear(); this.tick = [];
    S.legs = c.legs ? PARTS.legs[c.legs].build(m) : mechCradle(c); this.root.add(S.legs); this.legU = S.legs.userData; this.waist = this.legU.hip;
    S.torso = c.torso ? PARTS.torso[c.torso].build(m) : null; const a = S.torso && S.torso.userData, fit = (k, cat, side) => a && c[k] ? a[k].add(S[k] = PARTS[cat][c[k]].build(m, side)) : S[k] = null;
    if (S.torso) this.waist.add(S.torso); fit('head', 'head'); fit('armL', 'arm', -1); fit('armR', 'arm', 1); fit('back', 'back');
    this.root.traverse(o => { if (o.userData.tick) this.tick.push(o); });
    this.legU.onStep = L => this.onStep && this.onStep(L);
    this.stats = mechStats(c);
    this.root.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(this.root), inv = this.root.matrixWorld.clone().invert(); if (b.isEmpty()) b.set(V3(-2.5, 0, -2.5), V3(2.5, 6, 2.5)); else b.applyMatrix4(inv);
    this.height = b.max.y; this.radius = Math.max(b.max.x, -b.min.x, 2.5); this.chestY = this.height * .62; this.off = false; this.gait.sag = 0; mechZones(this);
    this.update(0);
  }
  setPaint(i) { this.cfg.paint = i; applyPaint(this.mats, i); }
  slotBox(slot) {
    this.root.updateMatrixWorld(true); const o = this.slot[slot], b = new THREE.Box3(); if (o) b.setFromObject(o); if (!b.isEmpty()) return b;
    const t = this.slot.torso, p = ((t && t.userData[slot]) || this.waist).getWorldPosition(V3()); return b.set(p.clone().addScalar(-1), p.clone().addScalar(1));   /* an empty mount: a small box where the part will go */
  }
  setJets(on) { const f = this.slot.back && this.slot.back.userData.flames; if (f) for (const x of f) x.visible = on; }
  update(dt) {
    this.t += dt; const g = this.gait, u = this.legU; g.dt = dt; g.t = this.t;
    const mag = Math.min(1.6, Math.max(Math.abs(g.amt), Math.abs(g.turn) * .5)), e = Math.sqrt(mag);
    g.eff = g.amt < -.02 ? -e : e;
    if (u.stride && mag > .012) g.phase = (g.phase + dt * e * this.stats.speed * this.run * u.duty / (u.stride * (g.sk || 1) * (this.run > 1 ? 1.25 : 1))) % 1;
    u.anim(g);
    this.waist.rotation.y = this.twist;
    for (const k of ['armL', 'armR']) { if (!this.slot[k]) continue; const a = this.slot[k].userData; a.recoil = damp(a.recoil, 0, 9, dt); a.fireT = Math.max(0, a.fireT - dt); a.pitch.rotation.x = -this.pitch - a.recoil * .05; a.pitch.position.z = -a.recoil * .35; }
    if (this.slot.torso) this.slot.torso.rotation.x = Math.sin(this.t * 1.7) * .006;
    for (const o of this.tick) o.userData.tick(dt, this.t, this);
  }
}

