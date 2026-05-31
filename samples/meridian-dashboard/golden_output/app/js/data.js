/* ============================================================
   data.js - loads the vendored OWID CO2 snapshot and exposes
   normalized accessors. Pure data layer, no DOM.
   The JSON is a LOCAL vendored file served by the static server;
   there are no calls to the public internet at runtime.
   ============================================================ */
(function (global) {
  "use strict";

  const Data = {
    raw: null,
    countries: [],
    regions: [],
    years: [],
    yearMin: null,
    yearMax: null,
    units: {},
  };

  // Build a fast index: country -> { meta, byYear: Map(year -> row) }.
  function index(raw) {
    const countries = raw.countries.map((c) => {
      const byYear = new Map();
      c.series.forEach((s) => byYear.set(s.year, s));
      return {
        country: c.country,
        iso: c.iso,
        continent: c.continent,
        series: c.series,
        byYear: byYear,
      };
    });

    const regionSet = new Set();
    countries.forEach((c) => regionSet.add(c.continent));
    const regions = Array.from(regionSet).sort();

    const yearMin = raw.meta.year_min;
    const yearMax = raw.meta.year_max;
    const years = [];
    for (let y = yearMin; y <= yearMax; y++) years.push(y);

    Data.raw = raw;
    Data.countries = countries;
    Data.regions = regions;
    Data.years = years;
    Data.yearMin = yearMin;
    Data.yearMax = yearMax;
    Data.units = raw.meta.units || {};
    return Data;
  }

  // Return one flat row per country for a given year, honoring a region filter.
  // Each row carries the metrics needed by the table and bar chart.
  Data.rowsForYear = function (year, region) {
    const out = [];
    Data.countries.forEach((c) => {
      if (region && region !== "All" && c.continent !== region) return;
      const s = c.byYear.get(year);
      if (!s) return;
      out.push({
        country: c.country,
        iso: c.iso,
        continent: c.continent,
        co2: s.co2,
        co2_per_capita: s.co2_per_capita,
        co2_growth_prct: s.co2_growth_prct,
        population: s.population,
      });
    });
    return out;
  };

  // Time series of a single metric for one country (array of {year, value}).
  Data.seriesFor = function (countryName, metric) {
    const c = Data.countries.find((x) => x.country === countryName);
    if (!c) return [];
    return c.series
      .filter((s) => s[metric] !== null && s[metric] !== undefined)
      .map((s) => ({ year: s.year, value: s[metric] }));
  };

  // Aggregate KPIs across the (region-filtered) set for a year.
  Data.summaryForYear = function (year, region) {
    const rows = Data.rowsForYear(year, region);
    let total = 0;
    let pcSum = 0;
    let pcCount = 0;
    let top = null;
    rows.forEach((r) => {
      if (typeof r.co2 === "number") total += r.co2;
      if (typeof r.co2_per_capita === "number") {
        pcSum += r.co2_per_capita;
        pcCount += 1;
      }
      if (typeof r.co2 === "number" && (!top || r.co2 > top.co2)) top = r;
    });

    // Year-over-year change of the aggregate total vs prior year.
    let yoy = null;
    if (year > Data.yearMin) {
      const prevRows = Data.rowsForYear(year - 1, region);
      let prevTotal = 0;
      prevRows.forEach((r) => {
        if (typeof r.co2 === "number") prevTotal += r.co2;
      });
      if (prevTotal > 0) yoy = ((total - prevTotal) / prevTotal) * 100;
    }

    return {
      total: total,
      avgPerCapita: pcCount ? pcSum / pcCount : null,
      topEmitter: top,
      yoy: yoy,
      count: rows.length,
    };
  };

  Data.load = async function (url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load dataset: " + res.status);
    const raw = await res.json();
    return index(raw);
  };

  global.MeridianData = Data;
})(window);
