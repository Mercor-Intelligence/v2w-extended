// app.js
// Prism: a custom-shaded, noise-displaced icosahedron rendered with Three.js.
//
// DETERMINISM CONTRACT
// --------------------
// The rendered image is a pure function of (uTime, controls). It never reads
// the wall clock for layout or animation.
//   * Live mode (no query params): uTime advances by a FIXED dt per frame
//     (FIXED_DT) using a frame accumulator, not by elapsed real time. This
//     keeps the live animation smooth and reproducible.
//   * Frozen mode (?t=T present): uTime is pinned to T, exactly one settled
//     frame is rendered, and the loop does not advance. A given ?t&preset
//     yields a byte-identical frame, including under software WebGL.
//
// Query params honored:
//   t          float   freeze uTime at this value (enables frozen mode)
//   preset     name    aurora | ember | nebula
//   wireframe  0|1     toggle wireframe rendering
//
// After fonts load and the first frame is on screen, window.__prismReady is
// set to true so a capture harness knows the page has settled.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VERTEX_SHADER, FRAGMENT_SHADER, STAR_VERTEX, STAR_FRAGMENT } from './shaders.js';
import { mulberry32, range } from './prng.js';
import { PRESETS, DEFAULT_PRESET, clonePreset } from './presets.js';
import { initPanel } from './panel.js';

const FIXED_DT = 1 / 60; // seconds advanced per live frame (deterministic)
const STAR_COUNT = 1400;
const STAR_SEED = 1337; // fixed seed -> identical starfield every load
const GEOMETRY_DETAIL = 64; // icosahedron subdivision (modest for software GL)

// ---- query params -----------------------------------------------------------
function parseParams() {
  const q = new URLSearchParams(window.location.search);
  const out = { frozen: false, t: 0, preset: DEFAULT_PRESET, wireframe: false };

  if (q.has('t')) {
    const t = parseFloat(q.get('t'));
    if (Number.isFinite(t)) {
      out.frozen = true;
      out.t = t;
    }
  }
  const p = (q.get('preset') || '').toLowerCase();
  if (p && PRESETS[p]) out.preset = p;

  if (q.has('wireframe')) {
    const w = q.get('wireframe');
    out.wireframe = w === '1' || w === 'true' || w === 'yes';
  }
  return out;
}

// ---- scene construction ------------------------------------------------------
class PrismScene {
  constructor(canvas, params) {
    this.params = params;
    this.controls = clonePreset(params.preset);
    this.activePreset = params.preset;
    this.wireframe = params.wireframe;
    this.uTime = params.frozen ? params.t : 0;
    this.frame = 0;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true, // lets a harness read pixels deterministically
      powerPreference: 'high-performance',
    });
    // Clamp pixel ratio so frame buffers are identical across DPI displays.
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 4.2);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.enablePan = false;
    this.orbit.minDistance = 2.6;
    this.orbit.maxDistance = 8;
    this.orbit.autoRotate = false; // we drive rotation deterministically below
    // In frozen mode disable damping so the single settled frame is exact.
    if (params.frozen) this.orbit.enableDamping = false;

    this._buildMesh();
    this._buildStars();
    this._applyBackground();
    this._applyControlsToUniforms();
    this._resize();

    window.addEventListener('resize', () => this._resize());
  }

  _buildMesh() {
    const geo = new THREE.IcosahedronGeometry(1.25, GEOMETRY_DETAIL);
    this.uniforms = {
      uTime: { value: this.uTime },
      uAmplitude: { value: this.controls.amplitude },
      uFrequency: { value: this.controls.frequency },
      uSwirl: { value: this.controls.swirl },
      uHue: { value: this.controls.hue },
      uColorA: { value: this.controls.colorA },
      uColorB: { value: this.controls.colorB },
      uIridescence: { value: this.controls.iridescence },
      uExposure: { value: this.controls.exposure },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      wireframe: this.wireframe,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.scene.add(this.mesh);
  }

  _buildStars() {
    const rng = mulberry32(STAR_SEED);
    const positions = new Float32Array(STAR_COUNT * 3);
    const scales = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute on a large sphere shell behind the mesh.
      const r = range(rng, 14, 30);
      const theta = range(rng, 0, Math.PI * 2);
      const phi = Math.acos(range(rng, -1, 1));
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = range(rng, 0.6, 2.4);
      phases[i] = rng();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    this.starUniforms = {
      uTime: { value: this.uTime },
      uPixelRatio: { value: this.pixelRatio },
      uColor: { value: new THREE.Color(this.controls.star) },
    };
    const starMat = new THREE.ShaderMaterial({
      uniforms: this.starUniforms,
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(g, starMat);
    this.scene.add(this.stars);
  }

  _applyBackground() {
    const [, mid, bottom] = this.controls.background;
    // The DOM body carries the gradient + vignette; the GL clear color matches
    // the mid stop so the canvas blends seamlessly with the page background.
    this.renderer.setClearColor(new THREE.Color(mid), 1);
    document.body.style.setProperty('--bg-top', this.controls.background[0]);
    document.body.style.setProperty('--bg-mid', mid);
    document.body.style.setProperty('--bg-bottom', bottom);
  }

  _applyControlsToUniforms() {
    this.uniforms.uAmplitude.value = this.controls.amplitude;
    this.uniforms.uFrequency.value = this.controls.frequency;
    this.uniforms.uSwirl.value = this.controls.swirl;
    this.uniforms.uHue.value = this.controls.hue;
    this.uniforms.uColorA.value = this.controls.colorA;
    this.uniforms.uColorB.value = this.controls.colorB;
    this.uniforms.uIridescence.value = this.controls.iridescence;
    this.uniforms.uExposure.value = this.controls.exposure;
    this.starUniforms.uColor.value.set(this.controls.star);
    this.material.wireframe = this.wireframe;
  }

  // Public API used by the control panel.
  setControl(key, value) {
    this.controls[key] = value;
    this._applyControlsToUniforms();
    if (this.params.frozen) this.renderOnce();
  }

  setWireframe(on) {
    this.wireframe = on;
    this.material.wireframe = on;
    if (this.params.frozen) this.renderOnce();
  }

  applyPreset(name) {
    if (!PRESETS[name]) return;
    this.activePreset = name;
    this.controls = clonePreset(name);
    this._applyBackground();
    this._applyControlsToUniforms();
    if (this.params.frozen) this.renderOnce();
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.starUniforms.uPixelRatio.value = this.pixelRatio;
    if (this.params.frozen) this.renderOnce();
  }

  // Deterministic per-frame state update for a given uTime.
  _syncTime() {
    this.uniforms.uTime.value = this.uTime;
    this.starUniforms.uTime.value = this.uTime;
    // Slow auto-rotation is a pure function of uTime.
    this.mesh.rotation.y = this.uTime * 0.25;
    this.mesh.rotation.x = Math.sin(this.uTime * 0.15) * 0.25;
    this.stars.rotation.y = this.uTime * 0.01;
  }

  renderOnce() {
    this._syncTime();
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Live animation: advance uTime by a fixed dt each frame.
  tickLive() {
    this.frame += 1;
    this.uTime += FIXED_DT;
    this._syncTime();
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// ---- bootstrap ---------------------------------------------------------------
async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {
      /* ignore: proceed even if the font API rejects */
    }
  }
}

function markReady() {
  // Two rAFs guarantee the first rendered frame has been presented.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__prismReady = true;
      document.documentElement.setAttribute('data-prism-ready', 'true');
    });
  });
}

async function main() {
  const params = parseParams();
  const canvas = document.getElementById('scene');
  const app = new PrismScene(canvas, params);

  // Wire the control panel to the scene and reflect the active preset.
  initPanel(app, params);

  // Wait for fonts so text in the panel is laid out before we declare ready.
  await waitForFonts();

  if (params.frozen) {
    // Render exactly one settled frame and stop.
    app.renderOnce();
    markReady();
  } else {
    // Live, deterministic loop.
    const loop = () => {
      app.tickLive();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    markReady();
  }

  // Expose for debugging / harnesses.
  window.__prism = app;
}

main();
