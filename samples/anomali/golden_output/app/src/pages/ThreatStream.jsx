import { Link } from 'react-router-dom'
import CTABand from '../components/CTABand.jsx'

const FEATURES = [
  { tag: 'CURATED', title: 'Curated Threat Intelligence', body: 'Premium, machine-readable intel from 200+ open and commercial sources — deduplicated, scored, and analyst-validated.' },
  { tag: 'ENRICHED', title: 'Operational Enrichment', body: 'Every observable is automatically enriched with actor, campaign, malware family and TTP context.' },
  { tag: 'PORTABLE', title: 'Threat Context That Travels', body: 'Push enriched intelligence directly into your SIEM, EDR, firewall and SOAR — at machine speed.' },
]

const CAPABILITIES = [
  { title: 'Intelligence Aggregation', body: 'Open-source, premium, ISAC, and internal feeds unified in one normalized graph.' },
  { title: 'Correlation & Campaign Analysis', body: 'Cluster indicators into actors and campaigns — see the adversary, not just the IOC.' },
  { title: 'Intelligence-Driven Investigation', body: 'Pivot from any IOC to actor TTPs, related campaigns, and impacted assets in one click.' },
  { title: 'Built for Automation & AI', body: 'Structured APIs and STIX/TAXII-native — every artifact is consumable by your agents and pipelines.' },
]

const STATS = [
  { num: '200+', lbl: 'Curated intelligence sources' },
  { num: '1.5B', lbl: 'Active observables tracked' },
  { num: '99.9%', lbl: 'IOC delivery SLA' },
  { num: '15min', lbl: 'Median time to operationalize' },
]

const VIDEOS = [
  { src: '68228a4fdbfec3b02c9c62e3_Anomali_ThreatStream_Explainer_Video.webp', title: 'ThreatStream Explainer', desc: 'A 3-minute tour of how curated intelligence drives detection and response.' },
  { src: '68228a4fdbfec3b02c9c628d_video-ti-intro.webp', title: 'Intro to Threat Intelligence', desc: 'Why operational intel is the missing layer in most modern SOCs.' },
  { src: '68228a4fdbfec3b02c9c6293_video-ti-sharing.webp', title: 'Intelligence Sharing', desc: 'Trusted circles, ISAC collaboration, and the future of community defense.' },
]

const USE_CASES = [
  { title: 'Threat-Informed Detection', body: 'Trigger high-fidelity detections from premium IOCs and adversary TTPs.' },
  { title: 'Threat Analysis', body: 'Cluster, score and prioritize threats relevant to your industry and geography.' },
  { title: 'Faster Investigations', body: 'One-click pivots from IOC to actor, campaign, and impacted assets.' },
  { title: 'Operational Intelligence Sharing', body: 'Trusted Circles let you collaborate with peers, ISACs and CERTs in real time.' },
]

export default function ThreatStream() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Layer 2 · Anomali ThreatStream Next-Gen</span>
          <h1>The world’s leading threat intelligence platform — now agentic.</h1>
          <p>Curated, correlated and operational threat intelligence that fuels every detection, investigation and response — across your entire security stack.</p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/resources" className="btn btn-primary">Schedule a Demo</Link>
            <Link to="/resources" className="btn btn-outline">Watch the Explainer</Link>
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
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
          <div className="section-head">
            <span className="eyebrow">Core capabilities</span>
            <h2 style={{ marginTop: 12 }}>Intelligence that drives the SOC, not just feeds it</h2>
            <p>ThreatStream Next-Gen turns raw intelligence into operational signal — ready to be consumed by humans, agents and automation alike.</p>
          </div>
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

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <h2>Built for the full intelligence lifecycle</h2>
            <p>From collection and curation to dissemination and feedback — ThreatStream covers every stage.</p>
          </div>
          <div className="grid grid-2">
            {CAPABILITIES.map(c => (
              <div className="card" key={c.title}>
                <h3>{c.title}</h3>
                <p style={{ marginTop: 10 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-gradient">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">See it in action</span>
            <h2 style={{ marginTop: 12 }}>Video demonstrations</h2>
          </div>
          <div className="grid grid-3">
            {VIDEOS.map(v => (
              <div className="video-card" key={v.src}>
                <div className="thumb"><img src={`/assets/images/${v.src}`} alt={v.title} /></div>
                <div className="play"><span>▶</span></div>
                <div className="meta">
                  <h4>{v.title}</h4>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-dark">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Use Cases</span>
            <h2 style={{ marginTop: 12 }}>Operational intelligence, end-to-end</h2>
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

      <CTABand title="Put intelligence in motion" text="See ThreatStream Next-Gen power detections in your environment." secondary="Browse Resources" secondaryTo="/resources" />
    </>
  )
}
