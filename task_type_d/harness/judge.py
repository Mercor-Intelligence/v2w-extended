"""Optional LLM-as-a-judge for rubric items, matching the external RFP grader.

Uses the OpenAI client pointed at a base URL, the same routing convention the
Vision2Web evaluator uses (``from openai import OpenAI`` with a LiteLLM proxy
base_url). Off by default; enabled with ``--judge-model``. Functional rollups
(rubric 1.1, 1.2) stay deterministic and are not sent to the judge.
"""

from __future__ import annotations

import json
import re
from typing import Optional

from .common import CheckResult, RubricItem

MAX_SOURCE_CHARS = 60_000

_SYSTEM = (
    "You are a strict senior frontend reviewer grading one rubric item against the "
    "source of a small React application. Decide only whether THIS item passes. "
    "A 'positive' item passes when the described good property holds. A 'negative' "
    "item passes when the described bad property is ABSENT. Respond with a single "
    'JSON object: {"passed": true|false, "reason": "<one sentence>"} and nothing else.'
)


class LLMJudge:
    """Scores a rubric item with a chat model via an OpenAI-compatible endpoint."""

    def __init__(self, model: str, base_url: Optional[str], api_key: Optional[str]) -> None:
        from openai import OpenAI  # imported lazily so the default path needs no openai

        self.model = model
        self.client = OpenAI(api_key=api_key or "sk-noauth", base_url=base_url)

    def verdict(self, item: RubricItem, source: str, package: dict) -> CheckResult:
        prompt = (
            f"Rubric item {item.id} ({item.importance}, {item.type}; {item.criterion}):\n"
            f"{item.title}\n\n"
            f"package.json:\n{json.dumps(package, indent=2)[:4000]}\n\n"
            f"Application source (truncated):\n{source[:MAX_SOURCE_CHARS]}"
        )
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": _SYSTEM},
                          {"role": "user", "content": prompt}],
                temperature=0,
            )
            content = resp.choices[0].message.content or ""
            passed, reason = self._parse(content)
            return CheckResult(item.id, item.title, passed, reason, item.importance, method="llm-judge")
        except Exception as exc:  # noqa: BLE001 - surface judge/transport failures as a failed item
            return CheckResult(
                item.id, item.title, False, "", item.importance,
                method="llm-judge", error=f"judge error: {exc}"[:300],
            )

    @staticmethod
    def _parse(content: str) -> tuple[bool, str]:
        match = re.search(r"\{.*\}", content, re.S)
        if not match:
            return False, f"unparseable judge response: {content[:160]}"
        data = json.loads(match.group(0))
        return bool(data.get("passed", False)), str(data.get("reason", ""))[:300]
