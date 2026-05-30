import React, { useState } from 'react';
import { team, faqs } from '../data/team.js';
import '../styles/pages.css';

function ConsultationModal({ open, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', dueDate: '', message: '' });
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <button className="modal-close" onClick={onClose}>×</button>
        {submitted ? (
          <div className="text-center" style={{ padding: '1rem 0' }}>
            <h3>Thank you, {form.name || 'friend'}!</h3>
            <p>We'll be in touch within 24 hours to schedule your free consultation.</p>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h3>Book a Free Consultation</h3>
            <p style={{ color: 'var(--color-muted)' }}>30 minutes, complimentary, no obligation.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <label>Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label>Phone<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label>Due date<input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
              <label>Tell us a bit about you<textarea rows="3" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}></textarea></label>
              <button className="btn" style={{ width: '100%', marginTop: '0.6rem' }}>Request Consultation</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function BirthDoula() {
  const [openConsult, setOpenConsult] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Doula Services</p>
          <h1>Birth Doula Services</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">Continuous, judgement-free birth support from a small team of experienced doulas.</p>
          <button className="btn btn-lg" onClick={() => setOpenConsult(true)}>Book a Free Consultation</button>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <h2>What is a Birth Doula?</h2>
            <p>A birth doula is a trained professional who provides continuous physical, emotional and informational support to a labouring person and their partner before, during and shortly after birth. We don't replace your medical team — we complement it.</p>
            <p>Research shows that continuous labour support is associated with shorter labours, fewer interventions, higher satisfaction, and better outcomes for both parent and baby.</p>
            <ul className="checked">
              <li>Comfort measures & pain coping techniques</li>
              <li>Birth education & informed decision-making</li>
              <li>Emotional & physical support during labour</li>
              <li>Partner coaching & encouragement</li>
              <li>Immediate postpartum & breastfeeding support</li>
            </ul>
          </div>
          <div>
            <img src="/assets/images/14-300x300.jpg" alt="Doula support" style={{ borderRadius: 4, width: '100%' }} />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow">Our Model</p>
            <h2>The Shared-Care Team Approach</h2>
            <hr className="divider" />
            <p style={{ maxWidth: 720, margin: '0 auto' }}>You don't get just one doula — you get a small team of two or three. This means continuous, well-rested support no matter when or how long your labour takes, and the peace of mind of knowing every possible attendee.</p>
          </div>
          <div className="grid grid-3">
            <div className="info-tile">
              <div className="info-num">1</div>
              <h4>Meet The Team</h4>
              <p>You'll have prenatal visits with each doula on your team so there are no strangers at your birth.</p>
            </div>
            <div className="info-tile">
              <div className="info-num">2</div>
              <h4>24/7 On-Call</h4>
              <p>Whenever labour starts, a primary or backup doula will be by your side — no exceptions.</p>
            </div>
            <div className="info-tile">
              <div className="info-num">3</div>
              <h4>Postpartum Visit</h4>
              <p>We follow up after birth with a home visit to debrief, support breastfeeding & answer questions.</p>
            </div>
          </div>
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <button className="btn" onClick={() => setOpenConsult(true)}>Book a Free Consultation</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow">Your Doulas</p>
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
            <p className="eyebrow">Common Questions</p>
            <h2>FAQs</h2>
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
            <button className="btn btn-lg" onClick={() => setOpenConsult(true)}>Book a Free Consultation</button>
          </div>
        </div>
      </section>

      <ConsultationModal open={openConsult} onClose={() => setOpenConsult(false)} />
    </>
  );
}
