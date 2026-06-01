# Prism: Real-Time Iridescent Shader Scene

A single-page WebGL toy that renders an original GLSL shader study: a noise-displaced icosahedron with fresnel rim lighting and shifting prism colors, a twinkling starfield backdrop, mouse-orbit controls, and a glassy control panel. The scene is a pure function of a uniform time value and the controls, so any given URL produces a byte-identical frame, including under headless software rendering (SwiftShader).

## Project Overview

This vanilla HTML/CSS/JS application delivers:

- A full-bleed **WebGL canvas** filled by a custom-shaded central mesh (an `IcosahedronGeometry`) displaced in a **custom vertex shader** using 5-octave fractional Brownian motion over 3D simplex noise.
- A **custom fragment shader** producing a fresnel rim glow and iridescent, prism-like color that shifts with view angle and surface displacement, finished with a Reinhard tone map.
- Slow, deterministic **auto-rotation**, plus **OrbitControls** (drag to orbit, scroll to zoom).
- A subtle **starfield** of 1,400 additive points with a per-point twinkle, seeded by a fixed PRNG so the backdrop is identical on every load.
- A soft **background gradient + vignette** that retints per preset.
- A polished, glassy **control panel**: labeled sliders (Displacement, Noise Frequency, Hue, Iridescence), a **Wireframe** toggle, and three preset buttons (**Aurora**, **Ember**, **Nebula**) with an active-preset indicator.
- A **deterministic freeze** mechanism driven by URL query params for byte-stable screenshot capture.

## CDA / V2W Coordinate

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| CDA level      | L2: Interactive Frontend (Design sub-track B: WebGL / 3D)                               |
| V2W type       | `frontend` (single page) with a natural-language `prompt.txt` |
| Metrics        | VS (visual score, graded 0-5 incl. originality/motion/polish) plus a light FS (GUI-agent) pass over the controls |
| Rendering note | Authored to run under software WebGL (`chromium --use-gl=swiftshader`) with byte-stable frozen frames |

## Technology Stack

| Layer        | Choice                                  | Why                                                        |
| ------------ | --------------------------------------- | ---------------------------------------------------------- |
| Rendering    | **Three.js r160** (vendored)            | Mature WebGL abstraction, stable `ShaderMaterial` API      |
| Controls     | **OrbitControls** (Three.js addon)      | Mouse orbit / zoom interactivity                           |
| Shaders      | **Hand-written GLSL** (vertex+fragment) | The core of the piece: FBM displacement + fresnel iridescence |
| Noise        | **Ashima 3D simplex** (in-shader, MIT)  | Polynomial noise, identical on hardware and software GL    |
| Determinism  | **Seeded PRNG** (mulberry32) + fixed dt | No bare `Math.random()`, no wall-clock in the render path  |
| Module load  | **ES modules + `<script type="importmap">`** | Loads vendored `three` locally, no runtime CDN        |
| Styling      | **Hand-crafted CSS (variables)**        | Glass panel, gradient/vignette, responsive breakpoints     |
| Font         | **Space Grotesk** (local woff2)         | Vendored from Google Fonts, no remote font request         |
| Server       | **Python stdlib http.server**           | Pure static serve on port 3000, zero build step            |

## Directory Structure

```
samples/prism-shader/
├── README.md                     # This file
├── prompt.txt                    # Natural-language brief (the agent's input)
├── workflow.json                 # VS-capture + functional test spec
├── prototypes/                   # Reference screenshots (committed), one per VS-capture group
├── resources/                    # Vendored source assets (provenance below)
│   ├── vendor/
│   │   ├── three.module.js       # Three.js r0.160.1 ES module
│   │   ├── OrbitControls.js      # Three.js r0.160.1 addon
│   │   └── THREE_LICENSE.txt     # Three.js MIT license
│   └── fonts/
│       ├── google.css            # Captured Google Fonts CSS (provenance)
│       ├── SpaceGrotesk-latin.woff2
│       └── SpaceGrotesk-latin-ext.woff2
└── golden_output/
    ├── start.sh                  # Static server bootstrap (localhost:3000)
    └── app/
        ├── index.html            # Page shell + importmap + panel DOM
        ├── .gitignore
        ├── css/
        │   └── style.css         # Panel, gradient/vignette, responsive UI
        ├── js/
        │   ├── app.js            # Scene, deterministic loop, freeze logic, __prismReady
        │   ├── shaders.js        # GLSL: simplex + FBM, vertex, fragment, star shaders
        │   ├── panel.js          # Control panel wiring (sliders, toggle, presets)
        │   ├── presets.js        # Aurora / Ember / Nebula look tables
        │   └── prng.js           # mulberry32 seeded PRNG
        ├── vendor/three/
        │   ├── three.module.js
        │   ├── LICENSE.txt
        │   └── addons/controls/OrbitControls.js
        └── assets/fonts/
            ├── SpaceGrotesk-latin.woff2
            └── SpaceGrotesk-latin-ext.woff2
```

## How to Run

```bash
bash golden_output/start.sh
```

Then open **http://localhost:3000**. The script static-serves `app/` on port 3000 (Python stdlib, with an `npx serve` fallback). There is no build step and no network access at runtime.

- Live, animated: `http://localhost:3000/`
- Frozen Aurora frame: `http://localhost:3000/?t=2.0&preset=aurora`
- Frozen Ember frame: `http://localhost:3000/?t=2.0&preset=ember`

## Feature List

### Rendering
- Custom `ShaderMaterial` on a subdivided icosahedron (`detail = 64`).
- Vertex shader: 5-octave FBM over 3D simplex noise displaces the surface along its normal; a central-difference perturbed normal keeps lighting consistent with the deformed surface.
- Fragment shader: fresnel rim term, iridescent hue driven by view angle + displacement + preset color stops, two soft key lights, crisp specular edge, Reinhard tone map. Output color space is sRGB.
- Additive starfield (1,400 points) with per-point seeded scale and twinkle phase.
- Background gradient + vignette retinted per preset.

### Interaction
- OrbitControls: left-drag to orbit, scroll to zoom (pan disabled, distance clamped). Damping is on live, off when frozen so the captured frame is exact.
- Control panel sliders: Displacement, Noise Frequency, Hue (shown in degrees), Iridescence. Each updates its uniform live and shows its current value.
- Wireframe toggle with a visible On/Off state.
- Aurora / Ember / Nebula preset buttons; the active preset is highlighted and named in the panel.
- Collapsible panel for small screens.

### Responsive
- Desktop, tablet (1024px), and mobile (640px) breakpoints. On mobile the panel docks to the bottom and the tagline/hint code are hidden.

## Determinism / Freeze Mechanism

The render is a pure function of `(uTime, controls)` and never reads the wall clock for animation or layout.

- **Live mode** (no `?t`): `uTime` advances by a fixed `dt = 1/60` each frame via a frame accumulator, not by elapsed real time. The animation is smooth and reproducible.
- **Frozen mode** (`?t=T` present): `uTime` is pinned to `T`, OrbitControls damping is disabled, exactly one settled frame is rendered, and the loop does not advance. The same `?t&preset&wireframe` URL yields a byte-identical frame.
- All randomness (starfield positions, scales, twinkle phases) comes from a fixed-seed `mulberry32` PRNG. There is no bare `Math.random()` in any render path.
- The pixel ratio is clamped to `min(devicePixelRatio, 2)` so the frame buffer size is stable across displays, and the shader noise is the polynomial Ashima simplex implementation, which evaluates identically on hardware GL and software WebGL.

### Query parameters

| Param       | Values             | Effect                                              |
| ----------- | ------------------ | --------------------------------------------------- |
| `t`         | float (seconds)    | Freeze `uTime` at this value; render one still frame |
| `preset`    | `aurora`/`ember`/`nebula` | Apply the named look preset                  |
| `wireframe` | `0` / `1`          | Render the mesh as wireframe                        |

Example: `http://localhost:3000/?t=2.0&preset=ember&wireframe=1`

### Settle signal

The page sets `window.__prismReady = true` (and `document.documentElement[data-prism-ready="true"]`) only after fonts have loaded and the first WebGL frame has been presented (guarded by two `requestAnimationFrame` ticks). A capture harness should wait for `window.__prismReady === true` before screenshotting. Recommended capture: load the frozen URL, wait for `window.__prismReady`, then capture.

### SwiftShader capture note

For byte-stable headless capture, render with Chromium's software WebGL backend, for example:

```
chromium --headless --use-gl=swiftshader --use-angle=swiftshader \
  --window-size=1920,1080 --hide-scrollbars \
  "http://localhost:3000/?t=2.0&preset=aurora"
```

Wait until `window.__prismReady` is true, then grab the screenshot. Because the frame is a pure function of the URL and the noise/PRNG are deterministic, repeated captures of the same URL match byte-for-byte.

## Resources

All assets were downloaded at authoring time and are vendored locally; nothing is fetched from the network at runtime.

| Asset | Vendored path | Source URL | Version | License |
| ----- | ------------- | ---------- | ------- | ------- |
| Three.js core (ES module) | `app/vendor/three/three.module.js` | `https://unpkg.com/three@0.160.1/build/three.module.js` | r0.160.1 | MIT (see `app/vendor/three/LICENSE.txt`) |
| OrbitControls addon | `app/vendor/three/addons/controls/OrbitControls.js` | `https://unpkg.com/three@0.160.1/examples/jsm/controls/OrbitControls.js` | r0.160.1 | MIT (same project) |
| Space Grotesk (latin) | `app/assets/fonts/SpaceGrotesk-latin.woff2` | `https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2` | v22 | SIL Open Font License 1.1 |
| Space Grotesk (latin-ext) | `app/assets/fonts/SpaceGrotesk-latin-ext.woff2` | `https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPb94C_k3HqUtEw.woff2` | v22 | SIL Open Font License 1.1 |

The in-shader 3D simplex noise routine in `app/js/shaders.js` is the classic Ashima Arts / Stefan Gustavson "webgl-noise" implementation, used under the MIT license.

## How to Demo / Walk Through

1. Run `bash golden_output/start.sh` and open `http://localhost:3000/`. The crystal slowly rotates and the colors drift; drag to orbit and scroll to zoom.
2. Open `http://localhost:3000/?t=2.0&preset=aurora`. The scene freezes on the cool teal/violet Aurora frame with the panel showing "Active preset: Aurora" (workflow group 0).
3. Open `http://localhost:3000/?t=2.0&preset=ember`. The same moment in warm red/gold; the panel reads "Active preset: Ember" (workflow group 1).
4. Back on the live page, click the **Wireframe** toggle in the panel. The mesh switches to a wireframe of edges and the toggle reads "On" (workflow group 2).
5. Click the **Ember** preset button. The scene retints to warm tones and the panel marks Ember active (workflow group 3).
6. Click the **Aurora** preset button. The scene returns to cool teal/violet and Aurora is active again (workflow group 4).

## Run inference, evaluation, and analysis on a fresh laptop

Runs the full Vision2Web harness on this single sample, blind, from a clean machine.
Prerequisites: Docker running, Node 18+, Python 3.8+, and an Anthropic API key.

```bash
# 1. Clone and install the harness
git clone https://github.com/Mercor-Intelligence/v2w-extended.git
cd v2w-extended
pip install -e .
pip install 'litellm[proxy]'

# 2. Build the stock sandbox image (Node + Python + Playwright/Chromium + openhands)
bash docker/build.sh

# 3. Start a LiteLLM proxy that routes the model id to Anthropic Opus.
#    Replace sk-ant-YOUR-KEY with your real key (do not commit it; litellm_config.yaml is gitignored).
cat > litellm_config.yaml <<'YAML'
model_list:
  - model_name: claude-opus-4-8
    litellm_params:
      model: anthropic/claude-opus-4-8
      api_key: os.environ/ANTHROPIC_API_KEY
general_settings:
  master_key: sk-v2w-local-proxy
litellm_settings:
  drop_params: true
  request_timeout: 3600
YAML
ANTHROPIC_API_KEY=sk-ant-YOUR-KEY litellm --config litellm_config.yaml --host 0.0.0.0 --port 4000 &

# 4. Stage THIS sample into the datasets/ layout the harness discovers
mkdir -p datasets/frontend/prism-shader
cp -r samples/prism-shader/prompt.txt samples/prism-shader/workflow.json \
      samples/prism-shader/resources samples/prism-shader/prototypes \
      datasets/frontend/prism-shader/

# 5. INFERENCE (no prototypes: the model builds blind from prompt.txt + resources).
#    Records results/frontend/openhands/claude-opus-4-8/prism-shader/trajectory.json (the chain-of-thought dump).
python3 -m vision2web.cli inference \
  --framework openhands --model claude-opus-4-8 \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --sandbox vision2web-sandbox:latest \
  --datasets-dir ./datasets --results-dir ./results \
  --max-workers 1 --projects frontend/prism-shader

# 6. EVALUATION (no prototypes: lenient component-presence VS + WebVoyager GUI-agent FS)
python3 -m vision2web.cli evaluate \
  --results-dir ./results --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest \
  --max-workers 1 --projects frontend/prism-shader

# 7. ANALYSIS (prints the VS / FS table)
python3 -m vision2web.cli analyze --results-dir ./results --datasets-dir ./datasets
```

Notes:
- Do not pass `--use-prototypes`: inference stays leakage-free, and the visual judge scores component presence rather than pixel-exact replication.
- The grader loads prototypes as `prototypes/<name>.jpg` keyed to the `workflow.json` prototype names; this sample already ships them.
- Invoke the CLI as `python3 -m vision2web.cli` so it uses this checkout's code.
- The `openhands` framework is pure Python and ships preinstalled in the stock sandbox image, so inference needs no changes to the rest of the repo.
- On Docker Desktop (macOS/Windows) `host.docker.internal` resolves automatically. On Linux, start the container with `--add-host=host.docker.internal:host-gateway`, or point `--base-url` at a host IP the container can reach.
- Per-sample scores: `results/frontend/openhands/claude-opus-4-8/prism-shader/test_results/` (per-component `*_scores.json` for VS; `workflow_*/test_case_*/result.json` for FS).
- To view the reference build instead of running the model: `bash samples/prism-shader/golden_output/start.sh`, then open http://localhost:3000.
