// Flux — flow-field particle animation on HTML Canvas 2D.
//
// Wires the deterministic FluxSim to a full-viewport canvas and a control
// panel. Two modes:
//
//   Live mode (no ?frame param): animate continuously from a default seed using
//   requestAnimationFrame, but always advancing the sim by a FIXED timestep so
//   motion is frame-rate independent. The controls mutate the running sim.
//
//   Frozen mode (?frame=N present): initialize the PRNG with ?seed, deterministi-
//   cally step the simulation exactly N times at a FIXED resolution, render, then
//   STOP. No requestAnimationFrame loop runs, so a screenshot is byte-stable. The
//   coordinator captures specific ?seed&frame&palette URLs in this mode.

import { FluxSim } from './sim.js';
import { normalizeSeed } from './rng.js';
import { PALETTES, PALETTE_ORDER, resolvePalette } from './palettes.js';

// Fixed logical resolution used whenever the sim is frozen for capture. Pinning
// this makes a frozen frame independent of the browser window size, so the same
// ?seed&frame&palette URL renders identically on any display.
const FROZEN_WIDTH = 1920;
const FROZEN_HEIGHT = 1080;

// Defaults for live mode and for any control whose value is not overridden.
const DEFAULTS = {
  seed: 1,
  count: 1800,
  speed: 1.6,
  noiseScale: 0.0024,
  palette: 'aurora',
};

// Bounds for the interactive controls (also used to clamp typed input).
const LIMITS = {
  count: { min: 200, max: 6000, step: 100 },
  speed: { min: 0.2, max: 4, step: 0.1 },
  noiseScale: { min: 0.0008, max: 0.006, step: 0.0001 },
};

function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const hasFrame = params.has('frame');
  const frameRaw = parseInt(params.get('frame') ?? '', 10);
  return {
    frozen: hasFrame && Number.isFinite(frameRaw),
    seedParam: params.get('seed'),
    frame: Number.isFinite(frameRaw) ? Math.max(0, frameRaw) : 0,
    paletteParam: params.get('palette'),
  };
}

class FluxApp {
  constructor() {
    this.canvas = document.getElementById('flux-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.query = readQueryParams();

    this.state = {
      seed: this.query.seedParam !== null
        ? normalizeSeed(this.query.seedParam)
        : DEFAULTS.seed,
      seedLabel: this.query.seedParam !== null
        ? String(this.query.seedParam)
        : String(DEFAULTS.seed),
      count: DEFAULTS.count,
      speed: DEFAULTS.speed,
      noiseScale: DEFAULTS.noiseScale,
      paletteKey: resolvePalette(this.query.paletteParam ?? DEFAULTS.palette),
      paused: false,
    };

    this.rafId = null;
    this.displayFrame = 0;

    this._cacheControls();
    this._bindControls();

    if (this.query.frozen) {
      this._runFrozen();
    } else {
      this._runLive();
    }
  }

  _cacheControls() {
    this.el = {
      count: document.getElementById('count-input'),
      countValue: document.getElementById('count-value'),
      speed: document.getElementById('speed-input'),
      speedValue: document.getElementById('speed-value'),
      noise: document.getElementById('noise-input'),
      noiseValue: document.getElementById('noise-value'),
      palette: document.getElementById('palette-select'),
      paletteName: document.getElementById('palette-name'),
      pause: document.getElementById('pause-button'),
      reset: document.getElementById('reset-button'),
      frameCounter: document.getElementById('frame-counter'),
      seedValue: document.getElementById('seed-value'),
      status: document.getElementById('status-pill'),
    };

    // Populate the palette selector from the registry.
    for (const key of PALETTE_ORDER) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = PALETTES[key].name;
      this.el.palette.appendChild(option);
    }
  }

  _syncControlsToState() {
    this.el.count.value = String(this.state.count);
    this.el.countValue.textContent = String(this.state.count);
    this.el.speed.value = String(this.state.speed);
    this.el.speedValue.textContent = this.state.speed.toFixed(1);
    this.el.noise.value = String(this.state.noiseScale);
    this.el.noiseValue.textContent = this.state.noiseScale.toFixed(4);
    this.el.palette.value = this.state.paletteKey;
    this.el.paletteName.textContent = PALETTES[this.state.paletteKey].name;
    this.el.seedValue.textContent = this.state.seedLabel;
    this.el.pause.textContent = this.state.paused ? 'Resume' : 'Pause';
    this.el.pause.setAttribute('aria-pressed', String(this.state.paused));
  }

  _bindControls() {
    const clamp = (v, { min, max }) => Math.min(max, Math.max(min, v));

    // Particles is a typed number input: commit the clamped value on Enter or
    // when the field loses focus, then reflect it in the readout and the sim.
    // (We do not commit on every keystroke so partial values like "3" do not
    // momentarily clamp to the minimum.)
    const commitCount = () => {
      const value = clamp(parseInt(this.el.count.value, 10) || DEFAULTS.count, LIMITS.count);
      this.state.count = value;
      this.el.count.value = String(value);
      this.el.countValue.textContent = String(value);
      if (this.sim) this.sim.setCount(value);
    };
    this.el.count.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        commitCount();
        this.el.count.blur();
      }
    });
    this.el.count.addEventListener('change', commitCount);

    this.el.speed.addEventListener('input', () => {
      const value = clamp(parseFloat(this.el.speed.value) || DEFAULTS.speed, LIMITS.speed);
      this.state.speed = value;
      this.el.speedValue.textContent = value.toFixed(1);
      if (this.sim) this.sim.setSpeed(value);
    });

    this.el.noise.addEventListener('input', () => {
      const value = clamp(parseFloat(this.el.noise.value) || DEFAULTS.noiseScale, LIMITS.noiseScale);
      this.state.noiseScale = value;
      this.el.noiseValue.textContent = value.toFixed(4);
      if (this.sim) this.sim.setNoiseScale(value);
    });

    this.el.palette.addEventListener('change', () => {
      const key = resolvePalette(this.el.palette.value);
      this.state.paletteKey = key;
      this.el.paletteName.textContent = PALETTES[key].name;
      if (this.sim) {
        this.sim.setPalette(PALETTES[key]);
        this.sim.clear(this.ctx);
      }
    });

    this.el.pause.addEventListener('click', () => {
      this.state.paused = !this.state.paused;
      this.el.pause.textContent = this.state.paused ? 'Resume' : 'Pause';
      this.el.pause.setAttribute('aria-pressed', String(this.state.paused));
      if (!this.state.paused && !this.query.frozen) {
        this._tick();
      }
    });

    this.el.reset.addEventListener('click', () => {
      if (!this.sim) return;
      this.sim.reset(this.state.seed);
      this.sim.setPalette(PALETTES[this.state.paletteKey]);
      this.sim.clear(this.ctx);
      this.displayFrame = 0;
      this.el.frameCounter.textContent = '0';
    });
  }

  _sizeCanvasToWindow() {
    // Render at device-pixel resolution for crisp lines, but keep the logical
    // simulation coordinate space equal to CSS pixels.
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.canvas.width = cssWidth;
    this.canvas.height = cssHeight;
    return { width: cssWidth, height: cssHeight };
  }

  _runLive() {
    const { width, height } = this._sizeCanvasToWindow();
    this.sim = new FluxSim(width, height, {
      seed: this.state.seed,
      count: this.state.count,
      speed: this.state.speed,
      noiseScale: this.state.noiseScale,
      palette: PALETTES[this.state.paletteKey],
    });
    this.sim.clear(this.ctx);
    this._syncControlsToState();
    this.el.status.textContent = 'Live';
    this.el.status.dataset.mode = 'live';

    // Re-fit on resize: rebuild the sim for the new dimensions (live only).
    window.addEventListener('resize', () => {
      if (this.query.frozen) return;
      const dims = this._sizeCanvasToWindow();
      this.sim.width = dims.width;
      this.sim.height = dims.height;
      this.sim.reset(this.state.seed);
      this.sim.setPalette(PALETTES[this.state.paletteKey]);
      this.sim.setSpeed(this.state.speed);
      this.sim.setNoiseScale(this.state.noiseScale);
      this.sim.setCount(this.state.count);
      this.sim.clear(this.ctx);
      this.displayFrame = 0;
    });

    this._tick();
  }

  _tick() {
    if (this.state.paused || this.query.frozen) return;
    this.sim.fade(this.ctx);
    this.sim.step();
    this.sim.draw(this.ctx);
    this.displayFrame += 1;
    this.el.frameCounter.textContent = String(this.displayFrame);
    this.rafId = window.requestAnimationFrame(() => this._tick());
  }

  // Deterministic frozen render: a fixed-resolution canvas, exactly N steps,
  // then nothing. No animation loop, so the result is byte-stable for capture.
  _runFrozen() {
    this.canvas.style.width = `${FROZEN_WIDTH}px`;
    this.canvas.style.height = `${FROZEN_HEIGHT}px`;
    this.canvas.width = FROZEN_WIDTH;
    this.canvas.height = FROZEN_HEIGHT;
    // Pin the page to the frozen size so a full-page screenshot is exactly
    // 1920x1080 with the canvas filling it.
    document.body.classList.add('is-frozen');

    this.sim = new FluxSim(FROZEN_WIDTH, FROZEN_HEIGHT, {
      seed: this.state.seed,
      count: this.state.count,
      speed: this.state.speed,
      noiseScale: this.state.noiseScale,
      palette: PALETTES[this.state.paletteKey],
    });
    this.sim.clear(this.ctx);

    const frames = this.query.frame;
    for (let f = 0; f < frames; f++) {
      this.sim.fade(this.ctx);
      this.sim.step();
      this.sim.draw(this.ctx);
    }

    this.displayFrame = frames;
    this.state.paused = true;
    this._syncControlsToState();
    this.el.frameCounter.textContent = String(frames);
    this.el.status.textContent = `Frozen @ ${frames}`;
    this.el.status.dataset.mode = 'frozen';
    this.el.pause.textContent = 'Resume';
    // Expose a machine-readable flag so the coordinator can confirm the sim
    // has settled and no RAF loop is running. Both a body data attribute and a
    // window flag are set so screenshot tooling can wait on either.
    document.body.dataset.fluxFrozen = 'true';
    document.body.dataset.fluxFrame = String(frames);
    window.__fluxFrozen = true;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Expose the instance for debugging / automated verification.
  window.fluxApp = new FluxApp();
});
