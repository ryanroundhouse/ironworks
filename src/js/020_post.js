/* ============ THE PICTURE: ONE SHORT CHAIN FROM THE SCENE TO THE CANVAS ============ */
/* The scene is drawn once into a multisampled half-float target, the bloom is built from that picture, and one last pass adds the two,
   tone-maps and writes the canvas. The canvas has no antialiasing, depth or stencil of its own, because that one triangle is all it ever
   receives: never render a scene straight to it, go through POST.draw(scene, camera).
   The bloom is the UnrealBloomPass of three.js r160 (MIT licence, copyright the three.js authors) step for step: the same shaders, target
   sizes and weights. Only its ending differs. It used to blend the glow back into the multisampled target, which resolved the largest
   buffer in the page a second time, and a separate pass then copied that to the screen; here the sum is taken in the pass that writes the
   screen. The picture is the same to within one rounding step of an 8-bit channel.
   POST.frame() is what the main loop calls. While a sortie is on hold nothing in the scene moves, so the picture already on the canvas is
   left standing. It is drawn again when the camera has moved, for three frames after anything that could have touched it (a key, a click,
   a control, a resize, POST.kick()), and twice a second regardless, so that nothing which slips past those can stay stale for long. */
const POST = (() => {
  const HF = { type: THREE.HalfFloatType, depthBuffer: false }, cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
  const tri = new THREE.Mesh(geo); tri.frustumCulled = false;
  const VS = 'varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }';
  const mat = (fragmentShader, uniforms, defines = {}) => new THREE.ShaderMaterial({ uniforms, defines, vertexShader: VS, fragmentShader, depthTest: false, depthWrite: false });
  /* one full-screen triangle with material m into target `to` (null: the canvas). Every pass covers its whole target without blending */
  const pass = (m, to) => { tri.material = m; renderer.setRenderTarget(to); renderer.render(tri, cam); };
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }), bright = new THREE.WebGLRenderTarget(1, 1, HF), mipH = [], mipV = [], blur = [];
  /* 1: keep what is brighter than the threshold */
  const hi = mat(`
uniform sampler2D tDiffuse;
uniform vec3 defaultColor;
uniform float defaultOpacity;
uniform float luminosityThreshold;
uniform float smoothWidth;
varying vec2 vUv;
void main() {
	vec4 texel = texture2D( tDiffuse, vUv );
	vec3 luma = vec3( 0.299, 0.587, 0.114 );
	float v = dot( texel.xyz, luma );
	vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );
	float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );
	gl_FragColor = mix( outputColor, texel, alpha );
}`, { tDiffuse: { value: null }, luminosityThreshold: { value: 1.05 }, smoothWidth: { value: .01 }, defaultColor: { value: new THREE.Color(0x000000) }, defaultOpacity: { value: 0 } });
  /* 2: five mips, each half the size of the last and blurred wider, across and then down */
  for (const r of [3, 5, 7, 9, 11]) {
    const co = []; for (let i = 0; i < r; i++) co.push(.39894 * Math.exp(-.5 * i * i / (r * r)) / r);
    mipH.push(new THREE.WebGLRenderTarget(1, 1, HF)); mipV.push(new THREE.WebGLRenderTarget(1, 1, HF));
    blur.push(mat(`
#include <common>
varying vec2 vUv;
uniform sampler2D colorTexture;
uniform vec2 invSize;
uniform vec2 direction;
uniform float gaussianCoefficients[KERNEL_RADIUS];
void main() {
	float weightSum = gaussianCoefficients[0];
	vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
	for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
		float x = float(i);
		float w = gaussianCoefficients[i];
		vec2 uvOffset = direction * invSize * x;
		vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
		vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
		diffuseSum += (sample1 + sample2) * w;
		weightSum += 2.0 * w;
	}
	gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
}`, { colorTexture: { value: null }, invSize: { value: new THREE.Vector2(.5, .5) }, direction: { value: null }, gaussianCoefficients: { value: co } }, { KERNEL_RADIUS: r }));
  }
  /* 3: weigh the five together at half size */
  const one = () => new THREE.Vector3(1, 1, 1), DX = new THREE.Vector2(1, 0), DY = new THREE.Vector2(0, 1);
  const mix5 = mat(`
varying vec2 vUv;
uniform sampler2D blurTexture1;
uniform sampler2D blurTexture2;
uniform sampler2D blurTexture3;
uniform sampler2D blurTexture4;
uniform sampler2D blurTexture5;
uniform float bloomStrength;
uniform float bloomRadius;
uniform float bloomFactors[NUM_MIPS];
uniform vec3 bloomTintColors[NUM_MIPS];
float lerpBloomFactor(const in float factor) {
	float mirrorFactor = 1.2 - factor;
	return mix(factor, mirrorFactor, bloomRadius);
}
void main() {
	gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
		lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
		lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
		lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
		lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
}`, { blurTexture1: { value: mipV[0].texture }, blurTexture2: { value: mipV[1].texture }, blurTexture3: { value: mipV[2].texture }, blurTexture4: { value: mipV[3].texture }, blurTexture5: { value: mipV[4].texture },
    bloomStrength: { value: 1 }, bloomRadius: { value: .5 }, bloomFactors: { value: [1, .8, .6, .4, .2] }, bloomTintColors: { value: [one(), one(), one(), one(), one()] } }, { NUM_MIPS: 5 });
  /* 4: the scene plus the glow (weighted by its own alpha, exactly as the additive blend did), tone-mapped and converted for the screen by the renderer's own chunks */
  const black = new THREE.DataTexture(new Uint8Array(4), 1, 1); black.needsUpdate = true;
  const fin = mat(`
uniform sampler2D tScene;
uniform sampler2D tBloom;
varying vec2 vUv;
void main() {
	vec4 s = texture2D( tScene, vUv );
	vec4 b = texture2D( tBloom, vUv );
	gl_FragColor = vec4( s.rgb + b.rgb * b.a, s.a + b.a * b.a );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, { tScene: { value: rt.texture }, tBloom: { value: black } });
  let wake = 3, beat = 0, scn = null; const cp = new THREE.Vector3(), cq = new THREE.Quaternion(), pm = new THREE.Matrix4();
  for (const k of ['keydown', 'keyup', 'pointerdown', 'pointerup', 'click', 'input', 'change', 'wheel', 'focus', 'pointerlockchange', 'visibilitychange']) addEventListener(k, () => { wake = 3; }, true);
  return {
    scene: null, camera: null, strength: .45, radius: .5, threshold: 1.05, bloom: true,
    /* pictures drawn so far */
    n: 0,
    /* the window in CSS pixels; the targets follow the renderer's pixel ratio, as the canvas does */
    size(w, h) {
      const pr = renderer.getPixelRatio(), W = Math.max(1, Math.floor(w * pr)), H = Math.max(1, Math.floor(h * pr)); rt.setSize(W, H);
      let x = Math.max(1, Math.round(W / 2)), y = Math.max(1, Math.round(H / 2)); bright.setSize(x, y);
      for (let i = 0; i < 5; i++) { mipH[i].setSize(x, y); mipV[i].setSize(x, y); blur[i].uniforms.invSize.value.set(1 / x, 1 / y); x = Math.max(1, Math.round(x / 2)); y = Math.max(1, Math.round(y / 2)); }
      wake = 3;
    },
    /* a scene through the whole chain and onto the canvas */
    draw(scene, camera, k = this.strength) {
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      if (this.bloom) {
        hi.uniforms.tDiffuse.value = rt.texture; hi.uniforms.luminosityThreshold.value = this.threshold; pass(hi, bright);
        let from = bright; for (let i = 0; i < 5; i++) { const u = blur[i].uniforms; u.colorTexture.value = from.texture; u.direction.value = DX; pass(blur[i], mipH[i]); u.colorTexture.value = mipH[i].texture; u.direction.value = DY; pass(blur[i], mipV[i]); from = mipV[i]; }
        mix5.uniforms.bloomStrength.value = k; mix5.uniforms.bloomRadius.value = this.radius; pass(mix5, mipH[0]);
      }
      fin.uniforms.tBloom.value = this.bloom ? mipH[0].texture : black; pass(fin, null); this.n++;
    },
    /* once per frame from the main loop. still: a sortie on hold, when the last picture may stand */
    frame(dt, still) {
      const c = this.camera; if (!still || scn !== this.scene || !cp.equals(c.position) || !cq.equals(c.quaternion) || !pm.equals(c.projectionMatrix)) wake = 3;
      beat += dt; if (beat >= .5 && wake < 1) wake = 1; if (wake < 1) return false;
      wake--; beat = 0; scn = this.scene; cp.copy(c.position); cq.copy(c.quaternion); pm.copy(c.projectionMatrix); this.draw(this.scene, c); return true;
    },
    /* something changed that a held picture would not show */
    kick() { wake = 3; },
  };
})();

/* tweens (promise based, driven by main loop) */
const tweens = [];
const ease = { io: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, out: k => 1 - Math.pow(1 - k, 3), in: k => k * k * k, lin: k => k };
function tween(dur, fn, e = ease.io) { return new Promise(res => tweens.push({ t: 0, dur, fn, e, res })); }
const wait = s => tween(s, () => { });
function updateTweens(dt) { for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; const k = Math.min(1, w.t / w.dur); w.fn(w.e(k)); if (k >= 1) { tweens.splice(i, 1); w.res(); } } }

