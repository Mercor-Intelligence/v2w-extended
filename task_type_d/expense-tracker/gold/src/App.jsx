import { useStore } from './store'
import AddExpenseForm from './components/AddExpenseForm'
import Filters from './components/Filters'
import ExpenseList from './components/ExpenseList'
import SummaryView from './components/SummaryView'

export default function App() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)

  const tab = (active) =>
    `rounded-md px-3 py-1 text-sm font-medium transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expense Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Track spending by category and stay on budget. All data lives in memory.</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        <AddExpenseForm />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Filters />
          <div role="tablist" aria-label="View" className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button type="button" role="tab" aria-selected={view === 'list'} onClick={() => setView('list')} className={tab(view === 'list')}>List</button>
            <button type="button" role="tab" aria-selected={view === 'summary'} onClick={() => setView('summary')} className={tab(view === 'summary')}>Summary</button>
          </div>
        </div>

        {view === 'list' ? <ExpenseList /> : <SummaryView />}
      </main>
    </div>
  )
}
