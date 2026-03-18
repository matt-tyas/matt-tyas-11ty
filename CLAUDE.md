# CLAUDE.md — AI Assistant Guide for matt-tyas-11ty

## Project Overview

**matt-tyas-11ty** is a personal portfolio/resume website for Matt Tyas (matt.tyas.fyi), built with [Eleventy (11ty)](https://www.11ty.dev/) v0.8.3. The site is a single-page design portfolio showcasing Matt's work as Head of Design at the Co-op and company director at Finest Group. It is deployed on Netlify.

Based on Phil Hawksworth's [Eleventyone](https://github.com/philhawksworth/eleventyone) starter.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Static Site Generator | Eleventy 0.8.3 |
| Template Engine | Nunjucks (.njk) |
| CSS Preprocessing | PostCSS (not Sass) |
| CSS Framework | Co-op Digital Foundations |
| Font | Poppins (via Google Fonts) + normalize.css |
| JavaScript | Vanilla JS, no framework or bundler |
| JS Minification | UglifyJS (via Eleventy filter) |
| HTML Minification | html-minifier (via Eleventy transform) |
| Date Handling | Luxon |
| HTTP Clients | axios, node-fetch |
| Deployment | Netlify |
| Serverless Functions | Netlify Functions (src/functions/) |

---

## Repository Structure

```
matt-tyas-11ty/
├── .eleventy.js              # Eleventy config (input: src/site, output: dist)
├── .env-sample               # Environment variable template
├── package.json              # Dependencies and npm scripts
├── static.json               # Netlify config — serves from dist/
│
├── src/
│   ├── site/                 # Eleventy input directory
│   │   ├── index.html        # Main homepage (single-page site)
│   │   ├── search.njk        # Search page
│   │   ├── sitemap.njk       # XML sitemap
│   │   │
│   │   ├── _data/            # Global Eleventy data
│   │   │   ├── site.js       # Root config: site.rootUrl, site.buildTime
│   │   │   ├── dev/site.js   # Dev environment overrides
│   │   │   └── prod/site.js  # Prod environment overrides
│   │   │
│   │   ├── _includes/        # Nunjucks includes and layouts
│   │   │   ├── header.njk    # Site header (contains animated SVG logo)
│   │   │   ├── footer.njk    # Site footer
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   ├── base.njk  # Base HTML layout (aliased as "default")
│   │   │   │   └── post.md   # Blog post layout (unused)
│   │   │   │
│   │   │   ├── postcss/      # CSS source files (PostCSS)
│   │   │   │   ├── styles.css       # Main entry point (imports below)
│   │   │   │   ├── _vars.pcss       # CSS custom properties / color tokens
│   │   │   │   ├── _my-styles.pcss  # Project-specific styles
│   │   │   │   └── _prototype-styles.pcss
│   │   │   │
│   │   │   ├── js/           # Client-side JavaScript
│   │   │   │   ├── core.js          # btnHandler() utility
│   │   │   │   ├── forms_storage.js # Form persistence (localStorage/sessionStorage)
│   │   │   │   ├── main.js          # Initialization entry point
│   │   │   │   └── hello.js         # Sample button interaction
│   │   │   │
│   │   │   ├── elements/     # Basic UI elements (buttons, forms, links, typography)
│   │   │   ├── components/   # Composed UI (cards, notifications, hero banners)
│   │   │   ├── layout/       # Grid and positioning patterns
│   │   │   └── patterns/     # Form patterns (validation, date input)
│   │   │
│   │   ├── css/
│   │   │   └── styles.11ty.js  # PostCSS pipeline as an Eleventy template
│   │   │
│   │   └── images/           # Static assets (SVGs, PNGs, favicons) — passthrough copied to dist/
│   │
│   ├── functions/            # Netlify serverless functions
│   │   ├── hello.js          # Returns "Hello from a serverless function!"
│   │   └── fetch-joke.js     # Fetches a dad joke from icanhazdadjoke.com
│   │
│   └── utils/                # Eleventy utility modules
│       ├── minify-html.js    # HTML minification transform
│       ├── save-seed.js      # Seed data utility
│       └── filters/
│           ├── date.js       # dateDisplay filter (Luxon)
│           ├── squash.js     # squash filter (search index deduplication)
│           └── section.js    # Content splitter (excerpt/remainder)
│
└── dist/                     # Build output — gitignored, served by Netlify
```

---

## Development Workflows

### Setup

```bash
npm install
```

Requires Node.js 12.x and npm 7.x.

### Local Development

```bash
npm start
# or
npm run dev
```

- Sets `ELEVENTY_ENV=dev`
- Watches for file changes
- Serves at http://localhost:8080 (BrowserSync)
- BrowserSync dashboard at http://localhost:3001
- Uses `_data/dev/site.js` for environment config

### Production Build

```bash
npm run build
```

- Sets `ELEVENTY_ENV=prod`
- Minifies HTML and JS output
- Optimises CSS via cssnano
- Uses `_data/prod/site.js` for environment config

### Seed Build

```bash
npm run seed
```

- Sets `ELEVENTY_ENV=seed` (maps to prod behaviour internally)

---

## Key Conventions

### Templates

- **Nunjucks (.njk)** is the primary template language.
- **Markdown (.md)** files are also processed through Nunjucks.
- **JavaScript 11ty templates (.11ty.js)** are used for the CSS compilation pipeline (`css/styles.11ty.js`).
- All pages use the `default` layout alias, which maps to `layouts/base.njk`.

### CSS

- All CSS is written as **PostCSS** (`.pcss` or `.css`), never Sass/SCSS.
- The entry point is `src/site/_includes/postcss/styles.css`.
- Custom properties (CSS variables) are defined in `_vars.pcss`.
- Project-specific styles go in `_my-styles.pcss`.
- Do **not** edit `src/site/_includes/css/` — that is a generated build artifact (gitignored).

**CSS Class Naming:**
- Project classes use the `mt-` prefix (Matt Tyas): `.mt-header`, `.mt-nav`, `.mt-section`, `.mt-main`, `.mt-logo`, etc.
- Co-op foundation classes use the `coop-` prefix: `.coop-l-grid`, `.coop-l-grid__item`.
- Modifiers follow BEM-style `--`: `.mt-section--bg`, `.mt-section--last`.
- State classes use `--is-`: `.mt-expression--is-happy`.

**Typography:**
- Font: Poppins (weights 200, 300, 600) via Google Fonts.
- Font sizes use `clamp()` for responsive scaling without breakpoints where possible.

### JavaScript

- **Vanilla JS only** — no framework, no bundler.
- Uses **IIFE pattern** for encapsulation (`forms_storage.js`).
- Uses **prototype-based OOP** for the form storage module.
- JS is minified at build time via the `jsmin` Eleventy filter (UglifyJS).
- Client JS lives in `src/site/_includes/js/`.

### Data

- Global site data is accessed via `site.rootUrl` and `site.buildTime` (from `_data/site.js`).
- Environment-specific values are in `_data/dev/site.js` and `_data/prod/site.js`.
- The active data directory is controlled by `ELEVENTY_ENV`.

### Eleventy Filters and Shortcodes

| Name | Type | Purpose |
|---|---|---|
| `dateDisplay` | filter | Format dates using Luxon |
| `squash` | filter | Deduplicate content for search index |
| `jsmin` | filter | Minify JS strings via UglifyJS |
| `year` | shortcode | Output current year |

### Environment Handling

- `ELEVENTY_ENV=dev` → uses `_data/dev/` data directory
- `ELEVENTY_ENV=prod` → uses `_data/prod/` data directory
- `ELEVENTY_ENV=seed` → treated as prod

---

## Deployment

- Hosted on **Netlify**.
- `static.json` sets the publish directory to `dist/`.
- Build command: `npm run build`.
- Serverless functions in `src/functions/` are automatically deployed as Netlify Functions.
- Environment secrets (e.g. `INSTAGRAM_AUTH`) are set in Netlify environment variables, mirroring `.env-sample`.

---

## Images and SVGs

- Static images live in `src/site/images/` and are passthrough-copied to `dist/images/`.
- Custom SVG illustrations of Matt (avatar, expressions, icons) are named `matt-*.svg`.
- Wall pattern SVGs (`walls.svg`, `walls-1.svg`, `walls-2.svg`) are used as CSS background images.
- Favicon assets are pre-generated and stored in `src/site/images/`.

---

## Things to Avoid

- Do **not** edit files in `dist/` — they are build outputs and will be overwritten.
- Do **not** edit `src/site/_includes/css/` — this is also generated (PostCSS output).
- Do **not** introduce Sass/SCSS — the project uses PostCSS exclusively.
- Do **not** add a JS bundler or framework without discussion — the project intentionally uses vanilla JS.
- Do **not** upgrade Eleventy without checking breaking changes — the project uses v0.8.3 which has a different API from v1.x/v2.x/v3.x.

---

## Useful References

- [Eleventy 0.8.x docs](https://www.11ty.dev/docs/) (note: use v0.8 docs, not latest)
- [Nunjucks templating](https://mozilla.github.io/nunjucks/templating.html)
- [PostCSS](https://postcss.org/)
- [Luxon date library](https://moment.github.io/luxon/)
- [Co-op Digital Foundations](https://github.com/coopdigital) (CSS framework used)
