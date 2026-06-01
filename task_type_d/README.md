# Task Type D sample: Expense Tracker (React + Zustand + Tailwind)

An RFP **Task Type D (Frontend Applications)** sample, authored to follow the
RFP's Task Spec D 1:1. Stack A from the RFP table: React + Zustand + Tailwind CSS.

## Contents (RFP Task Spec D, Steps 2-5)

| File | RFP step |
| ---- | -------- |
| [`expense-tracker/problem_statement.txt`](expense-tracker/problem_statement.txt) | Step 2: Problem Statement (`<summary>` / `<core_features>` / `<requirements>`) |
| [`expense-tracker/rubric.json`](expense-tracker/rubric.json) | Step 3: Rubric (`id` / `title` / `annotations{type, importance, criterion}`) |
| [`expense-tracker/agent_verifier.json`](expense-tracker/agent_verifier.json) | Step 4: Agent-as-a-Verifier outcome checklist |
| [`expense-tracker/gold/`](expense-tracker/gold/) | Step 5: Gold Implementation (working app that passes the rubric + checklist) |
| [`harness/`](harness/) | Reproducible grader: runs the agent-verifier and rubric against any build |

The application is a personal expense tracker: add / edit / delete expenses, a
List view and a Summary view, category and month filters, and per-category
monthly budgets with an over-budget indicator. All shared state lives in a single
Zustand store; styling is Tailwind utility classes only; no backend, no
persistence, no external component libraries.

## Build and run the gold

```bash
cd expense-tracker/gold
npm install
npm run dev                      # http://localhost:5173
# or a production build:
npm run build && npm run preview
```

## Evaluation

Scoring is the RFP's: a **rubric** (`rubric.json`) plus an **agent-as-a-verifier**
that drives the running app through the outcomes in `agent_verifier.json`.
Must-have rubric items determine the pass; nice-to-have items are not scored.

The grader is committed under [`harness/`](harness/), so the sample can be
verified end to end from this repo (no external grader needed):

```bash
pip install -r harness/requirements.txt
python -m playwright install chromium
# from the repo root:
python -m task_type_d.harness.verify --app task_type_d/expense-tracker/gold
```

It builds the app with Vite, serves it, runs the 10 outcomes in Playwright, and
scores the 16 rubric items (deterministic static analysis by default, or an
LLM-as-a-judge with `--judge-model claude-opus-4-8 --base-url <litellm-proxy>`).
The gold scores 10/10 outcomes and 13/13 must-haves. See [`harness/README.md`](harness/README.md).

Note: the RFP problem-statement template uses em dashes in two lines;
`problem_statement.txt` uses the same wording with semicolons.
