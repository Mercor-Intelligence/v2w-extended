export function formatCurrency(value) {
  const n = Number.isFinite(value) ? value : 0
  return `$${n.toFixed(2)}`
}

export function todayISO() {
  // Local date as YYYY-MM-DD, no date library needed.
  const d = new Date()
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function monthOf(isoDate) {
  return typeof isoDate === 'string' ? isoDate.slice(0, 7) : ''
}
