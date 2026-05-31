# Lumina - Edge AI Inference and Observability Landing Page

A single-page marketing site for an invented developer-tools product called Lumina, an edge AI inference and observability platform. The page pairs a raw-WebGL aurora hero (a hand-written GLSL flow-field shader, no libraries) with scroll-linked motion: count-up metrics, fade-and-slide section reveals, and a pointer-tracking glow on the feature cards. The whole page is a pure function of a fixed timestep and a freeze query param, so any frozen URL produces a byte-stable frame.

## Project Overview

This vanilla HTML/CSS/JS application delivers:

- A **sticky, blurred header** with the Lumina wordmark, five in-page nav links (Platform, Features, Metrics, Pricing, Docs), an accent **Get started** button, and a hamburger that opens a full-width mobile drawer on phone widths.
- A tall **hero** with a living aurora background painted by a custom WebGL fragment shader, an eyebrow, a large headline, supporting copy, **Start free** and **Book a demo** call-to-action buttons, and a floating console-preview card with a latency number and a live sparkline.
- A **trusted-by strip** of muted, single-color company logos.
- A **Features** section: a grid of six cards (low-latency inference, GPU autoscaling, live tracing, security and compliance, global edge regions, versioned rollouts), each lifting and showing a pointer-tracked edge glow on hover.
- A **Metrics** band: four big numbers that count up from zero when the band scrolls into view, plus a small line chart built from a real market time series.
- Two **alternating showcase sections** (text-left/image-right, then image-left/text-right) that fade and slide in on scroll, each with a heading, paragraph, three-point checklist, and a real photo.
- A **Pricing** section with three plan cards (Developer, Team, Enterprise); the middle Team plan is visually highlighted as Most popular.
- A **testimonial band** with one large customer quote, name, title, and company.
- A multi-column **footer** (Product, Developers, Company, Legal) with a brand panel and a bottom copyright bar.
- A **deterministic freeze** mechanism (`?frame=N`) for byte-stable screenshot capture, plus a `window.__luminaReady` settle signal.

## CDA / V2W Coordinate

| Field          | Value                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------- |
| CDA level      | Level L1: Static Surface                                                                       |
| V2W type       | `frontend` (single page) with a natural-language `prompt.txt`, so it runs from a brief         |
| Metrics        | VS (visual score, graded on layout, hierarchy, motion, polish, and originality) plus a light FS (GUI-agent) pass over the nav links, the hero CTA, and the mobile menu |
| Rendering note | Authored to run under software WebGL (`chromium --use-gl=swiftshader`) with byte-stable frozen frames; falls back to a CSS gradient if WebGL is unavailable |

## Technology Stack

| Layer        | Choice                                       | Why                                                              |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| Markup       | **Hand-written semantic HTML**               | Real headings in order, landmarks, alt text, skip link           |
| Styling      | **Hand-crafted CSS (variables)**             | Design-system tokens, dark palette, responsive grid, no runtime cost |
| Hero render  | **Raw WebGL + hand-written GLSL**            | Aurora flow field via layered value-noise domain warp, no Three.js |
| Interaction  | **Vanilla ES modules**                       | Header state, mobile drawer, count-up, scroll reveals, sparklines |
| Determinism  | **Seeded PRNG (mulberry32) + fixed dt**      | No bare `Math.random()`, no wall-clock in the render path        |
| Charts       | **Inline SVG from a real data series**       | Sparkline and metrics chart built from a vendored time series    |
| Fonts        | **Space Grotesk + Inter** (local woff2)      | Vendored from Google Fonts, no remote font request               |
| Server       | **Python stdlib http.server**                | Pure static serve on port 3000, zero build step                  |

## Directory Structure

```
samples/lumina-landing/
├── README.md                     # This file
├── prompt.txt                    # Natural-language brief (the agent's input)
├── workflow.json                 # VS-capture + functional test spec
├── .capture.json                 # Screenshot manifest (one shot per prototype key)
├── prototypes/                   # Empty (.gitkeep) — coordinator renders screenshots
├── resources/                    # Vendored source assets (provenance below)
│   ├── fonts/
│   │   ├── google.css            # Captured Google Fonts CSS (provenance)
│   │   ├── inter-latin-variable.woff2
│   │   └── spacegrotesk-latin-variable.woff2
│   ├── images/                   # Source photos (real, licensed)
│   ├── icons/                    # Simple Icons (brands) + Lucide (feature) SVG sources
│   └── data/                     # Real market time series snapshot
└── golden_output/
    ├── start.sh                  # Static server bootstrap (localhost:3000)
    └── app/
        ├── index.html            # Page shell + all section markup
        ├── css/
        │   └── styles.css        # Design system, components, responsive, reveal states
        ├── js/
        │   ├── main.js           # Header, drawer, count-up, reveals, sparklines, freeze, __luminaReady
        │   └── hero-shader.js    # Raw WebGL aurora: GLSL value-noise flow field, freeze logic
        └── assets/
            ├── fonts/            # Space Grotesk + Inter woff2 (loaded by CSS)
            ├── images/           # Photos used by the showcase sections
            ├── icons/            # Vendored brand + feature SVGs (path data inlined in HTML)
            └── data/
                ├── throughput.json   # Normalized series that drives the charts
                └── stocks.csv        # Underlying real market series
```

## How to Run

```bash
bash golden_output/start.sh
```

Then open **http://localhost:3000**. The script static-serves `app/` on port 3000 (Python stdlib, with an `npx serve` fallback). There is no build step and no network access at runtime.

- Live, animated: `http://localhost:3000/`
- Frozen settled frame (capture mode): `http://localhost:3000/?frame=240`
- Frozen at the Features section: `http://localhost:3000/?frame=240#features`
- Frozen at the Pricing section: `http://localhost:3000/?frame=240#pricing`

## Feature List

### Hero (raw WebGL)
- Full-bleed `<canvas>` painted by a hand-written GLSL fragment shader: a single big triangle drawn with layered value noise (6-octave fbm), two domain-warp passes, and a green to cyan to violet palette with ribbon highlights, drifting glow blobs, a vignette, and subtle deterministic grain.
- The shader takes only `uTime` and a fixed `uSeed`; it never reads the wall clock, so output is reproducible.
- Graceful fallback: if WebGL is unavailable, the canvas is painted with a static CSS radial-gradient aurora so the hero still reads.
- A grid overlay and a darkening veil keep the headline and copy legible over the motion.
- A floating console-preview card (animated float in live mode) shows a p95 latency value and an inline SVG sparkline.

### Scroll-linked motion
- Count-up metrics: four figures ease from zero to their target (12.4B requests, 23ms p95, 99.98% uptime, 34+ regions) when the metrics band enters the viewport, via an `IntersectionObserver`.
- Scroll reveals: section heads, feature cards, plan cards, showcase halves, and the quote fade and slide (or slide from left/right) into place as they scroll in.
- Feature-card pointer glow: each card tracks the pointer and lights a radial edge glow at the cursor.
- All of the above collapse to their settled state instantly under `?frame=N` and under `prefers-reduced-motion`.

### Charts from real data
- The hero sparkline and the metrics-band line chart are inline SVG paths built from a normalized market time series (`assets/data/throughput.json`, derived from a real AAPL monthly-close series). The chart caption names its source.

### Responsive and accessible
- Desktop, tablet (1024px), and phone (760px, 420px) breakpoints. On phones the nav collapses to a hamburger and full-width drawer; the feature, pricing, showcase, and footer grids restack.
- Semantic headings in order, descriptive `alt` text on both photos, a skip-to-content link, `aria` attributes on the nav toggle and drawer, and visible `:focus-visible` outlines.

## Determinism / Freeze Mechanism

The page is a pure function of `(frame, controls)` and never reads the wall clock for animation or layout.

- **Live mode** (no `?frame`): the hero shader advances by a fixed `dt = 1/60` per displayed frame via a frame accumulator (not by elapsed real time), so the motion is smooth and frame-rate independent. Metrics count up and sections reveal on scroll.
- **Frozen mode** (`?frame=N` present, any value including `0`): the page renders its settled state immediately. The hero shader advances exactly `N` fixed steps (`uTime = N * dt`) and draws one frame, then stops and never advances again (it re-draws on resize at the same frozen time). Count-up metrics jump straight to their final values, every scroll-reveal element is shown, and both sparklines are drawn fully. The same `?frame=N` URL yields a byte-identical frame.
- All incidental randomness (the sparkline gradient ids) comes from a fixed-seed `mulberry32` PRNG. There is no bare `Math.random()` in any render path.
- The device pixel ratio is clamped to `min(devicePixelRatio, 2)` so the frame-buffer size is stable across displays, and the shader noise is a plain polynomial hash that evaluates identically on hardware GL and software WebGL (SwiftShader).

### Query parameters

| Param   | Values          | Effect                                                                 |
| ------- | --------------- | ---------------------------------------------------------------------- |
| `frame` | integer (>= 0)  | Freeze: advance the hero `N` fixed steps, settle the page, render one still frame |

Optionally append a section hash (`#features`, `#metrics`, `#pricing`, `#docs`, `#platform`) to land the frozen page on that section. Example: `http://localhost:3000/?frame=240#pricing`.

### Settle signal

The page sets `window.__luminaReady = true` (and `document.documentElement[data-lumina-ready="true"]`) after two `requestAnimationFrame` ticks, once layout and the first WebGL frame have been committed. A capture harness should wait for `window.__luminaReady === true` before screenshotting. Recommended capture: load the frozen URL, wait for `window.__luminaReady`, then capture.

### SwiftShader capture note

For byte-stable headless capture, render with Chromium's software WebGL backend, for example:

```
chromium --headless --use-gl=swiftshader --use-angle=swiftshader \
  --window-size=1920,1080 --hide-scrollbars \
  "http://localhost:3000/?frame=240"
```

Wait until `window.__luminaReady` is true, then grab the screenshot. Because the frame is a pure function of the URL and the noise/PRNG are deterministic, repeated captures of the same URL match byte-for-byte.

## Resources

All assets were downloaded at authoring time and are vendored locally under `golden_output/app/`; nothing is fetched from the network at runtime. The shipped page loads the two fonts, the two showcase photos, and the data series. The brand and feature icons are vendored as SVG sources under `resources/icons/` and `app/assets/icons/`; their `<path>` data is inlined directly into `index.html` (the page does not request the SVG files at runtime).

| Asset | Vendored path | Source URL | Version | License |
| ----- | ------------- | ---------- | ------- | ------- |
| Inter (latin, variable) | `app/assets/fonts/inter-latin-variable.woff2` | `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2` | v20 | SIL Open Font License 1.1 |
| Space Grotesk (latin, variable) | `app/assets/fonts/spacegrotesk-latin-variable.woff2` | `https://fonts.gstatic.com/s/spacegrotesk/v22/V8mDoQDjQSkFtoMM3T6r8E7mPbF4C_k3HqU.woff2` | v22 | SIL Open Font License 1.1 |
| Abstract data-ribbon render (showcase 1) | `app/assets/images/abstract-3d-render.jpg` | `https://unsplash.com/` (Unsplash, abstract 3D render, 1600px) | n/a | Unsplash License (free to use, no attribution required) |
| Earth-at-night edge-nodes photo (showcase 2) | `app/assets/images/earth-network-nodes.jpg` | `https://unsplash.com/` (Unsplash, Earth network at night, 1600px) | n/a | Unsplash License (free to use, no attribution required) |
| Circuit-board macro photo (vendored, currently unused in the DOM) | `app/assets/images/circuit-board-macro.jpg` | `https://unsplash.com/` (Unsplash, circuit board macro, 1600px) | n/a | Unsplash License (free to use, no attribution required) |
| Brand logo SVGs (Vercel, Cloudflare, Datadog, MongoDB, Stripe, Grafana) | `app/assets/icons/{vercel,cloudflare,datadog,mongodb,stripe,grafana}.svg` | `https://simpleicons.org/` | Simple Icons | CC0 1.0 (icons); brand marks remain trademarks of their owners |
| Feature / UI icons (zap, cpu, activity, shield-check, globe, git-branch, check, gauge, layers) | `app/assets/icons/feat-*.svg` | `https://lucide.dev/` | lucide-static v0.469.0 | ISC |
| Inference throughput series | `app/assets/data/throughput.json` (and `stocks.csv`) | `https://github.com/vega/vega-datasets` `data/stocks.csv` | v2.9.0 | BSD-3-Clause (vega-datasets); underlying prices are public market data |

The captured Google Fonts CSS used to source the exact woff2 URLs is preserved at `resources/fonts/google.css`. The data series is the AAPL monthly-close column of the vega-datasets `stocks.csv`, normalized to 0..1 to drive the chart shapes deterministically.

## How to Demo / Walk Through

1. Run `bash golden_output/start.sh` and open `http://localhost:3000/`. The aurora hero drifts and shimmers, the console card floats, and as you scroll the metrics count up and the sections fade in.
2. Open `http://localhost:3000/?frame=240`. The hero freezes on a settled aurora frame, the metrics already show their final values, and every section is revealed: this is the byte-stable Homepage capture (workflow group 0).
3. Click **Features** in the top navigation. The page scrolls to the six-card feature grid under the heading "Everything you need to run models in production" (workflow group 1).
4. Click the primary **Start free** button in the hero. The page moves to the Pricing section with the Developer, Team, and Enterprise plans, the Team plan badged "Most popular" (workflow group 2).
5. Click **Pricing** in the top navigation. The page lands on the same Pricing section directly from the nav (workflow group 3).
6. Narrow the window to a phone width (or load at 375x812) and click the **hamburger** button in the header. The full-width drawer opens with the Platform, Features, Metrics, Pricing, and Docs links plus a Get started button (workflow group 4).

## Run inference, evaluation, and analysis on a fresh laptop

Runs the full Vision2Web harness on this single sample, blind, from a clean machine.
Prerequisites: Docker running, Node 18+, Python 3.8+, and an Anthropic API key.

```bash
# 1. Clone and install the harness
git clone https://github.com/Mercor-Intelligence/v2w-extended.git
cd v2w-extended
pip install -e .
pip install 'litellm[proxy]'

# 2. Build the pinned sandbox image (Node + Playwright/Chromium)
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
mkdir -p datasets/frontend/lumina-landing
cp -r samples/lumina-landing/prompt.txt samples/lumina-landing/workflow.json \
      samples/lumina-landing/resources samples/lumina-landing/prototypes \
      datasets/frontend/lumina-landing/

# 5. INFERENCE (no prototypes: the model builds blind from prompt.txt + resources).
#    Records results/frontend/claude_code/claude-opus-4-8/lumina-landing/trajectory.json (the chain-of-thought dump).
python3 -m vision2web.cli inference \
  --framework claude_code --model claude-opus-4-8 \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --sandbox vision2web-sandbox:latest \
  --datasets-dir ./datasets --results-dir ./results \
  --max-workers 1 --projects frontend/lumina-landing

# 6. EVALUATION (no prototypes: lenient component-presence VS + WebVoyager GUI-agent FS)
python3 -m vision2web.cli evaluate \
  --results-dir ./results --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest \
  --max-workers 1 --projects frontend/lumina-landing

# 7. ANALYSIS (prints the VS / FS table)
python3 -m vision2web.cli analyze --results-dir ./results --datasets-dir ./datasets
```

Notes:
- Do not pass `--use-prototypes`: inference stays leakage-free, and the visual judge scores component presence rather than pixel-exact replication.
- The grader loads prototypes as `prototypes/<name>.jpg` keyed to the `workflow.json` prototype names; this sample already ships them.
- Invoke the CLI as `python3 -m vision2web.cli` so it uses this checkout's code.
- The `claude_code` framework needs the `claude` CLI inside the sandbox; the base image does not include it, so add `RUN npm install -g @anthropic-ai/claude-code` to `docker/Dockerfile.sandbox` before step 2 (or run the `openhands` framework instead).
- On Docker Desktop (macOS/Windows) `host.docker.internal` resolves automatically. On Linux, start the container with `--add-host=host.docker.internal:host-gateway`, or point `--base-url` at a host IP the container can reach.
- Per-sample scores: `results/frontend/claude_code/claude-opus-4-8/lumina-landing/test_results/` (per-component `*_scores.json` for VS; `workflow_*/test_case_*/result.json` for FS).
- To view the reference build instead of running the model: `bash samples/lumina-landing/golden_output/start.sh`, then open http://localhost:3000.
