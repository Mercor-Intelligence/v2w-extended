// panel.js
// Builds the floating control panel and binds it to the PrismScene. The panel
// is intentionally built from real, labeled, clickable controls so a GUI agent
// can drive it: named preset buttons, a wireframe toggle, and labeled sliders.

import { PRESETS } from './presets.js';

// Slider definitions: [controlKey, label, min, max, step, formatter]
const SLIDERS = [
  ['amplitude', 'Displacement', 0.0, 0.9, 0.01, (v) => v.toFixed(2)],
  ['frequency', 'Noise Frequency', 0.4, 2.6, 0.01, (v) => v.toFixed(2)],
  ['hue', 'Hue', 0.0, 1.0, 0.001, (v) => Math.round(v * 360) + '°'],
  ['iridescence', 'Iridescence', 0.0, 1.0, 0.01, (v) => v.toFixed(2)],
];

export function initPanel(app, params) {
  const valueEls = {};
  const sliderEls = {};

  // ---- preset buttons ----
  const presetWrap = document.getElementById('preset-buttons');
  const presetBtns = {};
  Object.keys(PRESETS).forEach((name) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.dataset.preset = name;
    btn.textContent = PRESETS[name].label;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      app.applyPreset(name);
      syncFromControls();
      setActivePreset(name);
    });
    presetWrap.appendChild(btn);
    presetBtns[name] = btn;
  });

  function setActivePreset(name) {
    Object.entries(presetBtns).forEach(([n, b]) => {
      const on = n === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const labelEl = document.getElementById('active-preset-label');
    if (labelEl) labelEl.textContent = PRESETS[name].label;
  }

  // ---- sliders ----
  const sliderWrap = document.getElementById('sliders');
  SLIDERS.forEach(([key, label, min, max, step, fmt]) => {
    const row = document.createElement('div');
    row.className = 'slider-row';

    const head = document.createElement('div');
    head.className = 'slider-head';
    const name = document.createElement('label');
    name.className = 'slider-label';
    name.textContent = label;
    name.htmlFor = 'slider-' + key;
    const val = document.createElement('span');
    val.className = 'slider-value';
    val.id = 'value-' + key;
    val.textContent = fmt(app.controls[key]);
    head.appendChild(name);
    head.appendChild(val);

    const input = document.createElement('input');
    input.type = 'range';
    input.id = 'slider-' + key;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(app.controls[key]);
    input.className = 'slider-input';
    input.setAttribute('aria-label', label);
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      app.setControl(key, v);
      val.textContent = fmt(v);
    });

    row.appendChild(head);
    row.appendChild(input);
    sliderWrap.appendChild(row);

    valueEls[key] = val;
    sliderEls[key] = input;
  });

  // ---- wireframe toggle ----
  const wireBtn = document.getElementById('wireframe-toggle');
  function setWireUI(on) {
    wireBtn.classList.toggle('active', on);
    wireBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    wireBtn.querySelector('.toggle-state').textContent = on ? 'On' : 'Off';
  }
  wireBtn.addEventListener('click', () => {
    const next = !app.wireframe;
    app.setWireframe(next);
    setWireUI(next);
  });

  // Reflect every slider/value from the current control set (after a preset).
  function syncFromControls() {
    SLIDERS.forEach(([key, , , , , fmt]) => {
      sliderEls[key].value = String(app.controls[key]);
      valueEls[key].textContent = fmt(app.controls[key]);
    });
  }

  // ---- initial UI state from params ----
  setWireUI(app.wireframe);
  setActivePreset(params.preset);
  syncFromControls();

  // ---- collapse / expand (keeps the panel out of the way on small screens) ----
  const collapseBtn = document.getElementById('panel-collapse');
  const panel = document.getElementById('control-panel');
  if (collapseBtn && panel) {
    collapseBtn.addEventListener('click', () => {
      const collapsed = panel.classList.toggle('collapsed');
      collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      collapseBtn.textContent = collapsed ? '+' : '–';
    });
  }
}
