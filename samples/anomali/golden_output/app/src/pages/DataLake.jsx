import { Link } from 'react-router-dom'
import CTABand from '../components/CTABand.jsx'

const FEATURES = [
  { tag: 'ALWAYS-ON', title: 'Always-On Security Data', body: 'Continuous, full-fidelity telemetry across cloud, endpoint, identity and network — no sampling, no blind spots.' },
  { tag: 'UNIFIED VISIBILITY', title: 'Unified Operational Visibility', body: 'One queryable surface for every data source — built for analysts, not data engineers.' },
  { tag: 'AT-SCALE', title: 'Investigation-Ready at Scale', body: 'Petabyte-scale hot lookups in seconds, with affordable long-term retention for compliance and forensics.' },
]

const CAPABILITIES = [
  { title: 'Always-On Telemetry Access', body: 'Stream from any source and keep it queryable — without crippling your SIEM budget.' },
  { title: 'Security-Native Normalization', body: 'A purpose-built schema for SOC use cases — not a generic event store.' },
  { title: 'Native Threat Intelligence Enrichment', body: 'Every log line is enriched in-line with ThreatStream context — at write time and query time.' },
]

const STATS = [
  { num: 'PB+', lbl: 'Hot, queryable security data' },
  { num: '7yr', lbl: 'Affordable long-term retention' },
  { num: '<2s', lbl: 'Median lookup latency at scale' },
  { num: '60%', lbl: 'Lower TCO vs. legacy SIEM' },
]

const USE_CASES = [
  { title: 'Threat Hunting with Historical Clarity', body: 'Pivot through years of telemetry in seconds — uncover stealthy adversary behavior.' },
  { title: 'Real-Time Threat Detection', body: 'High-fidelity detections on streaming data, enriched with curated intelligence.' },
  { title: 'Faster, More Confident Decisions', body: 'Investigators see the full story without context-switching across tools.' },
  { title: 'Compliance & Forensics', body: 'Cost-effective long-term retention and tamper-evident audit trails.' },
]

export default function DataLake() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Layer 1 · Unified Security Data Lake</span>
          <h1>Always-on security data. Always investigation-ready.</h1>
          <p>The Anomali Unified Security Data Lake brings every security signal into one normalized, queryable foundation — built for analysts, priced for petabytes.</p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/resources" className="btn btn-primary">Schedule a Demo</Link>
            <Link to="/resources" className="btn btn-outline">Watch Overview</Link>
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="grid grid-3">
            {FEATURES.map(f => (
              <div className="card" key={f.tag}>
                <span className="card-tag">{f.tag}</span>
                <h3>{f.title}</h3>
                <p style={{ marginTop: 10 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-gradient">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Capabilities</span>
            <h2 style={{ marginTop: 12 }}>A security-first data foundation</h2>
            <p>Not a generic data lake — a platform purpose-built for the speed, fidelity, and economics of modern security operations.</p>
          </div>
          <div className="grid grid-3">
            {CAPABILITIES.map(c => (
              <div className="card" key={c.title}>
                <h3>{c.title}</h3>
                <p style={{ marginTop: 10 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <h2>Performance you can build on</h2>
            <p>Customer-validated metrics from Anomali deployments running in production today.</p>
          </div>
          <div className="grid grid-4">
            {STATS.map(s => (
              <div className="stat" key={s.lbl}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-gradient">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div className="testimonial">
              <blockquote>
                “We replaced our legacy SIEM with Anomali’s data lake and cut storage costs by more than half — while keeping seven years of hot data fully searchable.”
              </blockquote>
              <div className="who">
                <img src="/assets/images/68228a4fdbfec3b02c9c6384_rakbank-logo.jpg" alt="customer" />
                <div>VP, Security Operations · Global Financial Services</div>
              </div>
            </div>
            <div className="testimonial">
              <blockquote>
                “Anomali gave our hunt team something they’d never had: every log, every endpoint, every flow — one query away.”
              </blockquote>
              <div className="who">
                <img src="/assets/images/68228a4fdbfec3b02c9c6386_10x-logo.jpg" alt="customer" />
                <div>Head of Threat Hunting · Fortune 100 Retailer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Use Cases</span>
            <h2 style={{ marginTop: 12 }}>What you can do with always-on security data</h2>
          </div>
          <div className="grid grid-2">
            {USE_CASES.map(u => (
              <div className="card" key={u.title}>
                <h3>{u.title}</h3>
                <p style={{ marginTop: 10 }}>{u.body}</p>
                <Link to="/use-cases" className="btn-link" style={{ marginTop: 16 }}>Read More</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand title="See the data lake live" text="Have an Anomali engineer show you petabyte queries in seconds." secondary="Browse Resources" secondaryTo="/resources" />
    </>
  )
}
