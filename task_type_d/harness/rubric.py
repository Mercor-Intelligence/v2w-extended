"""Score rubric.json against an app: deterministic static analysis by default.

Each rubric id has an explicit checker so the pass/fail logic follows the item's
wording (positive items must hold; negative items must be absent). Items that are
inherently rollups of the agent-verifier run (1.1, 1.2) always use the functional
results. The remaining source-based items can instead be delegated to an
LLM-as-a-judge (see ``judge.py``) to match the external RFP grader exactly.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING, Callable, Optional

from .common import CheckResult, RubricItem

if TYPE_CHECKING:
    from .judge import LLMJudge

SOURCE_SUFFIXES = (".js", ".jsx", ".ts", ".tsx")
COMPONENT_LINE_LIMIT = 150
# Full component/UI libraries that the spec forbids (headless utilities excluded).
FORBIDDEN_LIBS = (
    "@mui/", "@material-ui/", "@chakra-ui/", "antd", "@ant-design/", "react-bootstrap",
    "@mantine/", "@blueprintjs/", "semantic-ui-react", "@fluentui/", "@nextui-org/",
)
SHARED_STATE_KEYS = ("expenses", "view", "filterCategory", "filterMonth", "editingId")


@dataclass
class RubricContext:
    app_dir: Path
    functional_by_id: dict[str, CheckResult]
    console_errors: list[str]
    sources: dict[str, str] = field(default_factory=dict)
    jsx: dict[str, str] = field(default_factory=dict)
    package: dict = field(default_factory=dict)

    @classmethod
    def build(
        cls, app_dir: Path, functional: list[CheckResult], console_errors: list[str]
    ) -> "RubricContext":
        src = app_dir / "src"
        sources: dict[str, str] = {}
        for path in sorted(src.rglob("*")):
            if path.suffix in SOURCE_SUFFIXES and path.is_file():
                sources[str(path.relative_to(app_dir))] = path.read_text(encoding="utf-8")
        jsx = {p: t for p, t in sources.items() if p.endswith((".jsx", ".tsx"))}
        package = {}
        pkg = app_dir / "package.json"
        if pkg.exists():
            package = json.loads(pkg.read_text(encoding="utf-8"))
        return cls(
            app_dir=app_dir,
            functional_by_id={c.id: c for c in functional},
            console_errors=console_errors,
            sources=sources,
            jsx=jsx,
            package=package,
        )

    def all_source_text(self) -> str:
        return "\n".join(self.sources.values())

    def all_deps(self) -> dict[str, str]:
        deps = dict(self.package.get("dependencies", {}))
        deps.update(self.package.get("devDependencies", {}))
        return deps


# --- functional rollups (always deterministic) ---
def _c11(ctx: RubricContext) -> tuple[bool, str]:
    results = list(ctx.functional_by_id.values())
    passed = sum(1 for r in results if r.passed)
    total = len(results)
    return (total > 0 and passed == total), f"agent verifier: {passed}/{total} outcomes passed"


def _c12(ctx: RubricContext) -> tuple[bool, str]:
    n = len(ctx.console_errors)
    if n == 0:
        return True, "no console.error / pageerror during the verifier session"
    return False, f"{n} console error(s): {ctx.console_errors[0][:160]}"


def _c13(ctx: RubricContext) -> tuple[bool, str]:
    # Invalid input must surface a visible message; outcome 7 asserts exactly that.
    zero = ctx.functional_by_id.get("7")
    if zero is not None:
        return zero.passed, f"invalid-input message verified by outcome 7: {zero.evidence or zero.error}"
    has_alert = bool(re.search(r"role=[\"']alert[\"']|data-testid=[\"'][^\"']*error", ctx.all_source_text()))
    return has_alert, "static: an alert/error element is present in source" if has_alert else "no error UI found"


# --- technical implementation ---
def _c21(ctx: RubricContext) -> tuple[bool, str]:
    text = ctx.all_source_text()
    imports_zustand = re.search(r"from\s+['\"]zustand['\"]", text) is not None
    uses_create = re.search(r"\bcreate\s*\(", text) is not None
    uses_zustand = imports_zustand and uses_create
    in_store = sum(1 for k in SHARED_STATE_KEYS if re.search(rf"\b{k}\b", text))
    ok = uses_zustand and in_store >= 3
    return ok, f"zustand import={imports_zustand}, create()={uses_create}; shared keys={in_store}/{len(SHARED_STATE_KEYS)}"


def _c22(ctx: RubricContext) -> tuple[bool, str]:
    worst, worst_n = "", 0
    for path, text in ctx.jsx.items():
        n = len(text.splitlines())
        if n > worst_n:
            worst, worst_n = path, n
    return worst_n <= COMPONENT_LINE_LIMIT, f"largest component {worst} = {worst_n} lines (limit {COMPONENT_LINE_LIMIT})"


def _c23(ctx: RubricContext) -> tuple[bool, str]:
    util = re.compile(
        r"\b("
        r"flex|grid|hidden|block|inline|"
        r"[mp][xytrbl]?-\d|gap-\d|space-[xy]-\d|"
        r"text-|bg-|border|rounded|font-|leading-|tracking-|"
        r"w-|h-|min-|max-|items-|justify-|"
        r"hover:|focus:|sm:|md:|lg:"
        r")"
    )
    text = ctx.all_source_text()
    class_strings = re.findall(r"className=[\"']([^\"']+)[\"']", text)
    class_strings += re.findall(r"className=\{`([^`]+)`\}", text)  # template-literal classes
    count = sum(len(util.findall(cls)) for cls in class_strings)
    return count >= 20, f"{count} tailwind utility tokens in className strings"


def _c24(ctx: RubricContext) -> tuple[bool, str]:
    hits = [p for p, t in ctx.jsx.items() if re.search(r"\bstyle=\{\{", t)]
    return len(hits) == 0, "no inline style={{...}} props" if not hits else f"inline styles in: {', '.join(hits)}"


def _c25(ctx: RubricContext) -> tuple[bool, str]:
    text = ctx.all_source_text()
    imported = [lib for lib in FORBIDDEN_LIBS if re.search(rf"from\s+[\"']{re.escape(lib)}", text)]
    in_deps = [lib for lib in FORBIDDEN_LIBS if any(d.startswith(lib.rstrip("/")) for d in ctx.all_deps())]
    bad = sorted(set(imported) | set(in_deps))
    return len(bad) == 0, "no external component library" if not bad else f"forbidden libs: {', '.join(bad)}"


def _c26(ctx: RubricContext) -> tuple[bool, str]:
    # Shared collection must come from the store, not a component-local useState collection.
    array_state = [p for p, t in ctx.jsx.items() if re.search(r"useState\s*(?:<[^>]+>)?\s*\(\s*\[", t)]
    expenses_in_store = re.search(r"expenses\s*:", ctx.all_source_text()) is not None
    ok = not array_state and expenses_in_store
    detail = f"array-initialized useState in: {', '.join(array_state)}" if array_state else "no local collection state"
    return ok, f"{detail}; expenses defined in store={expenses_in_store}"


def _c27(ctx: RubricContext) -> tuple[bool, str]:
    block = re.compile(r"\b(if|for|while)\s*\([^)]*\)\s*\{[^{}]*\buse[A-Z]\w*\s*\(")
    callback = re.compile(r"\.(map|forEach|filter|reduce)\s*\([^)]*=>\s*\{[^{}]*\buse[A-Z]\w*\s*\(")
    offenders = [p for p, t in ctx.jsx.items() if block.search(t) or callback.search(t)]
    return len(offenders) == 0, "no hook calls inside conditionals/loops (best-effort static)" if not offenders else f"conditional hooks in: {', '.join(offenders)}"


# --- ux & accessibility ---
def _c31(ctx: RubricContext) -> tuple[bool, str]:
    static = bool(re.search(r"(?:data-testid=[\"'][^\"']*empty)|(?:no\s+expenses)", ctx.all_source_text(), re.I))
    delete_all = ctx.functional_by_id.get("5")
    dyn = delete_all.passed if delete_all else False
    return static and dyn, f"empty-state element in source={static}; renders when empty (outcome 5)={dyn}"


def _c32(ctx: RubricContext) -> tuple[bool, str]:
    text = ctx.all_source_text()
    buttons = len(re.findall(r"<button\b", text))
    inputs = len(re.findall(r"<(input|select)\b", text))
    labels = len(re.findall(r"<label\b", text))
    ok = buttons > 0 and inputs > 0 and labels > 0
    return ok, f"<button>={buttons}, <input/select>={inputs}, <label>={labels}"


def _c33(ctx: RubricContext) -> tuple[bool, str]:
    offenders = [p for p, t in ctx.jsx.items() if re.search(r"<(div|span)\b[^>]*\bonClick", t)]
    return len(offenders) == 0, "no div/span onClick handlers" if not offenders else f"clickable div/span in: {', '.join(offenders)}"


# --- design fidelity (nice to have) ---
def _c41(ctx: RubricContext) -> tuple[bool, str]:
    arb = [c for c in re.findall(r"className=[\"']([^\"']+)[\"']", ctx.all_source_text()) if re.search(r"\[[\d.]+px\]", c)]
    return len(arb) == 0, "no arbitrary px values in className" if not arb else f"{len(arb)} arbitrary px className(s)"


def _c42(ctx: RubricContext) -> tuple[bool, str]:
    n = len(re.findall(r"\b(transition|animate)-?\w*", ctx.all_source_text()))
    return n > 0, f"{n} transition/animation utility occurrences"


def _c43(ctx: RubricContext) -> tuple[bool, str]:
    text = ctx.all_source_text()
    headings = len(re.findall(r"<h[1-6]\b", text))
    weights = len(re.findall(r"\b(text-(?:lg|xl|2xl|3xl)|font-(?:semibold|bold))\b", text))
    return (headings + weights) > 0, f"{headings} heading tags, {weights} size/weight utilities"


CHECKERS: dict[str, Callable[[RubricContext], tuple[bool, str]]] = {
    "1.1": _c11, "1.2": _c12, "1.3": _c13,
    "2.1": _c21, "2.2": _c22, "2.3": _c23, "2.4": _c24, "2.5": _c25, "2.6": _c26, "2.7": _c27,
    "3.1": _c31, "3.2": _c32, "3.3": _c33,
    "4.1": _c41, "4.2": _c42, "4.3": _c43,
}
# Items that must stay deterministic even in LLM-judge mode (functional rollups).
FUNCTIONAL_ROLLUPS = {"1.1", "1.2"}


def evaluate_rubric(
    app_dir: Path,
    items: list[RubricItem],
    functional: list[CheckResult],
    console_errors: list[str],
    judge: Optional["LLMJudge"] = None,
) -> list[CheckResult]:
    """Score every rubric item. ``rubric.json`` is authoritative for the item set."""
    ctx = RubricContext.build(app_dir, functional, console_errors)
    results: list[CheckResult] = []
    for item in items:
        use_llm = judge is not None and item.id not in FUNCTIONAL_ROLLUPS
        if use_llm:
            results.append(judge.verdict(item, ctx.all_source_text(), ctx.package))
            continue
        checker = CHECKERS.get(item.id)
        if checker is None:
            results.append(
                CheckResult(item.id, item.title, False, "", item.importance,
                            error="no checker mapped for this rubric id")
            )
            continue
        try:
            passed, evidence = checker(ctx)
            results.append(CheckResult(item.id, item.title, passed, evidence, item.importance))
        except Exception as exc:  # noqa: BLE001 - a checker error is a failed item, reported
            results.append(CheckResult(item.id, item.title, False, "", item.importance, error=str(exc)[:300]))
    return results
