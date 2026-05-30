import { Link } from 'react-router-dom'
import PlatformLayers from '../components/PlatformLayers.jsx'
import CTABand from '../components/CTABand.jsx'

const STAGES = [
  { step: '01', title: 'Security', body: 'Always-on detection across cloud, endpoint, network and identity — fueled by curated threat intelligence.' },
  { step: '02', title: 'Investigation', body: 'Petabyte-scale lookups with rich threat context and AI-guided narratives that close cases faster.' },
  { step: '03', title: 'Remediation', body: 'Agentic playbooks propose, execute and audit response steps — with human-in-the-loop oversight.' },
  { step: '04', title: 'Intelligence', body: 'Feedback from every incident enriches the global intelligence graph, sharpening the next detection.' },
]

const CORE_CAPS = [
  'Unified Security Data Lake — limitless, normalized telemetry',
  'ThreatStream Next-Gen — curated, operational threat intelligence',
  'Agentic AI — guided detection, investigation and response',
  'Open APIs and a marketplace of 200+ integrations',
  'Petabyte-scale hot storage at long-term retention cost',
  'Built-in MITRE ATT&CK and campaign analysis',
]

export default function AgenticSOC() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Anomali Agentic SOC Platform</span>
          <h1>One unified platform for the modern SOC</h1>
          <p>A detailed look at how Anomali centralizes security telemetry, fuses it with leading threat intelligence, and orchestrates AI-guided response — across Security, Investigation, Remediation and Intelligence.</p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/resources" className="btn btn-primary">Schedule a Demo</Link>
            <Link to="/resources" className="btn btn-outline">Read the Datasheet</Link>
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2 style={{ marginTop: 12 }}>Four stages, one continuous workflow</h2>
            <p>The Agentic SOC Platform operates across four tightly integrated stages — eliminating the swivel-chair between tools.</p>
          </div>
          <div className="stages">
            {STAGES.map(s => (
              <div className="stage" key={s.step}>
                <div className="step">{s.step}</div>
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-gradient">
        <div className="container">
          <div className="hero-grid" style={{ alignItems: 'start' }}>
            <div>
              <span className="eyebrow">Core capabilities</span>
              <h2 style={{ marginTop: 12 }}>Everything your analysts need, in one place</h2>
              <p style={{ marginTop: 16, fontSize: 17 }}>
                Stop stitching together SIEMs, TIPs, SOARs and data lakes. Anomali delivers the full
                operational SOC stack — purpose-built to be agentic from the ground up.
              </p>
              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/use-cases" className="btn btn-primary">View Use Cases</Link>
                <Link to="/resources" className="btn btn-outline">Schedule a Demo</Link>
              </div>
            </div>
            <ul className="feature-list">
              {CORE_CAPS.map(c => (
                <li key={c}><span className="ic">✓</span><span>{c}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PlatformLayers heading="Powered by the Anomali Platform Layers" subheading="Click any layer to explore its capabilities in depth." />

      <CTABand title="See the Agentic SOC Platform in action" text="Walk through real workflows with an Anomali solutions engineer." secondary="Browse Resources" secondaryTo="/resources" />
    </>
  )
}
