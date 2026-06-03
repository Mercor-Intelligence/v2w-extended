# v2w-extended

Vision2Web, extended with a focused set of self-contained frontend sample tasks.

This repository builds on [Vision2Web](https://vision2web-bench.github.io/) (a hierarchical benchmark for visual website development with agent verification, [paper](https://arxiv.org/abs/2603.26648)) and adds **five self-contained Level 2 (Interactive Frontend) sample tasks** under [`samples/`](samples/), together with the stock harness for building and scoring them.

Each sample is a client-side web app built from a plain-English brief, shipped with a reference build, reference screenshots, and a machine-checkable test spec. Every sample lives entirely under its own `samples/<name>/` folder and runs on the stock harness and the stock `vision2web-sandbox` image; nothing in a sample changes the rest of the repo.

<p align="center">
  <img src="./docs/images/vision2web-cover.png" width="80%">
</p>

## How a build is scored

Vision2Web is organized into three progressive levels:

- **Level 1: Static Webpage** generate responsive webpages from multi-device UI prototypes. Metric: Visual Score (VS).
- **Level 2: Interactive Frontend** build multi-page interactive frontends from prototypes plus a textual spec. Metrics: Visual Score (VS) and Functional Score (FS).
- **Level 3: Full-Stack Website** build full-stack systems from a requirements document and prototypes. Metrics: VS and FS.

All five samples in this repo are **Level 2 (Interactive Frontend)**. Two scores come out of evaluation:

- **Functional Score (FS):** a WebVoyager-style GUI agent drives the built app and checks the `workflow.json` validations (clicks a nav link, sorts a table, opens a drawer, and so on).
- **Visual Score (VS):** a vision-language judge segments the built page and scores component presence and layout against the `prototypes/*.jpg` anchors.

## Task shape

Each `samples/<name>/` folder has the same layout. This is the V2W task contract:

| Path | What it is |
| ---- | ---------- |
| `prompt.txt` | The natural-language brief. This is the only thing the agent is given at inference time. |
| `workflow.json` | The test spec. An ordered list of groups; each group is either a visual-score capture (it names a `prototype` and a viewport `resolution`) or a functional-score check (`"prototype": {}`, a GUI-agent action plus validations). |
| `prototypes/*.jpg` | Reference screenshots of the intended result, one per visual-score group. The visual judge compares the model's build against these. File names match the `prototype` keys in `workflow.json`. |
| `resources/` | Source assets the build is allowed to use (fonts, icons, images, data, vendored libraries), each with provenance recorded in the task README. |
| `golden_output/` | The reference build. `start.sh` serves `app/` on `http://localhost:3000` with no build step and no network at runtime. |
| `golden_trajectory.json` | A reference trajectory: the files a successful agent run produces. |
| `README.md` | The per-task write-up: what it is, how to run it, the resource provenance, and the full inference/evaluation/analysis recipe. |

All five tasks are V2W type `frontend`: client-side only, built blind from `prompt.txt`, with no prototypes shown to the model at inference time (leakage-free).

## The five sample tasks

| Task | One line | Highlights |
| ---- | -------- | ---------- |
| [`lumina-landing`](samples/lumina-landing/README.md) | Marketing landing page for an edge-AI inference and observability product. | Raw-WebGL aurora hero (hand-written GLSL), scroll count-up metrics and reveals, six feature cards, three-tier pricing, mobile drawer, deterministic `?frame=N` freeze. |
| [`meridian-dashboard`](samples/meridian-dashboard/README.md) | Analytics dashboard over global CO2 emissions by country and year. | Sidebar Overview/Explorer views, Region/Year/Metric controls, four KPI cards, static SVG line and bar charts, a sortable and searchable table with empty-state and clear-filters. Local JSON, no network. |
| [`flux-field`](samples/flux-field/README.md) | Full-window flow-field particle animation, a generative-art studio. | Thousands of noise-driven particles with fading trails, a floating panel (Particles, Speed, Noise scale, Palette, Pause, Reset, live frame and seed), three palettes, seeded `?seed=&palette=&frame=` reproducibility. |
| [`prism-shader`](samples/prism-shader/README.md) | Three.js real-time 3D shader toy with a glassy control panel. | Iridescent noise-displaced icosahedron with custom vertex and fragment shaders, fresnel rim glow, orbit and zoom, starfield, sliders plus a Wireframe toggle and Aurora/Ember/Nebula presets, address-driven freeze. Three.js vendored locally. |
| [`cadence-board`](samples/cadence-board/README.md) | Browser-only personal Kanban board. | Backlog / In Progress / Done columns with counts, cards with urgency pill and tag, add/edit/delete and Move-button column changes, tag filter, and localStorage persistence with a seeded default board. No server, no database. |

Each task README has its own deeper write-up, feature list, determinism notes, and a full resource-provenance table.

## Repository layout

```
v2w-extended/
├── samples/<name>/      # the five sample tasks (prompt.txt, workflow.json, prototypes/, resources/, golden_output/, README.md)
├── vision2web/          # the harness package; invoke via `python3 -m vision2web.cli`
├── docker/build.sh      # builds the vision2web-sandbox:latest image
├── datasets/            # staging layout the harness discovers (you create this; see below)
└── results/             # inference and evaluation outputs (generated)
```

## Installation

Prerequisites: Python 3.8+ and Docker running.

```bash
git clone https://github.com/Mercor-Intelligence/v2w-extended.git
cd v2w-extended
pip install -e .
pip install 'litellm[proxy]'
bash docker/build.sh        # builds the vision2web-sandbox:latest image (Node + Python + Playwright/Chromium + openhands)
```

## 1. Spin up a website locally

No build step, no network. Pick any task and serve its reference build:

```bash
bash samples/lumina-landing/golden_output/start.sh      # then open http://localhost:3000
```

Swap `lumina-landing` for `meridian-dashboard`, `flux-field`, `prism-shader`, or `cadence-board`. Each `start.sh` serves that task's `app/` on port 3000 with the Python standard library (with an `npx serve` fallback). Stop it with Ctrl-C.

The deterministic tasks accept a freeze parameter for byte-stable captures, for example `http://localhost:3000/?frame=240` (lumina), `?seed=1&frame=320&palette=aurora` (flux), `?t=6.0&preset=aurora` (prism). See each task README for the exact parameters.

## 2. Run inference on the samples

Inference runs the agent inside the Docker sandbox to build each app from `prompt.txt` alone. Use the `openhands` framework: it ships in the stock sandbox image and needs no changes to the repo. Prerequisites: the install step above, Docker running, and an Anthropic API key.

```bash
# a. Start a LiteLLM proxy that maps the model id to Anthropic Opus.
#    Put your real key in the env var only; litellm_config.yaml stays secret-free.
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

# b. Stage the tasks into the datasets/ layout the harness discovers
for s in lumina-landing meridian-dashboard flux-field prism-shader cadence-board; do
  mkdir -p "datasets/frontend/$s"
  cp -r "samples/$s/prompt.txt" "samples/$s/workflow.json" \
        "samples/$s/resources" "samples/$s/prototypes" "datasets/frontend/$s/"
done

# c. Inference: the model builds blind from prompt.txt + resources (no prototypes).
#    Writes results/frontend/openhands/claude-opus-4-8/<name>/ (the build + trajectory.json chain of thought).
python3 -m vision2web.cli inference \
  --framework openhands --model claude-opus-4-8 \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --sandbox vision2web-sandbox:latest \
  --datasets-dir ./datasets --results-dir ./results \
  --max-workers 1
```

To run a single task, add `--projects frontend/lumina-landing` (repeatable, comma separated).

## 3. Run evaluation on the samples

Evaluation drives each built app and scores it. The GUI agent (FS) and the visual judge (VS) reach their models through the same proxy.

```bash
# Evaluate everything inference produced
python3 -m vision2web.cli evaluate \
  --results-dir ./results --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest \
  --framework openhands --max-workers 1

# Print the VS / FS summary table
python3 -m vision2web.cli analyze --results-dir ./results --datasets-dir ./datasets
```

Per-task outputs land under `results/frontend/openhands/claude-opus-4-8/<name>/`: `trajectory.json` (the inference chain of thought), `evaluation_result.json`, and a `test_results/` tree with per-component `*_scores.json` (VS) and `workflow_*/test_case_*/result.json` (FS).

## Reproduce the golden scores (optional)

The reference build in each `golden_output/` is calibrated to score well against its own `workflow.json` (FS) and `prototypes/` (VS), with no inference: the golden output itself is the "result" that gets scored. After the install step and starting the proxy (section 2a), for any sample:

```bash
S=lumina-landing   # or meridian-dashboard | flux-field | prism-shader | cadence-board

mkdir -p "datasets/frontend/$S"
cp -r "samples/$S/prompt.txt" "samples/$S/workflow.json" \
      "samples/$S/resources" "samples/$S/prototypes" "datasets/frontend/$S/"

rm -rf "results_golden/frontend/golden/claude-opus-4-8/$S"
mkdir -p "results_golden/frontend/golden/claude-opus-4-8/$S"
cp -a "samples/$S/golden_output/." "results_golden/frontend/golden/claude-opus-4-8/$S/"

python3 -m vision2web.cli evaluate \
  --results-dir ./results_golden --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest --max-workers 1 --projects "frontend/$S"
python3 -m vision2web.cli analyze --results-dir ./results_golden --datasets-dir ./datasets
```

The GUI agent and VLM judge are non-deterministic, so the acceptance bar is a 3-run one: across three eval runs the sample shows at least one run with **FS = 100** and at least one with **VS > 80**. Drop the `--projects` filter to score all five samples in one pass.

## Notes

- Do not pass `--use-prototypes`. Inference stays leakage-free, and the visual judge scores component presence rather than pixel-exact replication.
- Invoke the CLI as `python3 -m vision2web.cli` so it runs from this checkout. Convenience wrappers `scripts/run_inference.sh`, `scripts/run_evaluation.sh`, and `scripts/run_analysis.sh` are also available.
- On Docker Desktop (macOS/Windows) `host.docker.internal` resolves automatically. On Linux, start the container with `--add-host=host.docker.internal:host-gateway`, or point `--base-url` at a host IP the container can reach.
- To read a reference build without running the model, use `start.sh` from section 1.

## License

This repository extends Vision2Web, which is licensed under CC-BY-NC-SA-4.0 and intended for academic research only. Commercial use in any form is prohibited.

## Citation

If you find Vision2Web helpful for your research, please consider citing:

```bibtex
@misc{he2026vision2webhierarchicalbenchmarkvisual,
      title={Vision2Web: A Hierarchical Benchmark for Visual Website Development with Agent Verification},
      author={Zehai He and Wenyi Hong and Zhen Yang and Ziyang Pan and Mingdao Liu and Xiaotao Gu and Jie Tang},
      year={2026},
      eprint={2603.26648},
      archivePrefix={arXiv},
      primaryClass={cs.SE},
      url={https://arxiv.org/abs/2603.26648},
}
```
