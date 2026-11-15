/* ============ PEOPLE: SCULPTING KIT (superellipse lofts merged into vertex-coloured body segments) ============ */
const _n3 = new THREE.Matrix3(), _c3 = new THREE.Color(), _c4 = new THREE.Color(), _v3 = V3(), _v4 = V3(), _q3 = new THREE.Quaternion(), _q4 = new THREE.Quaternion();
const TRS = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(_e3.set(rx, ry, rz)), V3(sx, sy, sz));
const PGEO = { s: new THREE.SphereGeometry(1, 12, 8), s2: new THREE.SphereGeometry(1, 18, 12), c: new THREE.CylinderGeometry(1, 1, 1, 10), dome: new THREE.SphereGeometry(1, 14, 5, 0, TAU, 0, PI / 2), tor: new THREE.TorusGeometry(1, .1, 5, 16), arc: new THREE.TorusGeometry(1, .06, 5, 16, PI) };
const tintC = (c, k) => new THREE.Color(c).multiplyScalar(k), mixC = (a, b, k) => new THREE.Color(a).lerp(_c4.set(b), k);
const linT = (T, y) => { let i = 0; while (i < T.length - 2 && y > T[i + 1][0]) i++; const a = T[i], b = T[i + 1]; return lerp(a[1], b[1], clamp((y - a[0]) / (b[0] - a[0]), 0, 1)); };

/* merges coloured, transformed primitives into one geometry: one draw call per body segment */
class Sculpt {
  constructor() { this.p = []; this.n = []; this.c = []; this.i = []; this.k = 0; }
  add(geo, col, m) {
    const P = geo.attributes.position, N = geo.attributes.normal, K = col == null ? geo.attributes.color : null, I = geo.index, b = this.k, fn = typeof col === 'function', flip = m && m.determinant() < 0; if (m) _n3.getNormalMatrix(m); if (!fn && !K) _c3.set(col);
    for (let i = 0; i < P.count; i++) {
      _v3.fromBufferAttribute(P, i); _v4.fromBufferAttribute(N, i); if (m) { _v3.applyMatrix4(m); _v4.applyMatrix3(_n3).normalize(); }
      if (fn) _c3.set(col(_v3)); else if (K) _c3.fromBufferAttribute(K, i); this.p.push(_v3.x, _v3.y, _v3.z); this.n.push(_v4.x, _v4.y, _v4.z); this.c.push(_c3.r, _c3.g, _c3.b);
    }
    const n = I ? I.count : P.count; for (let i = 0; i < n; i += 3) { const a = I ? I.getX(i) : i, c = I ? I.getX(i + 1) : i + 1, d = I ? I.getX(i + 2) : i + 2; flip ? this.i.push(b + a, b + d, b + c) : this.i.push(b + a, b + c, b + d); }
    this.k += P.count; return this;
  }
  rod(a, b, r, col, r2 = r) { _v3.subVectors(b, a); const l = _v3.length(); return this.add(PGEO.c, col, new THREE.Matrix4().compose(V3().addVectors(a, b).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(_Y, _v3.normalize()), V3(r, l, r2))); }
  geo() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setIndex(this.i); return g; }
}
/* a ring is [y, rx, rz, zc, n]: a superellipse of exponent n, half-widths rx/rz, centred zc along the body's front-back axis */
function hRing(R, y) {
  let i = 0; while (i < R.length - 2 && y > R[i + 1][0]) i++;
  const a = R[i], b = R[i + 1], p = R[Math.max(0, i - 1)], q = R[Math.min(R.length - 1, i + 2)], h = b[0] - a[0], t = clamp((y - a[0]) / h, 0, 1), t2 = t * t, t3 = t2 * t, o = [];
  for (let k = 1; k < 5; k++) {
    const df = k === 4 ? 2 : 0, A = a[k] ?? df, B = b[k] ?? df, m0 = (B - (p[k] ?? df)) / (b[0] - p[0]) * h, m1 = ((q[k] ?? df) - A) / (q[0] - a[0]) * h;
    o.push((2 * t3 - 3 * t2 + 1) * A + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * B + (t3 - t2) * m1);
  }
  o[0] = Math.max(o[0], .0006); o[1] = Math.max(o[1], .0006); o[3] = Math.max(o[3], 1.6); return o;
}
function hPt(r, a, off = 0, out = V3()) { const c = Math.cos(a), s = Math.sin(a), e = 2 / r[3], nx = c / r[0], nz = s / r[1], l = Math.hypot(nx, nz) || 1; return out.set(r[0] * Math.sign(c) * Math.abs(c) ** e + nx / l * off, 0, r[2] + r[1] * Math.sign(s) * Math.abs(s) ** e + nz / l * off); }
/* angle 0 = +X, PI/2 = front (+Z). o: { sub, y0, y1, ny, cov(y,v)→[a0,a1] (open shell), off | off(y,a,v,u,ring), cap (1 bottom | 2 top), cb, ct } */
function hLoft(R, seg = 14, o = {}) {
  const open = !!o.cov, cols = open ? seg + 1 : seg, cap = o.cap ?? (open ? 0 : 3), ys = [], pos = [], idx = [];
  if (o.y0 === undefined && o.y1 === undefined) { const sb = o.sub || 3; for (let i = 0; i < R.length - 1; i++) for (let j = 0; j < sb; j++) ys.push(lerp(R[i][0], R[i + 1][0], j / sb)); ys.push(R[R.length - 1][0]); }
  else { const y0 = o.y0 ?? R[0][0], y1 = o.y1 ?? R[R.length - 1][0], ny = o.ny || Math.max(1, Math.round((y1 - y0) / (R[R.length - 1][0] - R[0][0]) * (R.length - 1) * (o.sub || 3))); for (let i = 0; i <= ny; i++) ys.push(lerp(y0, y1, i / ny)); }
  const ny = ys.length - 1;
  for (let i = 0; i <= ny; i++) {
    const v = i / ny, y = ys[i], r = hRing(R, y), cv = open ? o.cov(y, v) : null;
    for (let j = 0; j < cols; j++) { const u = j / seg, a = open ? lerp(cv[0], cv[1], u) : u * TAU; hPt(r, a, typeof o.off === 'function' ? o.off(y, a, v, u, r) : o.off || 0, _v3); pos.push(_v3.x, y, _v3.z); }
  }
  for (let i = 0; i < ny; i++) for (let j = 0; j < seg; j++) { const a = i * cols + j, b = i * cols + (j + 1) % cols, c = a + cols, d = b + cols; idx.push(a, c, b, b, c, d); }
  const fan = (row, y, up) => { const c = pos.length / 3; pos.push(0, y, hRing(R, ys[row])[2]); for (let j = 0; j < seg; j++) { const a = row * cols + j, b = row * cols + (j + 1) % cols; up ? idx.push(c, b, a) : idx.push(c, a, b); } };
  if (cap & 1) fan(0, ys[0] - (o.cb || 0), false); if (cap & 2) fan(ny, ys[ny] + (o.ct || 0), true);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* a limb hangs from its joint (y = 0) down to -len, with round ends so that neighbouring segments blend at the joint */
const hLimb = (r0, r1, len, mid = [], ez = 1) => [[-len - r1 * .96, r1 * .28], [-len - r1 * .7, r1 * .72], [-len - r1 * .36, r1 * .94], [-len, r1], ...mid, [0, r0], [r0 * .36, r0 * .94], [r0 * .7, r0 * .72], [r0 * .96, r0 * .28]].map(([y, r, zc = 0]) => [y, r, r * ez, zc, 2]);
const hPatch = (R, y0, y1, a0, a1, off, seg = 8, x = {}) => hLoft(R, seg, { y0, y1, ny: Math.max(1, Math.round((y1 - y0) / .028)), cov: () => [a0, a1], off, ...x });

/* ============ PEOPLE: LOOKS + OUTFITS ============ */
const BUILDS = {
  avg: { sw: .196, ww: .134, wd: .1, cd: .114, hw: .16, hd: .11, bl: 0, bu: 0, lk: 1, jaw: 1.06 },
  broad: { sw: .214, ww: .148, wd: .11, cd: .126, hw: .168, hd: .118, bl: .01, bu: 0, lk: 1.13, jaw: 1.12 },
  heavy: { sw: .206, ww: .166, wd: .134, cd: .13, hw: .18, hd: .13, bl: .04, bu: 0, lk: 1.16, jaw: 1.1 },
  lean: { sw: .184, ww: .12, wd: .09, cd: .104, hw: .15, hd: .104, bl: 0, bu: 0, lk: .9, jaw: 1 },
  slim: { sw: .168, ww: .11, wd: .086, cd: .1, hw: .164, hd: .108, bl: 0, bu: .012, lk: .85, jaw: .9 },
  curvy: { sw: .176, ww: .122, wd: .094, cd: .108, hw: .178, hd: .118, bl: .004, bu: .016, lk: .93, jaw: .92 },
};
/* the same seeded draws as drawFace(), so the portrait on the screen and the figure in the room are one person */
function lookOf(seed, o = {}) {
  const R = mulberry(seed * 31 + 7), pk = a => a[(R() * a.length) | 0];
  const skin = pk(['#f1c9a5', '#e0ac69', '#c68642', '#8d5524', '#5a3825', '#ffdbac']), hair = pk(['#1b1b1b', '#3b2416', '#7a4a1e', '#b8b8b8', '#c9a24a', '#7a1e1e', '#e8e8e8']), st = (R() * 5) | 0, uni = pk(['#2b3138', '#3a2f2a', '#1f2f3a', '#3a3a2a']);
  const fw = (14 + R() * 3) / 15.5, fh = (17 + R() * 3) / 18.5; R(); R(); const bt = R() * 2 - 1, xt = R(), Q = mulberry(seed * 97 + 3), beard = xt < .22;
  const build = o.build || (beard ? ['avg', 'broad', 'lean', 'heavy'] : ['avg', 'broad', 'lean', 'slim', 'curvy', 'heavy', 'slim', 'avg'])[(Q() * (beard ? 4 : 8)) | 0], small = build === 'slim' || build === 'curvy';
  return { seed, skin, hair, st, uni, fw: lerp(1, fw, .7), fh: lerp(1, fh, .6), bt, beard, glasses: xt >= .22 && xt < .42, headset: xt >= .42 && xt < .6, scar: xt >= .6 && xt < .7, build, h: (small ? 1.6 : 1.7) + Q() * (small ? .13 : .2), eye: ['#3b2a1a', '#2a1c10', '#4a3a22', '#3f5f7a', '#4f6b4a', '#59626b'][(Q() * 6) | 0], Q, ...o };
}
const OUTFIT = {
  officer: (L, c) => ({ top: L.uni, bot: tintC(L.uni, .62), collar: 'stand', zip: 1, hem: 1, epaul: c, patch: c, cuff: 1, tape: 1 }),
  analyst: (L, c) => ({ top: mixC(L.uni, '#3d4b5c', .35), bot: '#1d2126', collar: 'fold', zip: 1, hem: 1, pocket: 1, patch: c, tape: 1, watch: 1 }),
  tech: (L, c) => ({ top: mixC(L.uni, '#5a4a2a', .35), bot: mixC(L.uni, '#5a4a2a', .35), sleeves: 1, collar: 'fold', zip: 1, pouch: 1, pocket: 1, patch: c, tape: 1, rag: 1 }),
  pilot: (L, c) => { const su = ['#46505a', '#55573f', '#5c4b3a', '#3f4d47'][L.seed % 4]; return { top: su, bot: su, collar: 'ring', harness: 1, pads: 1, gloves: '#16171a', tall: 1, patch: c, tape: 1, unit: 1, stripe: c }; },
  ops: (L, c) => ({ top: '#2b3947', bot: '#1c2128', collar: 'fold', zip: 1, hem: 1, pocket: 1, patch: c, tape: 1, watch: 1 }),
  suit: (L, c) => ({ top: L.uni, bot: tintC(L.uni, .7), collar: 'fold', hem: 1, zip: 1, epaul: L.seed % 3 ? null : c, patch: c }),
  mech: (L, c) => {
    const Q = L.Q, cov = ['#a8551d', '#27405f', '#565c63', '#4b5933', '#74302a', '#3d3f45'][(Q() * 6) | 0], hat = ['hard', 'hard', 'hard', 'cap', 'beanie', null][(Q() * 6) | 0];
    return { top: cov, bot: cov, sleeves: (Q() * 3) | 0, collar: 'fold', zip: 1, pouch: Q() < .7, pocket: 1, gloves: Q() < .65 ? '#2a2c2f' : null, vest: Q() < .55 ? (Q() < .6 ? '#e06a16' : '#c9d223') : null, hat, hatCol: hat === 'hard' ? ['#d9a316', '#d8d8d2', '#cf5a18', '#2f6fb0'][(Q() * 4) | 0] : hat === 'cap' ? ['#1f2a36', '#6d2a22', '#2f3a2a'][(Q() * 3) | 0] : '#3a3f47', ear: Q() < .3, tall: 1, knee: Q() < .4 };
  },
};

/* ============ PEOPLE: BODY BUILDER ============ */
const HUM = {
  mat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .82, metalness: .02, envMapIntensity: .14, side: THREE.DoubleSide }),
  blob: new THREE.MeshBasicMaterial({ map: labelTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(.55, 'rgba(0,0,0,.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }), transparent: true, depthWrite: false, opacity: .55, polygonOffset: true, polygonOffsetFactor: -2 }),
  blobG: new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), hitG: new THREE.CylinderGeometry(.38, .38, 1.85, 8), hitM: new THREE.MeshBasicMaterial({ visible: false }),
  /* hologram: one clean rim-lit layer with scan lines instead of a stack of additive shells */
  holo: new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(0x4fd8ff) }, uT: { value: 0 }, uOp: { value: 1 } }, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `varying vec3 vN;varying vec3 vV;varying float vY;void main(){vec4 wp=modelMatrix*vec4(position,1.);vY=wp.y;vN=normalize(mat3(modelMatrix)*normal);vV=cameraPosition-wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
    fragmentShader: `uniform vec3 uCol;uniform float uT;uniform float uOp;varying vec3 vN;varying vec3 vV;varying float vY;void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));float scan=.72+.28*sin(vY*170.-uT*7.);float bar=smoothstep(.985,1.,sin(vY*2.4+uT*1.9));gl_FragColor=vec4(uCol*((.2+1.25*pow(f,1.5))*scan*uOp+bar*.45),1.);}`
  }),
};
const NQ = 34, QA = 12, QF = 24;   // pose vector: 0-2 pelvis offset, 3-5 pelvis pitch/yaw/roll, 6-8 spine, 9-11 head, 12-23 arms (swing, abduct, twist, elbow, wrist, pronate) ×2, 24-31 feet (x, z, pitch, lift) ×2
const qArm = (q, i, sw, ab, tw, el, wr = 0, pr = 0) => { const b = QA + i * 6; q[b] = sw; q[b + 1] = ab; q[b + 2] = tw; q[b + 3] = el; q[b + 4] = wr; q[b + 5] = pr; };
const qNeutral = q => { q.fill(0); qArm(q, 0, .03, .07, .18, .2, .06); qArm(q, 1, .03, .07, .18, .2, .06); };

class Human {
  /* L: look (lookOf). o: { role, col, x, y, z, yaw, holo, far, scene, props: { r, l } } — index 0 is the figure's right side (-X), 1 its left */
  constructor(L, o = {}) {
    this.L = L; this.o = o; this.far = !!o.far; this.holo = !!o.holo; const k = this.k = L.h / 1.78, B = BUILDS[L.build], col = o.col || '#ffb21a', acc = tintC(col, .42);
    const F = this.fit = { boot: '#101114', sole: '#060607', belt: '#0c0c0e', ...(OUTFIT[o.role] || OUTFIT.suit)(L, acc), ...(o.fit || {}) };
    const sk0 = new THREE.Color(L.skin), skK = lerp(.8, .46, clamp((sk0.r * .3 + sk0.g * .6 + sk0.b * .1) * 1.5, 0, 1));
    const C = this.C = { skin: sk0.multiplyScalar(skK), hair: new THREE.Color(L.hair).multiplyScalar(.8), top: new THREE.Color(F.top), bot: new THREE.Color(F.bot), boot: new THREE.Color(F.boot), eye: new THREE.Color(L.eye) }; C.blush = new THREE.Color(C.skin).multiply(_c4.setRGB(1.1, .78, .76)); C.lip = mixC(C.skin, '#7a2f2c', .45);
    const mat = this.holo ? HUM.holo : HUM.mat, geos = this.geos = [], mesh = (p, S, m = mat) => { const g = S.geo ? S.geo() : S; geos.push(g); const x = new THREE.Mesh(g, m); x.castShadow = !this.holo; x.receiveShadow = !this.holo; p.add(x); return x; };
    const sw = B.sw * k, ww = B.ww * k, wd = B.wd * k, cd = B.cd * k, hw = B.hw * k, hd = B.hd * k, bl = B.bl * k, bu = B.bu * k, lk = B.lk * k, cl = 1.09;
    const L1 = this.L1 = .44 * k, L2 = this.L2 = .42 * k, AH = this.AH = .085 * k, A1 = .285 * k, A2 = .255 * k; this.hipY = L1 + L2 + AH; this.hipW = .09 * k * B.hw / .16; this.eyeY = this.hipY + (.16 + .475 + .066) * k;
    const g = this.g = grp(o.scene, o.x || 0, o.y || 0, o.z || 0); this.yaw = o.yaw || 0; g.rotation.y = this.yaw;
    const hips = this.hips = grp(g, 0, this.hipY, 0); hips.rotation.order = 'YXZ'; const spine = this.spine = grp(hips, 0, .16 * k, 0); spine.rotation.order = 'YXZ';

    /* ---- torso ---- */
    const CH = [[-.06 * k, ww * .86, wd * .84, 0, 2.3], [0, ww, wd + bl * .6, bl * .5, 2.3], [.09 * k, ww * 1.06, wd * 1.05 + bl, bl * .6 + .004 * k, 2.3], [.19 * k, sw * .9, cd + bu * .6, .01 * k + bu, 2.4], [.27 * k, sw * .98, cd, .008 * k, 2.5], [.33 * k, sw * .93, cd * .87, 0, 2.4], [.366 * k, sw * .6, cd * .66, -.006 * k, 2.2], [.392 * k, .064 * k, .064 * k, -.008 * k, 2], [.43 * k, .051 * k, .054 * k, -.004 * k, 2], [.5 * k, .047 * k, .05 * k, .004 * k, 2]];
    const cs = new Sculpt(), FR = PI / 2, BK = -PI / 2, dk = tintC(C.top, .6), lt = tintC(C.top, 1.22), cp = (y, a, off) => hPt(hRing(CH, y * k), a, off * k).setY(y * k);
    cs.add(hLoft(CH, 16, { sub: 3 }), p => p.y > .388 * k ? C.skin : C.top);
    if (F.collar === 'stand') cs.add(hPatch(CH, .372 * k, .432 * k, FR + .32, FR + TAU - .32, .008 * k, 14), lt);
    if (F.collar === 'fold') cs.add(hPatch(CH, .35 * k, .402 * k, FR + .28, FR + TAU - .28, (y, a, v) => (.006 + .009 * v) * k, 14), lt);
    if (F.collar === 'ring') { cs.add(hPatch(CH, .378 * k, .41 * k, 0, TAU, .017 * k, 14), '#6c727a'); cs.add(hPatch(CH, .388 * k, .4 * k, 0, TAU, .021 * k, 14), '#2a2d31'); }
    if (F.zip) cs.add(hPatch(CH, .005 * k, .365 * k, FR - .04, FR + .04, .0035 * k, 1), dk);
    if (F.pocket) { cs.add(hPatch(CH, .205 * k, .262 * k, FR - .95, FR - .4, .005 * k, 3), dk); cs.add(hPatch(CH, .25 * k, .266 * k, FR - .97, FR - .38, .008 * k, 3), tintC(C.top, .8)); }
    if (F.epaul) for (const s of [-1, 1]) { cs.add(UB, dk, TRS(s * sw * .8, .352 * k, -.004 * k, 0, 0, -s * .2, .1 * k, .014 * k, .058 * k)); cs.add(UB, F.epaul, TRS(s * sw * .86, .361 * k, -.004 * k, 0, 0, -s * .2, .022 * k, .006 * k, .06 * k)); }
    if (F.vest) {
      const st = '#dfe4e6', vc = F.vest; cs.add(hPatch(CH, .0, .352 * k, FR + .17, FR + TAU - .17, .013 * k, 18), vc); cs.add(hPatch(CH, .072 * k, .104 * k, FR + .17, FR + TAU - .17, .016 * k, 18), st);
      for (const a of [FR - .62, FR + .62, BK - .62, BK + .62]) cs.add(hPatch(CH, .104 * k, .348 * k, a - .1, a + .1, .016 * k, 2), st);
    }
    if (F.harness) {
      const hc = '#131417'; for (const a of [FR - .52, FR + .52, BK - .52, BK + .52]) cs.add(hPatch(CH, .0, .362 * k, a - .075, a + .075, .011 * k, 2), hc);
      cs.add(hPatch(CH, .2 * k, .23 * k, 0, TAU, .012 * k, 16), hc); const b = cp(.215, FR, .016); cs.add(UB, '#8a9098', TRS(b.x, b.y, b.z, 0, 0, 0, .034 * k, .034 * k, .012 * k));
    }
    if (F.unit) { const b = cp(.275, FR - .62, .02); cs.add(UB, '#23262b', TRS(b.x, b.y, b.z, 0, .5, 0, .075 * k, .05 * k, .026 * k)); }
    mesh(spine, cs);
    if (!this.holo && F.tape) { const a = new Sculpt(); a.add(hPatch(CH, .246 * k, .262 * k, FR + .4, FR + .86, .0075 * k, 3), '#000'); if (F.unit) { const b = cp(.275, FR - .62, .034); a.add(UB, '#000', TRS(b.x, b.y, b.z, 0, .5, 0, .04 * k, .008 * k, .004 * k)); } this.glow = mesh(spine, a, glowMat(new THREE.Color(col).getHex(), 1.5)); this.glow.castShadow = false; }

    /* ---- pelvis ---- */
    const PV = [[-.118 * k, .03 * k, .03 * k, 0, 2], [-.1 * k, hw * .46, hd * .56, -.006 * k, 2.1], [-.055 * k, hw * .9, hd * .8, -.01 * k, 2.3], [0, hw, hd * .96, -.012 * k, 2.4], [.06 * k, hw * .96, hd, -.004 * k, 2.4], [.13 * k, ww * 1.02, wd * 1.03 + bl * .7, bl * .5, 2.3], [.19 * k, ww * .97, wd * .97, 0, 2.3]];
    const ps = new Sculpt(), pp = (y, a, off) => hPt(hRing(PV, y * k), a, off * k).setY(y * k); ps.add(hLoft(PV, 24, { sub: 3 }), C.bot);
    if (F.hem) ps.add(hPatch(PV, .028 * k, .19 * k, 0, TAU, .0075 * k, 16), C.top);
    if (F.vest) ps.add(hPatch(PV, .1 * k, .19 * k, FR + .17, FR + TAU - .17, .0135 * k, 18), F.vest);
    ps.add(hPatch(PV, .122 * k, .158 * k, 0, TAU, (F.hem ? .0125 : .0085) * k, 16), F.belt); { const b = pp(.14, FR, F.hem ? .016 : .012); ps.add(UB, F.pouch ? '#6f6a5e' : '#a8935a', TRS(b.x, b.y, b.z, 0, 0, 0, .034 * k, .028 * k, .008 * k)); }
    if (F.pouch) for (const [a, w, h, c] of [[FR - 1.25, .07, .095, '#3d2f1e'], [FR + 1.2, .06, .08, '#3d2f1e'], [BK + .55, .08, .07, '#2c2a26'], [BK - .7, .035, .13, '#55595e']]) { const b = pp(.105, a, .03); ps.add(UB, c, TRS(b.x, b.y - h * k * .2, b.z, 0, PI / 2 - a, 0, w * k, h * k, .04 * k)); }
    if (F.rag) { const b = pp(.09, BK + 1.0, .02); ps.add(UB, '#8a2f24', TRS(b.x, b.y - .05 * k, b.z, .1, PI / 2 - (BK + 1), .15, .05 * k, .13 * k, .012 * k)); }
    mesh(hips, ps);

    /* ---- legs ---- */
    const thR = hLimb(.089 * lk * cl, .057 * lk * cl, L1, [[-.2 * k, .075 * lk * cl, .004 * k]]), shR = hLimb(.057 * lk * cl, (F.tall ? .05 : .046) * lk * cl, L2, [[-.3 * k, .052 * lk * cl], [-.13 * k, .06 * lk * cl, -.007 * k]]), bootY = -L2 * (F.tall ? .5 : .78);
    const foot = new Sculpt(); foot.add(hLoft([[-.08, .018, .02, -.03], [-.066, .037, .042, -.045], [-.03, .045, .052, -.052, 2.6], [.03, .049, .045, -.045, 2.8], [.09, .052, .036, -.036, 3], [.15, .049, .029, -.029, 3], [.185, .036, .024, -.025, 2.6], [.198, .015, .014, -.02]].map(r => [r[0] * k, r[1] * k, r[2] * k, r[3] * k, r[4] || 2.2]), 12, { sub: 2 }), p => p.y < -.069 * k ? F.sole : C.boot, TRS(0, -AH, 0, PI / 2, 0, 0));
    const footG = foot.geo(); geos.push(footG);
    this.leg = [-1, 1].map(s => {
      const th = grp(hips, s * this.hipW, 0, 0), ts = hLoftC(thR, 18, C.bot); th.rotation.order = 'ZXY'; if (F.pouch || F.knee) ts.add(hPatch(thR, -L1 * .62, -L1 * .34, (s > 0 ? 0 : PI) - .5, (s > 0 ? 0 : PI) + .5, .007 * k, 3), tintC(C.bot, .8)); if (F.stripe) ts.add(hPatch(thR, -L1 * .92, -L1 * .12, (s > 0 ? 0 : PI) - .16, (s > 0 ? 0 : PI) + .16, .004 * k, 1), F.stripe); mesh(th, ts);
      const kn = grp(th, 0, -L1, 0), sh = new Sculpt(); sh.add(hLoft(shR, 12, { sub: 2 }), p => p.y < bootY ? C.boot : C.bot); sh.add(hPatch(shR, bootY - .012 * k, bootY + .02 * k, 0, TAU, .006 * k, 12), tintC(C.boot, 1.5));
      if (F.pads || F.knee) sh.add(hPatch(shR, -.085 * k, .04 * k, FR - 1.05, FR + 1.05, (y, a, v, u) => .013 * k * Math.min(1, Math.sin(u * PI) * 2.5), 6), '#17181b');
      mesh(kn, sh); const ft = grp(kn, 0, -L2, 0), fm = new THREE.Mesh(footG, mat); fm.castShadow = !this.holo; ft.add(fm); return { th, kn, ft, s };
    });

    /* ---- arms + hands ---- */
    const uaR = hLimb(.05 * lk * cl, .043 * lk * cl, A1), faR = hLimb(.042 * lk * (F.sleeves ? 1 : cl), .031 * lk * (F.sleeves ? 1 : 1.06), A2, [[-.075 * k, .044 * lk * (F.sleeves ? 1 : cl)]]), gl = F.gloves ? new THREE.Color(F.gloves) : null;
    this.arm = [-1, 1].map((s, i) => {
      const sh = grp(spine, s * sw, .33 * k, -.004 * k); sh.rotation.order = 'XZY'; const ua = new Sculpt(), out = s > 0 ? 0 : PI;
      ua.add(hLoft(uaR, 10, { sub: 2 }), F.sleeves === 2 ? p => p.y < -A1 * .5 ? C.skin : C.top : C.top); if (F.sleeves === 2) ua.add(hPatch(uaR, -A1 * .53, -A1 * .44, 0, TAU, .006 * k, 10), lt);
      if (F.patch && !(F.vest && 0)) ua.add(hPatch(uaR, -.125 * k, -.06 * k, out - .55, out + .55, .0045 * k, 3), F.patch);
      if (F.vest) ua.add(hPatch(uaR, -.035 * k, .03 * k, 0, TAU, .012 * k, 10), F.vest);
      mesh(sh, ua); const el = grp(sh, 0, -A1, 0), fa = new Sculpt();
      fa.add(hLoft(faR, 10, { sub: 2 }), p => gl && p.y < -A2 * .7 ? gl : F.sleeves ? C.skin : C.top);
      if (F.sleeves === 1) fa.add(hPatch(faR, -.045 * k, .022 * k, 0, TAU, .009 * k, 10), lt); if (!F.sleeves && F.cuff) fa.add(hPatch(faR, -A2 + .005 * k, -A2 + .04 * k, 0, TAU, .005 * k, 10), dk);
      if (F.watch && s > 0) fa.add(hPatch(faR, -A2 + .008 * k, -A2 + .03 * k, 0, TAU, .006 * k, 10), '#0e0f11');
      mesh(el, fa); const hand = grp(el, 0, -A2, 0); hand.rotation.order = 'YZX';
      const prop = o.props && o.props[i ? 'l' : 'r'], hs = new Sculpt(), hc = gl || C.skin, hk = k * 1.1, grip = prop ? (prop === 'tablet' || prop === 'clip' ? .35 : 1) : 0, mir = s < 0 ? new THREE.Matrix4().makeScale(-1, 1, 1) : new THREE.Matrix4();
      const fg = (M, r, l) => hs.add(hLoft(hLimb(r, r * .86, l), 6, { sub: 1 }), hc, mir.clone().multiply(M));
      hs.add(PGEO.s, hc, mir.clone().multiply(TRS(0, -.046 * hk, .002 * hk, 0, 0, 0, .017 * hk, .046 * hk, .038 * hk)));
      for (let f = 0; f < 4; f++) { const z = (.028 - f * .0185) * hk, y = [-.08, -.086, -.083, -.074][f] * hk, l1 = [.036, .04, .037, .03][f] * hk, l2 = [.03, .033, .03, .025][f] * hk, r = [.0088, .0092, .0087, .0078][f] * hk, M1 = TRS(-.003 * hk, y, z, 0, 0, -(.28 + grip * 1.05) - f * .06 * (1 - grip)); fg(M1, r, l1); fg(M1.clone().multiply(TRS(0, -l1, 0, 0, 0, -(.4 + grip * 1.05))), r * .9, l2); }
      const T1 = TRS(-.004 * hk, -.022 * hk, .03 * hk, -.8, 0, -.3 - grip * .5); fg(T1, .0105 * hk, .034 * hk); fg(T1.clone().multiply(TRS(0, -.034 * hk, 0, -.2 - grip * .4, 0, -.25 - grip * .4)), .0095 * hk, .028 * hk);
      mesh(hand, hs); return { sh, el, hand, s, prop: prop ? this.mkProp(prop, hand, s, hk, mesh) : null };
    });

    /* ---- head ---- */
    this.buildHead(mesh, mat, col);

    /* ---- grounding ---- */
    if (!this.holo) { const b = this.blobM = new THREE.Mesh(HUM.blobG, HUM.blob); b.scale.setScalar(.95 * k); b.position.y = .02; b.renderOrder = 1; g.add(b); }
    const hit = this.hit = new THREE.Mesh(HUM.hitG, HUM.hitM); hit.position.y = .93; hit.userData.p = this; g.add(hit);
    this.q = new Float32Array(NQ); this.c = new Float32Array(NQ); this.ad = new Float32Array(NQ); qNeutral(this.c);
    Object.assign(this, { path: [], speed: 0, vmax: 1.12 + L.Q() * .16, ph: Math.random(), om: 0, faceTo: null, act: 'stand', at: 0, ao: {}, t: rand(50), fid: null, fidT: rand(2, 7), fidA: 0, ws: 0, wsG: 0, wsT: rand(2, 6), blinkT: rand(1, 4), lid: 0, gz: [0, 0, 0, 0, rand(.5, 2)], look: null, lookW: 0, talk: 0, speak: 0, hold: 0, hy: 0, co: null, dt: 0, seat: null, nodK: L.Q() < .45 ? 1 : 0, habit: ['stand', 'hips', 'cross', 'stand', 'back'][(L.Q() * 5) | 0], gf: [[0, 0, 0], [0, 0, 0]], gw: 0, held: [0, 0], steer: 0, slow: 1, ghost: 0, gzT: rand(1, 4), gzD: 0, glance: null, scT: 0, scY: 0, scP: 0, bl: 1, carry: false, run: false, lane: [0, 0] });
    this.pose(0);
  }
  buildHead(mesh, mat, col) {
    const L = this.L, C = this.C, F = this.fit, k = this.k, fh = L.fh, fw = L.fw, jw = BUILDS[L.build].jaw, e = this.he = k * 1.13, far = this.far || this.holo, S = new Sculpt(), FR = PI / 2, BK = -PI / 2;
    const HR = [[0, .026 * jw, .024, .047, 2.2], [.016, .046 * jw, .048, .027, 2.3], [.045, .06 * jw, .074, .008, 2.4], [.08, .068, .088, 0, 2.3], [.118, .073, .095, -.004, 2.2], [.155, .075, .099, -.008, 2.1], [.19, .071, .096, -.012, 2], [.22, .058, .08, -.016, 2], [.238, .036, .05, -.018, 2], [.246, .012, .018, -.018, 2]].map(r => [r[0] * fh, r[1] * fw, r[2], r[3], r[4]]);
    const piv = .058 * fh, MH = TRS(0, -piv * e, .004 * e, 0, 0, 0, e), M = m => MH.clone().multiply(m), top = HR[HR.length - 1][0];
    const sx = (y, x, off = 0) => { const r = hRing(HR, y), c = clamp(Math.abs(x) / r[0], 0, 1) ** (r[3] / 2); return hPt(r, Math.acos(c * Math.sign(x || 1)), off).setY(y); };
    const ey = .121 * fh, ex = .0315 * fw, er = .0155, ez = sx(ey, ex).z - .0185;
    const skinF = p => { const y = p.y / e + piv, x = Math.abs(p.x) / e, w = p.z > 0 ? Math.exp(-(((x - .042) / .02) ** 2 + ((y - .078 * fh) / .02) ** 2)) * .34 : 0; const so = p.z > 0 ? Math.exp(-(((x - ex) / .021) ** 2 + ((y - ey) / .015) ** 2)) : 0; return _c4.copy(C.skin).lerp(C.blush, w).multiplyScalar((1 - .22 * so) * lerp(.8, 1, clamp(y / .05, 0, 1))); };
    S.add(hLoft(HR, 20, { sub: 3, off: (y, a, v, u, r) => { if (Math.sin(a) <= 0) return 0; const c = Math.cos(a), x = Math.abs(r[0] * Math.abs(c) ** (2 / r[3])); return -.0075 * Math.exp(-(((x - ex) / .019) ** 2 + ((y - ey) / .0135) ** 2)) + .002 * Math.exp(-(((y - .149 * fh) / .009) ** 2)) * (x < .055 ? 1 : 0); } }), skinF, MH);
    const lidC = tintC(C.skin, .86), eyes = [];
    for (const s of [-1, 1]) {
      S.add(PGEO.s, tintC(C.skin, .9), M(TRS(s * (hRing(HR, ey)[0] + .0015), ey - .004, -.014, 0, -s * .42, 0, .0105, .029, .019)));
      S.add(PGEO.s2, '#b4b1ab', M(TRS(s * ex, ey, ez, 0, 0, 0, er * 1.14, er * .92, er))); S.add(PGEO.dome, lidC, M(TRS(s * ex, ey, ez, PI + .66, 0, 0, er * 1.18 * 1.07, er * .92 * 1.07, er * 1.07)));
      if (far) { S.add(PGEO.s, C.eye, M(TRS(s * ex, ey, ez + er * .56, 0, 0, 0, .0105, .0105, .0072))); S.add(PGEO.dome, lidC, M(TRS(s * ex, ey, ez, -.3, 0, 0, er * 1.18 * 1.08, er * .92 * 1.08, er * 1.08))); }
      eyes.push(V3(s * ex, ey, ez).applyMatrix4(MH));
    }
    const nc = mixC(C.skin, C.blush, .3); S.add(PGEO.s, nc, M(TRS(0, .1 * fh, sx(.1 * fh, 0).z + .0005, -.34, 0, 0, .0112, .027, .0145))); S.add(PGEO.s, nc, M(TRS(0, .088 * fh, sx(.088 * fh, 0).z + .0038, 0, 0, 0, .0138, .0096, .0115)));
    /* brows + mouth: separate, animated meshes up close; baked into the head at a distance */
    const brow = new Sculpt(), mouth = new Sculpt(), by = .1475 * fh, my = .056 * fh, bz = sx(by, .03 * fw).z, mz = sx(my, 0).z + (L.beard ? .0085 : .001), bc = L.st === 4 && !L.beard ? tintC(C.skin, .42) : tintC(C.hair, .55);
    for (const s of [-1, 1]) brow.add(PGEO.s, bc, TRS(s * .031 * fw * e, 0, 0, 0, s * .4, s * (.1 + L.bt * .2), .0185 * e, .0054 * e, .0066 * e));
    mouth.add(PGEO.s, '#3a1512', TRS(0, 0, 0, 0, 0, 0, .0185 * e, .0036 * e, .004 * e)); mouth.add(PGEO.s, C.lip, TRS(0, .0044 * e, -.0012 * e, 0, 0, 0, .0195 * e, .0034 * e, .0046 * e)); mouth.add(PGEO.s, C.lip, TRS(0, -.0048 * e, -.0014 * e, 0, 0, 0, .0165 * e, .0042 * e, .005 * e));
    const bP = V3(0, by, bz + .0025).applyMatrix4(MH), mP = V3(0, my, mz).applyMatrix4(MH);
    if (far) { S.add(brow.geo(), null, TRS(bP.x, bP.y, bP.z)); S.add(mouth.geo(), null, TRS(mP.x, mP.y, mP.z)); }
    /* hair */
    const hat = F.hat, st = hat && (L.st === 2 || L.st === 3) ? 0 : L.st, crop = [[.04, .45], [.07, 1], [.1, 1.36], [.138, 1.5], [.152, 1.9], [.172, 2.35], [.19, 2.9], [.2, 3.15]], bob = [[.06, 1.15], [.1, 1.72], [.15, 2.02], [.175, 2.4], [.193, 3.15]];
    const hairF = c0 => { const c = new THREE.Color(c0); return p => _c4.copy(c).multiplyScalar(lerp(.72, 1.18, clamp((p.y / e + piv) / (.25 * fh), 0, 1))); };
    const cap = (T, y0, base, crown, c) => S.add(hLoft(HR, 22, { y0: y0 * fh, y1: top, ny: 15, cap: 2, ct: .003 + crown * .4, cov: y => { const w = Math.min(PI, linT(T, y / fh)); return [BK - w, BK + w]; }, off: (y, a, v, u) => (base + (crown - base) * smooth(clamp((y / fh - .12) / .09, 0, 1))) * (linT(T, y / fh) >= PI - .02 ? 1 : Math.min(1, Math.sin(u * PI) * 3.2)) * Math.min(1, v * 6 + .12) }), hairF(c), MH);
    if (st === 0) cap(crop, .04, .008, .016, C.hair);
    if (st === 1) { cap(bob, .06, .013, .022, C.hair); S.add(hLoft([[-.05, .05, .03, -.056, 2.5], [-.02, .078, .052, -.05, 2.6], [.03, .088, .074, -.037, 2.5], [.09, .09, .089, -.027, 2.3], [.14, .084, .094, -.021, 2.2]].map(r => [r[0] * fh, r[1] * fw, r[2], r[3], r[4]]), 16, { sub: 2, cb: .004 }), hairF(C.hair), MH); }
    if (st === 2) cap(crop, .04, .003, .004, mixC(C.skin, C.hair, .55));
    if (st === 2 && L.top2) { cap([[.178, 2.2], [.19, 3.15], [.25, 3.15]], .178, .01, L.top2 === 'flat' ? .02 : .016, C.hair); if (L.top2 === 'quiff') S.add(PGEO.s, C.hair, M(TRS(0, .232 * fh, .052, -.5, 0, 0, .05, .026, .042))); }
    if (st === 2 && !L.top2) { for (let i = 0; i < 9; i++) { const t = i / 8, fr = t < .42, y = fr ? lerp(.2, .244, t / .42) : lerp(.244, .13, (t - .42) / .58), p = hPt(hRing(HR, y * fh), fr ? FR : BK).setY(y * fh), n = _v.set(0, p.y - .13 * fh, p.z + .01).normalize(); S.add(PGEO.s, C.hair, M(TRS(p.x, p.y, p.z, Math.atan2(n.z, n.y), 0, 0, .013, .03 - Math.abs(t - .4) * .012, .026))); } }
    if (st === 3) { cap(crop, .04, .008, .013, C.hair); S.add(PGEO.s, C.hair, M(TRS(0, .238 * fh, -.064, 0, 0, 0, .037, .034, .037))); }
    if (st === 4 && L.seed % 2) cap(crop, .04, .0025, .003, mixC(C.skin, C.hair, .3));
    if (L.beard) { const TB = [[0, 1.5], [.03, 1.8], [.06, 1.95], [.1, 1.72]]; S.add(hLoft(HR, 18, { y0: .0005, y1: .1 * fh, ny: 9, cap: 1, cb: .007, cov: y => { const w = linT(TB, y / fh); return [FR - w, FR + w]; }, off: (y, a, v, u) => { const da = Math.abs(a - FR), yt = da < .4 ? .081 : da < 1.2 ? lerp(.081, .058, clamp((da - .4) / .4, 0, 1)) : lerp(.058, .1, clamp((da - 1.2) / .5, 0, 1)); return lerp(-.006, .0085, clamp((yt - y / fh) / .01, 0, 1)) * Math.min(1, Math.sin(u * PI) * 3); } }), tintC(C.hair, .92), MH); }
    if (L.scar) S.add(UB, '#8a3d36', M(TRS(ex + .006, ey + .002, sx(ey, ex + .006).z - .004, 0, .3, .3, .0025, .05, .004)));
    /* things worn on the head */
    const frame = this.holo ? '#fff' : hat ? '#22252a' : col, band = (c, ry, cup, both) => {
      S.add(PGEO.arc, c, M(TRS(0, ey, -.012, 0, 0, 0, .079 * fw + .012, (top - ey) + ry, .08)));
      for (const s of both ? [-1, 1] : [1]) S.add(PGEO.c, c, M(TRS(s * (.079 * fw + .006), ey - .004, -.012, 0, 0, PI / 2, cup, .02, cup)));
    };
    if (L.glasses) { const gz = sx(ey, ex).z + .004; for (const s of [-1, 1]) { S.add(PGEO.tor, frame, M(TRS(s * ex, ey - .001, gz, 0, 0, 0, .019, .0155, .019))); S.add(UB, frame, M(TRS(s * (hRing(HR, ey)[0] + .001), ey, gz - .05, 0, 0, 0, .003, .004, .095))); } S.add(UB, frame, M(TRS(0, ey + .002, gz, 0, 0, 0, .014, .0032, .0032))); }
    if (L.headset || F.headset) { band('#15171a', .019, .026, F.headset); const a = V3(.079 * fw + .012, ey - .012, 0).applyMatrix4(MH), b = V3(.04, my - .004, mz + .016).applyMatrix4(MH); S.rod(a, b, .0032 * e, '#15171a'); S.add(PGEO.s, this.holo ? '#fff' : col, TRS(b.x, b.y, b.z, 0, 0, 0, .0075 * e)); }
    if (F.ear) band('#c23a1c', .03, .034, true);
    if (hat === 'hard') { S.add(hLoft(HR, 20, { y0: .163 * fh, y1: top, ny: 8, cap: 2, ct: .012, off: .017 }), F.hatCol, MH); S.add(hLoft([[.16 * fh, .101 * fw, .128, .008, 2.1], [.169 * fh, .098 * fw, .124, .008, 2.1]], 20, { sub: 1 }), tintC(F.hatCol, .9), MH); S.add(UB, tintC(F.hatCol, .85), M(TRS(0, top + .012, -.016, 0, 0, 0, .016, .012, .15))); }
    if (hat === 'cap') { S.add(hLoft(HR, 20, { y0: .158 * fh, y1: top, ny: 8, cap: 2, ct: .006, off: .009 }), F.hatCol, MH); S.add(hLoft([[.166 * fh, .068, .062, .112, 2.3], [.173 * fh, .066, .06, .11, 2.3]], 14, { sub: 1 }), tintC(F.hatCol, .8), M(TRS(0, .012, -.006, .14, 0, 0))); }
    if (hat === 'beanie') { S.add(hLoft(HR, 20, { y0: .14 * fh, y1: top, ny: 9, cap: 2, ct: .012, off: .013 }), F.hatCol, MH); S.add(hLoft(HR, 20, { y0: .14 * fh, y1: .166 * fh, ny: 2, cap: 0, off: .018 }), tintC(F.hatCol, 1.35), MH); }
    const head = this.head = grp(this.spine, 0, .475 * k, -.004 * k); head.rotation.order = 'YXZ'; mesh(head, S); this.eyeL = eyes; this.mouthP = mP; this.headTop = (top - piv) * e;
    if (!far) {
      this.brow = mesh(head, brow); this.brow.position.copy(bP); this.brow.castShadow = false; this.browY = bP.y;
      this.mouth = mesh(head, mouth); this.mouth.position.copy(mP); this.mouth.castShadow = false;
      const ig = new Sculpt(), lg = new Sculpt(), r = er * e; ig.add(PGEO.s, C.eye, TRS(0, 0, r * .56, 0, 0, 0, .0106 * e, .0106 * e, .0072 * e)); ig.add(PGEO.s, '#06070a', TRS(0, 0, r * .56 + .0056 * e, 0, 0, 0, .0052 * e, .0052 * e, .003 * e)); ig.add(PGEO.s, '#d8d8d8', TRS(.0036 * e, .004 * e, r * .56 + .0068 * e, 0, 0, 0, .002 * e));
      lg.add(PGEO.dome, tintC(C.skin, .84), TRS(0, 0, 0, 0, 0, 0, r * 1.14 * 1.085, r * .92 * 1.085, r * 1.085)); lg.add(PGEO.tor, tintC(C.hair, .3), TRS(0, 0, 0, PI / 2, 0, 0, r * 1.14 * 1.1, r * 1.1, r * .92 * 1.1)); const iG = ig.geo(), lG = lg.geo(); this.geos.push(iG, lG);
      this.eye = eyes.map(p => { const pv = grp(head, p.x, p.y, p.z), ir = new THREE.Mesh(iG, mat), lp = grp(head, p.x, p.y, p.z), ld = new THREE.Mesh(lG, mat); pv.add(ir); lp.add(ld); lp.rotation.x = -.34; return { pv, lp }; });
    }
    if (F.mask) { const ms = new Sculpt(); ms.add(hLoft(HR, 12, { y0: -.012, y1: .2 * fh, ny: 7, cov: () => [FR - 1.25, FR + 1.25], off: .03 }), '#1b1d21', TRS(0, -.15 * fh * e, 0, 0, 0, 0, e)); const w = sx(ey, 0, .034); ms.add(UB, '#0a2a2e', TRS(0, (ey - .15 * fh) * e, w.z * e, 0, 0, 0, .085 * e, .03 * e, .006 * e)); this.mask = grp(head, 0, (.15 * fh - piv) * e, .004 * e); mesh(this.mask, ms); this.mask.rotation.x = -1.45; this.maskK = 0; }
  }
  /* props ride in the hand; "level" props keep their own orientation relative to the body (a mug stays upright, a tablet faces its reader) */
  mkProp(kind, hand, s, hk, mesh) {
    const S = new Sculpt(), g = grp(hand, -s * .02 * hk, -.07 * hk, .012 * hk), P = { kind, g, level: null };
    if (kind === 'tablet' || kind === 'clip') {
      const cl = kind === 'clip'; S.add(UB, cl ? '#6a5236' : '#16181c', TRS(0, 0, 0, 0, 0, 0, .2, .012, .27)); S.add(UB, cl ? '#e9e4d6' : '#0b1418', TRS(0, .007, cl ? -.01 : 0, 0, 0, 0, cl ? .17 : .178, .003, cl ? .22 : .245)); if (cl) S.add(UB, '#9aa0a6', TRS(0, .012, .118, 0, 0, 0, .09, .012, .022));
      g.position.set(-s * .03 * hk, -.075 * hk, .06 * hk); P.level = new THREE.Quaternion().setFromEuler(_e3.set(-1.02, -s * .25, 0)); mesh(g, S);
      if (!cl && !this.holo) { const sc = new THREE.Mesh(UB, HUM.screen || (HUM.screen = glowMat(0x4fc8ff, .9))); sc.scale.set(.172, .002, .238); sc.position.y = .0092; g.add(sc); }
    } else if (kind === 'mug') { S.add(PGEO.c, '#d8d2c4', TRS(0, 0, 0, 0, 0, 0, .037, .09, .037)); S.add(PGEO.c, '#2a1a10', TRS(0, .041, 0, 0, 0, 0, .031, .01, .031)); S.add(PGEO.tor, '#d8d2c4', TRS(0, 0, -.045, 0, PI / 2, 0, .026, .03, .026)); g.position.set(-s * .034 * hk, -.07 * hk, .02 * hk); P.level = new THREE.Quaternion(); mesh(g, S); }
    else if (kind === 'wrench') { S.add(UB, '#8d949c', TRS(0, 0, .11, 0, 0, 0, .014, .03, .3)); S.add(PGEO.tor, '#8d949c', TRS(0, 0, .28, PI / 2, 0, 0, .03, .03, .05)); g.rotation.set(.2, 0, 0); mesh(g, S); }
    else if (kind === 'torch') { S.add(PGEO.c, '#2b2e33', TRS(0, 0, .06, PI / 2, 0, 0, .017, .2, .017)); S.add(PGEO.c, '#b9bec4', TRS(0, -.02, .19, PI / 2 + .5, 0, 0, .008, .09, .008)); mesh(g, S); P.tip = grp(g, 0, -.045, .225); P.glow = new THREE.Mesh(PGEO.s, glowMat(0x9fdcff, 0)); P.glow.scale.setScalar(.022); P.tip.add(P.glow); }
    else if (kind === 'baton') { S.add(PGEO.c, '#1a1b1e', TRS(0, 0, .02, PI / 2, 0, 0, .017, .13, .017)); mesh(g, S); P.glow = new THREE.Mesh(PGEO.c, glowMat(0xff7a1a, .3)); P.glow.scale.set(.021, .34, .021); P.glow.rotation.x = PI / 2; P.glow.position.z = .25; g.add(P.glow); }
    return P;
  }
  dispose() { for (const g of this.geos) g.dispose(); if (this.glow) this.glow.material.dispose(); if (this.g.parent) this.g.parent.remove(this.g); }
}
const hLoftC = (R, seg, col) => new Sculpt().add(hLoft(R, seg, { sub: 2 }), col);

