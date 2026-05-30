import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'

const sections = [
  {
    title: 'Current consultations',
    description: 'Find out what the FSB currently consults on.',
    image: '/images/current-consultations-500x250.jpg',
    to: '/publications',
  },
  {
    title: 'Past consultations',
    description: 'Browse all public consultations the FSB has conducted.',
    image: '/images/past-consultations-image-500x250.jpg',
    to: '/publications',
  },
  {
    title: 'Responses to past consultations',
    description: 'Responses received to FSB consultations are available publicly.',
    image: '/images/past-consultations-responses-500x250.jpg',
    to: '/publications',
  },
]

export default function Consultations() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Consultations' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Consultations</h1>
          <p>
            The FSB issues consultations for all policy documents, ensuring its work benefits from
            input from stakeholders worldwide.
          </p>
        </div>
      </div>
      <main className="page">
        <div className="container">
          <div className="content">
            <h2>The transparent FSB consultation process</h2>
            <p>
              The FSB is committed to transparency throughout the development of its policy
              documents. Its consultation process follows three core steps designed to give
              stakeholders a meaningful opportunity to provide input.
            </p>
          </div>

          <div className="steps-row">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>60-day consultation</h3>
              <p>
                Public consultations generally last 60 days, providing time for stakeholders to
                consider and respond to proposed policy documents.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Responses published</h3>
              <p>
                Public responses are published on the FSB website within 15 days of the close of the
                consultation, unless commenters request confidentiality.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Overview reports</h3>
              <p>
                Overview reports describing how comments were considered are published when the
                final policy documents are approved.
              </p>
            </div>
          </div>

          <div className="work-grid" style={{ marginTop: 30 }}>
            {sections.map((s) => (
              <Link to={s.to} key={s.title} className="work-tile">
                <img src={s.image} alt="" />
                <div className="body">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
