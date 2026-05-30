import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, blogCategories } from '../data/blog.js';
import { prenatalClasses } from '../data/classes.js';
import '../styles/pages.css';
import '../styles/blog.css';

const PER_PAGE = 3;

export default function Blog() {
  const [activeCat, setActiveCat] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return activeCat ? blogPosts.filter((p) => p.category === activeCat) : blogPosts;
  }, [activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const recent = blogPosts.slice(0, 4);
  const upcoming = prenatalClasses.slice(0, 3);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Resources</p>
          <h1>The Blog</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">Evidence-based articles on pregnancy, birth, postpartum and the early years.</p>
        </div>
      </section>

      <section className="section">
        <div className="container blog-layout">
          <main className="blog-main">
            {paged.length === 0 ? (
              <p>No posts in this category yet.</p>
            ) : (
              paged.map((p) => (
                <article className="blog-post" key={p.id}>
                  <Link to={`/blog/${p.slug}`}><img src={p.image} alt={p.title} /></Link>
                  <div className="blog-post-body">
                    <span className="tag">{p.category}</span>
                    <h2><Link to={`/blog/${p.slug}`}>{p.title}</Link></h2>
                    <p className="post-meta">By {p.author} · {p.date}</p>
                    <p>{p.excerpt}</p>
                    <Link to={`/blog/${p.slug}`} className="read-more">Read more →</Link>
                  </div>
                </article>
              ))
            )}

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              {page < totalPages && (
                <button onClick={() => setPage(page + 1)}>→</button>
              )}
            </div>
          </main>

          <aside className="blog-sidebar">
            <div className="widget">
              <h4>Categories</h4>
              <ul className="cat-list">
                <li>
                  <button
                    className={!activeCat ? 'active' : ''}
                    onClick={() => { setActiveCat(null); setPage(1); }}
                  >All</button>
                </li>
                {blogCategories.map((c) => (
                  <li key={c}>
                    <button
                      className={activeCat === c ? 'active' : ''}
                      onClick={() => { setActiveCat(c); setPage(1); }}
                    >{c}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="widget">
              <h4>Recent Posts</h4>
              <ul className="recent-list">
                {recent.map((p) => (
                  <li key={p.id}>
                    <Link to={`/blog/${p.slug}`}>
                      <img src={p.image} alt={p.title} />
                      <div>
                        <span>{p.title}</span>
                        <em>{p.date}</em>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="widget">
              <h4>Upcoming Classes</h4>
              <ul className="upcoming-side">
                {upcoming.map((c) => (
                  <li key={c.id}>
                    <strong>{c.title}</strong>
                    <em>{c.date}</em>
                    <Link to="/classes/prenatal">Register →</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
