// shaders.js
// GLSL source for the Prism scene. Kept as ES-module string exports so the
// shaders are bundled with the page (no runtime fetch), which keeps every
// frame a pure function of the uniforms and therefore byte-stable.
//
// The 3D simplex noise routine below is the classic Ashima / Stefan Gustavson
// implementation ("webgl-noise", MIT license). It uses only polynomial math
// and a permutation-free gradient construction, so it produces identical
// results on hardware GL and on software WebGL (SwiftShader / llvmpipe).

// Shared noise + fractional Brownian motion. Injected into both shaders.
export const NOISE_GLSL = /* glsl */ `
// --- Ashima 3D simplex noise (MIT) -----------------------------------------
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractional Brownian motion: 5 octaves of simplex, fixed lacunarity / gain.
float fbm(vec3 p){
  float total = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++){
    total += snoise(p * freq) * amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  return total;
}
`;

export const VERTEX_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uAmplitude;   // displacement strength
uniform float uFrequency;   // noise frequency
uniform float uSwirl;       // domain-warp / flow speed

varying vec3  vNormalW;
varying vec3  vViewDirW;
varying float vDisp;        // signed displacement, for fragment coloring
varying vec3  vObjPos;

${NOISE_GLSL}

void main(){
  // Animate by feeding uTime into the noise domain. A flow vector slowly
  // rotates the field so the surface appears to churn rather than pulse.
  vec3 flow = vec3(0.0, uTime * 0.18 * uSwirl, uTime * 0.12 * uSwirl);
  vec3 np   = position * uFrequency + flow;

  float n = fbm(np);
  vDisp = n;

  // Displace along the (object-space) normal.
  vec3 displaced = position + normal * n * uAmplitude;

  // Recompute a perturbed normal via central differences on the noise field
  // so lighting tracks the displaced surface (cheap, software-GL friendly).
  float eps = 0.35;
  vec3 tangent  = normalize(cross(normal, vec3(0.0, 1.0, 0.0) + 1e-4));
  vec3 bitangent = normalize(cross(normal, tangent));
  float nT = fbm((position + tangent  * eps) * uFrequency + flow);
  float nB = fbm((position + bitangent * eps) * uFrequency + flow);
  vec3 perturbed = normalize(normal
      - tangent  * (nT - n) * uAmplitude * 2.2
      - bitangent * (nB - n) * uAmplitude * 2.2);

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vNormalW  = normalize(mat3(modelMatrix) * perturbed);
  vViewDirW = normalize(cameraPosition - worldPos.xyz);
  vObjPos   = position;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uHue;         // base hue rotation [0,1]
uniform float uColorA;      // preset color stop A (hue offset)
uniform float uColorB;      // preset color stop B (hue offset)
uniform float uIridescence; // strength of the thin-film color shift
uniform float uExposure;

varying vec3  vNormalW;
varying vec3  vViewDirW;
varying float vDisp;
varying vec3  vObjPos;

// HSV -> RGB (deterministic, branch-free).
vec3 hsv2rgb(vec3 c){
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDirW);

  // Fresnel: rim glows, facing surfaces stay darker.
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

  // Iridescence: shift hue by view angle and surface displacement, mimicking
  // a thin-film / prism interference pattern. The hue excursion is bounded to
  // a span around the preset's base hue (uColorA..uColorB) so warm presets
  // stay warm and cool presets stay cool: iridescence widens the band rather
  // than rotating freely around the wheel.
  float band = clamp(fres * 1.15 + vDisp * 1.1 + 0.42 + sin(uTime * 0.25) * 0.05, 0.0, 1.0);
  float span = mix(uColorA, uColorB, band) * (0.55 + 0.45 * uIridescence);
  float hue  = fract(uHue + span);

  vec3 iri = hsv2rgb(vec3(hue, 0.78, 1.0));

  // Two soft key lights for form, plus the fresnel rim.
  vec3 L1 = normalize(vec3(0.6, 0.8, 0.5));
  vec3 L2 = normalize(vec3(-0.5, -0.2, 0.7));
  float diff = clamp(dot(N, L1), 0.0, 1.0) * 0.7 + clamp(dot(N, L2), 0.0, 1.0) * 0.3;

  vec3 baseCol = hsv2rgb(vec3(fract(uHue + 0.5), 0.55, 0.22));
  vec3 color = baseCol + iri * (0.35 + diff * 0.65);
  color += iri * fres * 1.3;            // rim light tinted by iridescence
  color += vec3(0.9, 0.95, 1.0) * pow(fres, 6.0) * 0.5; // crisp specular edge

  // Tone map + gamma for a filmic look. Output is linear; renderer converts
  // to sRGB via outputColorSpace, so colors are stable across captures.
  color *= uExposure;
  color = color / (color + vec3(1.0));  // Reinhard
  gl_FragColor = vec4(color, 1.0);
}
`;

// Backdrop starfield point shader: tiny twinkle driven purely by uTime + a
// per-point random phase baked into the geometry (seeded on the JS side).
export const STAR_VERTEX = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uPixelRatio;
attribute float aScale;
attribute float aPhase;
varying float vTwinkle;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTwinkle = 0.6 + 0.4 * sin(uTime * 0.8 + aPhase * 6.2831853);
  gl_PointSize = aScale * uPixelRatio * (140.0 / -mv.z) * vTwinkle;
  gl_Position = projectionMatrix * mv;
}
`;

export const STAR_FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uColor;
varying float vTwinkle;
void main(){
  // Soft round sprite.
  vec2 d = gl_PointCoord - vec2(0.5);
  float r = length(d);
  float a = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(uColor * (0.5 + vTwinkle), a * vTwinkle);
}
`;
