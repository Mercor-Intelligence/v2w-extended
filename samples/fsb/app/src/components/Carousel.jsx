import { useEffect, useState, useRef } from 'react'

export default function Carousel({ slides }) {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)
  const paused = useRef(false)

  const total = slides.length

  useEffect(() => {
    if (paused.current) return
    timerRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % total)
    }, 6000)
    return () => clearTimeout(timerRef.current)
  }, [active, total])

  const go = (idx) => setActive(((idx % total) + total) % total)
  const prev = () => go(active - 1)
  const next = () => go(active + 1)

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Featured news"
      onMouseEnter={() => { paused.current = true; clearTimeout(timerRef.current) }}
      onMouseLeave={() => { paused.current = false; setActive((p) => p) }}
    >
      {slides.map((s, i) => (
        <div
          key={i}
          className={`carousel-slide ${i === active ? 'active' : ''}`}
          style={{ backgroundImage: `url(${s.image})` }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${total}`}
          aria-hidden={i !== active}
        />
      ))}

      <button className="carousel-arrow prev" onClick={prev} aria-label="Previous slide">‹</button>
      <button className="carousel-arrow next" onClick={next} aria-label="Next slide">›</button>

      <div className="carousel-caption" aria-live="polite">
        <div className="container">
          <span className="tag">{slides[active].tag}</span>
          <h2>{slides[active].title}</h2>
          <p>{slides[active].description}</p>
          <a className="btn-readmore" href="#read">Read more</a>
        </div>
      </div>

      <div className="carousel-dots" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`Go to slide ${i + 1}`}
            className={i === active ? 'active' : ''}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  )
}
