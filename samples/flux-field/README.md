# Flux: Flow Field Studio (Deterministic Generative Canvas)

A full-viewport generative art piece on HTML Canvas 2D. Thousands of tiny particles drift through an invisible flow field driven by smooth simplex noise, each one trailing a thin fading line, so the screen fills with silky, swirling streams of color. A polished, instrument-like control panel floats in the top-left corner with palette, speed, noise-scale, and particle-count controls, a pause/resume toggle, a reset action, and a live frame/seed readout. The artwork is a pure function of seed and frame: the same URL always renders the identical image.

## CDA Coordinate

| Axis | Value |
| ---- | ----- |
| Track | Design sub-track A (SVG / CSS / Canvas) |
| V2W type | `frontend` (single self-contained page, no backend) |
| Metrics | VS (visual similarity) primary, light FS (GUI-agent) on the control panel |
| Determinism | Seeded PRNG plus fixed-timestep stepping; frozen still frame via `?frame=N` |

This sample is visual-first. The bulk of the score is the rendered canvas (VS), captured from deterministic freeze URLs. A light GUI-agent surface (FS) is provided by the control panel: the palette selector, the pause/resume button, and the typed particle-count input are all real, reachable, click/type-testable controls.

## Technology Stack

| Layer | Choice | Why |
| ----- | ------ | --- |
| Rendering | **HTML Canvas 2D** | Direct per-pixel control for thousands of trailed line segments; no WebGL toolchain needed |
| Language | **Vanilla ES modules** (no framework) | Zero build step, fully inspectable, deterministic by construction |
| Noise | **simplex-noise v4** (vendored, `createNoise2D`) | Fast, dependency-free 2D simplex noise; the `createNoise2D(prng)` factory accepts a seeded PRNG so the field is reproducible |
| PRNG | **mulberry32** (hand-written, public domain) | Tiny seeded 32-bit generator; replaces all `Math.random()` in the render path so frame N is byte-stable |
| Display font | **Space Grotesk** (local woff2, variable) | Crisp geometric display type for the panel chrome |
| Mono font | **JetBrains Mono** (local woff2, variable) | Monospaced readouts for frame, seed, and numeric values |
| Styling | **Hand-crafted CSS** (custom properties) | Frosted-glass panel, rounded corners, soft shadows, no runtime cost |
| Server | **Python `http.server`** (Node `npx serve` fallback) | Pure static hosting on port 3000; no install step |

Every runtime asset (the noise library and both fonts) is vendored locally under `golden_output/app/assets/`. There are no CDN script tags, no remote fonts, and no network fetches at runtime.

## Directory Structure

```
samples/flux-field/
├── README.md                 # This file
├── prompt.txt                # The natural-language brief the agent is given
├── workflow.json             # Functional + VS-capture spec (5 groups)
├── .capture.json             # Screenshot manifest (one shot per prototype key)
├── prototypes/               # Empty (.gitkeep); the coordinator renders screenshots here
├── resources/                # Source assets with provenance
│   ├── fonts/
│   │   ├── space-grotesk-latin-variable.woff2
│   │   ├── space-grotesk.google.css        # Google Fonts CSS (source URLs)
│   │   ├── jetbrains-mono-latin-variable.woff2
│   │   └── jetbrains-mono.google.css       # Google Fonts CSS (source URLs)
│   └── lib/
│       └── simplex-noise.js                # Vendored library source
└── golden_output/
    ├── start.sh              # Serves http://localhost:3000 (static)
    └── app/
        ├── index.html        # Canvas + floating control panel markup
        ├── styles.css        # Design system, frosted panel, frozen-capture sizing
        ├── assets/
        │   ├── fonts/        # Space Grotesk + JetBrains Mono (woff2)
        │   └── lib/
        │       └── simplex-noise.js   # createNoise2D, used by sim.js
        └── src/
            ├── app.js        # Wires sim to canvas + panel; live vs frozen mode
            ├── sim.js        # FluxSim: deterministic flow-field core
            ├── rng.js        # mulberry32, seed hashing, seed normalization
            └── palettes.js   # Aurora / Ember / Mono palettes + gradient sampler
```

## How to Run

### 1-step (recommended): bootstrap script

```bash
bash golden_output/start.sh
```

The script serves `golden_output/app/` on `0.0.0.0:3000` using Python's built-in static server (falling back to `npx serve` if Python is absent). No build, no `npm install`: every asset is vendored.

Then open **http://localhost:3000**.

### Manual

```bash
cd golden_output/app
python3 -m http.server 3000 --bind 0.0.0.0   # http://localhost:3000
```

## Feature List

### The artwork (canvas)
- Full-viewport HTML Canvas 2D fills the entire browser window.
- Thousands of particles are advected through a simplex-noise flow field: each particle samples the noise at its position to get a flow angle, steps forward, and draws a short line segment from its previous position.
- Each frame paints a translucent background veil over the whole canvas, so old strokes decay and the streams read as silky fading trails.
- Particle colors are sampled from the active palette's gradient by flow angle plus a per-particle seeded hue offset, so neighbouring streams share a hue and the field reads as a continuous aurora/ember/mono wash.
- Particles that leave the canvas or run out of life respawn from the seeded stream, keeping the field full.

### Control panel (floating, top-left)
- Titled **FLUX** with the subtitle **Flow Field Studio**, styled as a frosted-glass studio instrument.
- A live status pill: **Live** while animating, **Frozen @ N** in a frozen capture.
- A three-cell readout strip showing the current **Palette** name, **Frame** counter, and **Seed** value (frame and seed in monospace).
- **Particles**: a typed number input (200 to 6000, step 100) with the current count shown next to the label. The value commits on Enter or blur, so a GUI agent can set it without dragging.
- **Speed**: a range slider (0.2 to 4.0) with the current value shown.
- **Noise scale**: a range slider (0.0008 to 0.006) with the current value shown; tighter values make tighter swirls.
- **Palette**: a `<select>` with three named palettes. The current palette name is always shown in the readout strip.
- **Pause** button: stops and resumes the animation. While paused its label changes to **Resume**.
- **Reset** button: restarts the field from scratch at the current seed and frame 0.

### Palettes
There are exactly three named palettes (selector values in parentheses):

| Display name | Selector value | Mood |
| ------------ | -------------- | ---- |
| **Aurora** | `aurora` | Cool cyan, sky, indigo, violet, emerald, mint |
| **Ember** | `ember` | Warm amber, orange, red, crimson, gold, coral |
| **Mono** | `mono` | Elegant greys and whites |

Aurora is the default when no `?palette` is given or the value is unrecognized.

## Determinism and the Freeze Mechanism

The artwork is reproducible by construction. All randomness in the render path flows through a seeded **mulberry32** PRNG (two seed-derived streams: one for the noise field, one for the particles). There are no bare `Math.random()` calls in `sim.js`, and nothing reads the wall clock. The simulation advances by a **fixed integration timestep** (`FIXED_DT = 1`) per step, so "frame N" is well-defined regardless of frame rate or wall time.

The app honors three URL query parameters:

| Param | Meaning | Notes |
| ----- | ------- | ----- |
| `?seed=S` | Picks the PRNG seed | A pure number passes through unchanged (`?seed=1` is exactly seed 1). A non-numeric string is hashed deterministically. Default seed is `1`. |
| `?palette=P` | Picks the starting palette | One of `aurora`, `ember`, `mono` (case-insensitive). Unrecognized values fall back to `aurora`. |
| `?frame=N` | Fast-forwards and freezes | When `frame` is present, the app enters frozen mode: it steps the simulation exactly N times at a fixed 1920x1080 resolution, renders, then stops. No `requestAnimationFrame` loop runs. |

**Two modes:**

- **Live mode** (no `?frame`): the canvas animates continuously from the default (or `?seed`) seed at the window size, advancing by the fixed timestep each frame. The controls mutate the running simulation. The status pill reads **Live**.
- **Frozen mode** (`?frame=N` present): the page is pinned to a fixed **1920x1080** logical resolution (so the same URL renders identically on any display), the simulation is stepped exactly N times, the canvas is drawn once, and then nothing else runs. The status pill reads **Frozen @ N**, the Pause button reads **Resume**, and the frame readout shows N.

For example, `?seed=1&frame=320&palette=aurora` always renders the identical frozen image. With no options the page animates live from seed `1` on the Aurora palette.

**Screenshot timing flag.** When a frozen render completes, the app sets a machine-readable, idempotent flag so capture tooling can wait for the still frame to be ready before screenshotting:

- `window.__fluxFrozen === true`
- `document.body.dataset.fluxFrozen === 'true'` (the `data-flux-frozen="true"` attribute), plus `data-flux-frame="N"`.

Either signal indicates the deterministic frame has settled and no animation loop is running.

## How to Demo / Walk Through

These steps map directly to the `workflow.json` flows.

1. **Frozen Aurora still frame (VS anchor).** Open `http://localhost:3000/?seed=1&frame=320&palette=aurora`. A full-viewport cool cyan/indigo/green flow-field artwork renders and freezes. The panel reads palette **Aurora**, frame **320**, seed **1**, and the status pill shows **Frozen @ 320**. (workflow group 0: "Flux Aurora")
2. **Frozen Ember still frame (VS anchor).** Open `http://localhost:3000/?seed=1&frame=320&palette=ember`. The same seed and frame now render in warm amber/orange/red tones, with the panel reading palette **Ember**. This shows the palette parameter changes the color theme deterministically. (workflow group 1: "Flux Ember")
3. **Switch palette live (FS).** Open `http://localhost:3000/` (live), then choose **Ember** from the Palette selector. The Palette readout updates to **Ember** and the live field recolors. (workflow group 2: "Flux Live Controls")
4. **Pause and resume (FS).** On the live page, click the **Pause** button. The animation stops and the button label changes to **Resume**. Clicking it again resumes. (workflow group 3: "Flux Paused")
5. **Change particle count (FS).** On the live page, type **3000** into the Particles number input and press **Enter**. The count shown next to the Particles label updates to **3000** and the field repopulates to the new density. (workflow group 4: "Flux Particle Count")
6. **Try the rest.** Drag the **Speed** and **Noise scale** sliders to retune the motion, and click **Reset** to restart the field from frame 0 at the current seed.

## Resources

Every runtime asset is vendored locally and was sourced organically online. Provenance and license below.

### Library

| Asset | Path (in app) | Source | Version | License |
| ----- | ------------- | ------ | ------- | ------- |
| simplex-noise | `assets/lib/simplex-noise.js` | simplex-noise.js by Jonas Wagner, https://github.com/jwagner/simplex-noise.js (npm: `simplex-noise`) | 4.x (the `createNoise2D` / `createNoise3D` / `createNoise4D` factory API; vendored source carries `Copyright (c) 2024 Jonas Wagner`) | MIT |

Only `createNoise2D` is used (see `src/sim.js`), seeded with a mulberry32 stream.

### Fonts

| Asset | Path (in app) | Source | License |
| ----- | ------------- | ------ | ------- |
| Space Grotesk (latin, variable) | `assets/fonts/space-grotesk-latin-variable.woff2` | Google Fonts, https://fonts.google.com/specimen/Space+Grotesk (woff2 from `fonts.gstatic.com/s/spacegrotesk/v22/...`; source CSS preserved at `resources/fonts/space-grotesk.google.css`) | SIL Open Font License 1.1 |
| JetBrains Mono (latin, variable) | `assets/fonts/jetbrains-mono-latin-variable.woff2` | Google Fonts, https://fonts.google.com/specimen/JetBrains+Mono (woff2 from `fonts.gstatic.com/s/jetbrainsmono/v24/...`; source CSS preserved at `resources/fonts/jetbrains-mono.google.css`) | SIL Open Font License 1.1 |

### Self-authored (no external provenance)

- `src/rng.js`: mulberry32 PRNG (reference algorithm by Tommy Ettinger / bryc, public domain) plus an xmur3-style seed hasher and a seed normalizer.
- `src/sim.js`, `src/app.js`, `src/palettes.js`, `index.html`, `styles.css`: original work for this sample.

## Verifying

Once `start.sh` is serving on port 3000:

- `http://localhost:3000/`: live animation (status pill **Live**); try the palette selector, Pause/Resume, the Particles input, and the Speed / Noise-scale sliders.
- `http://localhost:3000/?seed=1&frame=320&palette=aurora`: deterministic frozen Aurora still frame.
- `http://localhost:3000/?seed=1&frame=320&palette=ember`: deterministic frozen Ember still frame (warm tones).
- `http://localhost:3000/?palette=mono&frame=320`: deterministic frozen Mono still frame (greys and whites).

Each frozen URL renders the identical image every time and sets `window.__fluxFrozen = true` once the still frame has settled.

## Run inference, evaluation, and analysis on a fresh laptop

Runs the full Vision2Web harness on this single sample, blind, from a clean machine.
Prerequisites: Docker running, Node 18+, Python 3.8+, and an Anthropic API key.

```bash
# 1. Clone and install the harness
git clone https://github.com/Mercor-Intelligence/v2w-extended.git
cd v2w-extended
pip install -e .
pip install 'litellm[proxy]'

# 2. Build the pinned sandbox image (bakes in Node, Playwright/Chromium, and the Claude Code CLI)
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
mkdir -p datasets/frontend/flux-field
cp -r samples/flux-field/prompt.txt samples/flux-field/workflow.json \
      samples/flux-field/resources samples/flux-field/prototypes \
      datasets/frontend/flux-field/

# 5. INFERENCE (no prototypes: the model builds blind from prompt.txt + resources).
#    Records results/frontend/claude_code/claude-opus-4-8/flux-field/trajectory.json (the chain-of-thought dump).
python3 -m vision2web.cli inference \
  --framework claude_code --model claude-opus-4-8 \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --sandbox vision2web-sandbox:latest \
  --datasets-dir ./datasets --results-dir ./results \
  --max-workers 1 --projects frontend/flux-field

# 6. EVALUATION (no prototypes: lenient component-presence VS + WebVoyager GUI-agent FS)
python3 -m vision2web.cli evaluate \
  --results-dir ./results --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest \
  --max-workers 1 --projects frontend/flux-field

# 7. ANALYSIS (prints the VS / FS table)
python3 -m vision2web.cli analyze --results-dir ./results --datasets-dir ./datasets
```

Notes:
- Do not pass `--use-prototypes`: inference stays leakage-free, and the visual judge scores component presence rather than pixel-exact replication.
- The grader loads prototypes as `prototypes/<name>.jpg` keyed to the `workflow.json` prototype names; this sample already ships them.
- Invoke the CLI as `python3 -m vision2web.cli` so it uses this checkout's code.
- On Docker Desktop (macOS/Windows) `host.docker.internal` resolves automatically. On Linux, start the container with `--add-host=host.docker.internal:host-gateway`, or point `--base-url` at a host IP the container can reach.
- Per-sample scores: `results/frontend/claude_code/claude-opus-4-8/flux-field/test_results/` (per-component `*_scores.json` for VS; `workflow_*/test_case_*/result.json` for FS).
- To view the reference build instead of running the model: `bash samples/flux-field/golden_output/start.sh`, then open http://localhost:3000.
