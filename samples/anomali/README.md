# Anomali — The Agentic SOC Platform (Interactive Front-End)

A polished, multi-page marketing front-end that reproduces the Anomali Agentic SOC Platform website. The site introduces the unified Agentic SOC Platform (Unified Security Data Lake · ThreatStream Next-Gen · Agentic AI), a Resource Center with filters/search/pagination, and shared navigation/footer across all pages.

## Project Overview

This single-page application (SPA) delivers:

- A **Homepage** with hero, three platform-layer cards, partner trust strip, outcome stats, and CTA band.
- A dedicated **Agentic SOC Platform** product page covering the four SOC stages (Security, Investigation, Remediation, Intelligence) and core capabilities.
- Three deep-dive product pages: **Unified Security Data Lake**, **ThreatStream Next-Gen**, and **Agentic AI Capabilities**.
- A comprehensive **Resource Center** with filter pills, search, grid layout, pagination, "Read More" actions, and empty/loading states.
- Consistent **top navigation** (Products · Use Cases · Marketplace · Resources · Company · Partners) and a comprehensive **footer** across every page.
- Responsive design (desktop / tablet / mobile), animated hover states, a sticky header, and CTA bands with **green "Schedule a Demo" / "Talk to Sales"** buttons throughout.

## Technology Stack

| Layer        | Choice                          | Why                                                     |
| ------------ | ------------------------------- | ------------------------------------------------------- |
| Framework    | **React 19**                    | Component model, ecosystem, mature router               |
| Routing      | **react-router-dom 7**          | Client-side routing across 9 pages                       |
| Build tool   | **Vite 7**                      | Fast HMR, zero-config dev server on port 3000           |
| Styling      | **Hand-crafted CSS (variables)**| Predictable, no runtime cost, design-system tokens      |
| Fonts        | **Inter** (local woff)          | Provided in `/workspace/resources/fonts`                |
| Assets       | Local images from `/resources`  | Real Anomali marketing thumbnails / logos               |

## Directory Structure

```
/workspace
├── start.sh                         # Self-contained bootstrap script
├── README.md                        # This file
├── DESIGN.md                        # Architecture & design document
├── prompt.txt                       # Original task description
├── resources/                       # Provided assets (images, fonts, …)
└── app/                             # Front-end application
    ├── index.html
    ├── package.json
    ├── vite.config.js               # Vite, port 3000, host 0.0.0.0
    ├── public/
    │   └── assets/
    │       ├── images/              # 385+ marketing images
    │       └── fonts/               # Inter family
    └── src/
        ├── main.jsx                 # App entry, React 19, Router
        ├── App.jsx                  # Routes + scroll-to-top
        ├── styles/
        │   └── global.css           # Design system + components
        ├── components/
        │   ├── Header.jsx           # Sticky nav, mobile drawer
        │   ├── Footer.jsx           # Multi-column footer
        │   ├── PlatformLayers.jsx   # Reusable "3 layers" section
        │   └── CTABand.jsx          # Reusable CTA band
        ├── data/
        │   └── resources.js         # 39 mock resources + filter list
        └── pages/
            ├── Home.jsx
            ├── AgenticSOC.jsx       # /products
            ├── DataLake.jsx         # /products/unified-security-data-lake
            ├── ThreatStream.jsx     # /products/threatstream
            ├── AgenticAI.jsx        # /products/agentic-ai
            ├── Resources.jsx        # /resources
            └── Generic.jsx          # /use-cases /marketplace /company /partners
```

## Local Deployment

### 1-step (recommended): use the bootstrap script

```bash
bash /workspace/start.sh
```

The script will:

1. Detect/install **Node.js 20 LTS** if missing (works on apt, yum, or apk systems).
2. Install npm dependencies (`npm ci` with `npm install` fallback).
3. Start the Vite dev server, bound to `0.0.0.0:3000`.

Then open **http://localhost:3000**.

### Manual (if Node ≥18 is already installed)

```bash
cd /workspace/app
npm install
npm run dev      # http://localhost:3000
```

## Feature List

### Navigation & Layout
- Sticky, blurred header with active-route highlighting.
- Mobile hamburger menu with full-width drawer.
- Persistent comprehensive footer (Platform, Capabilities, Partners, Company columns + brand panel + Talk-to-Sales CTA + contact details).
- Scroll-to-top on every route change.

### Homepage (`/`)
- Hero with eyebrow, headline, lead copy, CTAs ("Explore the Platform", "Watch the Demo"), and a layer-diagram preview card.
- Trusted-by logo strip (Air Canada, Admiral, College Board, Zscaler, Palo Alto, CrowdStrike, Fortinet, Check Point, Infoblox).
- "Powered by the Anomali Platform Layers" — three clickable cards linking to each layer page.
- Outcome stats grid (90% MTTD reduction, 10x faster investigations, 24/7 telemetry, PB-scale data).
- Detect / Investigate / Respond outcome cards.
- Final green CTA band.

### Agentic SOC Platform (`/products`)
- Detailed overview of the unified security operations platform.
- Four-stage workflow: **Security · Investigation · Remediation · Intelligence**.
- Core capabilities checklist (6 items) with green check icons.
- "Powered by the Anomali Platform Layers" cross-links.
- Schedule-a-Demo CTA.

### Unified Security Data Lake (`/products/unified-security-data-lake`)
- Three highlight cards: Always-On Security Data · Unified Operational Visibility · Investigation-Ready at Scale.
- Capability cards: Always-On Telemetry Access · Security-Native Normalization · Native Threat Intelligence Enrichment.
- Performance metrics (PB+ hot data, 7yr retention, <2s queries, 60% lower TCO).
- Customer testimonials (financial services, Fortune 100 retail).
- Use-case grid: Threat Hunting · Real-Time Detection · Faster Decisions · Compliance & Forensics — each with "Read More".

### ThreatStream Next-Gen (`/products/threatstream`)
- Performance metrics (200+ sources, 1.5B observables, 99.9% SLA, 15-min operationalization).
- Three highlight cards: Curated Intelligence · Operational Enrichment · Threat Context That Travels.
- Capabilities: Aggregation · Correlation & Campaign Analysis · Intelligence-Driven Investigation · Built for Automation & AI.
- Three video demonstration cards (ThreatStream explainer, TI Intro, Intelligence Sharing) with play overlays.
- Use cases: Threat-Informed Detection · Threat Analysis · Faster Investigations · Operational Intelligence Sharing.

### Agentic AI (`/products/agentic-ai`)
- "Four Zeros" stat row: zero friction detection, zero response time, zero analyst time screening, zero response bias.
- Core capabilities: AI-Guided Detection · Guided Investigations · Agentic Response Workflows.
- Two alternating feature sections: "Intelligence-driven decisions" and "SOC at scale" with imagery.

### Resource Center (`/resources`)
- 39 mock resources covering Solution Briefs, White Papers, eBooks, Guides, Datasheets, Product overviews, Use Cases, Videos and Webinars.
- 10 filter pills (All + every type listed in the prompt).
- Live search across title, description and type.
- 3-column responsive resource grid with cover image, type tag, title, blurb, "Read More" button.
- Pagination (9 cards per page) with prev/next + numbered buttons.
- Result counter, "Clear filters" affordance, and empty-state card.

### Other Sections
- `/use-cases`, `/marketplace`, `/company`, `/partners` — generic hero + tri-card "get in touch" + CTA, fully navigable from header and footer.

### Cross-cutting
- Real images from `/workspace/resources/images` mounted at `/assets/images/...`.
- Inter font served locally from `/assets/fonts/`.
- Tailored design system: dark navy palette, signature green CTAs, grid background hero, gradient cards.
- Responsive grid breakpoints at 1024px and 720px.
- Accessible: semantic headings, alt attributes, focus-visible buttons, keyboard navigation.

## Verifying

Once `start.sh` finishes booting Vite, visit:

- http://localhost:3000/ — Home
- http://localhost:3000/products — Agentic SOC Platform
- http://localhost:3000/products/unified-security-data-lake
- http://localhost:3000/products/threatstream
- http://localhost:3000/products/agentic-ai
- http://localhost:3000/resources — try the search box, filter pills, and pagination
- http://localhost:3000/use-cases · /marketplace · /company · /partners

Every "Learn More" link under a layer card on the home page navigates to the matching deep-dive page, and every footer link is wired into the router.
