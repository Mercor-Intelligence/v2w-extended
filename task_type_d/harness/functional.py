"""Agent-as-a-verifier: drive the running app through the agent_verifier outcomes.

Each outcome in ``agent_verifier.json`` maps to one deterministic Playwright
check. Locators prefer the documented ``data-testid`` hooks, then fall back to
semantic role/label/text queries, so the verifier also works on a candidate
build that ships conventional semantics. The selector contract is documented in
``README.md``. State is in-memory, so every check starts from a fresh reload.
"""

from __future__ import annotations

import re
from typing import Callable

from playwright.sync_api import Locator, Page, expect

from .common import CheckResult, Outcome

DEFAULT_TIMEOUT_MS = 5000


class Locators:
    """Resilient locators for the expense-tracker UI."""

    def __init__(self, page: Page) -> None:
        self.page = page

    def _pick(self, *locators: Locator) -> Locator:
        for loc in locators[:-1]:
            try:
                if loc.count() > 0:
                    return loc
            except Exception:  # noqa: BLE001 - locator probing is best-effort
                continue
        return locators[-1]

    def add_form(self) -> Locator:
        return self._pick(
            self.page.locator("[data-testid='add-form']"),
            self.page.locator("form").first,
        )

    def desc_input(self) -> Locator:
        form = self.add_form()
        return self._pick(
            form.locator("#description, input[name='description']"),
            form.get_by_label(re.compile("description", re.I)),
            form.locator("input[type='text']").first,
        )

    def amount_input(self) -> Locator:
        form = self.add_form()
        return self._pick(
            form.locator("#amount, input[name='amount']"),
            form.get_by_label(re.compile("amount", re.I)),
            form.locator("input[type='number']").first,
        )

    def category_select(self) -> Locator:
        form = self.add_form()
        return self._pick(
            form.locator("#category, select[name='category']"),
            form.get_by_label(re.compile("category", re.I)),
            form.locator("select").first,
        )

    def add_button(self) -> Locator:
        form = self.add_form()
        return self._pick(
            form.get_by_role("button", name=re.compile("add", re.I)),
            form.locator("button[type='submit']"),
            self.page.get_by_role("button", name=re.compile("add", re.I)),
        )

    def items(self) -> Locator:
        return self._pick(
            self.page.locator("[data-testid='expense-item']"),
            self.page.get_by_role("listitem"),
        )

    def empty_state(self) -> Locator:
        return self._pick(
            self.page.locator("[data-testid='expense-empty']"),
            self.page.get_by_text(re.compile("no expenses", re.I)),
        )

    def error_alert(self) -> Locator:
        return self._pick(
            self.page.locator("[data-testid='add-error']"),
            self.page.get_by_role("alert"),
        )

    def view_tab(self, name: str) -> Locator:
        return self._pick(
            self.page.get_by_role("tab", name=re.compile(name, re.I)),
            self.page.get_by_role("button", name=re.compile(name, re.I)),
        )

    def filter_category(self) -> Locator:
        return self._pick(
            self.page.locator("#filter-category"),
            self.page.get_by_label(re.compile("filter by category", re.I)),
        )

    def summary_total(self, category: str) -> Locator:
        return self._pick(
            self.page.locator(f"[data-testid='summary-total-{category}']"),
            self.page.get_by_role("row", name=re.compile(category, re.I)),
        )

    def summary_over(self, category: str) -> Locator:
        return self._pick(
            self.page.locator(f"[data-testid='summary-over-{category}']"),
            # Fallback stays category-scoped: the indicator must be in this category's row.
            self.page.get_by_role("row", name=re.compile(category, re.I)).get_by_text(
                re.compile("over budget", re.I)
            ),
        )


def _add_expense(
    page: Page, loc: Locators, description: str, amount: str, category: str | None = None
) -> None:
    loc.desc_input().fill(description)
    loc.amount_input().fill(amount)
    if category is not None:
        loc.category_select().select_option(category)
    loc.add_button().click()


def _reset(page: Page, base_url: str) -> Locators:
    page.goto(base_url, wait_until="networkidle")
    return Locators(page)


def _check_add_visible(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Coffee", "4.50", "Food")
    expect(page.get_by_text("Coffee").first).to_be_visible(timeout=DEFAULT_TIMEOUT_MS)
    return "added Coffee/4.50/Food; 'Coffee' visible in the list"


def _check_three(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Coffee", "4.50", "Food")
    _add_expense(page, loc, "Bus", "2.00", "Transport")
    _add_expense(page, loc, "Rent", "900", "Housing")
    expect(loc.items()).to_have_count(3, timeout=DEFAULT_TIMEOUT_MS)
    return "added 3 expenses; exactly 3 list entries"


def _check_edit(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Coffee", "4.50", "Food")
    loc.items().first.get_by_role("button", name=re.compile("edit", re.I)).click()
    edit_form = page.locator("[data-testid='edit-form']")
    edit_form = edit_form if edit_form.count() else page.locator("form").last
    edit_form.locator("input[type='text']").first.fill("Latte")
    edit_form.get_by_role("button", name=re.compile("save", re.I)).click()
    expect(page.get_by_text("Latte").first).to_be_visible(timeout=DEFAULT_TIMEOUT_MS)
    expect(page.get_by_text("Coffee")).to_have_count(0, timeout=DEFAULT_TIMEOUT_MS)
    return "edited Coffee -> Latte; 'Latte' visible, 'Coffee' gone"


def _check_delete(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Coffee", "4.50", "Food")
    loc.items().first.get_by_role("button", name=re.compile("delete", re.I)).click()
    expect(page.get_by_text("Coffee")).to_have_count(0, timeout=DEFAULT_TIMEOUT_MS)
    return "deleted the expense; 'Coffee' no longer visible"


def _check_delete_all(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Coffee", "4.50", "Food")
    _add_expense(page, loc, "Bus", "2.00", "Transport")
    # Cap iterations so a candidate whose delete is broken fails fast instead of hanging.
    guard = loc.items().count() + 2
    while loc.items().count() > 0 and guard > 0:
        loc.items().first.get_by_role("button", name=re.compile("delete", re.I)).click()
        guard -= 1
    expect(loc.items()).to_have_count(0, timeout=DEFAULT_TIMEOUT_MS)
    expect(loc.empty_state()).to_be_visible(timeout=DEFAULT_TIMEOUT_MS)
    return "deleted all; empty-state message visible, 0 entries"


def _check_empty_description(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Seed", "1.00", "Food")
    before = loc.items().count()
    loc.desc_input().fill("")
    loc.add_button().click()
    expect(loc.items()).to_have_count(before, timeout=DEFAULT_TIMEOUT_MS)
    return f"empty-description submit; count unchanged ({before})"


def _check_zero_amount(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Seed", "1.00", "Food")
    before = loc.items().count()
    loc.desc_input().fill("Zero")
    loc.amount_input().fill("0")
    loc.add_button().click()
    expect(loc.items()).to_have_count(before, timeout=DEFAULT_TIMEOUT_MS)
    expect(loc.error_alert().first).to_be_visible(timeout=DEFAULT_TIMEOUT_MS)
    return f"zero-amount submit; count unchanged ({before}) and a validation message shown"


def _check_category_filter(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Groceries", "12.00", "Food")
    _add_expense(page, loc, "Bus", "2.00", "Transport")
    loc.filter_category().select_option("Food")
    expect(page.get_by_text("Groceries").first).to_be_visible(timeout=DEFAULT_TIMEOUT_MS)
    expect(page.get_by_text("Bus")).to_have_count(0, timeout=DEFAULT_TIMEOUT_MS)
    expect(loc.items()).to_have_count(1, timeout=DEFAULT_TIMEOUT_MS)
    return "filtered by Food; only the Food expense visible"


def _check_summary_total(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    _add_expense(page, loc, "Lunch", "10.00", "Food")
    _add_expense(page, loc, "Snack", "5.00", "Food")
    loc.view_tab("summary").click()
    expect(loc.summary_total("Food")).to_contain_text("15", timeout=DEFAULT_TIMEOUT_MS)
    return "summary view shows Food total of $15.00 (10 + 5)"


def _check_over_budget(page: Page, base_url: str) -> str:
    loc = _reset(page, base_url)
    # Food monthly budget is 50; 30 + 30 = 60 in the current month exceeds it.
    _add_expense(page, loc, "Dinner", "30.00", "Food")
    _add_expense(page, loc, "Brunch", "30.00", "Food")
    loc.view_tab("summary").click()
    expect(loc.summary_over("Food").first).to_be_visible(timeout=DEFAULT_TIMEOUT_MS)
    return "Food spend over budget; over-budget indicator visible in Summary"


# Outcome id -> deterministic check. Keyed to agent_verifier.json ids 1..10.
CHECKS: dict[str, Callable[[Page, str], str]] = {
    "1": _check_add_visible,
    "2": _check_three,
    "3": _check_edit,
    "4": _check_delete,
    "5": _check_delete_all,
    "6": _check_empty_description,
    "7": _check_zero_amount,
    "8": _check_category_filter,
    "9": _check_summary_total,
    "10": _check_over_budget,
}


def run_functional(page: Page, base_url: str, outcomes: list[Outcome]) -> list[CheckResult]:
    """Run every outcome's deterministic check; ``agent_verifier.json`` is authoritative."""
    page.set_default_timeout(DEFAULT_TIMEOUT_MS)
    results: list[CheckResult] = []
    for outcome in outcomes:
        check = CHECKS.get(outcome.id)
        if check is None:
            results.append(
                CheckResult(
                    id=outcome.id,
                    title=outcome.title,
                    passed=False,
                    evidence="",
                    error="no deterministic check mapped for this outcome id",
                )
            )
            continue
        try:
            evidence = check(page, base_url)
            results.append(
                CheckResult(id=outcome.id, title=outcome.title, passed=True, evidence=evidence)
            )
        except Exception as exc:  # noqa: BLE001 - a failed assertion means the outcome failed
            results.append(
                CheckResult(
                    id=outcome.id,
                    title=outcome.title,
                    passed=False,
                    evidence="",
                    error=str(exc).splitlines()[0][:300],
                )
            )
    return results
