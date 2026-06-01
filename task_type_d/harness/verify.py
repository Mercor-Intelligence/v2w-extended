"""CLI: grade a Task Type D sample end to end and exit non-zero on failure.

    python -m task_type_d.harness.verify --app task_type_d/expense-tracker/gold

Pipeline: build (Vite) -> serve (static) -> agent-as-a-verifier (Playwright over
agent_verifier.json) -> rubric (rubric.json, static or --judge-model) -> report.
"""

from __future__ import annotations

import json
import os
import pathlib
import sys

# Allow running both as a module and as a script (python path/to/verify.py).
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2]))

import click  # noqa: E402

from task_type_d.harness.app_server import build_app, serve  # noqa: E402
from task_type_d.harness.common import GradeReport, load_outcomes, load_rubric  # noqa: E402
from task_type_d.harness.functional import run_functional  # noqa: E402
from task_type_d.harness.report import render  # noqa: E402
from task_type_d.harness.rubric import evaluate_rubric  # noqa: E402

DEFAULT_APP = "task_type_d/expense-tracker/gold"
DEFAULT_SPEC = "task_type_d/expense-tracker"


def grade(
    app_dir: pathlib.Path,
    spec_dir: pathlib.Path,
    headless: bool = True,
    judge_model: str | None = None,
    base_url: str | None = None,
    api_key: str | None = None,
) -> GradeReport:
    """Build, serve, and grade one sample; returns a populated GradeReport."""
    from playwright.sync_api import sync_playwright

    outcomes = load_outcomes(spec_dir)
    rubric_items = load_rubric(spec_dir)
    report = GradeReport(app=str(app_dir))

    build = build_app(app_dir)
    report.build_ok = build.ok
    report.build_log = build.log
    if not build.ok or build.dist_dir is None:
        return report

    judge = None
    if judge_model:
        from task_type_d.harness.judge import LLMJudge

        judge = LLMJudge(judge_model, base_url, api_key)

    console_errors: list[str] = []
    with serve(build.dist_dir) as url:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=headless)
            context = browser.new_context(viewport={"width": 1280, "height": 900})
            page = context.new_page()

            def on_console(msg: object) -> None:
                if getattr(msg, "type", "") == "error":
                    console_errors.append(f"console.error: {getattr(msg, 'text', '')}")

            page.on("console", on_console)
            page.on("pageerror", lambda exc: console_errors.append(f"pageerror: {exc}"))

            try:
                report.functional = run_functional(page, url, outcomes)
            finally:
                context.close()
                browser.close()

    report.console_errors = console_errors
    report.rubric = evaluate_rubric(app_dir, rubric_items, report.functional, console_errors, judge)
    return report


@click.command()
@click.option("--app", "app_path", default=DEFAULT_APP, show_default=True, help="App directory to grade.")
@click.option("--spec", "spec_path", default=DEFAULT_SPEC, show_default=True, help="Directory with agent_verifier.json and rubric.json.")
@click.option("--judge-model", default=None, help="Enable LLM-as-a-judge for source-based rubric items (e.g. claude-opus-4-8).")
@click.option("--base-url", default=None, help="OpenAI-compatible base URL for the judge (e.g. a LiteLLM proxy).")
@click.option("--api-key", default=None, help="API key for the judge; falls back to $OPENAI_API_KEY.")
@click.option("--headed", is_flag=True, default=False, help="Show the browser instead of running headless.")
@click.option("--report", "report_path", default=None, type=click.Path(), help="Write the full report as JSON here.")
def main(app_path, spec_path, judge_model, base_url, api_key, headed, report_path):
    """Grade a Task Type D sample and print a PASS/FAIL report."""
    app_dir = pathlib.Path(app_path).resolve()
    spec_dir = pathlib.Path(spec_path).resolve()
    if not app_dir.exists():
        raise click.ClickException(f"app directory not found: {app_dir}")
    if not (spec_dir / "agent_verifier.json").exists():
        raise click.ClickException(f"agent_verifier.json not found under: {spec_dir}")

    report = grade(
        app_dir=app_dir,
        spec_dir=spec_dir,
        headless=not headed,
        judge_model=judge_model,
        base_url=base_url,
        api_key=api_key or os.environ.get("OPENAI_API_KEY"),
    )

    click.echo(render(report))
    if report_path:
        pathlib.Path(report_path).write_text(json.dumps(report.to_dict(), indent=2), encoding="utf-8")
        click.echo(f"\nWrote JSON report to {report_path}")

    sys.exit(0 if report.passed else 1)


if __name__ == "__main__":
    main()
