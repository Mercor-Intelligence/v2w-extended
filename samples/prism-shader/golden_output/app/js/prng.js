// prng.js
// A tiny seeded pseudo-random generator (mulberry32). Used for the starfield
// positions/phases so the backdrop is identical on every load and every
// machine. No bare Math.random() is used anywhere in the render path.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convenience: a stable float in [min, max).
export function range(rng, min, max) {
  return min + (max - min) * rng();
}
