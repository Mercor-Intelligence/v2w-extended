import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/blog.js';
import '../styles/pages.css';
import '../styles/blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) {
    return (
      <div className="container section text-center">
        <h2>Post not found</h2>
        <Link to="/blog" className="btn">← Back to Blog</Link>
      </div>
    );
  }
  const related = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <article className="single-post">
        <div className="container" style={{ maxWidth: 800 }}>
          <Link to="/blog" className="back-link">← All posts</Link>
          <span className="tag">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="post-meta">By {post.author} · {post.date}</p>
          <img src={post.image} alt={post.title} className="post-hero-img" />
          <div className="post-content">
            {post.content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </div>
      </article>
      <section className="section section-alt">
        <div className="container">
          <h3 className="text-center">You might also like</h3>
          <hr className="divider" />
          <div className="grid grid-3">
            {related.map((p) => (
              <article key={p.id} className="post-card">
                <Link to={`/blog/${p.slug}`}><img src={p.image} alt={p.title} /></Link>
                <div className="post-card-body">
                  <span className="tag">{p.category}</span>
                  <h4><Link to={`/blog/${p.slug}`}>{p.title}</Link></h4>
                  <p className="post-meta">{p.author} · {p.date}</p>
                  <Link to={`/blog/${p.slug}`} className="read-more">Read more →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
