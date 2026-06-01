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

Scoring is the RFP's: a **rubric** judged by an LLM-as-a-judge (`rubric.json`)
plus an **agent-as-a-verifier** that drives the running app through the outcomes
in `agent_verifier.json`. Must-have rubric items determine the pass; nice-to-have
items are qualitative and not scored.

Note: the RFP problem-statement template uses em dashes in two lines;
`problem_statement.txt` uses the same wording with semicolons.
