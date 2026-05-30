import { useMemo, useState } from 'react'
import Breadcrumb from '../components/Breadcrumb.jsx'
import Pagination from '../components/Pagination.jsx'
import { PUBLICATIONS, POLICY_AREAS, CONTENT_TYPES } from '../data/mockData.js'

const PER_PAGE = 10

function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function iconClassFor(type) {
  switch (type) {
    case 'Report': return 'icon report'
    case 'Consultation': return 'icon pdf'
    case 'Statement': return 'icon statement'
    case 'Speech': return 'icon speech'
    default: return 'icon report'
  }
}

export default function Publications() {
  const [search, setSearch] = useState('')
  const [contentTypes, setContentTypes] = useState([])
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
    return PUBLICATIONS.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false
      if (contentTypes.length && !contentTypes.includes(p.contentType)) return false
      if (policyAreas.length && !policyAreas.includes(p.policyArea)) return false
      if (fromD && p.date < fromD) return false
      if (toD && p.date > toD) return false
      return true
    })
  }, [search, contentTypes, policyAreas, from, to])

  const totalResults = filtered.length
  // For the prototype, default headline reflects full set (914) when no filters are applied
  const noFilter =
    !search && contentTypes.length === 0 && policyAreas.length === 0 && !from && !to
  const displayCount = noFilter ? PUBLICATIONS.length : totalResults
  const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const clear = () => {
    setSearch('')
    setContentTypes([])
    setPolicyAreas([])
    setFrom('')
    setTo('')
    setPage(1)
  }

  // any filter change resets page
  const onFilterChange = (fn) => (e) => {
    fn(e)
    setPage(1)
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Publications' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Publications</h1>
          <p>Browse FSB policy documents, reports, evaluations and other publications.</p>
        </div>
      </div>

      <main className="page">
        <div className="container two-col">
          <aside className="filters" aria-label="Filter publications">
            <h3>Search</h3>
            <div className="filter-search">
              <input
                type="search"
                placeholder="Keywords…"
                value={search}
                onChange={onFilterChange((e) => setSearch(e.target.value))}
              />
            </div>

            <h3>Content Type</h3>
            {CONTENT_TYPES.map((t) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={contentTypes.includes(t)}
                  onChange={onFilterChange(() => setContentTypes((l) => toggle(l, t)))}
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
                <strong>{displayCount.toLocaleString('en-US')}</strong> results
                {!noFilter && totalResults !== PUBLICATIONS.length && (
                  <> (filtered from {PUBLICATIONS.length.toLocaleString('en-US')})</>
                )}
              </div>
              <div className="results-count">
                Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
              </div>
            </div>

            <div className="results-list">
              {slice.length === 0 && (
                <p>No publications match your current filters. Try clearing some filters.</p>
              )}
              {slice.map((p) => (
                <article key={p.id} className="result-item">
                  <div className={iconClassFor(p.contentType)} aria-hidden="true">
                    {p.contentType === 'Consultation' ? 'PDF' : p.contentType.slice(0, 4)}
                  </div>
                  <div>
                    <div className="meta">
                      {fmtDate(p.date)} · {p.contentType} · {p.policyArea}
                    </div>
                    <h3><a href={`#pub-${p.id}`}>{p.title}</a></h3>
                    <p>{p.description}</p>
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
