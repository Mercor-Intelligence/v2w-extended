import { useMemo, useState } from 'react'
import resources, { FILTERS } from '../data/resources.js'
import CTABand from '../components/CTABand.jsx'

const PAGE_SIZE = 9

export default function Resources() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resources.filter(r => {
      const matchesFilter = activeFilter === 'All' || r.type === activeFilter
      const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [query, activeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)

  const onFilter = (f) => { setActiveFilter(f); setPage(1) }
  const onSearch = (e) => { setQuery(e.target.value); setPage(1) }

  return (
    <>
      <section className="resource-hero">
        <div className="container">
          <span className="eyebrow">Resource Center</span>
          <h1 style={{ marginTop: 16 }}>Insights, intelligence, and stories from the front line</h1>
          <p style={{ marginTop: 16, fontSize: 18, color: 'var(--text-muted)', maxWidth: 720, margin: '16px auto 0' }}>
            Explore guides, white papers, solution briefs, datasheets, videos, and webinars — all in one place.
          </p>
          <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              placeholder="Search resources by title, topic, or type…"
              value={query}
              onChange={onSearch}
              aria-label="Search resources"
            />
            <button type="submit">Search</button>
          </form>
          <div className="filter-bar">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => onFilter(f)}
              >{f}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm section-bg-dark">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> resources
              {activeFilter !== 'All' && <> · filtered by <strong style={{ color: 'var(--accent)' }}>{activeFilter}</strong></>}
            </p>
            {(activeFilter !== 'All' || query) && (
              <button className="btn-link" onClick={() => { setActiveFilter('All'); setQuery(''); setPage(1) }}>Clear filters</button>
            )}
          </div>

          {pageItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, marginTop: 28 }}>
              <h3>No resources match your search</h3>
              <p style={{ marginTop: 10 }}>Try a different keyword or filter.</p>
            </div>
          ) : (
            <div className="resource-grid">
              {pageItems.map(r => (
                <article className="resource-card" key={r.id}>
                  <div className="thumb"><img src={r.img} alt={r.title} loading="lazy" /></div>
                  <div className="body">
                    <span className="type-tag">{r.type}</span>
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                    <button className="btn-link" style={{ alignSelf: 'flex-start' }}>Read More</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Previous page">‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={safePage === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
                  aria-label={`Page ${i + 1}`}
                >{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Next page">›</button>
            </div>
          )}
        </div>
      </section>

      <CTABand title="Don’t see what you’re looking for?" text="Our team can connect you with the right Anomali expert and tailored materials for your environment." secondary="Schedule a Demo" secondaryTo="/products" />
    </>
  )
}
