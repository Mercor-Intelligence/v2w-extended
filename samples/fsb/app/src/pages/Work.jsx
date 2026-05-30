import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { WORK_AREAS } from '../data/mockData.js'

export default function Work() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Work of the FSB' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Work of the FSB</h1>
          <p>
            The FSB’s work covers a broad range of areas to promote global financial stability,
            organised around the assessment of vulnerabilities and policy responses across sectors.
          </p>
        </div>
      </div>
      <main className="page">
        <div className="container">
          <div className="work-grid">
            {WORK_AREAS.map((w) => (
              <Link
                to={
                  w.slug === 'financial-innovation'
                    ? '/work/financial-innovation'
                    : '/work'
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
