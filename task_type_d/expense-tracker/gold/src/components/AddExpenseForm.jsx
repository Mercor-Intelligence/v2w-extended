import { useState } from 'react'
import { useStore } from '../store'
import { CATEGORIES } from '../constants'
import { todayISO } from '../utils/format'

// Local useState here holds only the transient, unsubmitted form inputs.
// Shared application state (the expense list) lives in the Zustand store.
export default function AddExpenseForm() {
  const addExpense = useStore((s) => s.addExpense)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [date, setDate] = useState(todayISO())
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
      setError('Amount must be a number greater than 0.')
      return
    }
    addExpense({ description: trimmed, amount: value, category, date: date || todayISO() })
    setDescription('')
    setAmount('')
    setCategory(CATEGORIES[0])
    setDate(todayISO())
    setError('')
  }

  const field = 'rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none'
  const labelCls = 'text-sm font-medium text-slate-700'

  return (
    <form onSubmit={handleSubmit} data-testid="add-form" className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-6 sm:items-end">
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label htmlFor="description" className={labelCls}>Description</label>
        <input id="description" name="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className={labelCls}>Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className={field} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className={labelCls}>Category</label>
        <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className={labelCls}>Date</label>
        <input id="date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
      </div>
      <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
        Add expense
      </button>
      {error && (
        <p role="alert" data-testid="add-error" className="text-sm font-medium text-red-600 sm:col-span-6">{error}</p>
      )}
    </form>
  )
}
