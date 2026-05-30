import Breadcrumb from '../components/Breadcrumb.jsx'

const members = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'China', 'France', 'Germany', 'Hong Kong SAR', 'India',
  'Indonesia', 'Italy', 'Japan', 'Korea', 'Mexico', 'Netherlands', 'Russia', 'Saudi Arabia',
  'Singapore', 'South Africa', 'Spain', 'Switzerland', 'Turkey', 'United Kingdom', 'United States',
  'European Union',
]

export default function Organisation() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Organisation and Members' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Organisation and Members</h1>
          <p>The FSB brings together national authorities and international bodies to promote global financial stability.</p>
        </div>
      </div>
      <main className="page">
        <div className="container content">
          <h2>Member Jurisdictions</h2>
          <p>The FSB has 25 jurisdictions as members, each represented by senior officials from finance ministries, central banks, and supervisory authorities.</p>
          <ul style={{ columns: 3, columnGap: 24 }}>
            {members.map((m) => <li key={m}>{m}</li>)}
          </ul>
          <h2>International Bodies</h2>
          <p>FSB members also include international financial institutions and international standard-setting bodies, including the IMF, World Bank, BIS, OECD, BCBS, CPMI, IAIS, IASB, IOSCO, and CGFS.</p>
        </div>
      </main>
    </>
  )
}
