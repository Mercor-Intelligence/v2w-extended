import React, { useState } from 'react';
import { team, faqs } from '../data/team.js';
import '../styles/pages.css';

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);
  const [consultOpen, setConsultOpen] = useState(false);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">About Us</p>
          <h1>Our Story & Mission</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">Supporting Waterloo Region families through education, doula care and community since 2014.</p>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <h2>Who We Are</h2>
            <p>Balancing Birth to Baby is a collective of certified doulas, childbirth educators and lactation counsellors based in Kitchener-Waterloo. We believe every family deserves continuous, judgement-free care through one of life's biggest transitions.</p>
            <p>Founded in 2014 by Sarah Bennett after her own transformative birth, we've grown into a small, dedicated team that has supported over 500 families through pregnancy, birth and postpartum.</p>
            <button className="btn" onClick={() => setConsultOpen(true)}>Book a Free Consultation</button>
          </div>
          <div>
            <img src="/assets/images/balancing-birth-baby-white.jpg" alt="Our team" style={{ background: 'var(--color-primary-dark)', padding: '2rem', borderRadius: 4 }} />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow">Our Services</p>
            <h2>How We Support You</h2>
            <hr className="divider" />
          </div>
          <div className="grid grid-3">
            <div className="info-tile">
              <h4>Childbirth Education</h4>
              <p>Weekend & weeknight prenatal classes, newborn care, breastfeeding basics, baby + me yoga and more.</p>
            </div>
            <div className="info-tile">
              <h4>Birth & Postpartum Doulas</h4>
              <p>Our signature shared-care model: continuous support from a small team you'll get to know before birth.</p>
            </div>
            <div className="info-tile">
              <h4>Birth Coaching & Resources</h4>
              <p>1:1 coaching, digital guides, rentals (TENS, Birth Boxes) and curated products to support your journey.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow">The Humans</p>
            <h2>Meet Our Team</h2>
            <hr className="divider" />
          </div>
          <div className="grid grid-2">
            {team.map((m) => (
              <div className="team-card" key={m.id}>
                <img src={m.image} alt={m.name} />
                <div className="team-info">
                  <h4>{m.name}</h4>
                  <p className="role">{m.role}</p>
                  <p className="creds">{m.credentials}</p>
                  <p>{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">FAQ</p>
            <h2>Doula Service FAQs</h2>
            <hr className="divider" />
          </div>
          <div className="faqs">
            {faqs.map((f, i) => (
              <div key={i} className={`faq ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}
                  <span>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <button className="btn btn-lg" onClick={() => setConsultOpen(true)}>Book a Free Consultation</button>
          </div>
        </div>
      </section>

      {consultOpen && (
        <div className="modal-overlay" onClick={() => setConsultOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setConsultOpen(false)}>×</button>
            <h3>Book a Free Consultation</h3>
            <p>Thanks for your interest! Our consultations are complimentary 30-minute calls or in-person meetings.</p>
            <p>Please email <a href="mailto:hello@balancingbirthtobaby.com">hello@balancingbirthtobaby.com</a> or call <strong>(519) 555-0142</strong> and we'll arrange a time that works for you.</p>
            <button className="btn" onClick={() => setConsultOpen(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
