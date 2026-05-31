/* ============================================================
   Lumina hero background - raw WebGL aurora/flow shader.
   No external libraries. Custom GLSL fragment shader.

   Determinism / freeze:
   - Reads ?frame=N from the URL.
   - When frame is present: advances exactly N fixed-step ticks
     (uTime = N * DT) and renders ONE settled frame, then stops.
     The shader uses NO wall-clock input, so the output is byte-stable.
   - When frame is absent: animates live off a rAF accumulator that
     also uses the fixed DT (independent of real elapsed time), so the
     motion is reproducible and never depends on frame rate jitter.
   ============================================================ */

const DT = 1 / 60; // fixed timestep in seconds

const VERT_SRC = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/* Aurora / flow field. Layered value-noise domain-warped and mapped to a
   green -> cyan -> violet palette, with a soft vignette so the hero copy
   stays readable. Everything is driven by uTime + uSeed (deterministic). */
const FRAG_SRC = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uSeed;

// hash / value noise (deterministic, no textures)
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02 + 11.0;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  // keep aspect so flow is not stretched on wide screens
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.06 + uSeed;

  // domain warp -> flowing aurora ribbons
  vec2 q = vec2(
    fbm(p * 1.6 + vec2(0.0, t)),
    fbm(p * 1.6 + vec2(5.2, -t * 0.8))
  );
  vec2 r = vec2(
    fbm(p * 1.9 + 3.4 * q + vec2(1.7 + t * 0.5, 9.2)),
    fbm(p * 1.9 + 3.4 * q + vec2(8.3, 2.8 - t * 0.4))
  );
  float f = fbm(p * 1.7 + 3.0 * r);

  // palette: deep navy -> green -> cyan -> violet
  vec3 navy   = vec3(0.018, 0.027, 0.051);
  vec3 green  = vec3(0.262, 0.960, 0.643);
  vec3 cyan   = vec3(0.310, 0.840, 1.000);
  vec3 violet = vec3(0.486, 0.545, 1.000);

  vec3 col = navy;
  col = mix(col, green,  smoothstep(0.30, 0.78, f));
  col = mix(col, cyan,   smoothstep(0.55, 0.95, f) * 0.85);
  col = mix(col, violet, smoothstep(0.62, 1.05, length(r)) * 0.6);

  // ribbon highlights
  float ribbon = smoothstep(0.42, 0.5, f) - smoothstep(0.5, 0.58, f);
  col += green * ribbon * 0.5;

  // gentle drifting glow blobs anchored top-left / right
  float g1 = exp(-3.5 * length(p - vec2(0.35 + 0.06 * sin(t * 1.3), 0.75)));
  float g2 = exp(-4.0 * length(p - vec2(1.15 + 0.05 * cos(t), 0.35)));
  col += green * g1 * 0.18 + violet * g2 * 0.16;

  // vignette toward the bottom + corners for text legibility
  float vig = smoothstep(1.25, 0.25, length((uv - vec2(0.5, 0.46)) * vec2(1.1, 1.3)));
  col *= mix(0.55, 1.0, vig);
  col *= mix(1.0, 0.7, uv.y); // darker low so copy block reads

  // subtle film grain (deterministic on fragment + time)
  float grain = (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.025;
  col += grain;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile error: " + info);
  }
  return sh;
}

function buildProgram(gl) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Program link error: " + gl.getProgramInfoLog(prog));
  }
  return prog;
}

/* Fallback: paint a static CSS gradient if WebGL is unavailable. */
function paintFallback(canvas) {
  canvas.style.background =
    "radial-gradient(60% 80% at 30% 25%, rgba(67,245,164,0.28), transparent 60%)," +
    "radial-gradient(50% 70% at 85% 30%, rgba(124,139,255,0.22), transparent 60%)," +
    "linear-gradient(180deg, #070b16, #05070d)";
}

export function initHero(canvas, options) {
  const opts = options || {};
  const seed = typeof opts.seed === "number" ? opts.seed : 7.0;
  // frame === null => live animation; integer => freeze at that frame.
  const freezeFrame = opts.freezeFrame;

  const gl =
    canvas.getContext("webgl", { antialias: true, alpha: false, preserveDrawingBuffer: true }) ||
    canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    paintFallback(canvas);
    return { frozen: true, fallback: true };
  }

  let prog;
  try {
    prog = buildProgram(gl);
  } catch (err) {
    console.error(err);
    paintFallback(canvas);
    return { frozen: true, fallback: true };
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // single big triangle
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(prog, "aPos");
  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uSeed = gl.getUniformLocation(prog, "uSeed");

  // Cap DPR for stable, affordable rendering across machines.
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const w = Math.max(1, Math.floor(canvas.clientWidth * DPR));
    const h = Math.max(1, Math.floor(canvas.clientHeight * DPR));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function draw(timeSeconds) {
    resize();
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, timeSeconds);
    gl.uniform1f(uSeed, seed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ---- Frozen mode: advance exactly N fixed steps, render once. ----
  if (freezeFrame !== null && freezeFrame !== undefined) {
    const n = Math.max(0, Math.floor(freezeFrame));
    draw(n * DT);
    // Re-draw once after layout settles so canvas client size is final.
    requestAnimationFrame(() => draw(n * DT));
    // Re-render on resize so a captured viewport change stays correct,
    // but never advance time (stays at the same frozen frame).
    window.addEventListener("resize", () => draw(n * DT));
    return { frozen: true, fallback: false, frame: n };
  }

  // ---- Live mode: fixed-DT accumulator, frame-rate independent. ----
  let ticks = 0;
  let raf = 0;
  function loop() {
    ticks += 1; // one fixed step per displayed frame
    draw(ticks * DT);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  window.addEventListener("resize", () => draw(ticks * DT));

  return {
    frozen: false,
    fallback: false,
    stop() {
      cancelAnimationFrame(raf);
    },
  };
}
