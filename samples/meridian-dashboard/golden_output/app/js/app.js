/* ============================================================
   app.js - view state, global controls, KPI cards, table.
   Default load state is fixed (Overview, All regions, year 2023,
   Total metric, United States series) so screenshots are stable.
   ============================================================ */
(function () {
  "use strict";

  const DATA_URL = "data/co2-emissions.json";

  // Fixed defaults -> deterministic first paint.
  const DEFAULTS = {
    view: "overview",
    region: "All",
    year: 2023,
    metric: "co2",
    entity: "United States",
  };

  const state = {
    view: DEFAULTS.view,
    region: DEFAULTS.region,
    year: DEFAULTS.year,
    metric: DEFAULTS.metric,
    entity: DEFAULTS.entity,
    search: "",
    sortKey: "co2",
    sortDir: "desc",
  };

  const METRIC_LABEL = { co2: "Total CO2", co2_per_capita: "Per capita CO2" };
  const METRIC_UNIT = { co2: "Mt", co2_per_capita: "t" };

  // ---- element refs ----
  const $ = (id) => document.getElementById(id);
  const els = {};

  function cacheEls() {
    [
      "nav-overview", "nav-explorer", "view-overview", "view-explorer",
      "view-title", "view-subtitle",
      "region-filter", "year-select", "metric-total", "metric-percap",
      "entity-select", "kpi-grid", "line-chart", "bar-chart", "line-sub", "bar-sub",
      "search-input", "result-count", "clear-filters", "table-body", "empty-state",
      "empty-sub", "data-table", "table-head-row",
    ].forEach((id) => (els[toCamel(id)] = $(id)));
  }
  function toCamel(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

  // ---- formatting helpers ----
  function fmtInt(n) {
    if (n === null || n === undefined) return "-";
    return Math.round(n).toLocaleString("en-US");
  }
  function fmtNum(n, dp) {
    if (n === null || n === undefined) return "-";
    return n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function fmtSigned(n, dp) {
    if (n === null || n === undefined) return "-";
    const s = n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
    return (n > 0 ? "+" : "") + s + "%";
  }
  function deltaClass(n) {
    if (n === null || n === undefined) return "flat";
    if (n > 0.05) return "up";
    if (n < -0.05) return "down";
    return "flat";
  }

  // ============================================================
  //  Populate control options
  // ============================================================
  function populateControls() {
    const Data = window.MeridianData;

    // Region filter (keep the existing "All regions" option first).
    Data.regions.forEach((r) => {
      const o = document.createElement("option");
      o.value = r;
      o.textContent = r;
      els.regionFilter.appendChild(o);
    });
    els.regionFilter.value = state.region;

    // Year selector (descending, latest first).
    const yearsDesc = Data.years.slice().sort((a, b) => b - a);
    yearsDesc.forEach((y) => {
      const o = document.createElement("option");
      o.value = String(y);
      o.textContent = String(y);
      els.yearSelect.appendChild(o);
    });
    els.yearSelect.value = String(state.year);

    rebuildEntityOptions();
  }

  // Entity (time-series country) options reflect the active region filter.
  function rebuildEntityOptions() {
    const Data = window.MeridianData;
    const prev = state.entity;
    const list = Data.countries
      .filter((c) => state.region === "All" || c.continent === state.region)
      .map((c) => c.country)
      .sort();

    els.entitySelect.innerHTML = "";
    list.forEach((name) => {
      const o = document.createElement("option");
      o.value = name;
      o.textContent = name;
      els.entitySelect.appendChild(o);
    });

    // Keep prior selection if still valid; else pick the largest emitter in view.
    if (list.indexOf(prev) !== -1) {
      state.entity = prev;
    } else {
      const rows = Data.rowsForYear(state.year, state.region).slice().sort((a, b) => (b.co2 || 0) - (a.co2 || 0));
      state.entity = rows.length ? rows[0].country : (list[0] || "");
    }
    els.entitySelect.value = state.entity;
  }

  // ============================================================
  //  Render: KPI cards
  // ============================================================
  function renderKpis() {
    const Data = window.MeridianData;
    const s = Data.summaryForYear(state.year, state.region);
    const grid = els.kpiGrid;
    grid.innerHTML = "";

    const scope = state.region === "All" ? "all tracked countries" : state.region;

    const yoyChip = (() => {
      if (s.yoy === null) return { cls: "flat", txt: "n/a" };
      const cls = deltaClass(s.yoy);
      return { cls: cls, txt: fmtSigned(s.yoy, 1) };
    })();

    const cards = [
      {
        label: "Total emissions " + state.year,
        value: fmtInt(s.total),
        unit: "Mt CO2",
        meta: "Across " + s.count + " countries (" + scope + ")",
      },
      {
        label: "Avg per capita",
        value: fmtNum(s.avgPerCapita, 1),
        unit: "t / person",
        meta: "Mean across " + scope,
      },
      {
        label: "Top emitter " + state.year,
        value: s.topEmitter ? s.topEmitter.country : "-",
        unit: "",
        meta: s.topEmitter ? fmtInt(s.topEmitter.co2) + " Mt CO2" : "",
      },
      {
        label: "Year-over-year",
        value: yoyChip.txt,
        unit: "",
        meta: "Aggregate change vs " + (state.year - 1),
        chip: yoyChip.cls,
      },
    ];

    cards.forEach((c) => {
      const card = document.createElement("article");
      card.className = "card kpi";

      const label = document.createElement("p");
      label.className = "kpi-label";
      label.textContent = c.label;

      const value = document.createElement("p");
      value.className = "kpi-value";
      value.textContent = c.value;
      if (c.unit) {
        const u = document.createElement("span");
        u.className = "kpi-unit";
        u.textContent = c.unit;
        value.appendChild(u);
      }

      const meta = document.createElement("p");
      meta.className = "kpi-meta";
      if (c.chip) {
        const chip = document.createElement("span");
        chip.className = "kpi-chip " + c.chip;
        chip.textContent = c.chip === "up" ? "rising" : c.chip === "down" ? "falling" : "steady";
        meta.appendChild(chip);
      }
      const metaText = document.createElement("span");
      metaText.textContent = c.meta;
      meta.appendChild(metaText);

      card.appendChild(label);
      card.appendChild(value);
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }

  // ============================================================
  //  Render: charts (Overview)
  // ============================================================
  function renderCharts() {
    const Data = window.MeridianData;
    const metric = state.metric;

    // Line: selected entity over all years for the active metric.
    const series = Data.seriesFor(state.entity, metric);
    window.MeridianCharts.renderLine(els.lineChart, series, {
      ariaLabel: METRIC_LABEL[metric] + " for " + state.entity + " over time",
    });
    els.lineSub.textContent =
      METRIC_LABEL[metric] + " for " + state.entity + " (" + METRIC_UNIT[metric] + "), " + Data.yearMin + "-" + Data.yearMax;

    // Bar: top N countries for the selected year + region + metric.
    const rows = Data.rowsForYear(state.year, state.region)
      .filter((r) => typeof r[metric] === "number")
      .sort((a, b) => b[metric] - a[metric]);
    const topN = rows.slice(0, 8);
    const items = topN.map((r) => ({
      label: r.country,
      value: r[metric],
      highlight: r.country === state.entity,
    }));
    window.MeridianCharts.renderBars(els.barChart, items, {
      ariaLabel: "Top countries by " + METRIC_LABEL[metric] + " in " + state.year,
    });
    els.barSub.textContent =
      "Top " + items.length + " by " + METRIC_LABEL[metric].toLowerCase() + ", " + state.year +
      " (" + (state.region === "All" ? "all regions" : state.region) + ")";
  }

  // ============================================================
  //  Render: table (Explorer)
  // ============================================================
  function compare(a, b, key, dir) {
    let av = a[key];
    let bv = b[key];
    const mult = dir === "asc" ? 1 : -1;
    if (key === "country" || key === "continent") {
      av = (av || "").toString();
      bv = (bv || "").toString();
      return av.localeCompare(bv) * mult;
    }
    // numeric; nulls always sort to the bottom regardless of direction
    const an = typeof av === "number" ? av : null;
    const bn = typeof bv === "number" ? bv : null;
    if (an === null && bn === null) return 0;
    if (an === null) return 1;
    if (bn === null) return -1;
    return (an - bn) * mult;
  }

  function currentRows() {
    const Data = window.MeridianData;
    let rows = Data.rowsForYear(state.year, state.region);
    const q = state.search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) => r.country.toLowerCase().indexOf(q) !== -1 || (r.iso || "").toLowerCase().indexOf(q) !== -1
      );
    }
    rows.sort((a, b) => compare(a, b, state.sortKey, state.sortDir));
    return rows;
  }

  function renderTable() {
    const rows = currentRows();
    const body = els.tableBody;
    body.innerHTML = "";

    // result count
    els.resultCount.textContent = rows.length === 1 ? "1 country" : rows.length + " countries";

    // empty state
    if (!rows.length) {
      els.emptyState.hidden = false;
      const q = state.search.trim();
      els.emptySub.textContent = q
        ? 'No results found for "' + q + '". Try a different search or clear the filters.'
        : "No countries match the current filters. Try clearing the filters.";
      updateSortIndicators();
      return;
    }
    els.emptyState.hidden = true;

    rows.forEach((r, i) => {
      const tr = document.createElement("tr");

      const tdRank = document.createElement("td");
      tdRank.className = "cell-rank";
      tdRank.textContent = String(i + 1);
      tr.appendChild(tdRank);

      const tdCountry = document.createElement("td");
      tdCountry.className = "cell-country";
      tdCountry.textContent = r.country;
      if (r.iso) {
        const iso = document.createElement("span");
        iso.className = "cell-iso";
        iso.textContent = r.iso;
        tdCountry.appendChild(iso);
      }
      tr.appendChild(tdCountry);

      const tdRegion = document.createElement("td");
      const tag = document.createElement("span");
      tag.className = "region-tag";
      tag.textContent = r.continent;
      tdRegion.appendChild(tag);
      tr.appendChild(tdRegion);

      const tdCo2 = document.createElement("td");
      tdCo2.className = "cell-num";
      tdCo2.textContent = fmtNum(r.co2, 1);
      tr.appendChild(tdCo2);

      const tdPc = document.createElement("td");
      tdPc.className = "cell-num";
      tdPc.textContent = fmtNum(r.co2_per_capita, 2);
      tr.appendChild(tdPc);

      const tdGrowth = document.createElement("td");
      tdGrowth.className = "cell-num";
      const span = document.createElement("span");
      span.className = "delta " + deltaClass(r.co2_growth_prct);
      span.textContent = fmtSigned(r.co2_growth_prct, 1);
      tdGrowth.appendChild(span);
      tr.appendChild(tdGrowth);

      const tdPop = document.createElement("td");
      tdPop.className = "cell-num";
      tdPop.textContent = fmtInt(r.population);
      tr.appendChild(tdPop);

      body.appendChild(tr);
    });

    updateSortIndicators();
  }

  function updateSortIndicators() {
    const ths = els.tableHeadRow.querySelectorAll("th");
    ths.forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc");
      th.removeAttribute("aria-sort");
      if (th.getAttribute("data-key") === state.sortKey && state.sortKey !== "rank") {
        th.classList.add(state.sortDir === "asc" ? "sort-asc" : "sort-desc");
        th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      }
    });
  }

  // ============================================================
  //  View switching
  // ============================================================
  function setView(view) {
    state.view = view;
    const isOverview = view === "overview";
    els.viewOverview.classList.toggle("is-active", isOverview);
    els.viewExplorer.classList.toggle("is-active", !isOverview);
    els.navOverview.classList.toggle("is-active", isOverview);
    els.navExplorer.classList.toggle("is-active", !isOverview);
    els.navOverview.setAttribute("aria-current", isOverview ? "page" : "false");
    els.navExplorer.setAttribute("aria-current", isOverview ? "false" : "page");
    els.viewTitle.textContent = isOverview ? "Overview" : "Explorer";
    els.viewSubtitle.textContent = isOverview
      ? "Global CO2 emissions at a glance"
      : "Browse, sort and filter every tracked country";

    // reflect in hash without scrolling
    const hash = isOverview ? "" : "#explorer";
    if (window.location.hash !== hash) {
      history.replaceState(null, "", hash || window.location.pathname + window.location.search);
    }
  }

  // ============================================================
  //  Wiring
  // ============================================================
  function rerenderActive() {
    renderKpis();
    if (state.view === "overview") renderCharts();
    renderTable();
  }

  function bindEvents() {
    els.navOverview.addEventListener("click", () => setView("overview"));
    els.navExplorer.addEventListener("click", () => setView("explorer"));

    els.regionFilter.addEventListener("change", (e) => {
      state.region = e.target.value;
      rebuildEntityOptions();
      rerenderActive();
    });

    els.yearSelect.addEventListener("change", (e) => {
      state.year = parseInt(e.target.value, 10);
      rerenderActive();
    });

    els.metricTotal.addEventListener("click", () => setMetric("co2"));
    els.metricPercap.addEventListener("click", () => setMetric("co2_per_capita"));

    els.entitySelect.addEventListener("change", (e) => {
      state.entity = e.target.value;
      renderCharts();
    });

    els.searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderTable();
    });
    // Pressing Enter in search keeps focus and simply re-applies (already live).
    els.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        renderTable();
      }
    });

    els.clearFilters.addEventListener("click", () => {
      state.search = "";
      state.region = "All";
      els.searchInput.value = "";
      els.regionFilter.value = "All";
      rebuildEntityOptions();
      rerenderActive();
    });

    // Sortable headers
    els.tableHeadRow.querySelectorAll("th.th-sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.getAttribute("data-key");
        if (key === "rank") return; // rank follows the active sort, not sortable itself
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          // sensible default direction: text asc, numbers desc
          state.sortDir = key === "country" || key === "continent" ? "asc" : "desc";
        }
        renderTable();
      });
    });

    window.addEventListener("hashchange", syncFromHash);
  }

  function setMetric(metric) {
    state.metric = metric;
    els.metricTotal.classList.toggle("is-active", metric === "co2");
    els.metricPercap.classList.toggle("is-active", metric === "co2_per_capita");
    els.metricTotal.setAttribute("aria-pressed", metric === "co2");
    els.metricPercap.setAttribute("aria-pressed", metric === "co2_per_capita");
    renderCharts();
  }

  function syncFromHash() {
    const h = (window.location.hash || "").toLowerCase();
    setView(h === "#explorer" ? "explorer" : "overview");
  }

  // ============================================================
  //  Deterministic deep-linking (capture + shareable URLs)
  //  All params are optional; absent params keep the fixed
  //  defaults, so the plain "/" load stays byte-stable.
  //  Supported: ?view=overview|explorer (or #explorer),
  //  ?region=<Name>, ?q=<search>, ?sort=<key>&dir=asc|desc,
  //  ?year=<n>, ?metric=co2|co2_per_capita, ?entity=<country>.
  //  ============================================================
  const SORT_KEYS = [
    "rank", "country", "continent", "co2", "co2_per_capita", "co2_growth_prct", "population",
  ];

  function applyParams() {
    const Data = window.MeridianData;
    const params = new URLSearchParams(window.location.search);

    // Year (only if it is a known year).
    if (params.has("year")) {
      const y = parseInt(params.get("year"), 10);
      if (Data.years.indexOf(y) !== -1) {
        state.year = y;
        els.yearSelect.value = String(y);
      }
    }

    // Metric.
    const metric = params.get("metric");
    if (metric === "co2" || metric === "co2_per_capita") {
      setMetric(metric); // updates toggle button state too
    }

    // Region (only if it is a known region).
    if (params.has("region")) {
      const r = params.get("region");
      if (r === "All" || Data.regions.indexOf(r) !== -1) {
        state.region = r;
        els.regionFilter.value = r;
        rebuildEntityOptions();
      }
    }

    // Entity for the line chart (only if present in the current region view).
    if (params.has("entity")) {
      const e = params.get("entity");
      if (Array.prototype.some.call(els.entitySelect.options, (o) => o.value === e)) {
        state.entity = e;
        els.entitySelect.value = e;
      }
    }

    // Search query.
    if (params.has("q")) {
      state.search = params.get("q") || "";
      els.searchInput.value = state.search;
    }

    // Sort key + direction.
    if (params.has("sort")) {
      const key = params.get("sort");
      if (SORT_KEYS.indexOf(key) !== -1 && key !== "rank") {
        state.sortKey = key;
        const dir = (params.get("dir") || "").toLowerCase();
        if (dir === "asc" || dir === "desc") {
          state.sortDir = dir;
        } else {
          state.sortDir = key === "country" || key === "continent" ? "asc" : "desc";
        }
      }
    }

    // View: explicit ?view= wins, else fall back to the #explorer hash.
    const view = (params.get("view") || "").toLowerCase();
    if (view === "explorer" || view === "overview") {
      setView(view);
    } else {
      syncFromHash();
    }
  }

  // ============================================================
  //  Boot
  // ============================================================
  async function boot() {
    cacheEls();
    try {
      await window.MeridianData.load(DATA_URL);
    } catch (err) {
      els.kpiGrid.textContent = "Failed to load data.";
      // surface to console for debugging; no network retry.
      console.error(err);
      return;
    }

    populateControls();
    bindEvents();

    // initial metric pressed-state attributes
    els.metricTotal.setAttribute("aria-pressed", "true");
    els.metricPercap.setAttribute("aria-pressed", "false");

    // Apply any optional deep-link params (region, search, sort, view, ...)
    // BEFORE the first render so the captured state is settled in one paint.
    // With no params this is a no-op and the fixed defaults stand.
    applyParams();

    rerenderActive();

    // Settle signal for deterministic screenshot capture: set only after the
    // first full render so a capturer can wait on a single stable flag.
    window.__meridianReady = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
