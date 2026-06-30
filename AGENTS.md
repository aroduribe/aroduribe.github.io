# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **static GitHub Pages site** (plain HTML/CSS/vanilla JS) for `aroduribe.com`. There is **no build step, no `package.json`, and no dependencies to install**.

### Services
- **Static site** — the only thing to "run". Pages: `index.html` (home) and `hobbies.html`. Styles in `assets/css/styles.css`, behavior in `assets/js/{home,films,books}.js`.

### Running locally (dev)
- Serve the repo root over HTTP from `/workspace`: `python3 -m http.server 8000`, then open `http://localhost:8000/index.html`.
- Must be served over HTTP (not `file://`): `films.js`/`books.js` `fetch()` `films.json`/`books.json` at runtime. If those files are missing/invalid, the JS keeps the static fallback markup already in the HTML, so the page still renders fully.

### Optional data refresh (build-time only)
- `node scripts/fetch-films.js` and `node scripts/fetch-books.js` scrape Letterboxd/Goodreads RSS and regenerate `films.json`/`books.json`. They run in CI (`.github/workflows/deploy.yml`) on Node 20 and **self-guard (`exit 0` on failure)**, so a network error never blocks deploy. These are one-shot scripts, not services, and require network access. They modify `films.json`/`books.json` — revert those edits unless you intend to commit refreshed data.

### Lint / test / build
- There is no linter, no test suite, and no build configured in this repo.
