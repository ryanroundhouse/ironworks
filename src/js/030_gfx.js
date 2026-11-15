/* ============ PROCEDURAL TEXTURES ============ */
function ctex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t;
}
function speckle(g, w, h, n, a, lo = 0, hi = 255) { for (let i = 0; i < n; i++) { const v = rand(lo, hi) | 0; g.fillStyle = `rgba(${v},${v},${v},${a})`; g.fillRect(rand(w), rand(h), rand(1, 3), rand(1, 3)); } }
const TX = {
  panel: ctex(256, 256, (g, w, h) => {
    g.fillStyle = '#cfcfcf'; g.fillRect(0, 0, w, h); speckle(g, w, h, 2600, .06);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(40,30,20,${rand(.03, .09)})`; const x = rand(w); g.fillRect(x, 0, rand(4, 26), h); }      // grime streaks
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 2; g.strokeRect(5, 5, w - 10, h - 10);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.strokeRect(7.5, 7.5, w - 15, h - 15);
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.moveTo(5, 170); g.lineTo(150, 170); g.lineTo(175, 195); g.lineTo(251, 195); g.moveTo(96, 5); g.lineTo(96, 170); g.stroke();
    for (let i = 0; i < 12; i++) for (const [x, y] of [[14 + i * 20.7, 14], [14 + i * 20.7, 242], [14, 14 + i * 20.7], [242, 14 + i * 20.7]]) { g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 1, y - 1.6, 1.2, 1.2); }
    g.strokeStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 40; i++) { const x = rand(w), y = rand(h), a = rand(TAU), l = rand(4, 22); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    const gr = g.createLinearGradient(0, h * .6, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,12,5,.28)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }),
  concrete: ctex(512, 512, (g, w, h) => {
    g.fillStyle = '#5b5c5a'; g.fillRect(0, 0, w, h); speckle(g, w, h, 14000, .05);
    for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${pick([0, 0, 20, 120])},${pick([0, 10, 90])},0,${rand(.02, .07)})`; g.beginPath(); g.ellipse(rand(w), rand(h), rand(10, 70), rand(8, 40), rand(PI), 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
    g.strokeStyle = 'rgba(15,15,15,.45)'; g.lineWidth = 1; for (let i = 0; i < 7; i++) { let x = rand(w), y = rand(h); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 9; j++) { x += rand(-22, 22); y += rand(-22, 22); g.lineTo(x, y); } g.stroke(); }
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 5; for (let i = 0; i < 4; i++) { g.beginPath(); const y = rand(h); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + rand(-60, 60), w * .6, y + rand(-60, 60), w, y + rand(-40, 40)); g.stroke(); } // tyre marks
  }, 7, 10),
  corr: ctex(256, 256, (g, w, h) => {
    for (let x = 0; x < w; x += 16) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#2b2f33'); gr.addColorStop(.5, '#5d646b'); gr.addColorStop(1, '#2b2f33'); g.fillStyle = gr; g.fillRect(x, 0, 16, h); }
    for (let i = 0; i < 26; i++) { const x = rand(w), l = rand(30, 200); const gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(120,58,22,.55)'); gr.addColorStop(1, 'rgba(120,58,22,0)'); g.fillStyle = gr; g.fillRect(x, 0, rand(3, 9), l); }
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, w, 5); g.fillRect(0, 126, w, 4); speckle(g, w, h, 3000, .05);
  }, 12, 3),
  hazard: ctex(128, 128, (g, w, h) => { g.fillStyle = '#b98a14'; g.fillRect(0, 0, w, h); g.fillStyle = '#131313'; for (let i = -2; i < 5; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 32, 0); g.lineTo(i * 64 + 32 + h, h); g.lineTo(i * 64 + h, h); g.fill(); } speckle(g, w, h, 900, .08); }),
  grate: ctex(64, 64, (g, w, h) => { g.fillStyle = '#17191b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6e757c'; g.lineWidth = 5; g.strokeRect(0, 0, w, h); g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); }),
  tread: ctex(64, 64, (g, w, h) => { g.fillStyle = '#1b1c1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4d51'; for (let i = 0; i < 4; i++) g.fillRect(0, i * 16 + 2, w, 7); g.fillStyle = '#0a0a0a'; g.fillRect(28, 0, 8, h); }),
};
TX.panelN = TX.panel;

/* ============ MATERIALS ============ */
const std = o => new THREE.MeshStandardMaterial({ envMapIntensity: .32, ...o });
const glowMat = (hex, i = 2.2) => new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: hex, emissiveIntensity: i });
const M = {
  steel: std({ color: 0x70767d, metalness: .85, roughness: .45, map: TX.panel }),
  dark: std({ color: 0x24272b, metalness: .8, roughness: .5 }),
  girder: std({ color: 0x3a3f45, metalness: .7, roughness: .6 }),
  chrome: std({ color: 0xd9dde2, metalness: 1, roughness: .12, envMapIntensity: 1 }),
  rust: std({ color: 0x6d3b20, metalness: .5, roughness: .85, map: TX.panel }),
  black: std({ color: 0x0d0e10, metalness: .4, roughness: .8 }),
  yellow: std({ color: 0xa87a12, metalness: .45, roughness: .6, map: TX.panel }),
  red: std({ color: 0x9c2018, metalness: .4, roughness: .55, map: TX.panel }),
  blue: std({ color: 0x1f4f7c, metalness: .4, roughness: .55, map: TX.panel }),
  hazard: std({ map: TX.hazard, metalness: .3, roughness: .7 }),
  grate: std({ map: TX.grate, metalness: .8, roughness: .5 }),
  amber: glowMat(0xff9a1a, 3), redGlow: glowMat(0xff2a12, 3), cyan: glowMat(0x5fd8ff, 2.4), white: glowMat(0xfff1d6, 3.2), green: glowMat(0x54ff6a, 2),
};

/* paint schemes — every mech owns its own material set so paint can change live */
const PAINTS = [
  { n: 'OLIVE DRAB', pri: 0x5d6b3e, sec: 0x30362a, acc: 0xd9a21b, glow: 0xffa826 },
  { n: 'DESERT RAT', pri: 0xb89b68, sec: 0x5a4a35, acc: 0x7a2e1c, glow: 0xff7a2a },
  { n: 'ARCTIC', pri: 0xd5dadd, sec: 0x56626e, acc: 0x1f7fd1, glow: 0x59c8ff },
  { n: 'CRIMSON GUARD', pri: 0x8e1f1f, sec: 0x2a2224, acc: 0xd8d2c2, glow: 0xff4433 },
  { n: 'HAZARD', pri: 0xe0a514, sec: 0x25262a, acc: 0x111111, glow: 0xfff06a },
  { n: 'NIGHT OPS', pri: 0x2d3540, sec: 0x15181c, acc: 0x35d0c0, glow: 0x45ffe0 },
];
function makeMats(pi) {
  const p = pi && typeof pi === 'object' ? pi : PAINTS[pi] || PAINTS[0];
  return {
    pri: std({ color: p.pri, map: TX.panel, metalness: .5, roughness: .6 }),
    sec: std({ color: p.sec, map: TX.panel, metalness: .6, roughness: .55 }),
    acc: std({ color: p.acc, metalness: .4, roughness: .5 }),
    joint: std({ color: 0x2b2e33, metalness: .9, roughness: .35 }),
    blk: std({ color: 0x121315, metalness: .6, roughness: .7 }),
    glass: std({ color: 0x16303a, metalness: 1, roughness: .07, emissive: p.glow, emissiveIntensity: .22, envMapIntensity: 1.3 }),
    glow: glowMat(p.glow, 2.4),
  };
}
function applyPaint(m, pi) { const p = pi && typeof pi === 'object' ? pi : PAINTS[pi] || PAINTS[0]; m.pri.color.set(p.pri); m.sec.color.set(p.sec); m.acc.color.set(p.acc); m.glass.emissive.set(p.glow); m.glow.emissive.set(p.glow); }

/* ============ GEOMETRY HELPERS (parent first, cached geometry) ============ */
const geoC = {}, UB = new THREE.BoxGeometry(1, 1, 1);
function fin(p, m, x, y, z, rx, ry, rz) { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; p && p.add(m); return m; }
function box(p, mat, w, h, d, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const m = new THREE.Mesh(UB, mat); m.scale.set(w, h, d); return fin(p, m, x, y, z, rx, ry, rz); }
/* box whose +Y face is scaled by (tx,tz) — angular armour plate */
function tbox(p, mat, w, h, d, tx, tz, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const k = `t${w},${h},${d},${tx},${tz}`; let g = geoC[k];
  if (!g) { g = new THREE.BoxGeometry(w, h, d); const a = g.attributes.position; for (let i = 0; i < a.count; i++) if (a.getY(i) > 0) { a.setX(i, a.getX(i) * tx); a.setZ(i, a.getZ(i) * tz); } g.computeVertexNormals(); geoC[k] = g; }
  return fin(p, new THREE.Mesh(g, mat), x, y, z, rx, ry, rz);
}
function cyl(p, mat, rt, rb, h, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 14) { const k = `c${rt},${rb},${h},${seg}`; const g = geoC[k] || (geoC[k] = new THREE.CylinderGeometry(rt, rb, h, seg)); return fin(p, new THREE.Mesh(g, mat), x, y, z, rx, ry, rz); }
function sph(p, mat, r, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) { const k = `s${r}`; const g = geoC[k] || (geoC[k] = new THREE.SphereGeometry(r, 20, 14)); const m = fin(p, new THREE.Mesh(g, mat), x, y, z, 0, 0, 0); m.scale.set(sx, sy, sz); return m; }
function grp(p, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx, ry, rz); p && p.add(g); return g; }
const noShadow = o => { o.traverse(c => { c.castShadow = false; }); return o; };

/* ============ PARTICLES ============ */
class Particles {
  constructor(scene, max = 2000, additive = true) {
    this.max = max; this.i = 0;
    this.pos = new Float32Array(max * 3); this.col = new Float32Array(max * 4); this.siz = new Float32Array(max);
    this.vel = new Float32Array(max * 3); this.life = new Float32Array(max); this.ml = new Float32Array(max); this.par = new Float32Array(max * 5);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(this.col, 4)); g.setAttribute('aSize', new THREE.BufferAttribute(this.siz, 1));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: { uS: { value: innerHeight } },
      vertexShader: `attribute vec4 aCol;attribute float aSize;varying vec4 vC;uniform float uS;void main(){vC=aCol;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uS/max(.1,-mv.z);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying vec4 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.08,d)*vC.a;if(a<.004)discard;gl_FragColor=vec4(vC.rgb,a);}`
    });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = 5; scene.add(this.pts); this.geo = g;
  }
  emit(x, y, z, vx, vy, vz, life, size, r, g, b, a = 1, grav = 0, drag = 0, grow = 0) {
    const i = this.i; this.i = (i + 1) % this.max;
    this.pos.set([x, y, z], i * 3); this.vel.set([vx, vy, vz], i * 3); this.col.set([r, g, b, a], i * 4);
    this.life[i] = this.ml[i] = life; this.par.set([grav, drag, grow, size, a], i * 5); this.siz[i] = size;
  }
  update(dt) {
    const { pos, vel, life, ml, par, col, siz } = this;
    for (let i = 0; i < this.max; i++) {
      if (life[i] <= 0) continue; life[i] -= dt;
      if (life[i] <= 0) { siz[i] = 0; col[i * 4 + 3] = 0; continue; }
      const k = life[i] / ml[i], d = Math.max(0, 1 - par[i * 5 + 1] * dt);
      vel[i * 3] *= d; vel[i * 3 + 1] = vel[i * 3 + 1] * d - par[i * 5] * dt; vel[i * 3 + 2] *= d;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      siz[i] = par[i * 5 + 3] * (1 + par[i * 5 + 2] * (1 - k)); col[i * 4 + 3] = par[i * 5 + 4] * Math.min(1, k * 2.2);
    }
    this.geo.attributes.position.needsUpdate = this.geo.attributes.aCol.needsUpdate = this.geo.attributes.aSize.needsUpdate = true;
  }
}
/* common bursts — fx = {spark: additive Particles, smoke: normal Particles} */
function sparks(fx, p, n = 12, pow = 6, r = 4, g = 2.2, b = .6) { for (let i = 0; i < n; i++) fx.spark.emit(p.x, p.y, p.z, rand(-pow, pow), rand(-pow * .3, pow), rand(-pow, pow), rand(.25, .9), rand(.12, .3), r, g, b, 1, 14, .6); }
function puff(fx, p, n = 6, sz = 1.5, c = .5, a = .35, up = 1.5, spread = 1.5) { for (let i = 0; i < n; i++) fx.smoke.emit(p.x + rand(-.3, .3), p.y, p.z + rand(-.3, .3), rand(-spread, spread), rand(.2, up), rand(-spread, spread), rand(1, 2.6), sz * rand(.7, 1.3), c, c, c * 1.03, a, -.3, .9, 2.2); }
function explode(fx, p, s = 1) {
  for (let i = 0; i < 26 * s; i++) fx.spark.emit(p.x, p.y, p.z, rand(-9, 9) * s, rand(-2, 11) * s, rand(-9, 9) * s, rand(.3, 1), rand(.5, 1.6) * s, 5, 2.2, .5, 1, 9, 1.2);
  for (let i = 0; i < 5 * s; i++) fx.spark.emit(p.x, p.y, p.z, rand(-2, 2), rand(0, 3), rand(-2, 2), rand(.15, .35), rand(4, 7) * s, 6, 3.5, 1.2, .9, 0, 0, .6);
  puff(fx, p, 10 * s, 3.2 * s, .16, .6, 5, 4 * s);
}

