import { Link } from 'react-router-dom'

const LAYERS = [
  {
    tag: 'LAYER 1',
    title: 'Unified Security Data Lake',
    desc: 'Always-on telemetry, normalized at scale and instantly queryable — so your SOC investigates with complete context instead of fragmented logs.',
    rows: ['Cloud · Endpoint · Network · Identity', 'Security-Native Normalization', 'Investigation-Ready Hot Storage', 'Cost-Efficient Long-Term Retention'],
    active: 2,
    to: '/products/unified-security-data-lake',
    color: '#4f8cff',
  },
  {
    tag: 'LAYER 2',
    title: 'ThreatStream Next-Gen',
    desc: 'Curated intelligence, operational enrichment, and threat context that travels — fueling every detection, investigation, and response.',
    rows: ['Intelligence Aggregation', 'Correlation & Campaign Analysis', 'Intelligence-Driven Investigation', 'Built for Automation & AI'],
    active: 1,
    to: '/products/threatstream',
    color: '#00e08a',
  },
  {
    tag: 'LAYER 3',
    title: 'Agentic AI',
    desc: 'AI-guided detection, investigation and response, grounded in your data and curated intel — with human-in-the-loop oversight.',
    rows: ['AI-Guided Detection & Prioritization', 'Guided Investigations', 'Agentic Response Workflows', 'Human-Guided Automation'],
    active: 0,
    to: '/products/agentic-ai',
    color: '#b388ff',
  },
]

export default function PlatformLayers({ heading = 'Powered by the Anomali Platform Layers', subheading = 'Three integrated layers, one unified platform — built to centralize telemetry, intelligence, and AI for the modern SOC.' }) {
  return (
    <section className="section section-bg-panel">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">The Platform</span>
          <h2 style={{ marginTop: 12 }}>{heading}</h2>
          <p>{subheading}</p>
        </div>
        <div className="grid grid-3">
          {LAYERS.map(layer => (
            <Link key={layer.tag} to={layer.to} className="card" style={{ textDecoration: 'none' }}>
              <span className="card-tag" style={{ color: layer.color }}>{layer.tag}</span>
              <h3>{layer.title}</h3>
              <div className="layer-diagram" style={{ marginTop: 18 }}>
                {layer.rows.map((row, i) => (
                  <div key={row} className={`layer-row ${i === layer.active ? 'active' : ''}`}>
                    <span>{row}</span>
                    <span className="dot" />
                  </div>
                ))}
              </div>
              <p>{layer.desc}</p>
              <div style={{ marginTop: 18 }}>
                <span className="btn-link">Learn More</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
