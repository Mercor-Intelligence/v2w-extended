"""Tests for the Task Type D rubric analyzers and spec loading.

These run without npm or a browser: they exercise the static source analysis
against the committed gold (every must-have must pass) and against a
deliberately bad fixture (the negative must-haves must fire). The full browser
run is exercised through the CLI (`python -m task_type_d.harness.verify`).
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from task_type_d.harness.common import CheckResult, load_outcomes, load_rubric  # noqa: E402
from task_type_d.harness.functional import CHECKS  # noqa: E402
from task_type_d.harness.rubric import CHECKERS, RubricContext, _c41, evaluate_rubric  # noqa: E402

SPEC_DIR = REPO_ROOT / "task_type_d" / "expense-tracker"
GOLD_DIR = SPEC_DIR / "gold"
BAD_DIR = Path(__file__).resolve().parent / "fixtures" / "bad_app"


def _all_outcomes_pass() -> list[CheckResult]:
    """Fabricated agent-verifier results (10/10) so functional rollups are satisfied."""
    return [CheckResult(id=str(i), title=f"outcome {i}", passed=True, evidence="ok") for i in range(1, 11)]


def test_spec_shape():
    outcomes = load_outcomes(SPEC_DIR)
    rubric = load_rubric(SPEC_DIR)
    assert len(outcomes) == 10
    assert len(rubric) == 16
    assert sum(1 for r in rubric if r.is_must_have) == 13
    assert sum(1 for r in rubric if not r.is_must_have) == 3


def test_every_outcome_and_rubric_id_is_mapped():
    for outcome in load_outcomes(SPEC_DIR):
        assert outcome.id in CHECKS, f"no functional check for outcome {outcome.id}"
    for item in load_rubric(SPEC_DIR):
        assert item.id in CHECKERS, f"no rubric checker for item {item.id}"


def test_gold_passes_all_must_haves():
    items = load_rubric(SPEC_DIR)
    results = evaluate_rubric(GOLD_DIR, items, _all_outcomes_pass(), console_errors=[])
    failed = [(c.id, c.evidence or c.error) for c in results if c.is_must_have and not c.passed]
    assert not failed, f"gold should pass every must-have, but these failed: {failed}"


def test_gold_console_errors_break_must_have_1_2():
    items = load_rubric(SPEC_DIR)
    results = evaluate_rubric(
        GOLD_DIR, items, _all_outcomes_pass(), console_errors=["console.error: boom"]
    )
    by_id = {c.id: c for c in results}
    assert by_id["1.2"].passed is False


@pytest.mark.parametrize("rubric_id", ["2.2", "2.4", "2.5", "2.6", "2.7", "3.3"])
def test_bad_fixture_fails_targeted_negatives(rubric_id):
    items = load_rubric(SPEC_DIR)
    results = evaluate_rubric(BAD_DIR, items, _all_outcomes_pass(), console_errors=[])
    by_id = {c.id: c for c in results}
    assert by_id[rubric_id].passed is False, f"bad fixture should fail {rubric_id}: {by_id[rubric_id].evidence}"


def test_c41_detects_arbitrary_px_values(tmp_path):
    # Regression guard: the arbitrary-px regex must actually match w-[100px] etc.
    ctx = RubricContext(
        app_dir=tmp_path,
        functional_by_id={},
        console_errors=[],
        sources={"x.jsx": 'const a = <div className="w-[100px] p-[4.5px]" />'},
        jsx={},
        package={},
    )
    passed, _ = _c41(ctx)
    assert passed is False


def test_bad_fixture_does_not_pass_overall():
    items = load_rubric(SPEC_DIR)
    results = evaluate_rubric(BAD_DIR, items, _all_outcomes_pass(), console_errors=[])
    must_have_failed = [c.id for c in results if c.is_must_have and not c.passed]
    # The PR specifically cited 2.2 and 2.4 as what a weak blind build fails.
    assert "2.2" in must_have_failed and "2.4" in must_have_failed
