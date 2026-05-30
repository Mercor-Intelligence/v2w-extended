import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { FIN_INNOVATION_SUB_AREAS } from '../data/mockData.js'

export default function FinancialInnovation() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Work of the FSB', to: '/work' },
          { label: 'Financial Innovation and Structural Change' },
        ]}
      />
      <div className="page-hero">
        <div className="container">
          <h1>Financial Innovation and Structural Change</h1>
          <p>
            The FSB considers financial stability issues arising from financial innovation and
            structural changes in financial markets.
          </p>
        </div>
      </div>
      <main className="page">
        <div className="container">
          <div className="content">
            <p>
              Work in this area covers a broad range of topics, including the assessment of
              vulnerabilities and policy responses related to climate-related financial risks,
              crypto-asset markets and activities, decentralised finance (DeFi), tokenisation, and
              the use of artificial intelligence in finance. The FSB collaborates closely with
              international standard-setting bodies and national authorities to ensure a coordinated
              global approach.
            </p>
          </div>
          <div className="work-grid">
            {FIN_INNOVATION_SUB_AREAS.map((w) => (
              <Link
                to={
                  w.slug === 'climate-related-risks'
                    ? '/work/financial-innovation/climate-related-risks'
                    : '/work/financial-innovation'
                }
                key={w.slug}
                className="work-tile"
              >
                <img src={w.image} alt="" />
                <div className="body">
                  <h3>{w.title}</h3>
                  <p>{w.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
