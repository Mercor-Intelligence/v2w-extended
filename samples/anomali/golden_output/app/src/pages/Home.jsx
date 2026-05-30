import { Link } from 'react-router-dom'
import PlatformLayers from '../components/PlatformLayers.jsx'
import CTABand from '../components/CTABand.jsx'

const PARTNER_LOGOS = [
  '68228a4fdbfec3b02c9c633b_logo-zscaler.jpg',
  '68228a4fdbfec3b02c9c6343_logo-palo-alto-networks.jpg',
  '68228a4fdbfec3b02c9c6362_logo-crowdstrike.webp',
  '68228a4fdbfec3b02c9c635c_logo-fortinet.jpg',
  '68228a4fdbfec3b02c9c6352_logo-checkpoint.jpg',
  '68228a4fdbfec3b02c9c6347_logo-infoblox.jpg',
]

const KEY_STATS = [
  { num: '90%', lbl: 'Reduction in mean time to detect' },
  { num: '10x', lbl: 'Faster threat investigations' },
  { num: '24/7', lbl: 'Always-on telemetry access' },
  { num: 'PB', lbl: 'Petabyte-scale security data' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">THE AGENTIC SOC PLATFORM</span>
              <h1 style={{ marginTop: 16 }}>
                Centralize security telemetry. Power it with threat intelligence and Agentic AI.
              </h1>
              <p className="lead">
                Anomali is the unified Agentic SOC Platform: a security data lake, the world’s leading
                threat intelligence platform, and AI agents that detect, investigate and respond — together,
                at machine speed.
              </p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary">Explore the Platform</Link>
                <Link to="/resources" className="btn btn-outline">Watch the Demo</Link>
              </div>
              <div style={{ marginTop: 36, display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Trusted by</span>
                <img src="/assets/images/68228a4fdbfec3b02c9c52dd_air-canada-white.webp" alt="Air Canada" style={{ height: 22, opacity: 0.8 }} />
                <img src="/assets/images/68228a4fdbfec3b02c9c52ff_admiral-white.webp" alt="Admiral" style={{ height: 22, opacity: 0.8 }} />
                <img src="/assets/images/68228a4fdbfec3b02c9c5300_college-board-white.webp" alt="College Board" style={{ height: 22, opacity: 0.8 }} />
              </div>
            </div>
            <div>
              <div className="card" style={{ background: 'rgba(15,28,63,0.6)', backdropFilter: 'blur(8px)' }}>
                <span className="card-tag">PLATFORM OVERVIEW</span>
                <h3>One platform. Three integrated layers.</h3>
                <div className="layer-diagram" style={{ marginTop: 18 }}>
                  <div className="layer-row active"><span>Layer 3 · Agentic AI</span><span className="dot" /></div>
                  <div className="layer-row active"><span>Layer 2 · ThreatStream Next-Gen</span><span className="dot" /></div>
                  <div className="layer-row active"><span>Layer 1 · Unified Security Data Lake</span><span className="dot" /></div>
                </div>
                <p>From raw telemetry to AI-guided response — Anomali unifies every step of the SOC workflow in one continuous platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm section-bg-panel" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="logo-strip">
            {PARTNER_LOGOS.map(src => (
              <img key={src} src={`/assets/images/${src}`} alt="partner" />
            ))}
          </div>
        </div>
      </section>

      <PlatformLayers />

      <section className="section section-bg-gradient">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Anomali</span>
            <h2 style={{ marginTop: 12 }}>Built for the modern Security Operations Center</h2>
            <p>Every SOC needs visibility, context, and speed. Anomali delivers all three — by collapsing the silos between security data, threat intelligence, and automation.</p>
          </div>
          <div className="grid grid-4">
            {KEY_STATS.map(s => (
              <div className="stat" key={s.lbl}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Outcomes</span>
            <h2 style={{ marginTop: 12 }}>From overwhelmed to outcome-driven</h2>
            <p>Anomali transforms the SOC from reactive log chasing to proactive, intelligence-led defense.</p>
          </div>
          <div className="grid grid-3">
            <div className="card">
              <span className="card-tag">DETECT</span>
              <h3>See threats sooner</h3>
              <p>Continuously match telemetry against curated intelligence to surface real threats — not noise.</p>
            </div>
            <div className="card">
              <span className="card-tag">INVESTIGATE</span>
              <h3>Decide with confidence</h3>
              <p>Investigations that complete in minutes, not hours, with full historical context at your fingertips.</p>
            </div>
            <div className="card">
              <span className="card-tag">RESPOND</span>
              <h3>Act at machine speed</h3>
              <p>AI agents propose, execute and audit response playbooks — with humans firmly in the loop.</p>
            </div>
          </div>
        </div>
      </section>

      <CTABand secondary="Browse Resources" secondaryTo="/resources" />
    </>
  )
}
