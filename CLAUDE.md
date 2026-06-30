# Personal Site

Static personal website/zine for Alex Rodriguez, deployed to GitHub Pages at aroduribe.com.

## Stack

- Plain HTML/CSS/vanilla JS. No framework, no bundler, no `package.json`, no `node_modules`.
- Pages: `index.html` (home) and `hobbies.html`. Shared styles in `assets/css/styles.css`.
- Page-specific behavior lives in `assets/js/*.js` (`home.js`, `books.js`, `films.js`), loaded via plain `<script>` tags.
- `designs/` holds exported prototype HTML (`*.dc.html`) and a generated runtime (`support.js`, built from a separate `dc-runtime` TS project). Treat `support.js` as generated — do not hand-edit it.

## Data: books.json / films.json

- `books.json` and `films.json` are generated at deploy time by `scripts/fetch-books.js` and `scripts/fetch-films.js`, which scrape Goodreads/Letterboxd RSS feeds (no public APIs exist for these).
- Both scripts exit 0 on failure by design, so a broken feed never blocks deployment — the page falls back to the static HTML already committed.
- The corresponding `assets/js/books.js` / `films.js` fetch these JSON files client-side and replace static fallback markup if the fetch succeeds; otherwise the hardcoded fallback entries in the HTML remain.
- When editing the fallback entries in `index.html`/`hobbies.html`, keep them realistic — they're what visitors see if the RSS fetch ever fails.

## Deployment

- GitHub Actions workflow (`.github/workflows/`) runs on push to `main`: runs both fetch scripts, then deploys the repo root as a static site via `actions/deploy-pages`.
- No build step beyond the two fetch scripts. Pushing to `main` deploys directly to production.
- DNS for `aroduribe.com` (the `CNAME` file's domain) is managed in Cloudflare, but DNS-only/grey-clouded — Cloudflare is not proxying traffic, caching, or terminating TLS in front of the site. GitHub Pages serves the site and handles its own TLS directly. Don't assume Cloudflare-specific caching/purging is relevant when debugging deploy or content-staleness issues.

## Conventions

- Inline `style=""` attributes are used heavily and intentionally throughout the HTML (zine-style one-off layouts) alongside `assets/css/styles.css` for shared rules. Don't reflexively move inline styles into the stylesheet unless asked.
- Vanilla JS in this repo uses `var` and old-style function expressions, IIFEs, and `.then()` chains rather than `const`/`let`/`async`/arrow functions — match this style in `assets/js/` for consistency.
- Comments in this codebase explain *why* (e.g. fallback behavior, timing of animations), not *what* — keep that pattern.
- Test changes by opening the HTML files directly or serving the repo root locally (e.g. `python3 -m http.server`); there is no dev server or build tooling.
