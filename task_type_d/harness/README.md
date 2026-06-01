# Task Type D grader

A reproducible, in-repo realization of the RFP Task Type D scoring: an
**agent-as-a-verifier** that drives the running app through `agent_verifier.json`,
plus a **rubric** scorer for `rubric.json`. Must-have rubric items decide the
binary pass; nice-to-have items are reported but not scored.

This is the harness PR #14 referred to as "intentionally not included." It is now
committed so any Task Type D sample can be graded end to end from this repo.

## Install

```bash
pip install -r task_type_d/harness/requirements.txt
python -m playwright install chromium      # one-time browser download
```

Node.js + npm are required to build the candidate app (the grader runs the app's
own `npm ci`/`npm install` and `npm run build`).

## Run

```bash
# Grade the gold (deterministic; no API key needed)
python -m task_type_d.harness.verify --app task_type_d/expense-tracker/gold

# Grade any candidate build
python -m task_type_d.harness.verify --app path/to/candidate --report grade.json

# Use an LLM-as-a-judge for the source-based rubric items (matches the RFP grader)
python -m task_type_d.harness.verify \
  --app task_type_d/expense-tracker/gold \
  --judge-model claude-opus-4-8 --base-url http://localhost:4000
```

Exit code is `0` on PASS, `1` on FAIL (build failure, a failed must-have, or a
failed agent-verifier outcome).

## Pipeline

1. **Build** (`app_server.py`): `npm ci`/`install` then `npm run build` (Vite).
   The static `dist/` is served in-process on an ephemeral localhost port.
2. **Agent-as-a-verifier** (`functional.py`): Playwright (Chromium) drives the
   10 outcomes in `agent_verifier.json`, one deterministic check per outcome,
   each from a fresh reload. Console `error`s and page errors are captured.
3. **Rubric** (`rubric.py`): each `rubric.json` id has an explicit checker.
   Functional rollups (1.1 "all outcomes pass", 1.2 "no console errors") read
   the verifier results; the rest are static source analysis by default, or are
   delegated to the LLM judge (`judge.py`) when `--judge-model` is set.
4. **Report** (`report.py`): prints PASS/FAIL with per-check evidence; `--report`
   writes the full JSON.

## Modes: deterministic vs LLM-judge

- **Deterministic (default):** every must-have is checked by code, so the grade
  is fully reproducible with no credentials. Negative items (e.g. "uses inline
  styles", "imports MUI") pass when the bad property is absent.
- **`--judge-model` (faithful):** source-based rubric items are scored by an LLM
  via an OpenAI-compatible endpoint (the same `openai` + LiteLLM-proxy routing
  the Vision2Web evaluator uses). 1.1 and 1.2 stay deterministic.

## Verifier selector contract

The deterministic checks prefer these hooks, then fall back to semantic
role/label/text so a candidate that ships conventional semantics still grades:

| Element | Preferred hook | Fallback |
| --- | --- | --- |
| Add form | `[data-testid="add-form"]` | first `<form>` |
| Description / Amount / Category | `#description` / `#amount` / `#category` | `<label>` text |
| Add button | role `button` name matches `add` | `button[type=submit]` |
| Expense rows | `[data-testid="expense-item"]` | role `listitem` |
| Empty state | `[data-testid="expense-empty"]` | text `no expenses` |
| Validation message | `[data-testid="add-error"]` | role `alert` |
| View tabs | role `tab`/`button` named `List`/`Summary` | - |
| Category filter | `#filter-category` | label `filter by category` |
| Summary cell / over-budget | `[data-testid="summary-total-<Cat>"]` / `summary-over-<Cat>` | row text |

## Tests

```bash
pytest task_type_d/tests -q
```

Covers the rubric analyzers against the gold (all must-haves pass) and against a
deliberately bad fixture (the negative must-haves fire). The full browser run is
exercised via the CLI above.
