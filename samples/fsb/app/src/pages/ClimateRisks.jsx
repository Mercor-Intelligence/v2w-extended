import Breadcrumb from '../components/Breadcrumb.jsx'
import Collapsible from '../components/Collapsible.jsx'

export default function ClimateRisks() {
  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Work of the FSB', to: '/work' },
          { label: 'Financial Innovation and Structural Change', to: '/work/financial-innovation' },
          { label: 'Climate-related Risks' },
        ]}
      />
      <div className="page-hero">
        <div className="container">
          <h1>Climate-related Risks</h1>
          <p>
            The FSB is coordinating internationally the work to address climate-related financial
            risks.
          </p>
        </div>
      </div>
      <main className="page">
        <div className="container">
          <div className="content">
            <p>
              The FSB published a comprehensive Roadmap for addressing climate-related financial
              risks. The Roadmap brings together the climate-related work of standard-setting bodies
              and other international organisations across four interrelated blocks: firm-level
              disclosures, data, vulnerability analysis, and regulatory and supervisory practices.
            </p>

            <Collapsible title="Disclosures" defaultOpen>
              <p>
                The FSB has been working with the International Sustainability Standards Board
                (ISSB) and other bodies to promote consistent, comparable and reliable climate-
                related disclosures by financial and non-financial firms. The ISSB’s IFRS S2
                standard builds on the recommendations of the Task Force on Climate-related
                Financial Disclosures (TCFD) and is now the global baseline for climate-related
                disclosures.
              </p>
              <p>
                The FSB encourages jurisdictions to use the ISSB standards as a baseline in their
                regulatory disclosure frameworks and to consider interoperability with other
                sustainability disclosure regimes.
              </p>
            </Collapsible>

            <Collapsible title="Data">
              <p>
                Reliable, consistent and comparable climate-related data are essential for monitoring
                and managing climate-related financial risks. The FSB and NGFS have published joint
                reports on climate-related data gaps and recommendations to address them, focused on
                improving the availability and reliability of data on physical and transition risks.
              </p>
            </Collapsible>

            <Collapsible title="Vulnerability Analysis">
              <p>
                The FSB has been assessing climate-related vulnerabilities in the financial system,
                including through stocktakes of jurisdictional initiatives and analytical work on
                the potential channels of climate-related risks. Cross-border and cross-sectoral
                aspects are a particular focus of the FSB’s analytical work.
              </p>
            </Collapsible>

            <Collapsible title="Regulatory and supervisory practices and tools">
              <p>
                The FSB works with the standard-setting bodies to develop regulatory and supervisory
                practices that effectively address climate-related risks across the financial
                sector, including banking, insurance and asset management. This work covers
                supervisory expectations, risk management, scenario analysis and stress testing.
              </p>
            </Collapsible>

            <h2>Roadmap</h2>
            <div className="roadmap-box">
              <img
                src="/images/climate-roadmap-1024x481.jpg"
                alt="FSB Roadmap for addressing climate-related financial risks"
              />
            </div>

            <h2>Key Documents</h2>
            <div className="key-docs">
              <a href="#doc1" className="key-doc">
                <img src="/images/climate-related-disclosures-300x189.jpg" alt="" />
                <div>
                  <h4>Climate-related disclosures: 2024 progress report</h4>
                  <p>16 July 2024 · Report</p>
                </div>
              </a>
              <a href="#doc2" className="key-doc">
                <img src="/images/climate-related-data-gaps-300x177.jpg" alt="" />
                <div>
                  <h4>Climate-related data gaps: progress report</h4>
                  <p>12 December 2023 · Report</p>
                </div>
              </a>
              <a href="#doc3" className="key-doc">
                <img src="/images/p230125-pdf1-212x300.jpg" alt="" />
                <div>
                  <h4>FSB Roadmap for addressing climate-related financial risks</h4>
                  <p>7 July 2021 · Report</p>
                </div>
              </a>
              <a href="#doc4" className="key-doc">
                <img src="/images/Crypto-assets-300x198.jpg" alt="" />
                <div>
                  <h4>2023 TCFD Status Report</h4>
                  <p>12 October 2023 · TCFD Report</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
