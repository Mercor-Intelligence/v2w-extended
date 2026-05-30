import { Link } from 'react-router-dom'

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Anomali Agentic SOC Platform', to: '/products/agentic-soc-platform' },
      { label: 'Anomali Unified Security Data Lake', to: '/products/unified-security-data-lake' },
      { label: 'Anomali ThreatStream Next-Gen', to: '/products/threatstream' },
      { label: 'Anomali Agentic AI', to: '/products/agentic-ai' },
    ],
  },
  {
    title: 'Capabilities',
    links: [
      { label: 'Threat Detection', to: '/use-cases' },
      { label: 'Threat Hunting', to: '/use-cases' },
      { label: 'Investigations', to: '/use-cases' },
      { label: 'Threat Intelligence Sharing', to: '/use-cases' },
      { label: 'Compliance & Forensics', to: '/use-cases' },
    ],
  },
  {
    title: 'Partners',
    links: [
      { label: 'Partner Program', to: '/partners' },
      { label: 'Marketplace', to: '/marketplace' },
      { label: 'Integrations', to: '/marketplace' },
      { label: 'Become a Partner', to: '/partners' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Leadership', to: '/company' },
      { label: 'Customers', to: '/company' },
      { label: 'Careers', to: '/company' },
      { label: 'Press Room', to: '/company' },
      { label: 'Resource Center', to: '/resources' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/images/68228a4fdbfec3b02c9c565b_Anomali-Logo-White-2024-1200-p-500.webp" alt="Anomali" />
            <p>The Agentic SOC Platform unifying security telemetry, threat intelligence and AI automation for the modern SOC.</p>
            <Link className="btn btn-primary" to="/products">Talk to Sales</Link>
            <div style={{ marginTop: 18, fontSize: 13, color: 'var(--text-dim)' }}>
              <div>808 Winslow St, Redwood City, CA 94063</div>
              <div>+1 (844) 484-7328 · sales@anomali.com</div>
            </div>
          </div>
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map(link => (
                  <li key={link.label}><Link to={link.to}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Anomali, Inc. All rights reserved.</span>
          <span>Privacy Policy · Terms of Use · Cookie Settings</span>
        </div>
      </div>
    </footer>
  )
}
