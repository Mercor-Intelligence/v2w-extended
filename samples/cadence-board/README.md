# Cadence: Personal Kanban (Client-Side)

A calm, single-board Kanban for moving personal work from Backlog to In Progress
to Done. Cadence is a pure static front-end (HTML, CSS, vanilla JS): the whole
board lives in the browser's localStorage, so every add, edit, move, and delete
is saved client-side and reloading the page restores exactly the board you left.
There is no server, no database, and no accounts.

## CDA Coordinate

| Axis     | Value                                                          |
| -------- | -------------------------------------------------------------- |
| Phase    | **ZTO Phase 2**                                                |
| Category | **Mini Productivity Apps**                                     |
| V2W type | **frontend** (self-contained, client-side web app)             |
| Metrics  | **VS + FS** (visual similarity + GUI-agent functional checks)  |

## Project Overview

Cadence delivers:

- A **three-column board** (Backlog, In Progress, Done) with a live per-column
  count badge.
- **Cards** carrying a title, an optional description, a priority pill
  (Low / Med / High), and a single tag chip.
- **Add a card** via a modal that drops the card into Backlog.
- **Edit a card** via the same modal, pre-filled, updating the card in place.
- **Move a card** between columns with explicit "Move" left / right buttons on
  each card (no drag-and-drop, so the flow is fully click-testable).
- **Delete a card** with an immediate count update.
- **Filter by tag** with a dropdown plus a "Clear filter" control.
- **Loading**, **empty-per-column**, and **error toast** states.
- **Client-side persistence** in `localStorage`, so a reload restores the board
  with no server and no database.

## Technology Stack

| Layer          | Choice                          | Why                                                  |
| -------------- | ------------------------------- | ---------------------------------------------------- |
| Front-end      | **Vanilla HTML / CSS / JS**     | No framework runtime; precise control over craft     |
| State          | **In-memory mirror of storage** | Render from memory; every change writes to storage   |
| Persistence    | **Browser `localStorage`**      | Key `cadence.board`; no server, no database, no auth |
| Seeding        | **Embedded JS seed constant**   | Fixed eight-card board for a deterministic first run |
| Module loading | **Native ES module** (`app.js`) | No bundler needed for a small app                    |
| Static serving | **`python3 -m http.server`**    | Any static file server works; `npx serve` fallback   |
| Fonts          | **Inter** (local woff2)         | Vendored variable font, served from `/fonts`         |
| Icons          | **Lucide-derived inline SVG**   | Sprite embedded in the HTML; no network at runtime   |

## Directory Structure

```
samples/cadence-board/
├── README.md                     # This file
├── prompt.txt                    # The brief (non-engineer voice)
├── workflow.json                 # VS-capture + FS functional test spec
├── .capture.json                 # Screenshot capture spec (Board, Card Editor)
├── prototypes/                   # Coordinator-rendered screenshots (VS anchors)
├── resources/                    # Vendored source assets + provenance
│   ├── fonts/
│   │   ├── Inter-latin-variable.woff2
│   │   └── Inter-google-fonts-source.css   # provenance of the woff2 URL
│   └── data/
│       └── seed.json             # Canonical seed board (source of truth)
└── golden_output/
    ├── start.sh                  # Static server on port 3000 (no Node/npm)
    └── app/
        ├── .gitignore
        └── public/               # The entire served app (static root)
            ├── index.html        # Markup, icon sprite, modal, toast
            ├── styles.css        # Design system + board + modal styles
            ├── app.js            # Front-end controller + localStorage store
            ├── seed.json         # Bundled seed (mirrors the embedded constant)
            └── fonts/
                └── Inter-latin-variable.woff2
```

## How to Run

```bash
bash golden_output/start.sh
```

The script serves the static app in `golden_output/app/public` on port 3000
using Python's built-in `http.server` (falling back to `npx --yes serve` if
Python is unavailable). There is nothing to install: no Node, no npm, no
Express.

Then open **http://localhost:3000**. The board renders immediately from
`localStorage`, or from the embedded seed on a fresh browser.

### Manual

```bash
cd golden_output/app/public
python3 -m http.server 3000        # http://localhost:3000
# or: npx --yes serve -l 3000 .
```

## Feature List

### Board and columns

- Three columns: **Backlog**, **In Progress**, **Done**, each with a colored dot
  and a live count badge.
- Counts reflect the currently visible cards, so they stay honest while a tag
  filter is active.

### Cards

- Priority pill with a distinct color per level (High red, Med amber, Low green).
- Tag chip with the card's label.
- Title and a 3-line-clamped description (omitted when empty).
- Footer controls: **Move** left, **Move** right, **edit**, **delete**.
- Move-left is disabled in Backlog; Move-right is disabled in Done.

### Create / edit

- A single modal handles both. "Add a card" drops a new card at the bottom of
  Backlog; "Edit card" updates a card in place.
- Title is required; saving with an empty title shows an inline validation error
  and blocks the save.
- The Tag field offers suggestions from tags already on the board.

### Move / delete

- Moving updates the card's column; the card joins the bottom of the
  destination column and both counts adjust.
- Deleting removes the card immediately.

### Filter

- Tag dropdown ("All tags" plus every distinct tag, alphabetized).
- "Clear filter" appears only while a filter is active.

### States

- **Loading:** spinner and "Loading your board…" on the very first paint, before
  the board is read from storage.
- **Empty:** dashed placeholder with an inbox icon per empty column.
- **Error:** a bottom toast if a change cannot be saved to the browser (for
  example, storage is blocked or full); a refresh prompt if the board cannot be
  read at all.

### Persistence (client-side)

- The board is stored as a single JSON object in `localStorage` under the key
  `cadence.board`.
- `GET`-equivalent: on load the app reads that key and renders it.
- `POST`/`PUT`/`DELETE`-equivalent: add, edit, move, and delete each mutate the
  in-memory board and immediately write it back to the same key.
- New card ids are minted from a `nextId` counter held inside the stored board,
  matching the format `card-001`, `card-002`, and so on.

## Determinism and Freeze Mechanism

- **localStorage key.** All board state lives under the single key
  `cadence.board`. There is no other persistence surface.
- **Deterministic seed.** When `cadence.board` is absent (a fresh browser or
  after the key is cleared), the app initializes from an embedded seed constant
  in `app.js` (8 cards with fixed ids `card-001`…`card-008`) and writes it to
  `localStorage`. That seed is byte-identical to `resources/data/seed.json` and
  to the bundled `app/public/seed.json`, so a fresh load renders the exact same
  board every run. The seed is fixed data; there is no `Math.random()` and no
  wall-clock dependence in any render path.
- **Seed reset.** To return to the starter board, clear the key from the
  browser console and reload:
  ```js
  localStorage.removeItem('cadence.board'); location.reload();
  ```
  The next load re-seeds from the embedded snapshot.
- **Deterministic ids.** New card ids come from the board's `nextId` counter
  (the seed starts at `9`, yielding `card-009`), not from random or time-based
  values.
- **No long animations.** Transitions are short (hover lift, button states) and
  idempotent; the only keyframe animation is the brief load spinner, which is
  replaced the moment the board renders. A settled screenshot is stable. The
  stylesheet also collapses all transitions and animations under
  `prefers-reduced-motion: reduce`.
- **Self-contained assets.** The font is vendored locally and icons are inline
  SVG, so the app makes no network calls to the internet at runtime. There is no
  same-origin API either: persistence is entirely in the browser.

## Resources

Every runtime asset is vendored locally under `golden_output/app/public/` and
was derived from a source recorded here.

| Asset                                       | Source URL                                                                                                  | License                   |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| `Inter-latin-variable.woff2` (Inter, v20)   | `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5nw.woff2` (via Google Fonts) | SIL Open Font License 1.1 |
| Inter `@font-face` CSS (provenance only)    | `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`                          | SIL Open Font License 1.1 |
| Inline icon paths (plus, chevrons, pencil, trash, x, tag, inbox) | Lucide icon set (`https://lucide.dev`)                                                 | ISC License               |

Notes:

- The vendored woff2 is Inter's latin variable subset; the local `@font-face`
  declares `font-weight: 100 900`, so the 400/500/600/700 weights the UI uses
  all come from this single file.
- The icon SVG `path` data is reproduced inline in `index.html` from the Lucide
  open-source set; no icon font or remote sprite is loaded.

## How to Demo / Walk Through

1. **See the seeded board.** Open `http://localhost:3000`. Backlog shows 3
   cards, In Progress 2, Done 3.
2. **Add a card.** Click **Add card**, type a title (for example "Plan launch
   checklist"), click **Save card**. The new card appears at the bottom of
   Backlog and the Backlog count ticks up to 4.
3. **Move it forward.** On that card, click the right-pointing **Move** button
   twice: it goes Backlog to In Progress, then In Progress to Done.
4. **Prove persistence.** Refresh the page. The card you added and moved is still
   in Done, because the board was saved to `localStorage`.
5. **Edit a card.** Click the pencil on any card, change the title, click **Save
   changes**. The card updates in place.
6. **Filter and clear.** Pick a tag (for example "Writing") from the filter
   dropdown to show only those cards, then click **Clear filter** to bring the
   whole board back.
7. **Delete a card.** Click the trash icon on a card; it disappears and its
   column count drops.

To return to a clean seeded board at any time, clear the `cadence.board` key
(see "Seed reset" above) and reload.

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
mkdir -p datasets/frontend/cadence-board
cp -r samples/cadence-board/prompt.txt samples/cadence-board/workflow.json \
      samples/cadence-board/resources samples/cadence-board/prototypes \
      datasets/frontend/cadence-board/

# 5. INFERENCE (no prototypes: the model builds blind from prompt.txt + resources).
#    Records results/frontend/claude_code/claude-opus-4-8/cadence-board/trajectory.json (the chain-of-thought dump).
python3 -m vision2web.cli inference \
  --framework claude_code --model claude-opus-4-8 \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --sandbox vision2web-sandbox:latest \
  --datasets-dir ./datasets --results-dir ./results \
  --max-workers 1 --projects frontend/cadence-board

# 6. EVALUATION (no prototypes: lenient component-presence VS + WebVoyager GUI-agent FS)
python3 -m vision2web.cli evaluate \
  --results-dir ./results --datasets-dir ./datasets \
  --api-key sk-v2w-local-proxy --base-url http://host.docker.internal:4000 \
  --gui-agent-model claude-opus-4-8 --vlm-judge-model claude-opus-4-8 \
  --sandbox vision2web-sandbox:latest \
  --max-workers 1 --projects frontend/cadence-board

# 7. ANALYSIS (prints the VS / FS table)
python3 -m vision2web.cli analyze --results-dir ./results --datasets-dir ./datasets
```

Notes:
- Do not pass `--use-prototypes`: inference stays leakage-free, and the visual judge scores component presence rather than pixel-exact replication.
- The grader loads prototypes as `prototypes/<name>.jpg` keyed to the `workflow.json` prototype names; this sample already ships them.
- Invoke the CLI as `python3 -m vision2web.cli` so it uses this checkout's code.
- On Docker Desktop (macOS/Windows) `host.docker.internal` resolves automatically. On Linux, start the container with `--add-host=host.docker.internal:host-gateway`, or point `--base-url` at a host IP the container can reach.
- Per-sample scores: `results/frontend/claude_code/claude-opus-4-8/cadence-board/test_results/` (per-component `*_scores.json` for VS; `workflow_*/test_case_*/result.json` for FS).
- To view the reference build instead of running the model: `bash samples/cadence-board/golden_output/start.sh`, then open http://localhost:3000.
