/* ============================================================
   charts.js - deterministic, hand-rolled SVG charts.
   No animation, no randomness, no wall-clock. Given the same
   data the output markup is byte-identical, so screenshots are
   stable. Styling lives in styles.css; here we only emit shapes.
   ============================================================ */
(function (global) {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    const node = document.createElementNS(SVGNS, name);
    if (attrs) {
      for (const k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    return node;
  }

  function text(content, attrs) {
    const node = el("text", attrs);
    node.textContent = content;
    return node;
  }

  // "Nice" upper bound so the y-axis ends on a round number.
  function niceCeil(value) {
    if (value <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(value)));
    const n = value / pow;
    let nice;
    if (n <= 1) nice = 1;
    else if (n <= 2) nice = 2;
    else if (n <= 2.5) nice = 2.5;
    else if (n <= 5) nice = 5;
    else nice = 10;
    return nice * pow;
  }

  function fmtCompact(v) {
    const a = Math.abs(v);
    if (a >= 1000) return (v / 1000).toFixed(a >= 10000 ? 0 : 1) + "k";
    if (a >= 100) return v.toFixed(0);
    if (a >= 10) return v.toFixed(1);
    return v.toFixed(2);
  }

  /* ---------------- Line chart ---------------- */
  // points: [{year, value}], rendered as area + line + dots.
  function renderLine(container, points, opts) {
    opts = opts || {};
    container.innerHTML = "";
    const W = 720;
    const H = 320;
    const m = { top: 18, right: 26, bottom: 34, left: 52 };
    const innerW = W - m.left - m.right;
    const innerH = H - m.top - m.bottom;

    const svg = el("svg", {
      viewBox: "0 0 " + W + " " + H,
      role: "img",
      "aria-label": opts.ariaLabel || "Line chart",
      preserveAspectRatio: "xMidYMid meet",
    });

    // defs: area gradient
    const defs = el("defs");
    const grad = el("linearGradient", { id: "areaFill", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "#4ade80", "stop-opacity": "0.34" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#4ade80", "stop-opacity": "0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    if (!points.length) {
      svg.appendChild(text("No data", { x: W / 2, y: H / 2, "text-anchor": "middle", class: "axis-label" }));
      container.appendChild(svg);
      return;
    }

    const years = points.map((p) => p.year);
    const minYear = Math.min.apply(null, years);
    const maxYear = Math.max.apply(null, years);
    const maxVal = Math.max.apply(null, points.map((p) => p.value));
    const yMax = niceCeil(maxVal);

    const xFor = (year) =>
      m.left + (maxYear === minYear ? innerW / 2 : ((year - minYear) / (maxYear - minYear)) * innerW);
    const yFor = (val) => m.top + innerH - (val / yMax) * innerH;

    // y grid + labels (5 ticks)
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const val = (yMax / ticks) * i;
      const y = yFor(val);
      svg.appendChild(el("line", { class: "grid-line", x1: m.left, y1: y, x2: m.left + innerW, y2: y }));
      svg.appendChild(text(fmtCompact(val), { x: m.left - 10, y: y + 4, class: "axis-label y" }));
    }

    // x labels (first, mid, last and a couple between)
    const xTickYears = [];
    const span = maxYear - minYear;
    const stepCount = Math.min(6, span);
    for (let i = 0; i <= stepCount; i++) {
      const yr = Math.round(minYear + (span * i) / Math.max(1, stepCount));
      if (xTickYears.indexOf(yr) === -1) xTickYears.push(yr);
    }
    xTickYears.forEach((yr) => {
      svg.appendChild(text(String(yr), { x: xFor(yr), y: m.top + innerH + 22, class: "axis-label x" }));
    });

    // baseline axis
    svg.appendChild(el("line", { class: "axis-line", x1: m.left, y1: m.top + innerH, x2: m.left + innerW, y2: m.top + innerH }));

    // area path
    let d = "M " + xFor(points[0].year) + " " + yFor(points[0].value);
    for (let i = 1; i < points.length; i++) d += " L " + xFor(points[i].year) + " " + yFor(points[i].value);
    const lineD = d;
    const areaD = d + " L " + xFor(points[points.length - 1].year) + " " + (m.top + innerH) + " L " + xFor(points[0].year) + " " + (m.top + innerH) + " Z";
    svg.appendChild(el("path", { class: "series-area", d: areaD }));
    svg.appendChild(el("path", { class: "series-line", d: lineD }));

    // dots (last one emphasized + value label)
    points.forEach((p, i) => {
      const isLast = i === points.length - 1;
      svg.appendChild(el("circle", { class: isLast ? "series-dot-last" : "series-dot", cx: xFor(p.year), cy: yFor(p.value), r: isLast ? 4.5 : 3 }));
    });
    const lastP = points[points.length - 1];
    const lx = xFor(lastP.year);
    const ly = yFor(lastP.value);
    svg.appendChild(text(fmtCompact(lastP.value), {
      x: Math.min(lx, m.left + innerW - 4),
      y: Math.max(ly - 12, m.top + 12),
      class: "point-label",
      "text-anchor": "end",
    }));

    container.appendChild(svg);
  }

  /* ---------------- Bar chart (horizontal) ---------------- */
  // items: [{label, value, highlight}], sorted desc by caller.
  function renderBars(container, items, opts) {
    opts = opts || {};
    container.innerHTML = "";
    const W = 520;
    const rowH = 34;
    const gap = 10;
    const m = { top: 12, right: 64, bottom: 8, left: 132 };
    const innerW = W - m.left - m.right;
    const H = m.top + m.bottom + items.length * rowH + Math.max(0, items.length - 1) * (gap - 0) - (gap - 0);
    const totalH = m.top + m.bottom + items.length * (rowH + gap);

    const svg = el("svg", {
      viewBox: "0 0 " + W + " " + totalH,
      role: "img",
      "aria-label": opts.ariaLabel || "Bar chart",
      preserveAspectRatio: "xMidYMid meet",
    });

    const defs = el("defs");
    const bg = el("linearGradient", { id: "barFill", x1: "0", y1: "0", x2: "1", y2: "0" });
    bg.appendChild(el("stop", { offset: "0%", "stop-color": "#1d4ed8", "stop-opacity": "0.55" }));
    bg.appendChild(el("stop", { offset: "100%", "stop-color": "#38bdf8", "stop-opacity": "0.95" }));
    defs.appendChild(bg);
    const bh = el("linearGradient", { id: "barFillHi", x1: "0", y1: "0", x2: "1", y2: "0" });
    bh.appendChild(el("stop", { offset: "0%", "stop-color": "#15803d", "stop-opacity": "0.6" }));
    bh.appendChild(el("stop", { offset: "100%", "stop-color": "#4ade80", "stop-opacity": "1" }));
    defs.appendChild(bh);
    svg.appendChild(defs);

    if (!items.length) {
      svg.appendChild(text("No data", { x: W / 2, y: 40, "text-anchor": "middle", class: "axis-label" }));
      container.appendChild(svg);
      return;
    }

    const maxVal = Math.max.apply(null, items.map((d) => d.value));
    const scale = maxVal > 0 ? innerW / maxVal : 0;

    items.forEach((d, i) => {
      const y = m.top + i * (rowH + gap);
      const w = Math.max(2, d.value * scale);
      // label
      svg.appendChild(text(d.label, { x: m.left - 12, y: y + rowH / 2 + 4, class: "bar-label", "text-anchor": "end" }));
      // track
      svg.appendChild(el("rect", { x: m.left, y: y, width: innerW, height: rowH, rx: 7, fill: "#0e1830" }));
      // bar
      svg.appendChild(el("rect", {
        class: "bar-rect" + (d.highlight ? " is-highlight" : ""),
        x: m.left,
        y: y,
        width: w,
        height: rowH,
        rx: 7,
      }));
      // value
      svg.appendChild(text(fmtCompact(d.value), { x: m.left + innerW + 56, y: y + rowH / 2 + 4, class: "bar-value" }));
    });

    container.appendChild(svg);
  }

  global.MeridianCharts = { renderLine: renderLine, renderBars: renderBars };
})(window);
