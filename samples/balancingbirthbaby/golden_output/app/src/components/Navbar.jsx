import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import '../styles/navbar.css';

const NAV = [
  {
    label: 'Classes & Events',
    items: [
      { label: 'Prenatal Classes', to: '/classes/prenatal' },
      { label: 'Class Calendar', to: '/classes/calendar' },
      { label: 'Natural Pain Management', to: '/classes/calendar' },
      { label: 'Baby + Me Yoga', to: '/classes/calendar' },
      { label: 'Newborn Care', to: '/classes/calendar' },
    ],
  },
  {
    label: 'Doula',
    items: [
      { label: 'Birth Doula', to: '/doula/birth' },
      { label: 'Postpartum Doula', to: '/doula/birth' },
    ],
  },
  { label: 'Birth Coaching', to: '/birth-coaching' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Blog', to: '/blog' },
];

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <img src="/assets/images/Balancing-birth-baby-logo-600x157.jpg" alt="Balancing Birth to Baby" />
        </Link>

        <button
          className="hamburger"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>

        <nav className={`main-nav ${mobileOpen ? 'open' : ''}`} ref={navRef}>
          <ul className="nav-list">
            {NAV.map((item) => (
              <li
                key={item.label}
                className={`nav-item ${item.items ? 'has-dropdown' : ''} ${
                  openDropdown === item.label ? 'open' : ''
                }`}
                onMouseEnter={() => item.items && setOpenDropdown(item.label)}
                onMouseLeave={() => item.items && setOpenDropdown(null)}
              >
                {item.items ? (
                  <>
                    <button
                      className="nav-link"
                      onClick={() =>
                        setOpenDropdown((prev) => (prev === item.label ? null : item.label))
                      }
                      aria-expanded={openDropdown === item.label}
                    >
                      {item.label} <span className="caret">▾</span>
                    </button>
                    <ul className="dropdown">
                      {item.items.map((sub) => (
                        <li key={sub.label}>
                          <NavLink to={sub.to} className="dropdown-link">
                            {sub.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink to={item.to} className="nav-link">
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
            <li className="nav-item cart-li">
              <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Open cart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
                {count > 0 && <span className="cart-badge">{count}</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
