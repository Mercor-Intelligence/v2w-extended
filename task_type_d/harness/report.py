"""Human-readable rendering of a GradeReport."""

from __future__ import annotations

from .common import CheckResult, GradeReport

_PASS = "PASS"
_FAIL = "FAIL"


def _line(check: CheckResult) -> str:
    mark = _PASS if check.passed else _FAIL
    detail = check.evidence or check.error or ""
    tag = "" if check.method == "deterministic" else f" [{check.method}]"
    return f"  [{mark}] {check.id}{tag} {check.title}\n        -> {detail}"


def render(report: GradeReport) -> str:
    lines: list[str] = []
    lines.append(f"Task Type D grade: {report.app}")
    lines.append("=" * 72)

    if not report.build_ok:
        lines.append("BUILD FAILED")
        lines.append(report.build_log[-2000:])
        lines.append("=" * 72)
        lines.append("RESULT: FAIL (build did not produce a servable app)")
        return "\n".join(lines)

    lines.append(f"Agent-as-a-verifier ({report.functional_passed}/{report.functional_total} outcomes):")
    lines.extend(_line(c) for c in report.functional)

    lines.append("")
    lines.append(f"Rubric must-haves ({report.must_have_passed}/{report.must_have_total}):")
    lines.extend(_line(c) for c in report.must_have_results)

    nice = report.nice_to_have_results
    if nice:
        nice_pass = sum(1 for c in nice if c.passed)
        lines.append("")
        lines.append(f"Rubric nice-to-haves ({nice_pass}/{len(nice)}, not scored):")
        lines.extend(_line(c) for c in nice)

    if report.console_errors:
        lines.append("")
        lines.append(f"Console errors ({len(report.console_errors)}):")
        lines.extend(f"  - {e[:200]}" for e in report.console_errors[:10])

    lines.append("=" * 72)
    verdict = "PASS" if report.passed else "FAIL"
    lines.append(
        f"RESULT: {verdict} "
        f"(must-haves {report.must_have_passed}/{report.must_have_total}, "
        f"outcomes {report.functional_passed}/{report.functional_total})"
    )
    return "\n".join(lines)
