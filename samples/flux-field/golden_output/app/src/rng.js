// Deterministic pseudo-random number generation.
//
// The whole point of Flux is that the artwork is a pure function of
// (seed, frame). Every source of randomness in the render path flows through
// the mulberry32 generator below. There are no bare Math.random() calls in the
// simulation, so advancing the same seed by the same number of fixed-dt steps
// always produces a byte-identical canvas.

// mulberry32: a tiny, fast, well-distributed 32-bit PRNG.
// Reference algorithm by Tommy Ettinger / bryc (public domain). Given the same
// 32-bit seed it always yields the same stream of floats in [0, 1).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash an arbitrary seed string into a 32-bit unsigned integer so that text
// seeds (?seed=aurora) and numeric seeds (?seed=1) both map deterministically
// to a mulberry32 starting state. This is the cyrb53-style xmur3 mixer.
export function hashSeed(input) {
  const str = String(input);
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

// Normalize a raw seed value (string or number) into a 32-bit integer seed.
// Pure numeric seeds pass through unchanged so "?seed=1" is exactly 1.
export function normalizeSeed(value) {
  if (value === null || value === undefined || value === '') {
    return 1;
  }
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && String(value).trim() !== '') {
    return asNumber >>> 0;
  }
  return hashSeed(value);
}
