export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const buildPageList = () => {
    const pages = []
    const add = (p) => pages.push(p)
    const window = 1

    add(1)
    if (page - window > 2) add('…')
    for (let p = Math.max(2, page - window); p <= Math.min(totalPages - 1, page + window); p++) {
      add(p)
    }
    if (page + window < totalPages - 1) add('…')
    if (totalPages > 1) add(totalPages)
    return pages
  }

  const pages = buildPageList()
  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    onChange(p)
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous">‹ Prev</button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="ellipsis">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={p === page ? 'active' : undefined}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}
      <button onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Next">Next ›</button>
    </nav>
  )
}
