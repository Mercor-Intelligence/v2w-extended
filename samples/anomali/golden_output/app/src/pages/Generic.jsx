import { Link } from 'react-router-dom'
import CTABand from '../components/CTABand.jsx'

export default function Generic({ title, subtitle }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Anomali</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary">Schedule a Demo</Link>
            <Link to="/resources" className="btn btn-outline">Browse Resources</Link>
          </div>
        </div>
      </section>
      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <h2>Get in touch</h2>
            <p>Reach out to our team to learn how Anomali can support your initiatives.</p>
          </div>
          <div className="grid grid-3">
            <div className="card"><h3>Talk to Sales</h3><p>Get a tailored walkthrough of the Agentic SOC Platform.</p><Link to="/products" className="btn-link" style={{ marginTop: 14 }}>Contact Sales</Link></div>
            <div className="card"><h3>Customer Support</h3><p>24/7 global support for Anomali customers.</p><Link to="/resources" className="btn-link" style={{ marginTop: 14 }}>Support Portal</Link></div>
            <div className="card"><h3>Partnerships</h3><p>Join the Anomali partner ecosystem.</p><Link to="/partners" className="btn-link" style={{ marginTop: 14 }}>Become a Partner</Link></div>
          </div>
        </div>
      </section>
      <CTABand />
    </>
  )
}
