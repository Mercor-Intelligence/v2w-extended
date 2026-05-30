import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import {
  carouselSlides,
  homeNews,
  featuredReports,
  homeCallouts,
} from '../data/mockData.js'

export default function Home() {
  return (
    <>
      <Breadcrumb items={[]} />
      <Carousel slides={carouselSlides} />

      <main className="page">
        <div className="container">
          <div className="home-grid">
            <div>
              <div className="section-title">
                <h2>Latest News</h2>
                <Link to="/press" className="more">View all →</Link>
              </div>

              <div className="news-list">
                {homeNews.map((n, i) => (
                  <article className="news-item" key={i}>
                    <img src={n.image} alt="" />
                    <div>
                      <div className="meta">
                        {n.date} · {n.category}
                      </div>
                      <h3>
                        <Link to="/press">{n.title}</Link>
                      </h3>
                      <p>{n.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside>
              <div className="section-title">
                <h2>Featured Reports</h2>
              </div>
              {featuredReports.map((r, i) => (
                <div className="featured-report" key={i}>
                  <img src={r.image} alt="" />
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                  <Link to="/publications" className="cta">{r.cta} →</Link>
                </div>
              ))}
            </aside>
          </div>

          <div className="home-callouts">
            {homeCallouts.map((c, i) => (
              <Link to={c.to} key={i} className="callout">
                <img src={c.image} alt="" />
                <div className="overlay">
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
