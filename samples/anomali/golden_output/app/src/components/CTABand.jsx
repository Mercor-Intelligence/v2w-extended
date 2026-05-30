import { Link } from 'react-router-dom'

export default function CTABand({ title = 'Ready to defend at machine speed?', text = 'See how the Anomali Agentic SOC Platform unifies your security data, threat intelligence, and AI workflows.', primary = 'Schedule a Demo', primaryTo = '/products', secondary, secondaryTo = '/resources' }) {
  return (
    <div className="container">
      <div className="cta-band">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to={primaryTo} className="btn btn-primary">{primary}</Link>
          {secondary && <Link to={secondaryTo} className="btn btn-outline">{secondary}</Link>}
        </div>
      </div>
    </div>
  )
}
