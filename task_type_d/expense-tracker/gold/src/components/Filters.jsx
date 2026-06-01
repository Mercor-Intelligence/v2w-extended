import { useMemo } from 'react'
import { useStore } from '../store'
import { CATEGORIES } from '../constants'
import { monthOf } from '../utils/format'

export default function Filters() {
  const expenses = useStore((s) => s.expenses)
  const filterCategory = useStore((s) => s.filterCategory)
  const filterMonth = useStore((s) => s.filterMonth)
  const setFilterCategory = useStore((s) => s.setFilterCategory)
  const setFilterMonth = useStore((s) => s.setFilterMonth)

  const months = useMemo(() => {
    const seen = new Set(expenses.map((e) => monthOf(e.date)).filter(Boolean))
    return Array.from(seen).sort().reverse()
  }, [expenses])

  const select = 'rounded-md border border-slate-300 px-3 py-2 text-sm'
  const labelCls = 'text-sm font-medium text-slate-700'

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-category" className={labelCls}>Filter by category</label>
        <select id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={select}>
          <option value="All">All</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-month" className={labelCls}>Filter by month</label>
        <select id="filter-month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className={select}>
          <option value="All">All</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  )
}
