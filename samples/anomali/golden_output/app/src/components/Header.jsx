import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const NAV = [
  { label: 'Products', to: '/products' },
  { label: 'Use Cases', to: '/use-cases' },
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'Resources', to: '/resources' },
  { label: 'Company', to: '/company' },
  { label: 'Partners', to: '/partners' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Anomali home">
          <img src="/assets/images/68228a4fdbfec3b02c9c565b_Anomali-Logo-White-2024-1200-p-500.webp" alt="Anomali" />
        </Link>
        <nav className={`nav ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} className={({isActive}) => isActive ? 'active' : ''}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-cta">
          <Link to="/company" className="btn btn-outline">Sign In</Link>
          <Link to="/products" className="btn btn-primary">Schedule a Demo</Link>
          <button
            className="menu-toggle"
            aria-label="Open menu"
            onClick={() => setOpen(o => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
