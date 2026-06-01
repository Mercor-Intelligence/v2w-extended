import { create } from 'zustand'

let nextId = 1
const genId = () => String(nextId++)

// Single Zustand store: every piece of shared application state lives here
// (expenses, the active view, the active filters, and which row is being
// edited). Components read slices of it; none of this is duplicated into
// component-local useState.
export const useStore = create((set) => ({
  expenses: [],
  view: 'list', // 'list' | 'summary'
  filterCategory: 'All',
  filterMonth: 'All',
  editingId: null,

  setView: (view) => set({ view }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterMonth: (filterMonth) => set({ filterMonth }),
  startEditing: (id) => set({ editingId: id }),
  cancelEditing: () => set({ editingId: null }),

  addExpense: ({ description, amount, category, date }) =>
    set((state) => ({
      expenses: [{ id: genId(), description, amount, category, date }, ...state.expenses],
    })),

  updateExpense: (id, patch) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      editingId: null,
    })),

  deleteExpense: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

  clearAll: () => set({ expenses: [] }),
}))
