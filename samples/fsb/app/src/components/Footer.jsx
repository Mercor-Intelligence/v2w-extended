import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>About the FSB</h4>
            <ul>
              <li><Link to="/about">Mandate & Mission</Link></li>
              <li><Link to="/organisation">Organisation & Members</Link></li>
              <li><Link to="/about">History</Link></li>
              <li><Link to="/about">Charter</Link></li>
            </ul>
          </div>
          <div>
            <h4>Work of the FSB</h4>
            <ul>
              <li><Link to="/work">Policy Areas</Link></li>
              <li><Link to="/work/financial-innovation">Financial Innovation</Link></li>
              <li><Link to="/work/financial-innovation/climate-related-risks">Climate-related Risks</Link></li>
              <li><Link to="/work">Annual Work Programme</Link></li>
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              <li><Link to="/publications">Publications</Link></li>
              <li><Link to="/press">Press</Link></li>
              <li><Link to="/consultations">Consultations</Link></li>
              <li><Link to="/data">Data</Link></li>
              <li><Link to="/video-audio">Video & Audio</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Centralbahnplatz 2</li>
              <li>4002 Basel, Switzerland</li>
              <li>Tel: +41 61 280 8000</li>
              <li><a href="mailto:fsb@fsb.org">fsb@fsb.org</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Financial Stability Board. All rights reserved.</span>
          <span>
            <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a> · <a href="#cookies">Cookies</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
