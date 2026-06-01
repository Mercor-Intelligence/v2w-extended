import { useState } from 'react'
import { useStore } from '../store'
import { CATEGORIES } from '../constants'

// Editing one row. Field values are local until Save commits them to the store.
export default function ExpenseEditForm({ expense }) {
  const updateExpense = useStore((s) => s.updateExpense)
  const cancelEditing = useStore((s) => s.cancelEditing)
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)
  const [date, setDate] = useState(expense.date)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = description.trim()
    const value = Number(amount)
    if (!trimmed) {
      setError('Description is required.')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Amount must be greater than 0.')
      return
    }
    updateExpense(expense.id, { description: trimmed, amount: value, category, date })
  }

  const field = 'rounded-md border border-slate-300 px-2 py-1 text-sm'

  return (
    <form onSubmit={handleSubmit} data-testid="edit-form" className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`edit-desc-${expense.id}`} className="text-xs font-medium text-slate-600">Description</label>
        <input id={`edit-desc-${expense.id}`} type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`edit-amount-${expense.id}`} className="text-xs font-medium text-slate-600">Amount</label>
        <input id={`edit-amount-${expense.id}`} type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-24 ${field}`} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`edit-cat-${expense.id}`} className="text-xs font-medium text-slate-600">Category</label>
        <select id={`edit-cat-${expense.id}`} value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`edit-date-${expense.id}`} className="text-xs font-medium text-slate-600">Date</label>
        <input id={`edit-date-${expense.id}`} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
      </div>
      <button type="submit" className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">Save</button>
      <button type="button" onClick={cancelEditing} className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">Cancel</button>
      {error && <p role="alert" className="w-full text-sm font-medium text-red-600">{error}</p>}
    </form>
  )
}
