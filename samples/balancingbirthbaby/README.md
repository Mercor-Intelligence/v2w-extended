# Balancing Birth to Baby

A complete front-end application for **Balancing Birth to Baby** — a childbirth education and doula services organization in the Waterloo Region. Built per the specification in `prompt.txt`.

## Overview

The site offers prospective and current families:

* Information about prenatal classes, doula services and birth coaching
* A browsable class calendar (monthly / weekly)
* A blog with category filtering, recent posts, pagination and individual post pages
* A shop with categorized products, search, sorting and a shopping cart
* About page with team profiles & FAQs

## Tech Stack

| Layer        | Choice                          |
|--------------|---------------------------------|
| Framework    | React 18 (function components + hooks) |
| Routing      | React Router v6 (`BrowserRouter`) |
| State (cart) | React Context API               |
| Build tool   | Vite 5                          |
| Styling      | Hand-written CSS (custom design system, no UI lib) |
| Fonts        | Local `Astra` font (provided in `/resources/fonts`) |
| Language     | JavaScript (ESM, JSX)           |

There are no third-party UI kits — the visual design system, layout grid, navbar/dropdown, modal, cart drawer and calendar are all implemented from scratch.

## Directory Structure

```
/workspace
├── prompt.txt                # Original requirements
├── resources/                # Provided assets (images, fonts)
├── start.sh                  # One-shot deployment script
├── DESIGN.md                 # Full design document
├── README.md                 # You are here
└── app/                      # The application
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/assets/        # Copies of images & fonts served at /assets/*
    └── src/
        ├── main.jsx          # React entry, providers & router
        ├── App.jsx           # Route table
        ├── context/
        │   └── CartContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── CartDrawer.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── PrenatalClasses.jsx
        │   ├── ClassCalendar.jsx
        │   ├── BirthDoula.jsx
        │   ├── BirthCoaching.jsx
        │   ├── Blog.jsx
        │   ├── BlogPost.jsx
        │   ├── Shop.jsx
        │   ├── About.jsx
        │   └── NotFound.jsx
        ├── data/             # Mock data (classes, blog, products, team)
        └── styles/           # Global + per-feature CSS
```

## Routes

| Path                          | Page                          |
|-------------------------------|-------------------------------|
| `/`                           | Home                          |
| `/classes/prenatal`           | Prenatal Classes              |
| `/classes/calendar`           | Class Calendar (monthly/weekly) |
| `/doula/birth`                | Birth Doula Services          |
| `/birth-coaching`             | Birth Coaching                |
| `/blog`                       | Blog index                    |
| `/blog/:slug`                 | Single blog post              |
| `/shop`                       | Shop                          |
| `/about`                      | About                         |

## Feature List

### Navigation
* Sticky top navbar with the logo, all required top-level menu items and a cart icon with badge.
* `Classes & Events` and `Doula` dropdowns open on hover or click.
* Mobile hamburger menu with collapsible sub-menus.
* Footer with `Services`, `Resources`, `Legal` and `Social` columns.

### Home page
* Hero with “Everything is about to change… And, we're here to help!”
* Welcome / mission section with `Learn More About Us` CTA.
* Three service tiles (`Classes`, `Doula Services`, `Coaching`) each with their own CTA linking to the relevant page.
* Upcoming Classes list with `Register` buttons + `See Full Calendar`.
* Featured blog cards with `Read More` links to individual posts.
* Related-classes grid with `See Details` buttons.
* Final dual CTA band: `Learn How Our Classes & Events` and `Learn About Our Doula Services`.

### Prenatal Classes
* Weekend & Weeknight curriculum sections.
* List of upcoming classes with dates, times, locations and per-class `Register` buttons (interactive state).
* Two `See Full Calendar` CTAs (mid and bottom).
* Related classes grid with `See Details` buttons.

### Class Calendar
* `Category` filter, search box, month + year selectors.
* `MONTHLY` / `WEEKLY` view toggle.
* Previous / next month navigation showing actual month names (e.g. `← DECEMBER`, `FEBRUARY →`).
* Clickable events that open a detail modal.

### Birth Doula
* Multiple `BOOK A FREE CONSULTATION` buttons that open a working contact-form modal.
* What is a doula, shared-care team model, team profiles, expandable FAQs.

### Birth Coaching
* Three selectable coaching packages with prices.

### Blog
* Article list with image, title, excerpt, author and date.
* Sidebar with category filter (Baby / Birth / Postpartum / Pregnancy), Recent Posts and Upcoming Classes.
* Numbered pagination.
* Full single-post view at `/blog/:slug` with related-posts grid.

### Shop
* Category pills, search box and sort dropdown.
* Product cards with image, title, price and category tag.
* `Add to cart` buttons (instant feedback via slide-out cart drawer).
* `Select amount` selector for gift cards (25/50/100/150/200).
* Persistent shared cart state across pages, item quantity controls, remove, and total.

### About
* Mission, services overview, team profiles, FAQ accordion, `BOOK A FREE CONSULTATION` buttons.

### Misc
* Animated cart drawer with overlay.
* Modals (calendar event, consultation, About contact).
* Responsive design for mobile, tablet & desktop.
* Smooth scroll-to-top on route change.
* `NotFound` page for unknown routes.

## Running locally — quick start

```bash
bash /workspace/start.sh
```

`start.sh` is fully self-contained: in a fresh container it will install Node.js (via NodeSource if missing), install npm dependencies, free port 3000 if necessary, and start the Vite dev server.

The application will then be available at:

```
http://localhost:3000
```

### Manual (if you already have Node ≥ 18)

```bash
cd /workspace/app
npm install
npm run dev
```

## Notes on mock data

As permitted by the task, mock data is embedded in `/workspace/app/src/data/`:

* `classes.js` — prenatal & related classes, calendar events
* `blog.js` — blog posts and categories
* `products.js` — shop products, including a gift card with selectable amounts
* `team.js` — team members & FAQs

All product images come from `/workspace/resources/images` and are exposed under `/assets/images/` by Vite.
