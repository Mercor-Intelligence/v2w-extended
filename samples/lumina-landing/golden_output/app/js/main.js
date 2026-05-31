/* ============================================================
   Lumina landing - interaction layer.
   Header state, mobile drawer, count-up metrics, scroll reveals,
   feature-card pointer glow, sparkline rendering.

   Determinism / freeze: if the URL has ?frame=N (any value, even 0),
   the page renders its SETTLED state immediately:
     - counters jump to final values,
     - scroll-reveal elements are shown,
     - sparklines draw fully.
   Without the param, everything animates live.
   ============================================================ */

import { initHero } from "./hero-shader.js";

/* ---------- Freeze flag ---------- */
const params = new URLSearchParams(window.location.search);
const hasFrame = params.has("frame");
const frameValue = hasFrame ? parseInt(params.get("frame"), 10) || 0 : null;
const reduceMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FROZEN = hasFrame; // capture mode

/* ---------- Seeded PRNG (mulberry32) for any incidental randomness ---------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0x10c1a); // fixed seed -> deterministic

/* ---------- Hero WebGL ---------- */
const heroCanvas = document.getElementById("hero-canvas");
if (heroCanvas) {
  initHero(heroCanvas, { seed: 7.0, freezeFrame: FROZEN ? frameValue : null });
}

/* ---------- Header: shadow on scroll ---------- */
const header = document.querySelector(".site-header");
function syncHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}
syncHeader();
if (!FROZEN) window.addEventListener("scroll", syncHeader, { passive: true });

/* ---------- Mobile drawer ---------- */
const toggle = document.querySelector(".nav__toggle");
const drawer = document.getElementById("mobile-drawer");
function setDrawer(open) {
  if (!drawer || !toggle) return;
  drawer.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  drawer.setAttribute("aria-hidden", String(!open));
}
if (toggle && drawer) {
  toggle.addEventListener("click", () => {
    setDrawer(!drawer.classList.contains("is-open"));
  });
  drawer.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setDrawer(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setDrawer(false);
  });
}

/* ---------- Count-up metrics ---------- */
function formatNumber(value, decimals, sep) {
  const fixed = value.toFixed(decimals);
  if (!sep) return fixed;
  const [intPart, dec] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? grouped + "." + dec : grouped;
}

function runCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const sep = el.dataset.sep === "1";
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";

  function render(v) {
    el.firstChild
      ? (el.childNodes[0].nodeValue = prefix + formatNumber(v, decimals, sep) + suffix)
      : (el.textContent = prefix + formatNumber(v, decimals, sep) + suffix);
  }

  if (FROZEN || reduceMotion) {
    render(target);
    return;
  }

  const duration = 1600;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    // easeOutExpo
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    render(target * eased);
    if (t < 1) requestAnimationFrame(step);
    else render(target);
  }
  requestAnimationFrame(step);
}

/* ---------- Sparkline / chart rendering ---------- */
function buildPath(points, w, h, pad) {
  const n = points.length;
  if (n < 2) return "";
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  return points
    .map((v, i) => {
      const x = pad + (i / (n - 1)) * innerW;
      const y = pad + (1 - v) * innerH;
      return (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    })
    .join(" ");
}

function renderSpark(svg, points, opts) {
  const o = opts || {};
  const w = o.w || 320;
  const h = o.h || 120;
  const pad = o.pad != null ? o.pad : 6;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("preserveAspectRatio", "none");

  const line = buildPath(points, w, h, pad);
  const area = line + ` L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
  const gradId = "sg-" + Math.floor(rand() * 1e6);

  svg.innerHTML = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(67,245,164,0.40)"/>
        <stop offset="100%" stop-color="rgba(67,245,164,0)"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#${gradId})"></path>
    <path d="${line}" fill="none" stroke="#43f5a4" stroke-width="2"
          stroke-linejoin="round" stroke-linecap="round"
          vector-effect="non-scaling-stroke"></path>
  `;
}

/* ---------- Scroll reveals + counter triggers ---------- */
const counters = Array.from(document.querySelectorAll("[data-target]"));
const reveals = Array.from(document.querySelectorAll(".reveal"));

// Run the count-up animation at most once, whichever trigger fires first
// (metrics scrolled into view, or the no-scroll fallback below).
let countersStarted = false;
const startCounters = () => {
  if (countersStarted) return;
  countersStarted = true;
  counters.forEach(runCounter);
};

if (FROZEN || reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-visible"));
  startCounters();
} else {
  const revObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => revObserver.observe(el));

  const metricsBand = document.getElementById("metrics");
  if (metricsBand) {
    const mObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    mObserver.observe(metricsBand);
  } else {
    startCounters();
  }

  // Capture / no-scroll fallback: a full-page screenshot (and any viewer who does
  // not scroll) must still see every section. Shortly after load, reveal any
  // sections the scroll observer has not yet shown and run the counters so the
  // settled page is complete. The scroll-triggered entrance still plays earlier
  // when the user actually scrolls.
  window.setTimeout(() => {
    reveals.forEach((el) => el.classList.add("is-visible"));
    startCounters();
  }, 1200);
}

/* ---------- Feature card pointer glow ---------- */
if (!FROZEN) {
  document.querySelectorAll(".fcard").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

/* ---------- Load real dataset, draw charts ---------- */
async function loadCharts() {
  // Default deterministic series so charts render even if fetch fails.
  let points = [
    0.08, 0.12, 0.1, 0.18, 0.22, 0.19, 0.3, 0.34, 0.31, 0.42, 0.46, 0.43,
    0.55, 0.6, 0.57, 0.66, 0.72, 0.69, 0.81, 0.86, 0.83, 0.92, 0.97, 1.0,
  ];
  try {
    const res = await fetch("assets/data/throughput.json", { cache: "force-cache" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.points) && data.points.length > 1) {
        points = data.points;
      }
      const src = document.getElementById("chart-source");
      if (src && data.source) src.textContent = "Source: " + data.source;
    }
  } catch (err) {
    /* offline-safe: keep default series */
  }

  const heroSpark = document.getElementById("hero-spark");
  if (heroSpark) renderSpark(heroSpark, points.slice(-26), { w: 360, h: 78, pad: 4 });

  const bandChart = document.getElementById("band-chart");
  if (bandChart) renderSpark(bandChart, points, { w: 480, h: 120, pad: 8 });
}
loadCharts();

/* ---------- Year in footer ---------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = "2025"; // fixed for deterministic capture

/* ---------- Settle signal for screenshot harness ----------
   A capture harness should wait for window.__luminaReady === true before
   shooting. When ?frame=N is present the page is already in its settled
   state (counters at final values, reveals shown, hero frozen at frame N);
   we still defer two animation frames so layout + the first WebGL frame are
   committed before flagging ready. Mirrors the prism-shader convention. */
window.__luminaReady = false;
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    window.__luminaReady = true;
    document.documentElement.setAttribute("data-lumina-ready", "true");
  });
});
