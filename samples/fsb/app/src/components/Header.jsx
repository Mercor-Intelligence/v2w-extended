import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/about', label: 'About the FSB' },
  { to: '/work', label: 'Work of the FSB' },
  { to: '/publications', label: 'Publications' },
  { to: '/consultations', label: 'Consultations' },
  { to: '/press', label: 'Press' },
]

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <>
      <div className="top-bar">
        <div className="container">
          <a href="#contact">Contact</a>
          <a href="#sitemap">Sitemap</a>
          <a href="#subscribe">Subscribe</a>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <Link to="/" className="brand" aria-label="FSB Home">
            <div className="brand-logo">FSB</div>
            <div className="brand-text">
              <span className="brand-name">Financial Stability Board</span>
              <span className="brand-sub">Promoting global financial stability</span>
            </div>
          </Link>

          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault()
              alert(`Search: ${searchQuery || '(empty)'}`)
            }}
          >
            <input
              type="text"
              aria-label="Search the FSB website"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">Search</button>
          </form>
        </div>
      </div>

      <nav className="main-nav" aria-label="Main navigation">
        <div className="container">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
