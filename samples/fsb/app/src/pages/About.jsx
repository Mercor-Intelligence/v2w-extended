import Breadcrumb from '../components/Breadcrumb.jsx'

export default function About() {
  return (
    <>
      <Breadcrumb items={[{ label: 'About the FSB' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>About the FSB</h1>
          <p>
            The Financial Stability Board (FSB) is an international body that monitors and makes
            recommendations about the global financial system.
          </p>
        </div>
      </div>
      <main className="page">
        <div className="container content">
          <h2>Mandate and Mission</h2>
          <p>
            The FSB promotes international financial stability by coordinating national financial
            authorities and international standard-setting bodies as they work toward developing
            strong regulatory, supervisory and other financial sector policies. It fosters a level
            playing field by encouraging coherent implementation of these policies across sectors
            and jurisdictions.
          </p>
          <p>
            The FSB, working through its members, seeks to strengthen financial systems and increase
            the stability of international financial markets. The policies developed in the pursuit
            of this agenda are implemented by jurisdictions and national authorities.
          </p>

          <div className="info-card">
            <h3>The Mandate of the FSB</h3>
            <p>As set out in its Charter, the FSB:</p>
            <ul>
              <li>Assesses vulnerabilities affecting the global financial system and identifies and reviews regulatory, supervisory and related actions needed to address them.</li>
              <li>Promotes coordination and information exchange among authorities responsible for financial stability.</li>
              <li>Monitors and advises on market developments and their implications for regulatory policy.</li>
              <li>Advises on and monitors best practice in meeting regulatory standards.</li>
              <li>Undertakes joint strategic reviews of the international standard-setting bodies.</li>
              <li>Sets guidelines for, and supports the establishment of, supervisory colleges.</li>
              <li>Supports contingency planning for cross-border crisis management, particularly with respect to systemically important firms.</li>
              <li>Collaborates with the IMF to conduct Early Warning Exercises.</li>
              <li>Promotes member jurisdictions’ implementation of agreed commitments, standards and policy recommendations.</li>
            </ul>
          </div>

          <h2>Organisational Framework</h2>
          <p>
            The FSB operates through its Plenary, Steering Committee, and three Standing Committees.
            The Plenary is the decision-making body of the FSB and includes representatives of all
            FSB members.
          </p>

          <h3>Plenary</h3>
          <p>
            The Plenary takes all decisions of the FSB. It approves the FSB Work Programme,
            including its strategic direction, and the reports issued by the FSB. Members of the
            Plenary include senior officials from national authorities — finance ministries, central
            banks, and supervisory authorities — of 25 jurisdictions, plus international financial
            institutions and standard-setting bodies.
          </p>

          <h3>Steering Committee</h3>
          <p>
            The Steering Committee provides operational guidance between Plenary meetings to carry
            forward the directions of the FSB. Among its tasks are monitoring and guidance of the
            Standing Committees and reviewing strategic policy issues facing the FSB.
          </p>

          <h3>Standing Committees</h3>
          <p>The FSB conducts much of its work through three Standing Committees:</p>
          <ul>
            <li>
              <strong>Standing Committee on Assessment of Vulnerabilities (SCAV)</strong> — the
              FSB’s mechanism for identifying and assessing risks to global financial stability.
            </li>
            <li>
              <strong>Standing Committee on Supervisory and Regulatory Cooperation (SRC)</strong> —
              addresses coordination issues that arise among supervisors and regulators.
            </li>
            <li>
              <strong>Standing Committee on Standards Implementation (SCSI)</strong> — promotes
              FSB member implementation of agreed international standards.
            </li>
          </ul>

          <h2>History</h2>
          <p>
            The FSB was established in April 2009 as the successor to the Financial Stability Forum
            (FSF), which had been founded in 1999 by the G7 Finance Ministers and Central Bank
            Governors. The FSB Charter, agreed in 2009 and amended in 2012, sets out the FSB’s
            mandate, structure and processes. The FSB is hosted and funded by the Bank for
            International Settlements (BIS) in Basel, Switzerland.
          </p>
        </div>
      </main>
    </>
  )
}
