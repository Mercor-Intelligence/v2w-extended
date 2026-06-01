import { useMemo } from 'react'
import { useStore } from '../store'
import { monthOf } from '../utils/format'
import ExpenseItem from './ExpenseItem'

export default function ExpenseList() {
  const expenses = useStore((s) => s.expenses)
  const filterCategory = useStore((s) => s.filterCategory)
  const filterMonth = useStore((s) => s.filterMonth)

  const filtered = useMemo(
    () =>
      expenses.filter(
        (e) =>
          (filterCategory === 'All' || e.category === filterCategory) &&
          (filterMonth === 'All' || monthOf(e.date) === filterMonth),
      ),
    [expenses, filterCategory, filterMonth],
  )

  const emptyCls = 'rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500'

  if (expenses.length === 0) {
    return <p data-testid="expense-empty" className={emptyCls}>No expenses yet. Add one above to get started.</p>
  }

  if (filtered.length === 0) {
    return <p data-testid="expense-empty" className={emptyCls}>No expenses match these filters.</p>
  }

  return (
    <section aria-label="Expense list" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-800">Expenses ({filtered.length})</h2>
      <ul className="flex flex-col gap-3">
        {filtered.map((e) => <ExpenseItem key={e.id} expense={e} />)}
      </ul>
    </section>
  )
}
