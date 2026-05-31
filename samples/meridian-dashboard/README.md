# Meridian: Global Emissions Analytics (Interactive Front-End)

A polished, multi-view analytics dashboard for exploring global CO2 emissions by country and year. Meridian pairs an at-a-glance Overview (KPI cards, a time-series line chart, and a top-emitters bar chart) with a data-dense Explorer (a sortable, filterable, searchable table), all driven by a real, locally vendored dataset from Our World in Data.

## CDA / V2W Coordinate

| Field      | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| CDA level  | **L2** (Interactive Front-End)                                     |
| V2W type   | **frontend** (brief in `prompt.txt`)                               |
| Metrics    | **VS + FS** (visual similarity + GUI-agent functional score)       |
| Surface    | Multi-view dashboard with global filters and a sortable data table |

## Project Overview

This single-page application delivers:

- A left **sidebar** that switches between two views: **Overview** and **Explorer**.
- A row of **global controls** present on both views: a **Region** filter (All regions + each continent), a **Year** selector (defaults to the latest year), and a **Metric** toggle (**Total** vs **Per capita**).
- An **Overview** view with four **KPI cards** (total emissions, average per capita, top emitter, year-over-year change), a **line chart** of one country's metric over time (with a country picker), and a horizontal **bar chart** ranking the top emitters for the selected year.
- An **Explorer** view with a **sortable** data table (click a header to sort, click again to flip direction), a **search** box and **region** filter, a live **result count**, a **Clear filters** action, and an **empty state** when nothing matches.
- Fully **responsive** layout (desktop, tablet, mobile), with the sidebar collapsing to a top bar on narrow screens.

## Technology Stack

| Layer       | Choice                                  | Why                                                        |
| ----------- | --------------------------------------- | ---------------------------------------------------------- |
| Language    | **Vanilla HTML / CSS / JS**             | Zero build, fully deterministic, no framework runtime cost |
| Charts      | **Hand-rolled inline SVG**              | Deterministic geometry, no animation, byte-stable renders  |
| Data        | **Local JSON snapshot** (OWID CO2)      | Loaded from `app/data/`, no runtime network                |
| Fonts       | **Inter** (variable woff2, vendored)    | Served locally from `app/fonts/`                            |
| Server      | **Python `http.server`** (static)       | Present in nearly every container; npx `serve` fallback    |

No bundler, no `node_modules`, no CDN, no remote fonts, no runtime fetch to the public internet.

## Directory Structure

```
samples/meridian-dashboard/
├── README.md                     # This file
├── prompt.txt                    # The natural-language brief (frontend task)
├── workflow.json                 # VS-capture + FS functional test spec (7 groups)
├── prototypes/                   # Empty (.gitkeep); the coordinator renders screenshots
├── resources/                    # Vendored real assets, with provenance below
│   ├── data/
│   │   └── co2-emissions.json    # Trimmed OWID CO2 snapshot (42 countries x 2000-2023)
│   └── fonts/
│       └── inter-variable.woff2  # Inter variable font (latin subset)
└── golden_output/
    ├── start.sh                  # Self-contained static server on http://localhost:3000
    └── app/
        ├── index.html            # App shell (sidebar, controls, both views)
        ├── css/
        │   └── styles.css        # Hand-crafted design system
        ├── js/
        │   ├── data.js           # Data layer: load + normalize + aggregate (no DOM)
        │   ├── charts.js         # Deterministic SVG line + bar chart renderers
        │   └── app.js            # State, controls, KPI cards, table, view switching
        ├── data/
        │   └── co2-emissions.json # Vendored copy the app loads at runtime
        └── fonts/
            └── inter-variable.woff2
```

## How to Run

```bash
bash golden_output/start.sh
```

This serves the app at **http://localhost:3000**. The script prefers `python3 -m http.server`, falls back to `python`, then to `npx serve@14` if neither Python is present. There is no build step and no dependency install.

Open **http://localhost:3000/** for the Overview, or **http://localhost:3000/#explorer** for the Explorer view.

## Feature List

### Global controls (both views)
- **Region filter** dropdown: starts on "All regions", lists every continent in the data (Africa, Asia, Europe, North America, Oceania, South America). Drives the KPI aggregates, the bar chart, the line-chart country list, and the table.
- **Year selector**: every year from 2000 to 2023, latest first; defaults to 2023. Drives the KPI cards, bar chart, and table.
- **Metric toggle**: "Total" (total CO2 in million tonnes) vs "Per capita" (tonnes per person). Drives both charts.

### Overview (`/`)
- Four **KPI cards**: total emissions for the year, average per capita, top emitter (name + value), and the aggregate year-over-year change (with a rising/falling/steady chip).
- **Line chart** ("Emissions over time"): the selected metric for one country across all years, drawn as an SVG area + line with axis labels and a labelled endpoint. A "Country" dropdown above the chart selects the plotted country (defaults to United States).
- **Bar chart** ("Top emitters"): the top eight countries for the selected year, region, and metric, drawn as horizontal SVG bars with value labels. The currently plotted line-chart country is highlighted.

### Explorer (`/#explorer`)
- **Sortable table**: columns for rank, country (with ISO code), region, total CO2 (Mt), per capita (t), year-over-year change (color-coded), and population. Click any header to sort by that column; click the same header again to flip ascending/descending. The active column shows a sort caret.
- **Search**: a "Search by country" box that filters rows by country name (or ISO code) as you type; pressing Enter re-applies.
- **Region filter**: the global Region dropdown also narrows the table to one continent.
- **Result count**: a live count ("42 countries", "1 country") that updates with every filter.
- **Empty state**: when no rows match, the table is replaced by a "No matching countries" message that echoes the query.
- **Clear filters**: resets the search box and region back to the full set.

### Cross-cutting
- Dark navy palette with a signature green accent, Inter typography, KPI accent bars, gradient chart fills.
- Responsive: KPI grid reflows to 2-up then 1-up; charts stack; the sidebar becomes a top bar on mobile.
- Accessible: semantic headings, `aria-current` on the active nav item, `aria-sort` on the active column, `aria-pressed` on the metric toggle, focus-visible outlines, and `aria-label`s on every control.

## Determinism and Freeze Mechanism

The capture is byte-stable by construction:

- **Static data.** The app loads a vendored JSON snapshot from `app/data/co2-emissions.json`. There are no runtime network calls.
- **No animation, no clock.** Charts are hand-rolled SVG whose geometry is a pure function of the data; there are no transitions, timers, requestAnimationFrame loops, or wall-clock reads in any render path. The only CSS transitions are on `:hover`/`:focus` of controls, which are idle (and therefore identical) at screenshot time.
- **No randomness.** There is no `Math.random()` anywhere; chart layout is fully deterministic.
- **Fixed default state.** On first load the app always opens on **Overview**, with **All regions**, year **2023**, the **Total** metric, and the **United States** plotted in the line chart. The Explorer table defaults to sorting by **Total CO2 descending**. The Explorer view can be deep-linked with the `#explorer` hash. Given the same dataset, every load renders the same pixels.

## Resources (provenance and license)

| Asset                                   | Source                                                                                                  | License            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| `resources/data/co2-emissions.json`     | Our World in Data, CO2 and Greenhouse Gas Emissions. Derived from `owid-co2-data.csv` at https://github.com/owid/co2-data (raw: https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv) | **CC BY 4.0**      |
| `resources/fonts/inter-variable.woff2`  | Inter (variable, latin subset) via Google Fonts: https://fonts.googleapis.com/css2?family=Inter         | **SIL OFL 1.1**    |

The dataset was retrieved on 2026-05-30 and trimmed to 42 countries spanning six continents, years 2000-2023 (1,008 country-year rows). For each country-year it keeps: total CO2 (Mt), CO2 per capita (t), year-over-year percent change, population, and coal/oil/gas CO2 breakdowns. Values are rounded for a compact, stable file. The trimmed snapshot is the only data the app reads; the original full CSV is not shipped. The same JSON is vendored into `golden_output/app/data/` so the running app loads it locally.

## How to Demo / Walk Through

With the server running at http://localhost:3000:

1. **Overview loads by default.** Confirm the four KPI cards (Total emissions 2023, Avg per capita, Top emitter 2023 = China, Year-over-year), the "Emissions over time" line chart for the United States, and the "Top emitters" bar chart led by China.
2. **Switch to Explorer.** Click **Explorer** in the sidebar. The table appears with 42 countries and the result count reads "42 countries".
3. **Search.** Type `Japan` into the **Search by country** box. The table filters to the single Japan row and the count reads "1 country". Clear the box to restore all rows.
4. **Filter by region.** Choose **Europe** in the **Region** dropdown. Only European countries remain and the count reads "12 countries".
5. **Sort.** Click the **Per capita (t)** column header. The table sorts descending and Qatar moves to the top row (the largest per-capita value).
6. **Clear filters.** Type any query, then click **Clear filters**. The search empties and all 42 countries return.
7. **Empty state.** Type `zzzz` into the search box. The table shows the "No matching countries" empty state and the count reads "0 countries".

These steps correspond one-to-one with the seven groups in `workflow.json`.

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
mkdir -p datasets/frontend/meridian-dashboard
cp -r samples/meridian-dashboard/prompt.txt samples/meridian-dashboard/workflow.json \
      samples/meridian-dashboard/resources samples/meridian-dashboard/prototypes \
      datasets/frontend/meridian-dashboard/

# 5. INFERENCE (no prototypes: the model builds blind from prompt.txt + resources).
#    Records results/frontend/claude_code/claude-opus-4-8/meridian-dashboard/trajectory.json (the chain-of-thought dump).
python3 -m vision2web.cli inference \
  --framework claude_code --model claude-opus-4-8 \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --sandbox vision2web-sandbox:latest \
  --datasets-dir ./datasets --results-dir ./results \
  --max-workers 1 --projects frontend/meridian-dashboard

# 6. EVALUATION (no prototypes: lenient component-presence VS + WebVoyager GUI-agent FS)
python3 -m vision2web.cli evaluate \
  --results-dir ./results --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest \
  --max-workers 1 --projects frontend/meridian-dashboard

# 7. ANALYSIS (prints the VS / FS table)
python3 -m vision2web.cli analyze --results-dir ./results --datasets-dir ./datasets
```

Notes:
- Do not pass `--use-prototypes`: inference stays leakage-free, and the visual judge scores component presence rather than pixel-exact replication.
- The grader loads prototypes as `prototypes/<name>.jpg` keyed to the `workflow.json` prototype names; this sample already ships them.
- Invoke the CLI as `python3 -m vision2web.cli` so it uses this checkout's code.
- The `claude_code` framework needs the `claude` CLI inside the sandbox; the base image does not include it, so add `RUN npm install -g @anthropic-ai/claude-code` to `docker/Dockerfile.sandbox` before step 2 (or run the `openhands` framework instead).
- On Docker Desktop (macOS/Windows) `host.docker.internal` resolves automatically. On Linux, start the container with `--add-host=host.docker.internal:host-gateway`, or point `--base-url` at a host IP the container can reach.
- Per-sample scores: `results/frontend/claude_code/claude-opus-4-8/meridian-dashboard/test_results/` (per-component `*_scores.json` for VS; `workflow_*/test_case_*/result.json` for FS).
- To view the reference build instead of running the model: `bash samples/meridian-dashboard/golden_output/start.sh`, then open http://localhost:3000.
