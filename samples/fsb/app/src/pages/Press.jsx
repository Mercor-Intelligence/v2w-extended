import { useMemo, useState } from 'react'
import Breadcrumb from '../components/Breadcrumb.jsx'
import Pagination from '../components/Pagination.jsx'
import { PRESS, POLICY_AREAS } from '../data/mockData.js'

const PER_PAGE = 10
const PRESS_TYPES = ['Press Release', 'Speech', 'Statement']

function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function iconClassFor(type) {
  switch (type) {
    case 'Press Release': return 'icon report'
    case 'Speech': return 'icon speech'
    case 'Statement': return 'icon statement'
    default: return 'icon report'
  }
}

export default function Press() {
  const [search, setSearch] = useState('')
  const [types, setTypes] = useState([])
  const [policyAreas, setPolicyAreas] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)

  const toggle = (list, val) =>
    list.includes(val) ? list.filter((x) => x !== val) : [...list, val]

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const fromD = from ? new Date(from) : null
    const toD = to ? new Date(to) : null
    return PRESS.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false
      if (types.length && !types.includes(p.type)) return false
      if (policyAreas.length && !policyAreas.includes(p.policyArea)) return false
      if (fromD && p.date < fromD) return false
      if (toD && p.date > toD) return false
      return true
    })
  }, [search, types, policyAreas, from, to])

  const noFilter =
    !search && types.length === 0 && policyAreas.length === 0 && !from && !to
  const totalResults = filtered.length
  const displayCount = noFilter ? PRESS.length : totalResults
  const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const featured = slice[0]
  const rest = slice.slice(1)

  const clear = () => {
    setSearch('')
    setTypes([])
    setPolicyAreas([])
    setFrom('')
    setTo('')
    setPage(1)
  }

  const onFilterChange = (fn) => (e) => {
    fn(e)
    setPage(1)
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Press' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Press</h1>
          <p>Press releases, speeches and statements from the FSB.</p>
        </div>
      </div>
      <main className="page">
        <div className="container two-col">
          <aside className="filters" aria-label="Filter press items">
            <h3>Search</h3>
            <div className="filter-search">
              <input
                type="search"
                placeholder="Keywords…"
                value={search}
                onChange={onFilterChange((e) => setSearch(e.target.value))}
              />
            </div>

            <h3>Type</h3>
            {PRESS_TYPES.map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={types.includes(t)}
                  onChange={onFilterChange(() => setTypes((l) => toggle(l, t)))}
                />
                {t}
              </label>
            ))}

            <h3>Policy Areas</h3>
            {POLICY_AREAS.map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={policyAreas.includes(t)}
                  onChange={onFilterChange(() => setPolicyAreas((l) => toggle(l, t)))}
                />
                {t}
              </label>
            ))}

            <h3>Date</h3>
            <div className="filter-date-row">
              <label>Published After</label>
              <input type="date" value={from} onChange={onFilterChange((e) => setFrom(e.target.value))} />
              <label>Published Before</label>
              <input type="date" value={to} onChange={onFilterChange((e) => setTo(e.target.value))} />
            </div>

            <button className="btn-clear" type="button" onClick={clear}>Clear filters</button>
          </aside>

          <section>
            <div className="results-header">
              <div className="results-count">
                <strong>{displayCount.toLocaleString('en-US')}</strong> press items
                {!noFilter && totalResults !== PRESS.length && (
                  <> (filtered from {PRESS.length.toLocaleString('en-US')})</>
                )}
              </div>
              <div className="results-count">
                Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
              </div>
            </div>

            {featured && safePage === 1 && noFilter && (
              <article
                className="featured-report"
                style={{
                  background: 'linear-gradient(180deg, #003d6e08, #fff)',
                  borderLeft: '4px solid var(--fsb-orange)',
                }}
              >
                <div className="meta" style={{ textTransform: 'uppercase', fontSize: '.78rem', color: 'var(--fsb-gray-500)', letterSpacing: '.5px', marginBottom: 6 }}>
                  Latest update · {fmtDate(featured.date)} · {featured.type}
                </div>
                <h3 style={{ fontSize: '1.3rem' }}>
                  <a href={`#press-${featured.id}`}>{featured.title}</a>
                </h3>
                <p style={{ fontSize: '.95rem' }}>{featured.excerpt}</p>
              </article>
            )}

            <div className="results-list">
              {slice.length === 0 && (
                <p>No press items match your current filters. Try clearing some filters.</p>
              )}
              {(safePage === 1 && noFilter ? rest : slice).map((p) => (
                <article key={p.id} className="result-item">
                  <div className={iconClassFor(p.type)} aria-hidden="true">
                    {p.type === 'Press Release' ? 'PR' : p.type.slice(0, 4)}
                  </div>
                  <div>
                    <div className="meta">
                      {fmtDate(p.date)} · {p.type} · {p.policyArea}
                    </div>
                    <h3><a href={`#press-${p.id}`}>{p.title}</a></h3>
                    <p>{p.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>

            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </section>
        </div>
      </main>
    </>
  )
}
