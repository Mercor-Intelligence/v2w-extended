import React, { useState } from 'react';
import '../styles/pages.css';

export default function BirthCoaching() {
  const [pkg, setPkg] = useState('signature');

  const packages = {
    starter: { title: 'Starter Session', price: 95, duration: '60 min', includes: ['One 60-minute virtual session','Personalized resource list','Email follow-up'] },
    signature: { title: 'Signature Package', price: 295, duration: '3 sessions', includes: ['Three 75-minute sessions','Custom birth plan workbook','24/7 email support','Phone check-ins'] },
    premium: { title: 'Premium Birth Prep', price: 495, duration: '5 sessions + birth call', includes: ['Five 75-minute sessions','Custom birth plan & worksheets','24/7 email & text support','On-call birth phone support','Postpartum debrief session'] },
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Coaching</p>
          <h1>Birth Coaching</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">1:1 birth coaching designed around your goals, fears, values and unique birth philosophy.</p>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <h2>What is Birth Coaching?</h2>
            <p>Birth coaching is a personalized, 1:1 alternative or supplement to group prenatal classes. We meet (virtually or in person) and work through everything you want to feel prepared for your birth — from understanding your options, to mindset work, to building a values-based birth plan.</p>
            <ul className="checked">
              <li>Personalized to your birth setting & care provider</li>
              <li>Address fears, anxieties and past birth experiences</li>
              <li>Build a flexible birth plan that reflects your values</li>
              <li>Partner involvement & support strategies</li>
              <li>Mindset & visualization tools</li>
            </ul>
          </div>
          <div>
            <img src="/assets/images/315c2cac45.jpg" alt="Birth coaching" style={{ borderRadius: 4, width: '100%' }} />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <p className="eyebrow">Pricing</p>
            <h2>Choose Your Package</h2>
            <hr className="divider" />
          </div>
          <div className="grid grid-3">
            {Object.entries(packages).map(([key, p]) => (
              <div
                className={`pkg-card ${pkg === key ? 'active' : ''}`}
                key={key}
                onClick={() => setPkg(key)}
              >
                <h4>{p.title}</h4>
                <div className="pkg-price">${p.price}</div>
                <p className="pkg-duration">{p.duration}</p>
                <ul>
                  {p.includes.map((it) => <li key={it}>{it}</li>)}
                </ul>
                <button className="btn btn-sm">Select</button>
              </div>
            ))}
          </div>
          <p className="text-center" style={{ marginTop: '1.5rem', color: 'var(--color-muted)' }}>
            Selected: <strong>{packages[pkg].title}</strong> — ${packages[pkg].price}
          </p>
        </div>
      </section>
    </>
  );
}
