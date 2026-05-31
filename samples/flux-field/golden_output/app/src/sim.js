// The Flux flow-field simulation.
//
// This module is the deterministic core. A FluxSim instance is a pure function
// of (seed, frame, parameters): construct it with a seed, advance it by N steps
// with a FIXED timestep, and the particle positions are identical every time.
// Nothing here reads the wall clock; the only randomness comes from the seeded
// mulberry32 generators threaded through it.

import { createNoise2D } from '../assets/lib/simplex-noise.js';
import { mulberry32 } from './rng.js';
import { sampleStops } from './palettes.js';

// Fixed integration timestep. Every step advances the field by exactly this
// amount, so "frame N" is well-defined independent of frame rate or wall time.
export const FIXED_DT = 1;

// How far the flow field itself drifts per step (the third "z" dimension of the
// noise, faked by offsetting the sample coordinates). Small and constant so the
// motion is gentle and reproducible.
const FIELD_DRIFT = 0.0016;

// Two full turns of curl: mapping noise [-1,1] onto angle gives swirling flow.
const TWO_PI = Math.PI * 2;

export class FluxSim {
  constructor(width, height, options = {}) {
    this.width = width;
    this.height = height;
    this.params = {
      count: options.count ?? 1800,
      speed: options.speed ?? 1.6,
      noiseScale: options.noiseScale ?? 0.0024,
      palette: options.palette ?? null, // resolved palette object
    };
    this.frame = 0;
    this.noise2D = null;
    this.particleRng = null;
    this.particles = null;
    this.reset(options.seed ?? 1);
  }

  // Re-seed everything: rebuild the noise field and respawn every particle from
  // the seed. After reset(seed) the sim is at frame 0 in a fully defined state.
  reset(seed) {
    this.seed = seed >>> 0;
    // Distinct but seed-derived streams for the field vs the particles, so the
    // two never accidentally correlate yet both stay deterministic.
    this.noise2D = createNoise2D(mulberry32(this.seed ^ 0x9e3779b9));
    this.particleRng = mulberry32(this.seed ^ 0x85ebca6b);
    this.frame = 0;
    this._spawnParticles(this.params.count);
  }

  _spawnParticles(count) {
    const rng = this.particleRng;
    const particles = new Array(count);
    for (let i = 0; i < count; i++) {
      particles[i] = {
        x: rng() * this.width,
        y: rng() * this.height,
        // A per-particle hue offset keeps streams visually distinct while still
        // being seed-determined.
        hue: rng(),
        // Remaining life before a deterministic respawn (keeps the field full
        // instead of draining toward the edges).
        life: 40 + Math.floor(rng() * 140),
      };
    }
    this.particles = particles;
    this.params.count = count;
  }

  // Change particle count deterministically. Growing keeps existing particles
  // and spawns new ones from the same stream; shrinking truncates. Either way
  // the result depends only on (seed, prior history, count).
  setCount(count) {
    const target = Math.max(1, Math.floor(count));
    const current = this.particles.length;
    if (target === current) return;
    if (target < current) {
      this.particles.length = target;
    } else {
      const rng = this.particleRng;
      for (let i = current; i < target; i++) {
        this.particles.push({
          x: rng() * this.width,
          y: rng() * this.height,
          hue: rng(),
          life: 40 + Math.floor(rng() * 140),
        });
      }
    }
    this.params.count = target;
  }

  setSpeed(speed) {
    this.params.speed = speed;
  }

  setNoiseScale(scale) {
    this.params.noiseScale = scale;
  }

  setPalette(palette) {
    this.params.palette = palette;
  }

  // Advance the simulation by exactly one fixed timestep. Particle motion is
  // governed entirely by the noise field sampled at the particle position plus
  // a constant drift; respawns are driven by the seeded particle stream.
  step() {
    const { speed, noiseScale } = this.params;
    const drift = this.frame * FIELD_DRIFT;
    const rng = this.particleRng;
    const w = this.width;
    const h = this.height;
    const particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const angle =
        this.noise2D(p.x * noiseScale + drift, p.y * noiseScale - drift) *
        TWO_PI *
        2;
      p.px = p.x;
      p.py = p.y;
      p.x += Math.cos(angle) * speed * FIXED_DT;
      p.y += Math.sin(angle) * speed * FIXED_DT;
      p.life -= 1;

      // Deterministic respawn: off-canvas or out of life -> new seeded position.
      if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = rng() * w;
        p.y = rng() * h;
        p.px = p.x;
        p.py = p.y;
        p.hue = rng();
        p.life = 40 + Math.floor(rng() * 140);
      }
    }
    this.frame += 1;
  }

  // Lay down the trail-fade veil for this frame. Painting a translucent rect of
  // the palette background over the whole canvas makes previous strokes decay,
  // producing the silky fading trails.
  fade(ctx) {
    const palette = this.params.palette;
    const [r, g, b] = palette.background;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${palette.fade})`;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw the current particle segments. Called once per rendered frame after
  // fade(). Colors come from the palette gradient indexed by flow angle + the
  // particle's own seeded hue offset.
  draw(ctx) {
    const palette = this.params.palette;
    const stops = palette.stops;
    const particles = this.particles;
    ctx.lineWidth = 1.15;
    ctx.lineCap = 'round';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.px === undefined) continue;
      const dx = p.x - p.px;
      const dy = p.y - p.py;
      const t = (Math.atan2(dy, dx) / TWO_PI + 1 + p.hue) % 1;
      const [cr, cg, cb] = sampleStops(stops, t);
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.85)`;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  // Paint the solid background once (used on (re)initialization before any
  // trails exist so the canvas starts from the palette base color).
  clear(ctx) {
    const [r, g, b] = this.params.palette.background;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
