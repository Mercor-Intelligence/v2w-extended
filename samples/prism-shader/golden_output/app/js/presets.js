// presets.js
// Named look presets. Each preset is a complete, deterministic set of control
// values. Selecting a preset writes these straight into the uniforms and the
// control panel, so "?preset=aurora" fully determines the frame.

export const PRESETS = {
  aurora: {
    label: 'Aurora',
    amplitude: 0.42,
    frequency: 1.35,
    swirl: 1.0,
    hue: 0.46, // teal / green start
    colorA: 0.0,
    colorB: 0.34, // sweeps green -> violet
    iridescence: 0.55,
    exposure: 1.25,
    background: ['#04121b', '#0a2233', '#02060b'], // top, mid, bottom
    star: '#bfe9ff',
  },
  ember: {
    label: 'Ember',
    amplitude: 0.55,
    frequency: 1.05,
    swirl: 0.8,
    hue: 0.02, // red / orange start
    colorA: 0.0,
    colorB: 0.16, // sweeps red -> gold
    iridescence: 0.4,
    exposure: 1.35,
    background: ['#1a0a06', '#2a1108', '#0c0402'],
    star: '#ffd9b0',
  },
  nebula: {
    label: 'Nebula',
    amplitude: 0.48,
    frequency: 1.6,
    swirl: 1.2,
    hue: 0.74, // magenta / indigo start
    colorA: 0.0,
    colorB: 0.42,
    iridescence: 0.65,
    exposure: 1.2,
    background: ['#0d0620', '#1b0e3a', '#050211'],
    star: '#e6c8ff',
  },
};

export const DEFAULT_PRESET = 'aurora';

// Deep copy so callers can mutate freely without touching the table.
export function clonePreset(name) {
  const p = PRESETS[name] || PRESETS[DEFAULT_PRESET];
  return JSON.parse(JSON.stringify(p));
}
