import React, { useMemo, useState } from 'react';
import { calendarEvents, eventCategories } from '../data/classes.js';
import '../styles/pages.css';
import '../styles/calendar.css';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function startOfMonth(year, month) { return new Date(year, month, 1); }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }

export default function ClassCalendar() {
  const [view, setView] = useState('monthly');
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(0); // January
  const [category, setCategory] = useState('All Categories');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((e) => {
      const eDate = new Date(e.date);
      if (eDate.getFullYear() !== year || eDate.getMonth() !== month) return false;
      if (category !== 'All Categories' && e.category !== category) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [year, month, category, search]);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); } else setMonth(month + 1);
  };

  const prevMonthLabel = MONTH_NAMES[(month + 11) % 12].toUpperCase();
  const nextMonthLabel = MONTH_NAMES[(month + 1) % 12].toUpperCase();

  // Build calendar grid
  const first = startOfMonth(year, month);
  const startDay = first.getDay(); // 0 (Sun)
  const totalDays = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = filteredEvents.reduce((acc, e) => {
    const day = new Date(e.date).getDate();
    acc[day] = acc[day] || [];
    acc[day].push(e);
    return acc;
  }, {});

  // Weekly view: pick first week containing today or the 1st
  const weekEvents = view === 'weekly'
    ? filteredEvents.slice(0, 7)
    : [];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Classes & Events</p>
          <h1>Class Calendar</h1>
          <hr className="divider" style={{ marginLeft: 0 }} />
          <p className="lead">Browse all upcoming classes and events. Filter by category or search by name.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          {/* Filters */}
          <div className="cal-filters">
            <div className="cal-filter">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {eventCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="cal-filter">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="cal-filter">
              <label>Select Month</label>
              <div className="month-year">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MONTH_NAMES.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="cal-filter view-toggle-wrap">
              <label>View</label>
              <div className="view-toggle">
                <button className={view === 'monthly' ? 'active' : ''} onClick={() => setView('monthly')}>MONTHLY</button>
                <button className={view === 'weekly' ? 'active' : ''} onClick={() => setView('weekly')}>WEEKLY</button>
              </div>
            </div>
          </div>

          {/* Month nav */}
          <div className="cal-nav">
            <button onClick={prevMonth}>← {prevMonthLabel}</button>
            <h2>{MONTH_NAMES[month]} {year}</h2>
            <button onClick={nextMonth}>{nextMonthLabel} →</button>
          </div>

          {view === 'monthly' ? (
            <div className="cal-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                <div className="cal-head" key={d}>{d}</div>
              ))}
              {cells.map((d, i) => (
                <div className={`cal-cell ${d ? '' : 'empty'}`} key={i}>
                  {d && <div className="cal-day-num">{d}</div>}
                  {d && eventsByDay[d] && eventsByDay[d].map((e) => (
                    <button
                      key={e.id}
                      className={`cal-event cat-${e.category.toLowerCase()}`}
                      onClick={() => setSelectedEvent(e)}
                      title={e.title}
                    >
                      {e.time} {e.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="weekly-list">
              {weekEvents.length === 0 ? (
                <p className="text-center" style={{ color: 'var(--color-muted)' }}>No events match your filters this month.</p>
              ) : (
                weekEvents.map((e) => (
                  <div className="weekly-row" key={e.id} onClick={() => setSelectedEvent(e)}>
                    <div className="weekly-date">
                      <strong>{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                      <span>{e.time}</span>
                    </div>
                    <div className="weekly-info">
                      <h4>{e.title}</h4>
                      <span className={`tag cat-${e.category.toLowerCase()}`}>{e.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {filteredEvents.length === 0 && view === 'monthly' && (
            <p className="text-center" style={{ color: 'var(--color-muted)', marginTop: '1.5rem' }}>
              No events found for these filters. Try changing the month or category.
            </p>
          )}
        </div>
      </section>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            <span className="tag">{selectedEvent.category}</span>
            <h3>{selectedEvent.title}</h3>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p><strong>Time:</strong> {selectedEvent.time}</p>
            <p>Join us for this {selectedEvent.category.toLowerCase()} class. Space is limited — please register in advance.</p>
            <button className="btn" onClick={() => setSelectedEvent(null)}>Register</button>
          </div>
        </div>
      )}
    </>
  );
}
