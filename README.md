# Handoff: Alex Rodriguez — Personal Website ("A Personal Zine")

## Overview
A three-page personal website styled as a hand-printed paper **zine**: a textured cream
"newsprint" cover with a masthead, a contents/nav list, an editor's note, a film-photography
section, a "Now" page (watching/reading), and a photography contact-sheet page with a lightbox.
The tone is warm, analog, handmade — film grain, masking tape, leaning book spines, squiggly
hand-drawn arrows.

The goal of this handoff is to **stand the site up as a real, deployable codebase** (target:
GitHub Pages) while preserving the look and behavior exactly.

## About the Design Files
The files in `designs/` are **design references created in HTML** — working prototypes that show
the intended look and behavior. They are authored in a lightweight in-house component format
("DC"): each `.dc.html` file has a `<x-dc>` markup template plus a `<script type="text/x-dc">`
logic class, and they depend on the bundled `designs/support.js` runtime to render in a browser.

**Do not ship the DC files as-is.** The task is to **recreate these designs in a clean, standard
stack**. Because this is a small static marketing-style site, the recommended target is:

- **Plain static HTML/CSS/JS** (simplest; deploys to GitHub Pages with zero build), **or**
- **Astro** or **Vite + React** if you want components and a build step.

Either way, drop the DC runtime entirely and translate the markup to normal HTML/JSX and the
logic classes to small vanilla JS / React state. All styling in the prototypes is **inline
styles**; consolidate into a stylesheet or CSS modules as you port.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are all settled in
the prototypes. Recreate pixel-for-pixel. Exact hex values, fonts, and measurements are below;
when in doubt, open the prototype file and read the inline `style="…"`.

---

## Global Layout & Shell (applies to all pages)
- **Page background:** `#f4e8cf` (warm cream) with a faint crosshatch texture:
  ```
  background-image:
    repeating-linear-gradient(45deg, rgba(124,85,48,.035) 0 1px, transparent 1px 5px),
    repeating-linear-gradient(-45deg, rgba(124,85,48,.035) 0 1px, transparent 1px 5px);
  ```
- **Content column:** `max-width: 1080px; margin: 0 auto; padding: 0 28px 80px;`
- **Default text color (ink):** `#2a2521`
- **Body font:** `'Newsreader', Georgia, serif`
- Horizontal rules between sections are solid ink borders: `3px` for major (masthead/footer),
  `2px` for section dividers, `1px` (`#d8c39a`) for list rows.
- Links reset: `color: inherit; text-decoration: none;`

---

## Pages

### 1. Home — `index.html` (from `Home.dc.html`)
The zine "cover."

**Sections, top to bottom:**
1. **Masthead** — bottom border `3px solid #2a2521`, padding `30px 0 18px`.
   - Top row (mono, `11.5px`, letter-spacing `.18em`, color `#b14a1e`): left `VOL.1 · A PERSONAL ZINE`, right `ISSUE: SUMMER 2026`.
   - Title: `Alex Rodriguez` — Gluten 800, `clamp(46px,9vw,104px)`, line-height `.86`, letter-spacing `-.02em`, color `#2a2521`.
   - Tagline (italic Newsreader, `clamp(17px,2.4vw,24px)`, `#5e564b`): "engineer by day, lots of other things otherwise."
   - Bottom mono row (`10.5px`, `#7c5530`): `PRINTED AT HOME` / `HANDLE WITH CARE`.
2. **Contents / Nav** — label `CONTENTS — POKE AROUND` (mono, `#b14a1e`). A list of links, each row:
   index number (mono, `#7c5530`, width `34px`) · label (Gluten 700, `clamp(24px,4vw,38px)`) · spacer · italic sub-caption (`#6e6459`) · a hand-drawn squiggle arrow (SVG). Row hover: background `#fbf2dc`, `padding-left:16px`, and the arrow's two paths animate (stroke-dashoffset draw). Items:
   - `p.04 · Photography · "film, mostly"` → `photography.html`
   - `p.08 · Now · "watching · reading"` → `now.html`
3. **Editor's note + portrait** — two-column grid `1.4fr 1fr`, gap `34px`.
   - Left: a paragraph (Newsreader `clamp(18px,2.4vw,22px)`, line-height `1.7`) mentioning Webflow and DreamWorks with small inline rounded "logo chips" (a `#146EF5` square with white "W"; a `#0a1f4d` square with a small crescent-moon SVG). Keep the exact copy from the prototype.
   - Right: portrait photo (`assets/photos/portrait.png`) in a `4/5` frame, rotated `.8deg`, with a heavy drop shadow and two **masking-tape** strips (gold `rgba(207,154,44,.6)`, torn-edge `clip-path` polygons). The top tape peels in via the `tapePeel` keyframe.
4. **On Film** (teaser) — heading `On Film` (Gluten 800) + link "see the whole roll →" to `photography.html`. A 5-column grid of small film frames (dark `#211d18` mount, sprocket-hole strips top & bottom via `repeating-linear-gradient`, `3/2` image, tiny gold frame number). Each links to `photography.html`; hover lifts/rotates.
5. **Now + The Day Job** — two-column grid `1fr 1fr`, gap `40px`.
   - Left: a bordered card (`2px solid #2a2521`, bg `#fffaf0`) linking to `now.html`. Header bar `#2a2521` / `#f4e8cf` mono "NOW PLAYING →". Rows of `LABEL` (mono `#b14a1e`) + value (Gluten 600). Hover: `box-shadow:5px 5px 0 #2a2521`.
   - Right: "The day job" heading + paragraph + a dark button linking to LinkedIn (`https://www.linkedin.com/in/aroduribe/`). Button hover: `box-shadow:5px 5px 0 #b14a1e`.
6. **Footer / colophon** — top border `3px`, a row of mono links: letterboxd, github, linkedin, "✉ say hello" (mailto). See External Links below.

**Intro loader (first visit only):** A full-screen overlay (`#f4e8cf`, `z-index:9999`) shown only
when `sessionStorage["alex_zine_loaded"]` is unset. Sequence:
- mono `DEVELOPING…` blinking (1s `steps(1)` blink).
- a wavy SVG line "develops" left-to-right via `stroke-dashoffset` draw (`1.7s ease-in-out`).
- name `Alex Rodriguez` (Gluten 800, `clamp(42px,11vw,80px)`) pops in at `1.15s` (`popIn` keyframe).
- Caveat sub-line at `1.6s`: "engineer by day, lots of other things otherwise".
- At `2.2s` overlay starts fading (`opacity` transition `.55s`); at `2.78s` it's removed and the flag is set in `sessionStorage`.
- After the overlay (≈`3.05s`, or `350ms` on repeat visits) the cover's top tape strip plays its `tapePeel` animation.

### 2. Now — `now.html` (from `Now.dc.html`)
**Top nav bar** (shared with Photography): left brand "Alex Rodriguez" (Gluten 800, `25px`) → `index.html`; right links `Photography` → `photography.html`, `Now` (active: `#b14a1e`, `2px` underline).

**Masthead:** mono kicker `SECTION 12 · WATCHING · READING`; `Now` title (Gluten 800, `clamp(48px,9vw,96px)`); right italic blurb.

**The Film Diary:** heading + "↗ follow on letterboxd" link. 2-column grid of films, each = a striped "poster" placeholder block (`70×104`, `2px` ink border) + title (Gluten 700) + year (italic) + star rating (`#b14a1e`) + "logged on Letterboxd". Data array of 4 films in the logic class.

**The Shelf:**
- **Currently reading** card (`2px` ink border, bg `#fffaf0`, offset shadow `5px 5px 0 #e7d9b7`): striped "cover" block + "CURRENTLY READING" kicker + title (Gluten 700, `22px`) + author (italic) + a paragraph listing other books in the stack.
- **Recently finished:** a row of **leaning book spines**. Each spine: `width:122px; aspect-ratio:2/3; border-radius:2px 5px 5px 2px;` colored background (`b.color`), inner ink (`b.ink`), a dark "binding" strip on the left, a small tag, title (Gluten 700), author (italic), rotated by `b.tilt`, overlapped via `margin-left:-14px`, drop shadow. Hover: straighten + lift (`rotate(0) translateY(-7px)`). Sits on a wooden "shelf" bar (`linear-gradient(#5a4632,#4a3826)`). 5 books in the data array (colors/tilts specified in the logic class).

**Footer:** "← back to cover" (→ `index.html`), letterboxd, mailto; right Caveat note "made by hand ✶".

### 3. Photography — `photography.html` (from `Photography.dc.html`)
Same top nav (Photography active).

**Masthead:** kicker `SECTION 04 · CONTACT SHEETS`; `Photography` title; right italic blurb.

**Roll 04 contact sheet:** header line "Roll 04 · 35MM · LAGO LLANQUIHUE, CHILE". A dark
sheet container (`#1c1813`, radius `4px`, big soft shadow) holding a **4-column grid** of frames.
Each frame (`figure`, clickable): top row with frame number (mono gold `#c98a3a`) + "›"; a `3/2`
image with striped fallback bg and filter `sepia(.16) contrast(1.05) saturate(1.05)` (hover
`scale(1.06)`); a mono caption below. 8 frames in array `r4` (a second array `r7` exists in the
logic but isn't currently rendered — treat as future "Roll 07").

**Gear note:** a dashed-border callout (Caveat) "more frames developing — scans dropping in soon ✶".

**Footer:** same as Now.

**Lightbox:** clicking a frame opens a fixed full-screen overlay (`rgba(16,13,10,.975)`, `z-index:9999`)
showing the image (`max-height:92vh`, `object-fit:contain`, subtle sepia). Controls: large `‹`/`›`
prev/next buttons (Gluten 800, `58px`, hover `#e8a23a`) and a circular `✕` close. Behavior:
- Click backdrop or `✕` closes; clicks on the image itself don't close (stopPropagation).
- Prev/next wrap around (modulo over the 8 frames).
- Keyboard: `Esc` closes, `←`/`→` step. (Remove the listener on unmount.)

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Cream / page bg | `#f4e8cf` | page background |
| Paper / card | `#fffaf0` | cards, callouts |
| Ink | `#2a2521` | primary text, borders, dark bars |
| Rust (primary accent) | `#b14a1e` | kickers, links, accents |
| Brown (secondary) | `#7c5530` | mono labels, captions |
| Gold / tape | `rgba(207,154,44,.6)` / `#cf9a2c` | masking tape, frame numbers |
| Amber (lightbox/hover) | `#e8a23a` / `#e7b34c` / `#c98a3a` | lightbox controls, film numbers |
| Muted text | `#5e564b`, `#6e6459`, `#403a33`, `#332e28` | blurbs, body |
| Hairline rules | `#d8c39a`, `#ece0c4`, `#cbb98c`, `#cdbf9f` | list/row dividers, sprockets |
| Film dark | `#1c1813`, `#211d18` | contact-sheet & film mounts |
| Book spines | `#6e6a39`, `#b14a1e`, `#cf9a2c`, `#2a2521`, `#4f6b58` | Now shelf |
| Webflow chip | `#146EF5` | inline logo chip (Home) |
| DreamWorks chip | `#0a1f4d` | inline logo chip (Home) |

### Typography (Google Fonts)
Load: `Caveat (400–700)`, `Gluten (100–900)`, `Newsreader (italic + roman, opsz 6–72, 300–600)`, `Spline Sans Mono (400–600)`.
- **Gluten** — display/headings & UI labels. Weights 600/700/800.
- **Newsreader** (serif) — body copy and italics.
- **Spline Sans Mono** — kickers, captions, frame numbers, nav links. Letter-spacing `.06em`–`.22em`.
- **Caveat** — handwritten accents ("made by hand ✶", loader sub-line, gear note).

Heading scale uses fluid `clamp()` — exact values per page above.

### Spacing / Radius / Shadow
- Column gutter `28px`; section padding ~`30px 0`; grid gaps `10–40px`.
- Radii are small: `2–8px` (books use `2px 5px 5px 2px`). Film mounts/cards mostly square.
- Signature shadow is the **hard offset** `box-shadow: 5px 5px 0 <color>` on hover; photos use soft
  `0 16px 32px -18px rgba(0,0,0,.6)`.

### Keyframes (recreate these)
- `draw` — `stroke-dashoffset → 0` (loader squiggle, nav arrows).
- `popIn` — fade + rise + slight rotate settle (loader title/sub).
- `blink` — opacity pulse (loader `DEVELOPING…`).
- `tapePeel` — 3D `rotateX` peel-in for the cover's top tape strip.
- `scribble` — `stroke-dashoffset → 0` (photo annotation marks; `ring`/`cross` helpers exist but aren't applied to any frame currently).

---

## Assets
In `designs/assets/photos/`:
- `portrait.png` — Home portrait (real).
- `volcano-lake.jpg` — used on Home film strip (`01A`) and Photography Roll 04 frame `01A` (real).
- `taos-pueblo.jpg` — Home film strip frame `11` (real).
- `self-portrait.jpg` — included, not currently placed; available if useful.

**Placeholders to replace:** most film frames on Home and Photography point at
`https://picsum.photos/seed/...` (random stand-ins). These must be swapped for Alex's real 35mm
scans before launch. The project's `uploads/` folder contains candidate scans
(`000051760025.jpg`, `000115090029.jpg`, `photos-….jpg`, etc.) — confirm final selection/captions
with Alex.

## External Links (exact)
- Letterboxd: `https://letterboxd.com/aroduribe/`
- GitHub: `https://github.com/aroduribe`
- LinkedIn: `https://www.linkedin.com/in/aroduribe/`
- Email: `mailto:uribe.rodriguez@gmail.com`

---

## Suggested Implementation Plan (for Claude Code)
1. Scaffold a static site (plain HTML/CSS/JS, or Astro). One page each: `index.html`, `now.html`, `photography.html`.
2. Add the Google Fonts `<link>` and global CSS (cream bg + crosshatch, ink color, 1080px column).
3. Port each page's markup from the matching `.dc.html` prototype; convert inline styles to CSS
   classes/modules; drop the `support.js`/DC runtime.
4. Reimplement the three bits of interactivity in vanilla JS (or React state):
   - Home intro loader (sessionStorage-gated) + tape peel.
   - Photography lightbox (open/close, prev/next wrap, keyboard).
   - Hover states (CSS only).
5. Copy real photos into `/assets`, replace all `picsum.photos` placeholders.
6. **Deploy to GitHub Pages:** create a repo, push the static files, then either enable Pages on the
   `main` branch `/root` (or `/docs`) in repo Settings → Pages, or add a GitHub Actions Pages
   workflow. Custom domain optional via a `CNAME` file.

## Files
- `designs/Home.dc.html` — Home / cover prototype
- `designs/Now.dc.html` — Now page prototype
- `designs/Photography.dc.html` — Photography page prototype
- `designs/support.js` — DC runtime (needed only to preview the prototypes; **do not port**)
- `designs/assets/photos/*` — real photography assets
