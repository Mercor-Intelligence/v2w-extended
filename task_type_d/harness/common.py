"""Shared types and spec loading for the Task Type D grader."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

MUST_HAVE = "must have"
NICE_TO_HAVE = "nice to have"


@dataclass(frozen=True)
class Outcome:
    """One agent-as-a-verifier outcome from ``agent_verifier.json``."""

    id: str
    title: str


@dataclass(frozen=True)
class RubricItem:
    """One rubric item from ``rubric.json``."""

    id: str
    title: str
    type: str  # "positive hli verifier" | "negative hli verifier"
    importance: str  # MUST_HAVE | NICE_TO_HAVE
    criterion: str

    @property
    def is_must_have(self) -> bool:
        return self.importance.strip().lower() == MUST_HAVE


@dataclass
class CheckResult:
    """Outcome of a single functional or rubric check."""

    id: str
    title: str
    passed: bool
    evidence: str
    importance: str = MUST_HAVE
    method: str = "deterministic"  # "deterministic" | "llm-judge"
    error: Optional[str] = None

    @property
    def is_must_have(self) -> bool:
        return self.importance.strip().lower() == MUST_HAVE


@dataclass
class GradeReport:
    """Aggregated grade for one sample."""

    app: str
    functional: list[CheckResult] = field(default_factory=list)
    rubric: list[CheckResult] = field(default_factory=list)
    console_errors: list[str] = field(default_factory=list)
    build_ok: bool = True
    build_log: str = ""

    # --- functional rollups ---
    @property
    def functional_passed(self) -> int:
        return sum(1 for c in self.functional if c.passed)

    @property
    def functional_total(self) -> int:
        return len(self.functional)

    # --- must-have rollups (the binary pass) ---
    @property
    def must_have_results(self) -> list[CheckResult]:
        return [c for c in self.rubric if c.is_must_have]

    @property
    def must_have_passed(self) -> int:
        return sum(1 for c in self.must_have_results if c.passed)

    @property
    def must_have_total(self) -> int:
        return len(self.must_have_results)

    @property
    def nice_to_have_results(self) -> list[CheckResult]:
        return [c for c in self.rubric if not c.is_must_have]

    @property
    def passed(self) -> bool:
        """A sample passes only when the build is clean and every must-have holds."""
        return (
            self.build_ok
            and self.must_have_total > 0
            and self.must_have_passed == self.must_have_total
        )

    def to_dict(self) -> dict[str, Any]:
        def dump(checks: list[CheckResult]) -> list[dict[str, Any]]:
            return [
                {
                    "id": c.id,
                    "title": c.title,
                    "passed": c.passed,
                    "importance": c.importance,
                    "method": c.method,
                    "evidence": c.evidence,
                    "error": c.error,
                }
                for c in checks
            ]

        return {
            "app": self.app,
            "passed": self.passed,
            "build_ok": self.build_ok,
            "functional": {
                "passed": self.functional_passed,
                "total": self.functional_total,
                "checks": dump(self.functional),
            },
            "rubric": {
                "must_have_passed": self.must_have_passed,
                "must_have_total": self.must_have_total,
                "checks": dump(self.rubric),
            },
            "console_errors": self.console_errors,
        }


def load_outcomes(spec_dir: Path) -> list[Outcome]:
    """Load ``agent_verifier.json`` (list of ``{id, title}``)."""
    raw = json.loads((spec_dir / "agent_verifier.json").read_text(encoding="utf-8"))
    return [Outcome(id=str(o["id"]), title=str(o["title"])) for o in raw]


def load_rubric(spec_dir: Path) -> list[RubricItem]:
    """Load ``rubric.json`` (list of ``{id, title, annotations{...}}``)."""
    raw = json.loads((spec_dir / "rubric.json").read_text(encoding="utf-8"))
    items: list[RubricItem] = []
    for entry in raw:
        ann = entry.get("annotations", {})
        items.append(
            RubricItem(
                id=str(entry["id"]),
                title=str(entry["title"]),
                type=str(ann.get("type", "")),
                importance=str(ann.get("importance", MUST_HAVE)),
                criterion=str(ann.get("criterion", "")),
            )
        )
    return items
