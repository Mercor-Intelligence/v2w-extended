import { Link } from 'react-router-dom'

export default function Breadcrumb({ items = [] }) {
  // items: [{ label, to? }, ...]; last item is current page (no link)
  const full = [{ label: 'Home', to: '/' }, ...items]
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <div className="container">
        <ol>
          {full.map((it, idx) => {
            const isLast = idx === full.length - 1
            return (
              <li key={idx} aria-current={isLast ? 'page' : undefined}>
                {!isLast && it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
