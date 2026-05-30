import Breadcrumb from '../components/Breadcrumb.jsx'

const items = [
  { title: 'Press conference: FSB Plenary, November 2025', date: '24 Nov 2025', image: '/images/plenary-meeting-nov-2025-carousel-768x256.jpg' },
  { title: 'Speech by FSB Secretary General: Global Economy & Financial Stability', date: '12 Nov 2025', image: '/images/John-Schindler-GEFS-speech-callout-500x250.jpg' },
  { title: 'FSB Chair’s remarks at the G20 Finance Ministers meeting', date: '18 Oct 2025', image: '/images/kk-gsw-500x250.jpg' },
]

export default function VideoAudio() {
  return (
    <>
      <Breadcrumb items={[{ label: 'Video and Audio' }]} />
      <div className="page-hero">
        <div className="container">
          <h1>Video and Audio</h1>
          <p>Speeches, press conferences and multimedia resources from the FSB.</p>
        </div>
      </div>
      <main className="page">
        <div className="container">
          <div className="work-grid">
            {items.map((it) => (
              <a href="#play" className="work-tile" key={it.title}>
                <img src={it.image} alt="" />
                <div className="body">
                  <h3>{it.title}</h3>
                  <p>{it.date}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
