import { useState } from 'react'

export default function Collapsible({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`collapsible ${open ? 'open' : ''}`}>
      <button
        className="collapsible-header"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="chev" aria-hidden="true">▾</span>
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  )
}
