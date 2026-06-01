import { useStore } from '../store'
import { formatCurrency } from '../utils/format'
import ExpenseEditForm from './ExpenseEditForm'

export default function ExpenseItem({ expense }) {
  // Hooks run unconditionally before any early return.
  const isEditing = useStore((s) => s.editingId === expense.id)
  const startEditing = useStore((s) => s.startEditing)
  const deleteExpense = useStore((s) => s.deleteExpense)

  if (isEditing) {
    return (
      <li data-testid="expense-item" className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <ExpenseEditForm expense={expense} />
      </li>
    )
  }

  return (
    <li data-testid="expense-item" className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="min-w-0">
        <p data-testid="expense-description" className="truncate font-medium text-slate-900">{expense.description}</p>
        <p className="mt-1 text-sm text-slate-500">
          <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{expense.category}</span>
          <span className="ml-2">{expense.date}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(expense.amount)}</span>
        <button type="button" onClick={() => startEditing(expense.id)} className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">Edit</button>
        <button type="button" onClick={() => deleteExpense(expense.id)} className="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-50">Delete</button>
      </div>
    </li>
  )
}
