import React from 'react';
import { Link } from 'react-router-dom';
import { prenatalClasses, relatedClasses } from '../data/classes.js';
import { blogPosts } from '../data/blog.js';
import '../styles/home.css';

export default function Home() {
  const featuredPosts = blogPosts.slice(0, 3);
  const upcoming = prenatalClasses.slice(0, 3);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="container hero-content">
            <p className="eyebrow">Childbirth Education & Doula Services · Waterloo Region</p>
            <h1>Everything is about to change…<br/><em>And, we're here to help!</em></h1>
            <p className="lead">From your first ultrasound to your first weeks at home — supportive, evidence-based care from a team that truly gets it.</p>
            <div className="hero-cta">
              <Link to="/about" className="btn btn-lg">Learn More About Us</Link>
              <Link to="/doula/birth" className="btn btn-lg btn-outline">Book a Free Consultation</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section">
        <div className="container text-center" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Welcome</p>
          <h2>Support for every step of your journey</h2>
          <hr className="divider" />
          <p>
            We're a team of certified doulas and childbirth educators in Kitchener-Waterloo, offering classes,
            birth & postpartum support, coaching, and thoughtfully chosen products for new families.
          </p>
          <Link to="/about" className="btn">Learn More About Us</Link>
        </div>
      </section>

      {/* Services */}
      <section className="section section-alt">
        <div className="container">
          <div className="services-grid">
            <div className="service-card">
              <h3>CLASSES</h3>
              <hr className="divider" style={{ margin: '0.5rem 0 1rem 0' }}/>
              <p>Prenatal, breastfeeding, newborn care, baby + me yoga and more — taught by educators who love what they do.</p>
              <Link to="/classes/calendar" className="btn btn-sm">See Full Calendar</Link>
            </div>
            <div className="service-card">
              <h3>DOULA SERVICES</h3>
              <hr className="divider" style={{ margin: '0.5rem 0 1rem 0' }}/>
              <p>Continuous, shared-care birth & postpartum support from a small team you'll know and trust.</p>
              <Link to="/doula/birth" className="btn btn-sm">Learn More</Link>
            </div>
            <div className="service-card">
              <h3>COACHING</h3>
              <hr className="divider" style={{ margin: '0.5rem 0 1rem 0' }}/>
              <p>1:1 birth coaching tailored to your goals, fears and birth philosophy — virtual or in person.</p>
              <Link to="/birth-coaching" className="btn btn-sm">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Classes */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">Upcoming</p>
            <h2>Classes & Events</h2>
            <hr className="divider" />
          </div>
          <div className="upcoming-list">
            {upcoming.map((c) => (
              <div key={c.id} className="upcoming-row">
                <div className="upcoming-date">
                  <strong>{c.date.split(',')[0]}</strong>
                  <span>{c.time}</span>
                </div>
                <div className="upcoming-info">
                  <h4>{c.title}</h4>
                  <p>{c.location} · <span className="tag">{c.type}</span></p>
                </div>
                <Link to="/classes/prenatal" className="btn btn-sm">Register</Link>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/classes/calendar" className="btn">See Full Calendar</Link>
          </div>
        </div>
      </section>

      {/* Featured posts */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow">From The Blog</p>
            <h2>Recent Articles</h2>
            <hr className="divider" />
          </div>
          <div className="grid grid-3">
            {featuredPosts.map((p) => (
              <article key={p.id} className="post-card">
                <Link to={`/blog/${p.slug}`}><img src={p.image} alt={p.title} /></Link>
                <div className="post-card-body">
                  <span className="tag">{p.category}</span>
                  <h4><Link to={`/blog/${p.slug}`}>{p.title}</Link></h4>
                  <p className="post-meta">{p.author} · {p.date}</p>
                  <p>{p.excerpt}</p>
                  <Link to={`/blog/${p.slug}`} className="read-more">Read More →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Related classes */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">Explore</p>
            <h2>Other Classes You'll Love</h2>
            <hr className="divider" />
          </div>
          <div className="grid grid-4">
            {relatedClasses.map((c) => (
              <div className="class-card" key={c.id}>
                <img src={c.image} alt={c.title} />
                <div className="class-card-body">
                  <span className="tag">{c.category}</span>
                  <h4>{c.title}</h4>
                  <p>{c.description}</p>
                  <Link to="/classes/calendar" className="btn btn-sm">See Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTAs */}
      <section className="cta-band">
        <div className="container cta-grid">
          <div className="cta-tile" style={{ backgroundImage: 'url(/assets/images/315c2cac45.jpg)' }}>
            <div className="cta-tile-inner">
              <h3>Classes & Events</h3>
              <p>Hands-on learning to help you feel prepared, confident and supported.</p>
              <Link to="/classes/prenatal" className="btn">Learn How Our Classes & Events</Link>
            </div>
          </div>
          <div className="cta-tile" style={{ backgroundImage: 'url(/assets/images/14-300x300.jpg)' }}>
            <div className="cta-tile-inner">
              <h3>Doula Services</h3>
              <p>Continuous, judgement-free care for birth and the early postpartum days.</p>
              <Link to="/doula/birth" className="btn">Learn About Our Doula Services</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Award strip */}
      <section className="section-sm text-center">
        <div className="container">
          <img src="/assets/images/bbb-readers-choice-2022.jpg" alt="Readers' Choice 2022" style={{ maxWidth: 220, margin: '0 auto' }} />
          <p style={{ color: 'var(--color-muted)', marginTop: '0.6rem' }}>Proudly serving the Waterloo Region since 2014</p>
        </div>
      </section>
    </div>
  );
}
