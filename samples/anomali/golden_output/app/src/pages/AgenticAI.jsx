import { Link } from 'react-router-dom'
import CTABand from '../components/CTABand.jsx'

const ZEROS = [
  { num: '0', lbl: 'Friction in detection & prioritization' },
  { num: '0s', lbl: 'Response time for threat indicators' },
  { num: '0', lbl: 'Analyst time spent screening threats' },
  { num: '0', lbl: 'Response bias falling through the cracks' },
]

const CAPS = [
  { tag: 'DETECT', title: 'AI-Guided Detection & Prioritization', body: 'Anomali AI ranks every alert by adversary, asset value and business impact — so analysts work on what matters first.' },
  { tag: 'INVESTIGATE', title: 'Guided Investigations', body: 'A virtual analyst that pulls together telemetry, intelligence and past cases into a complete narrative — in seconds.' },
  { tag: 'RESPOND', title: 'Agentic Response Workflows', body: 'Playbooks that propose, execute, and audit response steps with human-in-the-loop oversight at every gate.' },
]

const SECTIONS = [
  {
    eyebrow: 'Grounded in your data',
    title: 'Intelligence-driven decisions, not hallucinations',
    body: 'Every recommendation from Anomali Agentic AI is grounded in your security data lake and curated threat intelligence — never a black box, never inventing facts. Every action is fully explainable, auditable and reversible.',
  },
  {
    eyebrow: 'Built for scale',
    title: 'SOC at scale, without scaling headcount',
    body: 'Agentic AI handles tier-1 and tier-2 toil so your senior analysts focus on the threats only humans can solve. Free up 60%+ of analyst time while improving detection and response outcomes.',
  },
]

export default function AgenticAI() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Layer 3 · Anomali Agentic AI</span>
          <h1>AI-guided security decisions, powered by complete data and real intelligence.</h1>
          <p>Human-guided automation with AI-assisted reasoning across detection, investigation and response — built directly on the Anomali platform.</p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/resources" className="btn btn-primary">Schedule a Demo</Link>
            <Link to="/resources" className="btn btn-outline">See the Capabilities</Link>
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Why Anomali Agentic AI</span>
            <h2 style={{ marginTop: 12 }}>The four zeros</h2>
            <p>What modern SOCs gain — and what they leave behind — when AI is built directly into the platform.</p>
          </div>
          <div className="grid grid-4">
            {ZEROS.map(z => (
              <div className="stat" key={z.lbl}>
                <div className="num">{z.num}</div>
                <div className="lbl">{z.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-gradient">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Core capabilities</span>
            <h2 style={{ marginTop: 12 }}>Agentic AI across the SOC workflow</h2>
          </div>
          <div className="grid grid-3">
            {CAPS.map(c => (
              <div className="card" key={c.tag}>
                <span className="card-tag">{c.tag}</span>
                <h3>{c.title}</h3>
                <p style={{ marginTop: 10 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {SECTIONS.map((s, idx) => (
        <section key={s.title} className={`section ${idx % 2 === 0 ? 'section-bg-dark' : 'section-bg-gradient'}`}>
          <div className="container">
            <div className="hero-grid" style={{ alignItems: 'center' }}>
              <div style={{ order: idx % 2 === 0 ? 0 : 1 }}>
                <span className="eyebrow">{s.eyebrow}</span>
                <h2 style={{ marginTop: 12 }}>{s.title}</h2>
                <p style={{ marginTop: 16, fontSize: 17 }}>{s.body}</p>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: 24 }}>Schedule a Demo</Link>
              </div>
              <div className="card" style={{ aspectRatio: '4 / 3', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(15,28,63,0.6)' }}>
                <img
                  src={idx === 0 ? '/assets/images/68228a4fdbfec3b02c9c6329_The_Anomali_Platform.webp' : '/assets/images/68228a4fdbfec3b02c9c62da_Anomali_Resillence_Starts_Here_1200x630.webp'}
                  alt={s.title}
                  style={{ borderRadius: 12, maxHeight: '100%', objectFit: 'cover', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      <CTABand title="Bring AI into your SOC — safely" text="See how Anomali Agentic AI augments your analysts, with humans in the loop at every step." secondary="Browse Resources" secondaryTo="/resources" />
    </>
  )
}
