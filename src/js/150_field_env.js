/* ============ FIELD: ENVIRONMENT (biomes, baked heightmap, colliders, weather) ============ */
const FD = { scene: new THREE.Scene(), size: 1000, k: 1, cols: [], ents: [], shots: [], beams: [], emit: [], wrecks: [], blips: [], t0: [], t1: [], tick: [], misc: [], trees: [], falling: [], tgrid: new Map(), grav: 24, coolK: 1, fogK: 1, sunK: 1, wx: null };
FD.camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .5, 1600);
FD.env = grp(FD.scene);
FD.fx = { spark: new Particles(FD.scene, 2600, true), smoke: new Particles(FD.scene, 1600, false), wx: new Particles(FD.scene, 3000, false) };
const hash2 = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), u), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), u), v); }
const HOME_PADS = [[0, 40, 85], [-170, -150, 48], [175, -70, 30], [40, -250, 55], [-210, 110, 30], [230, 170, 34]];   // flattened build sites [x,z,r]
const EV = { key: '', B: null, seed: 0, home: false, ox: 0, oz: 0, pads: HOME_PADS, padH: [], wl: null, cr: [], mood: null };

/* colliders {x,z,r | hw,hd, top} live in a coarse grid so rays and movement only test what is nearby */
const CG = new Map(), CS = 40, NOCOL = [];
const cgEach = (c, fn) => { const hw = (c.r ?? c.hw) + 7, hd = (c.r ?? c.hd) + 7; for (let i = Math.floor((c.x - hw) / CS); i <= Math.floor((c.x + hw) / CS); i++) for (let j = Math.floor((c.z - hd) / CS); j <= Math.floor((c.z + hd) / CS); j++) fn(i * 1024 + j); };
function addCol(c) { FD.cols.push(c); cgEach(c, k => { let a = CG.get(k); if (!a) CG.set(k, a = []); a.push(c); }); return c; }
function delCol(c) { if (!c) return; let i = FD.cols.indexOf(c); if (i >= 0) FD.cols.splice(i, 1); cgEach(c, k => { const a = CG.get(k); if (a && (i = a.indexOf(c)) >= 0) a.splice(i, 1); }); }
const nearCols = (x, z) => CG.get(Math.floor(x / CS) * 1024 + Math.floor(z / CS)) || NOCOL;
const circ = (x, z, r, top = 99) => addCol({ x, z, r, top }), rect = (x, z, hw, hd, top = 99) => addCol({ x, z, hw, hd, top });

/* heightmap: generated analytically per biome, baked to a grid, sampled bilinearly everywhere else */
let HN = 220, HM = new Float32Array((HN + 1) * (HN + 1));
function heightAt(x, z) {
  const fx = clamp((x / FD.size + .5) * HN, 0, HN - .001), fz = clamp((z / FD.size + .5) * HN, 0, HN - .001), i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, a = j * (HN + 1) + i;
  return lerp(lerp(HM[a], HM[a + 1], u), lerp(HM[a + HN + 1], HM[a + HN + 2], u), v);
}
function genRaw(x, z) {
  const B = EV.B, n = B.n, X = x + EV.ox, Zz = z + EV.oz;
  let h = vnoise(X * n[1] + 3, Zz * n[1] + 7) * n[0] + vnoise(X * n[3], Zz * n[3]) * n[2] + vnoise(X * n[5], Zz * n[5]) * n[4] + n[6];
  if (B.shape) h = B.shape(h, x, z, X, Zz);
  return h + smooth(clamp((Math.hypot(x, z) - 360 * FD.k) / 130, 0, 1)) * n[7];
}
function genH(x, z) {
  let h = genRaw(x, z); const Q = EV.pads;
  for (let i = 0; i < Q.length; i++) { const p = Q[i], d = Math.hypot(x - p[0], z - p[1]); if (d < p[2] * 1.9) h = lerp(EV.padH[i], h, smooth(clamp((d - p[2]) / (p[2] * .9), 0, 1))); }
  return h;
}
/* walkable floor: terrain, or the roof of a collider we are standing above */
function floorAt(p) {
  let g = heightAt(p.x, p.z);
  for (const c of nearCols(p.x, p.z)) { if (c.top > 90 || c.top > p.y + 1.2 || c.top < g) continue; if (c.r !== undefined ? (p.x - c.x) ** 2 + (p.z - c.z) ** 2 < c.r * c.r : Math.abs(p.x - c.x) < c.hw && Math.abs(p.z - c.z) < c.hd) g = c.top; }
  return g;
}

/* ---- persistent sky, lights, terrain mesh, liquids ---- */
{
  const sc = FD.scene, S = FD.size;
  sc.fog = new THREE.FogExp2(0xcfa77e, .0021); sc.background = new THREE.Color(0xcfa77e); sc.environment = ENV;
  FD.sunDir = V3(.45, .42, -.6).normalize();
  FD.sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 24, 14), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: { sun: { value: FD.sunDir }, hz: { value: new THREE.Color() }, zn: { value: new THREE.Color() }, sg: { value: new THREE.Color() }, st: { value: 0 }, sk: { value: 1 } },
    vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vP;uniform vec3 sun,hz,zn,sg;uniform float st,sk;float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 d=normalize(vP);float h=max(d.y,0.);vec3 c=mix(hz,zn,pow(h,.5));float s=max(dot(d,sun),0.);c+=(sg*pow(s,24.)*.5+vec3(1.,.95,.85)*pow(s,1200.)*9.)*sk;
if(st>0.){vec2 q=d.xz/(abs(d.y)+.35)*70.;vec2 f=fract(q)-.5;float r=h21(floor(q));c+=st*step(.955,r)*smoothstep(.16,0.,length(f))*(.5+2.5*fract(r*37.))*smoothstep(0.,.12,d.y);}
gl_FragColor=vec4(c,1.);}`
  })); FD.sky.frustumCulled = false; sc.add(FD.sky);
  const pt = labelTex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2ead8'); gr.addColorStop(.5, '#b9763c'); gr.addColorStop(1, '#1a0f0a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 22; i++) { g.fillStyle = `rgba(${pick([255, 120, 60])},${pick([220, 90, 40])},${pick([180, 60, 30])},.22)`; g.fillRect(0, rand(h), w, rand(2, 9)); } });
  FD.planet = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 20), new THREE.MeshBasicMaterial({ map: pt, fog: false })); FD.planet.position.set(-520, 430, -900); FD.planet.rotation.z = .4; FD.planet.visible = false; FD.sky.add(FD.planet);
  FD.hemi = new THREE.HemisphereLight(0xc4d6ee, 0x7a5c3c, 1.15); sc.add(FD.hemi);
  const sun = FD.sun = new THREE.DirectionalLight(0xffdfb5, 3.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .05;
  Object.assign(sun.shadow.camera, { left: -75, right: 75, top: 75, bottom: -75, near: 10, far: 420 }); sc.add(sun, sun.target);
  FD.lamp = new THREE.SpotLight(0xdfeaff, 0, 280, .5, .6, 1.25); sc.add(FD.lamp, FD.lamp.target);
  const rn = 1200, rgeo = new THREE.BufferGeometry(); rgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rn * 6), 3));
  FD.rain = new THREE.LineSegments(rgeo, new THREE.LineBasicMaterial({ color: 0xa8c0d0, transparent: true, opacity: .3, depthWrite: false })); FD.rain.frustumCulled = false; FD.rain.visible = false; sc.add(FD.rain); FD.rainP = Float32Array.from({ length: rn * 3 }, () => Math.random());
  const g = new THREE.PlaneGeometry(S, S, HN, HN); g.rotateX(-PI / 2); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  const gt = ctex(256, 256, (x, w, h) => { x.fillStyle = '#b9b9b9'; x.fillRect(0, 0, w, h); speckle(x, w, h, 9000, .1); for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(0,0,0,${rand(.03, .1)})`; x.beginPath(); x.arc(rand(w), rand(h), rand(1, 5), 0, TAU); x.fill(); } }, 110, 110);
  FD.ter = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, map: gt, roughness: .96, metalness: 0, envMapIntensity: .15 })); FD.ter.receiveShadow = true; FD.ter.frustumCulled = false; sc.add(FD.ter);
  const flatPlane = m => { const p = new THREE.Mesh(new THREE.PlaneGeometry(S * 1.4, S * 1.4), m); p.rotation.x = -PI / 2; p.visible = false; sc.add(p); return p; };
  FD.water = flatPlane(new THREE.MeshStandardMaterial({ color: 0x2f5a52, transparent: true, opacity: .8, roughness: .06, metalness: .35, envMapIntensity: .9 }));
  const lavaT = ctex(256, 256, (x, w, h) => {
    x.fillStyle = '#ff7a12'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { const lc = pick([[255, 214], [255, 130], [215, 70], [130, 24]]); x.fillStyle = `rgba(${lc[0]},${lc[1]},0,${rand(.2, .6)})`; x.beginPath(); x.ellipse(rand(w), rand(h), rand(8, 44), rand(5, 22), rand(PI), 0, TAU); x.fill(); }
    for (let i = 0; i < 50; i++) { x.fillStyle = `rgba(22,8,4,${rand(.5, .92)})`; x.beginPath(); x.ellipse(rand(w), rand(h), rand(8, 30), rand(6, 20), rand(PI), 0, TAU); x.fill(); }
  }, 30, 30);
  FD.lava = flatPlane(new THREE.MeshBasicMaterial({ map: lavaT })); FD.lava.material.color.setScalar(2.4);
}

/* the field comes in two sizes. An ordinary contract area is a kilometre across; a story theatre is STK times that, on a grid of about the same fineness.
   Everything that knew the old size reads FD.k: the rim of hills, where props may stand and how many, the edge units are held inside, the tactical map */
function fieldScale(k) {
  if (FD.k === k) return; FD.k = k; FD.size = 1000 * k; HN = k > 1 ? 480 : 220; HM = new Float32Array((HN + 1) * (HN + 1)); EV.home = false; MAPV.key = '';
  const g = new THREE.PlaneGeometry(FD.size, FD.size, HN, HN); g.rotateX(-PI / 2); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
  FD.ter.geometry.dispose(); FD.ter.geometry = g; FD.ter.material.map.repeat.set(110 * k, 110 * k); for (const p of [FD.water, FD.lava]) p.scale.set(k, k, 1); FD.lava.material.map.repeat.set(30 * k, 30 * k);
  FD.camera.far = k > 1 ? 3600 : 1600; FD.camera.updateProjectionMatrix();
}

/* ---- shared prop geometry + materials ---- */
const flatM = (c, o) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true, envMapIntensity: .1, ...o });
const EM = {
  rock: flatM(0x6a5b4c), bark: flatM(0x3b2a1c), pine: flatM(0x1f4424, { side: 2 }), jleaf: flatM(0x1f5a24), palm: flatM(0x417f2c, { side: 2 }), fern: flatM(0x2f6a28, { side: 2 }),
  ice: flatM(0xa9daf2, { roughness: .2, metalness: .1, emissive: 0x0e3a55, emissiveIntensity: .5 }), basalt: flatM(0x1d1a1b), moon: flatM(0x7b7b80), snow: flatM(0xd9e4ec),
  lamp: glowMat(0xffd9a0, 4), stone: std({ map: TX.concrete, color: 0x6f7a5a, roughness: .95 }), conc: std({ map: TX.concrete, color: 0x8a8378, roughness: .95 }),
};
const GEO = {};
{
  const up = (g, y) => { g.translate(0, y, 0); return g; }, lump = (g, k) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const s = 1 + (hash2(p.getX(i) * 9.1, p.getY(i) * 7.3 + p.getZ(i) * 3.7) - .5) * k; p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s); } g.computeVertexNormals(); return g; };
  GEO.rock = lump(new THREE.IcosahedronGeometry(1, 1), .5);
  GEO.spire = up(new THREE.ConeGeometry(1, 1, 5), .5);
  GEO.pineT = up(new THREE.CylinderGeometry(.25, .42, 3.4, 6), 1.7);
  GEO.pineL = new THREE.LatheGeometry([[0, 13], [1.7, 9.4], [.8, 9.4], [2.5, 6.1], [1.2, 6.1], [3.2, 2.6], [0, 2.6]].map(p => new THREE.Vector2(p[0], p[1])), 7);
  GEO.jT = up(new THREE.CylinderGeometry(.3, .55, 9.5, 6), 4.75);
  GEO.jL = lump(new THREE.IcosahedronGeometry(1, 1), .35); GEO.jL.scale(4.8, 2.5, 4.8); GEO.jL.translate(0, 10.8, 0);
  GEO.pT = up(new THREE.CylinderGeometry(.18, .32, 11, 5), 5.5);
  GEO.pL = up(new THREE.ConeGeometry(4.4, 1.6, 7, 1, true), 11.5);
  GEO.fern = new THREE.ConeGeometry(1.4, 1.5, 5, 1, true); GEO.fern.rotateX(PI); GEO.fern.translate(0, .7, 0);
  GEO.pole = up(new THREE.CylinderGeometry(.12, .2, 9, 5), 4.5);
  GEO.head = up(new THREE.BoxGeometry(1.8, .25, .6), 9);
}
const BLD = [[0x6b7078, '#ffd98a'], [0x4f555e, '#bfe2ff'], [0x7d7468, '#ffe9b8']].map(([wall, lit], n) => {
  const mk = em => ctex(128, 128, (g, w, h) => { g.fillStyle = em ? '#000' : '#b8b8b8'; g.fillRect(0, 0, w, h); if (!em) speckle(g, w, h, 900, .06); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const on = hash2(i * 3.1 + n * 17, j * 7.7 + n) < .3; if (em && !on) continue; g.fillStyle = on ? lit : '#0d1116'; g.fillRect(i * 16 + 3.5, j * 16 + 3, 9, 10); } });
  return std({ color: wall, map: mk(false), emissiveMap: mk(true), emissive: 0xffffff, emissiveIntensity: 1, metalness: .25, roughness: .7 });
});

/* ---- placement helpers ---- */
const _mx = new THREE.Matrix4(), _e3 = new THREE.Euler(), _s3 = V3(), _ax = V3(), _q2 = new THREE.Quaternion(), _Y = V3(0, 1, 0);
const at = (x, z, ry = 0) => grp(FD.env, x, heightAt(x, z), z, 0, ry, 0);
const tank = (x, z, r, h, mt) => { const t = at(x, z); cyl(t, mt, r, r, h + 4, 0, h / 2 - 2, 0, 0, 0, 0, 20); cyl(t, M.dark, r * 1.03, r * 1.03, .4, 0, h * .7, 0, 0, 0, 0, 20); cyl(t, M.girder, r * .3, r * 1.0, r * .35, 0, h + r * .17, 0, 0, 0, 0, 20); box(t, M.yellow, .25, h, .8, r + .1, h / 2, 0); circ(x, z, r + .6, t.position.y + h); };
const crates = (x, z, n, R) => { for (let i = 0; i < n; i++) { const cx = x + (R() - .5) * 14, cz = z + (R() - .5) * 14, s = 2.4 + R() * 1.4, k = at(cx, cz, R() * 3); box(k, [M.rust, M.blue, M.yellow, M.red][i % 4], s * 2.2, s, s, 0, s / 2 - .2, 0); box(k, M.dark, s * 2.24, s * .1, s * 1.03, 0, s * .9 - .2, 0); circ(cx, cz, s * 1.1, k.position.y + s); } };
function scatter(geo, mat, L, shadow = true) {
  const m = new THREE.InstancedMesh(geo, mat, Math.max(1, L.length)); m.count = L.length;
  L.forEach((o, i) => { _e3.set(o.rx || 0, o.ry || 0, o.rz || 0); m.setMatrixAt(i, _mx.compose(_v.set(o.x, o.y, o.z), _q.setFromEuler(_e3), _s3.set(o.sx, o.sy, o.sz))); });
  m.castShadow = shadow; m.receiveShadow = true; m.frustumCulled = false; FD.env.add(m); return m;
}
const freeXZ = (R, rm = 380, pad = 6, minY = -1e9) => { for (let k = 0; k < 30; k++) { const x = (R() - .5) * 2 * rm * FD.k, z = (R() - .5) * 2 * rm * FD.k; if (Math.hypot(x, z) > 415 * FD.k || EV.pads.some(p => Math.hypot(x - p[0], z - p[1]) < p[2] + pad)) continue; if (heightAt(x, z) < minY) continue; return [x, z]; } return null; };
function rocks(R, n, mat, bigP = .12, k = 1) {
  const L = []; n = Math.round(n * FD.k * FD.k); for (let i = 0; i < n; i++) { const p = freeXZ(R, 380, 6 + k * 4); if (!p) continue; const [x, z] = p, s = (R() < bigP ? 5 + R() * 8 : .8 + R() * 3) * k, y = heightAt(x, z); L.push({ x, y: y + s * .15, z, sx: s, sy: s * (.6 + R() * .6), sz: s, rx: R() * 3, ry: R() * 6, rz: R() * 3 }); if (s > 3) circ(x, z, s * .85, y + s * .7); }
  return scatter(GEO.rock, mat, L);
}
function spires(R, n, mat, h0, h1) {
  const L = []; n = Math.round(n * FD.k * FD.k); for (let i = 0; i < n; i++) { const p = freeXZ(R, 395, 8, (EV.wl ?? -99) + .5); if (!p) continue; const [x, z] = p, h = h0 + R() * R() * (h1 - h0), w = h * (.12 + R() * .1) + 1, y = heightAt(x, z); L.push({ x, y: y - 1, z, sx: w, sy: h, sz: w, rx: (R() - .5) * .3, ry: R() * 6, rz: (R() - .5) * .3 }); if (w > 2.2) circ(x, z, w * .6, y + h * .5); }
  return scatter(GEO.spire, mat, L);
}
/* trees: two instanced meshes sharing transforms; mechs shoulder them over */
function treeMx(it) {
  _q.setFromAxisAngle(_Y, it.ry); if (it.f > 0) { _q2.setFromAxisAngle(_ax.set(it.dz, 0, -it.dx), ease.in(Math.min(1, it.f)) * 1.48); _q.premultiply(_q2); }
  return _mx.compose(_v.set(it.x, it.y, it.z), _q, _s3.set(it.s, it.s, it.s));
}
function plant(R, n, tg, lg, tm, lm, s0, s1, dens = .34) {
  const items = [], minY = (EV.wl ?? -99) + .3, FK = FD.k; n = Math.round(n * FK * FK);
  for (let k = 0; k < n * 4 && items.length < n; k++) {
    const x = (R() - .5) * 820 * FK, z = (R() - .5) * 820 * FK; if (Math.hypot(x, z) > 408 * FK || vnoise(x * .012 + 9, z * .012) < dens || EV.pads.some(p => Math.hypot(x - p[0], z - p[1]) < p[2] + 3)) continue;
    const y = heightAt(x, z); if (y < minY) continue; items.push({ x, y: y - .3, z, s: s0 + R() * (s1 - s0), ry: R() * TAU, f: 0, i: items.length });
  }
  const G = new Map(); for (const it of items) { const k = FK > 1 ? Math.floor(it.x / 300) * 64 + Math.floor(it.z / 300) : 0; let a = G.get(k); if (!a) G.set(k, a = []); it.i = a.length; a.push(it); }
  for (const L of G.values()) {
    const set = { a: new THREE.InstancedMesh(tg, tm, L.length), b: new THREE.InstancedMesh(lg, lm, L.length) };
    for (const it of L) { it.set = set; const mx = treeMx(it); set.a.setMatrixAt(it.i, mx); set.b.setMatrixAt(it.i, mx); const k = Math.floor(it.x / 16) * 1024 + Math.floor(it.z / 16); let a = FD.tgrid.get(k); if (!a) FD.tgrid.set(k, a = []); a.push(it); }
    for (const m of [set.a, set.b]) { m.castShadow = m.receiveShadow = true; if (FK > 1) { m.computeBoundingSphere(); m.boundingSphere.radius += 16; } else m.frustumCulled = false; FD.env.add(m); }
    FD.trees.push(set);
  }
}
function building(x, z, w, h, d, mat) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  for (let i = 0; i < 24; i++) { const f = i >> 2; if (f === 2 || f === 3) uv.setXY(i, .02, .02); else uv.setXY(i, uv.getX(i) * (f < 2 ? d : w) / 24, uv.getY(i) * h / 24); }
  const m = new THREE.Mesh(g, mat), y = heightAt(x, z); m.position.set(x, y + h / 2 - 1, z); m.castShadow = m.receiveShadow = true; FD.env.add(m); rect(x, z, w / 2, d / 2, y + h - 1); return m;
}
/* ---- biomes: n = [amp1,freq1,amp2,freq2,amp3,freq3,base,rim]; pal = [flat, noise, steep, low]; wx = [name, fogK, sunK, particles] ---- */
const lowTint = (c, y, r, g, b, band = 1.6) => { if (EV.wl != null && y < EV.wl + band) c.lerp(_c1.setRGB(r, g, b), clamp((EV.wl + band - y) / band, 0, 1)); };
const BIOMES = {
  desert: {
    name: 'DESERT', css: '#e0a860', note: 'Open sightlines. Heat sinks run 10% hot.', n: [38, .0055, 10, .019, 1.5, .07, -20, 85], hi: 30, lo: -8, pal: [[.56, .42, .27], [.43, .36, .22], [.36, .3, .25], [.3, .26, .2]],
    sky: [[.82, .63, .45], [.2, .33, .55], [1, .75, .45]], fog: [0xcfa77e, .0021], hemi: [0xc4d6ee, 0x7a5c3c, 1.15], sun: [0xffdfb5, 3.4, [.45, .42, -.6]], wx: [['CLEAR', 1, 1, null], ['SANDSTORM', 2.6, .78, 'dust']], storm: ['SANDSTORM', 3.2, .7, 'dust'], cool: .9,
    props: R => { rocks(R, 230, EM.rock); rocks(R, 9, EM.rock, 1, 3); }
  },
  urban: {
    name: 'URBAN', css: '#b8a8d8', note: 'Dense city blocks. Buildings stop fire — and you.', n: [12, .004, 4, .02, .4, .07, -6, 60], hi: 40, lo: -30, pal: [[.3, .3, .31], [.25, .25, .26], [.28, .27, .26], [.2, .2, .2]],
    shape: (h, x, z) => h * smooth(clamp((Math.hypot(x, z) - 275 * FD.k) / 110, 0, 1)),
    tint: (c, x, y, z) => { if (Math.hypot(x, z) < 305 * FD.k) { const u = ((x % 64) + 64) % 64, v = ((z % 64) + 64) % 64; if (u < 15 || v < 15) c.setRGB(.1, .1, .11); else c.setRGB(.33, .33, .32); } },
    sky: [[.75, .42, .3], [.16, .16, .34], [1, .6, .35]], fog: [0x8a6f78, .0026], hemi: [0x9aa4c8, 0x3a3238, .85], sun: [0xffb890, 2.7, [-.6, .24, -.5]], wx: [['DUSK', 1, .62, null], ['NIGHT RAIN', 1.5, .14, 'rain']], storm: ['DOWNPOUR', 2.2, .3, 'rain'],
    props: R => {
      const L = [];
      const nb = Math.ceil(5 * FD.k);
      for (let i = -nb; i < nb; i++) for (let j = -nb; j < nb; j++) {
        const bx = i * 64 + 39.5, bz = j * 64 + 39.5, d = Math.hypot(bx, bz); if (d > 300 * FD.k) continue;
        L.push({ x: i * 64 + 16, y: heightAt(i * 64 + 16, j * 64 + 16), z: j * 64 + 16, sx: 1, sy: 1, sz: 1, ry: (i + j) * Z });
        if (EV.pads.some(p => Math.hypot(bx - p[0], bz - p[1]) < p[2] + 37) || R() < .1) continue;
        const tall = (14 + R() * R() * 95) * clamp(1.25 - d / (330 * FD.k), .3, 1);
        if (R() < .5) building(bx, bz, 30 + R() * 16, tall, 30 + R() * 16, BLD[(R() * 3) | 0]);
        else for (const s of [-1, 1]) building(bx + s * 12.5, bz, 19 + R() * 4, tall * (.5 + R() * .8), 28 + R() * 18, BLD[(R() * 3) | 0]);
      }
      scatter(GEO.pole, M.girder, L); scatter(GEO.head, EM.lamp, L, false); rocks(R, 30, EM.conc, 0);
    }
  },
  forest: {
    name: 'FOREST', css: '#7fc46a', note: 'Tall conifers break line of sight. Lakes cool a hot reactor.', n: [30, .006, 9, .02, 1.5, .07, -12, 90], hi: 26, lo: -9, pal: [[.2, .3, .13], [.27, .31, .14], [.33, .31, .28], [.2, .2, .12]],
    shape: h => Math.max(h, -17), tint: (c, x, y) => lowTint(c, y, .36, .32, .2), wl: -13, liq: 'water', wcol: 0x2a4a4c,
    sky: [[.7, .8, .86], [.22, .42, .7], [1, .9, .7]], fog: [0xa9c2c4, .003], hemi: [0xbcd4ee, 0x3c4a2c, 1.05], sun: [0xfff0d0, 3.0, [.5, .55, .4]], wx: [['CLEAR', 1, 1, null], ['DAWN FOG', 2.3, .62, null]], storm: ['GROUND FOG', 3, .6, null], cool: 1.05,
    props: R => { plant(R, 1500, GEO.pineT, GEO.pineL, EM.bark, EM.pine, .8, 1.7); rocks(R, 90, EM.rock, .1); }
  },
  jungle: {
    name: 'JUNGLE', css: '#3fd08a', note: 'Thick canopy and a river. Humid air: cooling −20%.', n: [26, .006, 12, .022, 2, .08, -8, 80], hi: 30, lo: -6, pal: [[.16, .27, .09], [.22, .3, .1], [.3, .27, .2], [.22, .2, .1]],
    shape: (h, x, z) => { const r = Math.abs(z - 70 * Math.sin(x * .009) - 28 * Math.sin(x * .023 + 2)); return Math.max(lerp(h, Math.min(h, -15), smooth(clamp(1 - r / 55, 0, 1))), -16.5); },
    tint: (c, x, y) => lowTint(c, y, .34, .27, .14, 2.2), wl: -12.5, liq: 'water', wcol: 0x3d5a34,
    sky: [[.72, .82, .7], [.3, .5, .55], [1, .95, .7]], fog: [0x86a890, .0052], hemi: [0xc0e0c8, 0x2c3c1c, 1.1], sun: [0xfff2c0, 2.8, [-.35, .7, .3]], wx: [['HUMID', 1, .95, null], ['MONSOON', 1.45, .5, 'rain']], storm: ['MONSOON', 1.9, .4, 'rain'], cool: .8,
    props: R => {
      plant(R, 1100, GEO.jT, GEO.jL, EM.bark, EM.jleaf, .8, 1.5, .3); plant(R, 520, GEO.pT, GEO.pL, EM.bark, EM.palm, .8, 1.4, .22);
      const L = []; for (let i = 0; i < 1300 * FD.k * FD.k; i++) { const p = freeXZ(R, 400, 2, EV.wl + .2); if (p) L.push({ x: p[0], y: heightAt(p[0], p[1]), z: p[1], sx: 1 + R(), sy: .8 + R() * 1.2, sz: 1 + R(), ry: R() * 6 }); } scatter(GEO.fern, EM.fern, L, false);
      const t = freeXZ(R, 260, 40, EV.wl + 3); if (t) { const g = at(t[0], t[1]); for (let i = 0; i < 4; i++) { const w = 46 - i * 10; box(g, EM.stone, w, 6.4, w, 0, i * 6 + 3, 0); rect(t[0], t[1], w / 2, w / 2, g.position.y + i * 6 + 6); } box(g, EM.stone, 8, 7, 8, 0, 27.4, 0); noShadow(box(g, M.amber, 2, 3, .2, 0, 26.5, 4.05)); FD.blips.push([t[0], t[1], 'TEMPLE']); }
      rocks(R, 50, EM.rock, .08);
    }
  },
  glacial: {
    name: 'GLACIAL', css: '#9fdcff', note: 'Ice shelves and whiteouts. Bitter cold: cooling +50%.', n: [34, .005, 10, .018, 1, .07, -14, 100], hi: 60, lo: -99, pal: [[.86, .9, .95], [.74, .82, .9], [.45, .56, .7], [.6, .8, .9]], rough: .62,
    shape: h => Math.max(lerp(h, Math.round(h / 8) * 8, .4), -11), tint: (c, x, y) => { if (y < -10.85) c.setRGB(.5, .74, .9); },
    sky: [[.8, .88, .96], [.25, .45, .78], [1, .95, .9]], fog: [0xd3e2ee, .0024], hemi: [0xd8e8ff, 0x8090a8, 1.2], sun: [0xffffff, 3.2, [.3, .3, .7]], wx: [['CLEAR', .8, 1, null], ['BLIZZARD', 2.6, .62, 'snow']], storm: ['WHITEOUT', 3.4, .6, 'snow'], cool: 1.5,
    props: R => { spires(R, 170, EM.ice, 7, 40); rocks(R, 120, EM.snow, .15); }
  },
  volcanic: {
    name: 'VOLCANIC', css: '#ff6a3a', note: 'Lava channels cook anything that wades in. Cooling −35%.', n: [30, .006, 14, .02, 2, .08, -22, 95], hi: 34, lo: -99, pal: [[.12, .11, .11], [.18, .14, .13], [.21, .17, .16], [.1, .1, .1]],
    shape: (h, x, z, X, Zz) => Math.max(h + Math.abs(vnoise(X * .011 + 40, Zz * .011) * 2 - 1) * 26 - 9, -12.5), tint: (c, x, y) => lowTint(c, y, .95, .3, .05, 3), wl: -9.5, liq: 'lava',
    sky: [[.5, .2, .1], [.08, .05, .07], [1, .45, .2]], fog: [0x4a2a22, .003], hemi: [0xa06050, 0x401808, .8], sun: [0xff9060, 2.1, [.2, .3, -.8]], wx: [['ASHFALL', 1, 1, 'ash'], ['ERUPTION', 1.5, .72, 'ash']], storm: ['PYROCLASTIC HAZE', 2.8, .55, 'ash'], cool: .65,
    props: R => { spires(R, 150, EM.basalt, 6, 36); rocks(R, 160, EM.basalt, .14); }
  },
  lunar: {
    name: 'LUNAR', css: '#c8c8d8', note: 'Low gravity: jump jets carry three times as far. No air to shed heat: cooling −25%.', n: [22, .005, 8, .017, 1.2, .07, -8, 70], hi: 40, lo: -99, pal: [[.42, .42, .44], [.34, .34, .36], [.27, .27, .29], [.3, .3, .3]],
    init: R => { for (let i = 0; i < 18 * FD.k * FD.k; i++) EV.cr.push([(R() - .5) * 760 * FD.k, (R() - .5) * 760 * FD.k, 22 + R() * 55]); },
    shape: (h, x, z) => { for (const c of EV.cr) { const d = Math.hypot(x - c[0], z - c[1]) / c[2]; if (d < 1.5) h += (d < 1 ? -c[2] * .2 * (1 - d * d) : 0) + c[2] * .09 * Math.exp(-(d - 1) * (d - 1) / .03); } return h; },
    sky: [[.012, .012, .018], [0, 0, .004], [1, .95, .85]], fog: [0x030305, .0003], hemi: [0x8fa0c0, 0x202024, .42], sun: [0xffffff, 4.4, [.6, .35, .3]], wx: [['HARD VACUUM', 1, 1, null]], storm: null, stars: true, grav: 9, cool: .75,
    props: R => { rocks(R, 260, EM.moon, .14); }
  },
};
const BIOME_KEYS = Object.keys(BIOMES);

function applyAtmo(fk, sk, wx) {
  const B = EV.B, dk = lerp(.12, 1, sk), f = FD.scene.fog, u = FD.sky.material.uniforms;
  f.color.setHex(B.fog[0]).multiplyScalar(dk); FD.scene.background.copy(f.color); f.density = B.fog[1] * fk;
  u.hz.value.setRGB(...B.sky[0]).multiplyScalar(dk); u.zn.value.setRGB(...B.sky[1]).multiplyScalar(dk); u.sg.value.setRGB(...B.sky[2]); u.st.value = B.stars ? 1 : sk < .3 ? .7 : 0; u.sk.value = fk > 1.6 ? .15 : sk;
  if (fk > 1.6) { const k = clamp((fk - 1.6) / 1.2, 0, .92); u.hz.value.lerp(f.color, k); u.zn.value.lerp(f.color, k * .9); }
  FD.hemi.color.setHex(B.hemi[0]); FD.hemi.groundColor.setHex(B.hemi[1]); FD.hemi.intensity = B.hemi[2] * lerp(.3, 1, sk);
  FD.sun.color.setHex(sk < .3 ? 0x8fa8d8 : B.sun[0]); FD.sun.intensity = B.sun[1] * Math.max(sk, .1) * (fk > 2 ? .7 : 1);
  FD.lamp.intensity = sk < .3 ? 1300 : 0; for (const m of BLD) m.emissiveIntensity = sk < .3 ? 1.35 : sk < .7 ? .95 : .25; EM.lamp.emissiveIntensity = sk < .7 ? 2.6 : .2;
  FD.fogK = fk; FD.sunK = sk; FD.wx = wx;
}
/* storms roll in over a few seconds of field time */
function weatherShift(fk, sk, wx, dur = 9) { const f0 = FD.fogK, s0 = FD.sunK; return ftween(dur, k => applyAtmo(lerp(f0, fk, k), lerp(s0, sk, k), k > .35 ? wx : FD.wx), ease.lin); }

function clearEnv() {
  const keep = new Set([UB, ...Object.values(geoC), ...Object.values(GEO)]);
  FD.env.traverse(o => { if (o.isInstancedMesh) o.dispose(); if (o.geometry && !keep.has(o.geometry)) o.geometry.dispose(); });
  FD.env.clear(); FD.cols.length = 0; CG.clear(); FD.emit.length = 0; FD.blips.length = 0; FD.beacon = null; FD.trees.length = 0; FD.falling.length = 0; FD.tgrid.clear();
}
function buildEnv(key, seed, o = {}) {
  clearEnv(); const B = BIOMES[key], R = mulberry(seed * 7919 + 13);
  Object.assign(EV, { key, B, seed, home: !!o.home, ox: o.home ? 0 : R() * 900, oz: o.home ? 0 : R() * 900, pads: o.home ? HOME_PADS : (o.pads || []), wl: B.wl ?? null, cr: [] });
  if (B.init) B.init(R);
  EV.padH = EV.pads.map(p => o.home && !p[0] ? 0 : Math.max(genRaw(p[0], p[1]), (EV.wl ?? -99) + 2.5));
  const g = FD.ter.geometry, pa = g.attributes.position, ca = g.attributes.color, c = new THREE.Color(), p = B.pal;
  for (let i = 0; i < pa.count; i++) { const h = genH(pa.getX(i), pa.getZ(i)); HM[i] = h; pa.setY(i, h); }
  pa.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere(); const na = g.attributes.normal;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), z = pa.getZ(i), y = HM[i], sl = 1 - na.getY(i), n = vnoise(x * .05, z * .05);
    c.setRGB(...p[0]).lerp(_c1.setRGB(...p[2]), clamp(sl * 3.2 + (y > B.hi ? (y - B.hi) / 40 : 0), 0, 1)).lerp(_c2.setRGB(...p[1]), n * .5); if (y < B.lo) c.lerp(_c1.setRGB(...p[3]), clamp((B.lo - y) / 10, 0, .7));
    if (B.tint) B.tint(c, x, y, z, sl); ca.setXYZ(i, c.r, c.g, c.b);
  }
  ca.needsUpdate = true; FD.ter.material.roughness = B.rough ?? .96;
  FD.water.visible = B.liq === 'water'; FD.lava.visible = B.liq === 'lava';
  if (B.liq === 'water') { FD.water.position.y = EV.wl; FD.water.material.color.setHex(B.wcol); } else if (B.liq === 'lava') FD.lava.position.y = EV.wl;
  FD.planet.visible = !!B.stars; FD.sunDir.set(...B.sun[2]).normalize();
  EV.mood = B.wx[o.mood || 0] || B.wx[0]; applyAtmo(EV.mood[1], EV.mood[2], EV.mood[3]);
  FD.grav = B.grav || 24; FD.coolK = B.cool || 1;
  if (o.home) propsHome(); else B.props(R);
}

/* per-frame environment effects: weather around the camera, lava embers, falling trees */
function updateEnvFx(dt, t) {
  const w = FD.wx, c = FD.camera.position, fx = FD.fx.wx;
  if (EV.B.liq === 'lava') {
    const m = FD.lava.material.map; m.offset.x = t * .004; m.offset.y = t * .0025;
    if (Math.random() < dt * 50) { const x = c.x + rand(-150, 150), z = c.z + rand(-150, 150); if (heightAt(x, z) < EV.wl) FD.fx.spark.emit(x, EV.wl, z, rand(-1, 1), rand(3, 9), rand(-1, 1), rand(1, 2.4), rand(.3, .8), 5, 1.8, .3, 1, 1.5, .3); }
  }
  FD.rain.visible = w === 'rain';
  if (w === 'rain') { const a = FD.rain.geometry.attributes.position, q = FD.rainP; for (let i = 0; i < q.length / 3; i++) { const x = c.x + (q[i * 3] - .5) * 130, z = c.z + (q[i * 3 + 2] - .5) * 130, y = c.y + (1 - (q[i * 3 + 1] + t * 1.3) % 1) * 62 - 16; a.setXYZ(i * 2, x, y, z); a.setXYZ(i * 2 + 1, x + .3, y + 2.8, z + .1); } a.needsUpdate = true; }
  else if (w) {
    const n = Math.min(70, ({ rain: 900, snow: 420, ash: 240, dust: 220 })[w] * dt * Math.min(2, FD.fogK) * .8 + Math.random()) | 0;
    for (let i = 0; i < n; i++) {
      const x = c.x + rand(-70, 70), z = c.z + rand(-70, 70), y = c.y + rand(-6, 34);
      if (w === 'snow') fx.emit(x, y, z, rand(-9, -4), rand(-8, -5), rand(-2, 2), 3.5, rand(.2, .42), .95, .97, 1, .85);
      else if (w === 'ash') fx.emit(x, y, z, rand(-2, 1), rand(-4, -2), rand(-1, 1), 4, rand(.2, .45), .3, .26, .25, .8);
      else fx.emit(x, y - 4, z, rand(22, 40), rand(-1, 2), rand(6, 14), 2.2, rand(3, 7), .72, .58, .4, .1);
    }
  }
  fx.update(dt);
  if (FD.trees.length) {
    const hit = (px, pz, r) => {
      const ci = Math.floor(px / 16), cj = Math.floor(pz / 16);
      for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) {
        const a = FD.tgrid.get(i * 1024 + j); if (!a) continue;
        for (const it of a) { if (it.f > 0) continue; const dx = it.x - px, dz = it.z - pz, d = Math.hypot(dx, dz); if (d > r) continue; it.f = .001; it.dx = dx / (d || 1); it.dz = dz / (d || 1); FD.falling.push(it); puff(FD.fx, _v.set(it.x, it.y + 2, it.z), 3, 2.5, .3, .3, 2, 3); if (Math.hypot(px - P.pos.x, pz - P.pos.z) < 120) sfx.play('crack', .5); }
      }
    };
    if (!P.air) hit(P.pos.x, P.pos.z, player.radius * .55 + 1);
    for (const e of FD.ents) if (e.kind === 'mech' || e.kind === 'tank' || e.kind === 'truck') hit(e.pos.x, e.pos.z, e.r * .6 + .8);
    for (let i = FD.falling.length - 1; i >= 0; i--) { const it = FD.falling[i]; it.f += dt * 1.5; const m = treeMx(it), s = it.set; s.a.setMatrixAt(it.i, m); s.b.setMatrixAt(it.i, m); s.a.instanceMatrix.needsUpdate = s.b.instanceMatrix.needsUpdate = true; if (it.f >= 1) FD.falling.splice(i, 1); }
  }
}
/* the home proving grounds: hangar exterior, refinery, comm array, ruins, depots */
function propsHome() {
  const sc = FD.env, R = mulberry(41), PADS = EV.pads;
  /* home base: hangar exterior + apron (player spawns on the apron, facing -Z) */
  const hb = grp(sc, 0, 0, 95); box(hb, std({ map: TX.corr, color: 0x8d939a, metalness: .6, roughness: .6 }), 96, 40, 62, 0, 20, 0); box(hb, M.girder, 100, 2, 66, 0, 41, 0);
  noShadow(box(hb, new THREE.MeshBasicMaterial({ color: 0x050607 }), 44, 30, .6, 0, 15, -31.1)); for (const s of [-1, 1]) box(hb, repMat(TX.hazard, 1, 14), 2, 31, 2, s * 23, 15.5, -31.4); box(hb, M.yellow, 48, 2, 2, 0, 31.5, -31.4);
  for (const s of [-1, 1]) noShadow(box(hb, M.amber, .8, .8, .8, s * 23, 33.2, -31.4)); rect(0, 95, 49, 32);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(120, 90), std({ map: TX.concrete, color: 0x9d9a94, roughness: .85 })); apron.rotation.x = -PI / 2; apron.position.set(0, .06, 20); apron.receiveShadow = true; sc.add(apron);
  for (const s of [-1, 1]) { noShadow(box(sc, repMat(TX.hazard, 1, 30), 1.2, .05, 60, s * 13, .1, 28)); const p = grp(sc, s * 40, 0, 10); cyl(p, M.girder, .3, .45, 22, 0, 11, 0); box(p, M.dark, 4, .5, 1.4, -s * 1.5, 22, 0); noShadow(box(p, M.white, 3.4, .12, 1, -s * 1.5, 21.7, 0)); circ(s * 40, 10, 1); }
  crates(-36, 44, 5, R); crates(38, 40, 4, R); tank(-50, 20, 5, 9, M.steel); tank(-50, 33, 5, 9, M.steel);

  /* refinery */
  { const [x, z] = PADS[1]; for (const [dx, dz, r, h, mt] of [[0, 0, 7, 16, M.rust], [18, 6, 6, 12, M.steel], [-16, 12, 8, 10, M.steel], [6, -20, 5, 22, M.red]]) tank(x + dx, z + dz, r, h, mt);
    for (const [dx, dz, h] of [[-8, -14, 46], [22, -16, 34], [-26, -8, 28]]) { const t = at(x + dx, z + dz); cyl(t, M.girder, 1.3, 2.2, h, 0, h / 2, 0, 0, 0, 0, 10); for (let y = 8; y < h; y += 9) cyl(t, M.yellow, 2.6, 2.6, .35, 0, y, 0, 0, 0, 0, 12); cyl(t, M.dark, 1.7, 1.3, 2, 0, h + 1, 0); circ(x + dx, z + dz, 2.6); FD.emit.push({ p: V3(x + dx, t.position.y + h + 2.5, z + dz), kind: dx === -8 ? 'flare' : 'smoke' }); }
    const pr = at(x + 4, z + 2); for (let i = 0; i < 4; i++) { cyl(pr, i % 2 ? M.rust : M.blue, .5, .5, 44, -14 + i * 1.3, 5 + (i % 2) * 1.2, 0, 0, 0, Z, 8); } for (let i = -2; i <= 2; i++) { box(pr, M.girder, .5, 6, .5, i * 9, 3, -4); box(pr, M.girder, .5, 6, .5, i * 9, 3, 4); box(pr, M.girder, .5, .5, 8.5, i * 9, 6, 0); }
    crates(x + 30, z + 26, 4, R); FD.blips.push([x, z, 'REFINERY']); }
  /* comm array */
  { const [x, z] = PADS[2], t = at(x, z); for (const [px, pz] of [[-3, -3], [3, -3], [3, 3], [-3, 3]]) box(t, M.girder, .5, 52, .5, px * .6, 26, pz * .6, 0, 0, 0); for (let y = 4; y < 52; y += 6) { box(t, M.girder, 4.2, .3, 4.2, 0, y, 0); box(t, M.girder, .25, 7.5, .25, 1.8, y, 0, .6); box(t, M.girder, .25, 7.5, .25, -1.8, y, 0, -.6); }
    FD.beacon = noShadow(box(t, M.redGlow, .8, .8, .8, 0, 52.8, 0)); const d = grp(t, 0, 38, 2.6, -.5); sph(d, M.steel, 5, 0, 0, 0, 1, 1, .25); cyl(d, M.chrome, .08, .08, 4, 0, 0, 2, Z); circ(x, z, 3.2);
    const b = at(x + 12, z - 6, .4); box(b, M.steel, 10, 5, 7, 0, 2.3, 0); box(b, M.dark, 10.4, .5, 7.4, 0, 5, 0); noShadow(box(b, M.cyan, 1.4, .8, .1, -2, 3, 3.52)); circ(x + 12, z - 6, 6, b.position.y + 5); FD.blips.push([x, z, 'COMMS']); }
  /* ruins */
  { const [x, z] = PADS[3], cm = std({ map: TX.concrete, color: 0x8a8378, roughness: .95 });
    for (let i = 0; i < 9; i++) { const bx = x + (R() - .5) * 80, bz = z + (R() - .5) * 80, w = 8 + R() * 10, h = 6 + R() * 22, d = 8 + R() * 8, b = at(bx, bz, R() * .5); box(b, cm, w, h + 4, d, 0, h / 2 - 2, 0); box(b, cm, w * .6, h * .35, d * .7, w * .1, h + h * .16, 0, 0, 0, (R() - .5) * .3); for (let k = 0; k < 3; k++) box(b, M.black, w * .16, 1.6, d + .1, (k - 1) * w * .28, h * .55, 0); box(b, M.rust, .3, h * .5, .3, w * .3, h + h * .5, d * .3, 0, 0, .2); circ(bx, bz, Math.max(w, d) * .62, b.position.y + h); }
    FD.blips.push([x, z, 'RUINS']); }
  /* depots */
  for (const i of [4, 5]) { const [x, z] = PADS[i]; tank(x - 8, z, 5, 8, M.blue); tank(x + 6, z + 8, 4, 11, M.rust); crates(x + 6, z - 12, 5, R); FD.blips.push([x, z, 'DEPOT']); }
  /* rocks (instanced) */
  const rg = new THREE.IcosahedronGeometry(1, 1), rp = rg.attributes.position; for (let i = 0; i < rp.count; i++) { const k = 1 + (hash2(rp.getX(i) * 9.1, rp.getY(i) * 7.3 + rp.getZ(i) * 3.7) - .5) * .5; rp.setXYZ(i, rp.getX(i) * k, rp.getY(i) * k * .8, rp.getZ(i) * k); } rg.computeVertexNormals();
  const rocks = new THREE.InstancedMesh(rg, new THREE.MeshStandardMaterial({ color: 0x6a5b4c, roughness: 1, flatShading: true, envMapIntensity: .1 }), 240), mx = new THREE.Matrix4(), e = new THREE.Euler();
  for (let i = 0; i < 240; i++) { let x, z; do { x = (R() - .5) * 760; z = (R() - .5) * 760; } while (PADS.some(p => Math.hypot(x - p[0], z - p[1]) < p[2] + 6)); const s = R() < .12 ? 5 + R() * 8 : .8 + R() * 3; e.set(R() * 3, R() * 6, R() * 3); mx.compose(_v.set(x, heightAt(x, z) + s * .15, z), _q.setFromEuler(e), _v2.set(s, s * (.6 + R() * .6), s)); rocks.setMatrixAt(i, mx); if (s > 3) circ(x, z, s * .85, heightAt(x, z) + s * .7); }
  rocks.castShadow = rocks.receiveShadow = true; sc.add(rocks);
  /* a long-dead wreck for flavour */
  const wk = new Mech({ ...PRESETS[2], paint: 5 }); for (const k in wk.mats) { wk.mats[k].color.multiplyScalar(.35); if (wk.mats[k].emissive) wk.mats[k].emissiveIntensity = 0; } wk.root.position.set(-62, heightAt(-62, -96) + 2.2, -96); wk.root.rotation.set(1.35, .5, .2); sc.add(wk.root); circ(-62, -100, 6, heightAt(-62, -96) + 6); FD.emit.push({ p: V3(-62, heightAt(-62, -96) + 4, -100), kind: 'smoke' });
}

