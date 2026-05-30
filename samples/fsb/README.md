# Financial Stability Board (FSB) — Interactive Front-End Prototype

A complete, interactive prototype of the Financial Stability Board (FSB) website built as a single-page React application.

The application implements every feature described in `/workspace/prompt.txt`:

- A homepage with a featured carousel, the latest news, featured reports, and three callouts (Data, Video and Audio, Organisation and Members).
- An About the FSB page describing the FSB’s mandate, mission and organisational framework (Plenary, Steering Committee, three Standing Committees).
- A Work of the FSB page and the drill-down: Work of the FSB → Financial Innovation and Structural Change → Climate-related Risks, which includes four collapsible sections (Disclosures, Data, Vulnerability Analysis, Regulatory and supervisory practices and tools), a roadmap diagram, and key documents including the TCFD report.
- A Publications page with 914 results, left-hand sidebar filters (search, content types, policy areas, date range), and pagination across 92 pages.
- A Consultations page describing the three-step transparent consultation process and the three image-driven sections: Current consultations, Past consultations, and Responses to past consultations.
- A Press page with 1,034 items, sidebar filters (search, policy areas, date range), pagination, and a prominent "latest update" feature at the top.

A consistent main navigation menu with the five required sections (ABOUT THE FSB, WORK OF THE FSB, PUBLICATIONS, CONSULTATIONS, PRESS) and a breadcrumb appear on every page.

---

## Technology Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router v6 |
| Styling | Hand-crafted CSS (CSS variables, responsive grid) |
| Language | JavaScript (JSX, ES2022) |
| Data | Local mock data generated from real-looking seed lists |

No external UI framework is used so that the design is faithful to the FSB brand language (deep institutional blue, orange accent, serif headings).

---

## Directory Structure

```
/workspace
├── README.md                  ← this file
├── DESIGN.md                  ← design document
├── start.sh                   ← single-command deployment script
├── prompt.txt                 ← original task description
├── resources/                 ← provided assets (images, audio, fonts, video)
└── app/                       ← the front-end application
    ├── index.html             ← Vite entry HTML
    ├── package.json
    ├── vite.config.js         ← server on port 3000, host 0.0.0.0
    ├── public/
    │   └── images/            ← every image from /workspace/resources/images
    └── src/
        ├── main.jsx           ← React entry, mounts BrowserRouter
        ├── App.jsx            ← Route configuration
        ├── index.css          ← global styles (single source of truth)
        ├── components/
        │   ├── Layout.jsx     ← Header + Outlet + Footer + scroll reset
        │   ├── Header.jsx     ← top bar, brand, search, main navigation
        │   ├── Footer.jsx     ← site-wide footer
        │   ├── Breadcrumb.jsx ← shared breadcrumb (always starts at Home)
        │   ├── Carousel.jsx   ← auto-rotating, accessible carousel
        │   ├── Collapsible.jsx← shared accordion / disclosure widget
        │   └── Pagination.jsx ← reusable pagination control
        ├── data/
        │   └── mockData.js    ← 914 publications, 1034 press items, etc.
        └── pages/
            ├── Home.jsx
            ├── About.jsx
            ├── Work.jsx
            ├── FinancialInnovation.jsx
            ├── ClimateRisks.jsx
            ├── Publications.jsx
            ├── Consultations.jsx
            ├── Press.jsx
            ├── DataPage.jsx
            ├── VideoAudio.jsx
            └── Organisation.jsx
```

---

## Local Deployment

### One-command start (recommended)

From a brand-new container, run:

```bash
bash /workspace/start.sh
```

This will:

1. Install Node.js 20.x (via NodeSource) if not already present.
2. Install all project dependencies via `npm install`.
3. Start the Vite development server on **http://localhost:3000**.

When the script prints `VITE … ready` open `http://localhost:3000` in a browser.

### Manual (if you already have Node ≥ 18)

```bash
cd /workspace/app
npm install
npm run dev   # serves on 0.0.0.0:3000
```

---

## Feature List

### Homepage
- Auto-rotating hero carousel with 5 slides (pause on hover, prev/next arrows, indicator dots).
- "Latest News" feed with 5 articles, each with thumbnail, date, category, headline, and excerpt.
- "Featured Reports" sidebar with three flagship report cards.
- Three clickable bottom callouts: **Data**, **Video and Audio**, **Organisation and Members**.

### About the FSB
- Mandate and mission explanation.
- "Mandate of the FSB" highlight card listing each function from the FSB Charter.
- Organisational framework (Plenary, Steering Committee, three Standing Committees) with sub-sections.
- History section.

### Work of the FSB
- Tile grid covering Vulnerabilities Assessment, Financial Innovation and Structural Change, NBFI, Cross-Border Payments, Cyber & Operational Resilience, and Resolution.
- Clicking "Financial Innovation and Structural Change" drills into a sub-area page (Climate-related Risks, Crypto-Assets, Artificial Intelligence).
- Climate-related Risks page with:
  - Four interactive collapsible sections (Disclosures, Data, Vulnerability Analysis, Regulatory and supervisory practices and tools).
  - Roadmap diagram.
  - "Key Documents" panel including progress reports and TCFD report.

### Publications (914 results)
- Sidebar filters: keyword search, content type, policy area (incl. Climate-related Risks, Cyber Resilience, Crypto Assets, Nonbank Financial Intermediation, …), Published After / Published Before date range.
- Live filtering with result count.
- Pagination of 92 pages (10 results per page) with first/last/ellipsis logic.
- Coloured "icon" badges per content type.
- Each listing shows title (linked), date, and brief description.

### Consultations
- Explanation of the FSB consultation policy.
- Three numbered step cards: 60-day consultation, public responses within 15 days, overview reports.
- Three image-led sections: Current consultations, Past consultations, Responses to past consultations.

### Press (1,034 items)
- Identical filter UX to Publications (search, type, policy area, date range).
- "Latest update" featured callout at the top of the first page.
- Pagination control with Next/Prev and active page indicator.

### Shared
- Main navigation menu with five primary sections on every page.
- Breadcrumb under the main navigation on every page (e.g. `Home > Work of the FSB > Financial Innovation and Structural Change > Climate-related Risks`).
- Responsive layout (collapses on viewports ≤ 900px).
- Smooth scroll-to-top on route change.

---

## Reproducibility

The `start.sh` script is fully self-contained and tested in a clean directory: it installs Node.js (if missing), runs `npm install`, and starts the dev server on port 3000. After running:

```bash
bash /workspace/start.sh
```

the site is fully operational at **http://localhost:3000**.
