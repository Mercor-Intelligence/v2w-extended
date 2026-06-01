import { useMemo } from 'react'
import { useStore } from '../store'
import { CATEGORIES, BUDGETS } from '../constants'
import { formatCurrency, monthOf } from '../utils/format'

export default function SummaryView() {
  const expenses = useStore((s) => s.expenses)
  const filterMonth = useStore((s) => s.filterMonth)

  const totals = useMemo(() => {
    const acc = {}
    for (const c of CATEGORIES) acc[c] = 0
    for (const e of expenses) {
      if (filterMonth !== 'All' && monthOf(e.date) !== filterMonth) continue
      acc[e.category] = (acc[e.category] || 0) + e.amount
    }
    return acc
  }, [expenses, filterMonth])

  const grandTotal = useMemo(() => Object.values(totals).reduce((a, b) => a + b, 0), [totals])

  // Budgets are monthly, so over-budget is evaluated per calendar month: a
  // category is over budget when its spend in any single month (within the
  // current filter) exceeds the monthly budget, not when a multi-month
  // cumulative total does.
  const overByCategory = useMemo(() => {
    const perMonth = {}
    for (const e of expenses) {
      if (filterMonth !== 'All' && monthOf(e.date) !== filterMonth) continue
      perMonth[e.category] = perMonth[e.category] || {}
      const m = monthOf(e.date)
      perMonth[e.category][m] = (perMonth[e.category][m] || 0) + e.amount
    }
    const over = {}
    for (const c of CATEGORIES) {
      const monthly = perMonth[c] ? Object.values(perMonth[c]) : [0]
      over[c] = Math.max(...monthly, 0) > BUDGETS[c]
    }
    return over
  }, [expenses, filterMonth])

  if (expenses.length === 0) {
    return (
      <p data-testid="summary-empty" className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No expenses yet. Add expenses to see your spending summary.
      </p>
    )
  }

  return (
    <section aria-label="Spending summary" className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-800">Summary</h2>
      <p className="text-sm text-slate-600">Total spent: <span className="font-semibold text-slate-900">{formatCurrency(grandTotal)}</span></p>
      <table className="w-full border-collapse overflow-hidden rounded-lg border border-slate-200 bg-white text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">Category</th>
            <th scope="col" className="px-4 py-2 font-medium">Spent</th>
            <th scope="col" className="px-4 py-2 font-medium">Budget</th>
            <th scope="col" className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((c) => {
            const spent = totals[c] || 0
            const over = overByCategory[c]
            return (
              <tr key={c} data-testid={`summary-row-${c}`} className="border-t border-slate-100">
                <th scope="row" className="px-4 py-2 font-medium text-slate-800">{c}</th>
                <td data-testid={`summary-total-${c}`} className="px-4 py-2 tabular-nums text-slate-900">{formatCurrency(spent)}</td>
                <td className="px-4 py-2 tabular-nums text-slate-500">{formatCurrency(BUDGETS[c])}</td>
                <td className="px-4 py-2">
                  {over ? (
                    <span data-testid={`summary-over-${c}`} className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Over budget</span>
                  ) : (
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">On track</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
