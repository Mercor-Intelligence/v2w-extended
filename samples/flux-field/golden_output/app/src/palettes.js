// Named color palettes for the flow field.
//
// Each palette declares:
//   name        display label shown in the control panel
//   background  the canvas clear color (also the trail-fade tint)
//   fade        per-frame trail opacity (lower = longer, silkier trails)
//   stops       an ordered list of [r, g, b] control points; a particle's
//               color is sampled from this gradient by its flow angle, so
//               neighbouring streams share a hue and the field reads as a
//               continuous aurora/ember/etc.
//
// Colors are plain RGB arrays so the renderer can interpolate them without any
// CSS parsing in the hot loop (which keeps rendering deterministic and fast).

export const PALETTES = {
  aurora: {
    name: 'Aurora',
    background: [6, 10, 20],
    fade: 0.045,
    stops: [
      [34, 211, 238], // cyan
      [56, 189, 248], // sky
      [129, 140, 248], // indigo
      [167, 139, 250], // violet
      [52, 211, 153], // emerald
      [110, 231, 183], // mint
    ],
  },
  ember: {
    name: 'Ember',
    background: [16, 7, 6],
    fade: 0.05,
    stops: [
      [251, 191, 36], // amber
      [249, 115, 22], // orange
      [239, 68, 68], // red
      [220, 38, 38], // crimson
      [253, 224, 71], // gold
      [248, 113, 113], // coral
    ],
  },
  mono: {
    name: 'Mono',
    background: [10, 10, 12],
    fade: 0.04,
    stops: [
      [245, 245, 247], // near white
      [212, 212, 216], // zinc 300
      [161, 161, 170], // zinc 400
      [113, 113, 122], // zinc 500
      [228, 228, 231], // zinc 200
      [180, 180, 188], // soft grey
    ],
  },
};

// Default ordering used by the palette selector / cycle button.
export const PALETTE_ORDER = ['aurora', 'ember', 'mono'];

// Resolve a palette key from a query param or UI value, defaulting to aurora.
export function resolvePalette(key) {
  if (typeof key === 'string') {
    const normalized = key.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(PALETTES, normalized)) {
      return normalized;
    }
  }
  return 'aurora';
}

// Sample the palette gradient at t in [0, 1), returning an [r, g, b] triple.
// The gradient is treated as a closed loop so the last stop blends back to the
// first, giving seamless color transitions across the full angular range.
export function sampleStops(stops, t) {
  const n = stops.length;
  const scaled = ((t % 1) + 1) % 1 * n;
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const a = stops[i % n];
  const b = stops[(i + 1) % n];
  return [
    Math.round(a[0] + (b[0] - a[0]) * frac),
    Math.round(a[1] + (b[1] - a[1]) * frac),
    Math.round(a[2] + (b[2] - a[2]) * frac),
  ];
}
