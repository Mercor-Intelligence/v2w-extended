import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { prenatalClasses, relatedClasses } from '../data/classes.js';
import '../styles/pages.css';

export default function PrenatalClasses() {
  const [registered, setRegistered] = useState({});

  const register = (id) => {
    setRegistered((r) => ({ ...r, [id]: true }));
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Classes & Events</p>
          <h1>Prenatal Classes</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">Comprehensive prenatal education for expecting families — choose the format that works best for you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <h2>Weekend Prenatal Classes</h2>
            <p>Our weekend prenatal class is designed for couples with busy weekday schedules. Over two intensive days, we cover everything from late pregnancy and the stages of labour to coping techniques, medical interventions, postpartum recovery, breastfeeding and newborn care.</p>
            <ul className="checked">
              <li>Stages of labour & birth</li>
              <li>Comfort measures & pain management</li>
              <li>Medical interventions & informed consent</li>
              <li>Partner support roles</li>
              <li>Postpartum recovery & early days</li>
              <li>Breastfeeding & newborn care basics</li>
            </ul>
          </div>
          <div>
            <h2>Weeknight Prenatal Series</h2>
            <p>The weeknight series spans four consecutive weeks, giving you time to absorb material and practice between sessions. Each evening builds on the last, with plenty of time for questions and partner practice.</p>
            <ul className="checked">
              <li>Week 1: Late pregnancy & preparing for birth</li>
              <li>Week 2: Stages of labour & coping</li>
              <li>Week 3: Variations, interventions & cesarean</li>
              <li>Week 4: Postpartum, breastfeeding & newborn care</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="text-center">Upcoming Prenatal Classes</h2>
          <hr className="divider" />
          <div className="class-table">
            {prenatalClasses.map((c) => (
              <div key={c.id} className="class-row">
                <div className="col-date">
                  <strong>{c.date}</strong>
                  <span>{c.time}</span>
                </div>
                <div className="col-info">
                  <h4>{c.title}</h4>
                  <p>{c.location}</p>
                  <p><span className="tag">{c.type}</span> · {c.spots} spots remaining</p>
                </div>
                <div className="col-action">
                  {registered[c.id] ? (
                    <span className="success-pill">✓ Registered</span>
                  ) : (
                    <button className="btn btn-sm" onClick={() => register(c.id)}>Register</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/classes/calendar" className="btn">See Full Calendar</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="text-center">Other Related Classes</h2>
          <hr className="divider" />
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
          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <Link to="/classes/calendar" className="btn">See Full Calendar</Link>
          </div>
        </div>
      </section>
    </>
  );
}
