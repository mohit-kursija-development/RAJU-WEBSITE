# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository scope

This CLAUDE.md lives in `RAJU-WEBSITE/`, which is the actual git repository (the parent `Raju Enterprises` folder is just a container on disk, not part of git). Always run git commands from inside `RAJU-WEBSITE/`.

## What this is

A static marketing website for RAJU ENTERPRISES (a laundry soap/detergent manufacturer), hosted on GitHub Pages under the custom domain in `CNAME` (rajuenterprise.in). There is no build step, no package manager, and no server-side code — every page is a hand-written static HTML file.

There are **no JS/CSS framework dependencies**: no Bootstrap, no jQuery, no Font Awesome. Styling is a custom design system in `resources/main.css`, behaviour is vanilla JS in `resources/logic.js`, and all icons are inline SVG. The only external request is the Google Fonts stylesheet (Outfit + Inter). Keep it that way — don't reintroduce a CDN framework to solve a layout problem the existing utility classes already cover.

## Running / previewing

There is no build or dev server. To preview changes, open the HTML files directly in a browser or serve the directory with any static file server, e.g.:
```
python3 -m http.server 8000
```
then visit `http://localhost:8000/index.html`.

There are no automated tests or linters configured in this repo.

## Site structure

- `index.html` — home page: hero slideshow, trust marquee, stats, feature grid, story split, product preview, CTA, map
- `products.html` — product listing (6 product cards) + bulk/custom order section
- `founders.html` — "About Us": CEO profile, stats, story timeline, capacity, campaign gallery
- `contact.html` — contact form + info tiles + map
- `resources/main.css` — the single shared stylesheet for all pages (design system + all components + responsive rules)
- `resources/logic.js` — all shared behaviour, one IIFE with a `boot()` at the bottom: mobile nav, sticky-header state, scroll reveal, hero slideshow, soap bubbles, count-up stats, footer year, contact form validation. Every function no-ops when its markup is absent, so the same file is safe to load on every page.
- `resources/images/` — all site imagery
- `Raju Enterprises.pdf` — company brochure, linked from the footer's "Download Brochure" button on every page
- `favicon.ico`, `google9eb8a245f5ce9915.html` — Google Search Console verification file, do not remove
- `CNAME` — GitHub Pages custom domain config
- `ads.txt`, `robots.txt` — SEO/ad network config

## Conventions to follow when editing pages

- **Every page repeats the same `<head>` block, header/nav, footer, floating WhatsApp button and back-to-top button.** There is no templating system, so a change to nav links, footer content, or social/contact links (WhatsApp, phone, Facebook) must be manually copied across all four HTML files to keep them in sync. The phone number `+919699792981` appears many times per page — grep for it and update every hit.
- Mark the current page in the nav with **both** `class="is-active"` and `aria-current="page"` on that one link, and leave the other three plain.
- The footer year is `<span data-year>` — `initYear()` fills every `[data-year]` element on the page. Use that attribute rather than adding a per-page id and inline script.
- **Reuse the design system before writing new CSS.** `main.css` is organised in labelled sections with all theme values as custom properties on `:root` (brand colours, radii, shadows, gradients, `--ease`, `--shell`). Existing building blocks: `.shell` (page gutter), `.section` / `.section--tight` / `.section--soft` / `.section--white`, `.sec-head` + `.eyebrow` + `.sec-title` (+ `.accent` for the gradient-text word), `.btn` with `.btn-primary|white|outline|glass|sm`, `.grid` + `.grid-2|3|4`, `.feature`, `.pcard` + `.specs`, `.split` + `.split-media`, `.stats` + `.stat`, `.timeline`, `.card-soft`, `.field`, `.info-tile`, `.cta`, `.map-frame`, `.ticks`, `.link-arrow`.
- **Brand colours must stay `#0095B6` and `#10687c`** (`--brand` / `--brand-deep`), with `--brand-dark` for dark surfaces and `--accent` for highlights. Don't hardcode hex values in page markup; use the custom properties.
- **Animations:** add `data-reveal` to any new block to give it a scroll-in reveal (`data-reveal="left|right|zoom"` for direction, `data-delay="120"` in ms to stagger siblings). This requires the `js` class that the inline `<script>` in `<head>` adds — keep that script, otherwise `[data-reveal]` elements stay hidden. All animation is wrapped in a `prefers-reduced-motion` guard at the bottom of `main.css`; keep new animation inside that contract.
- `.wave` dividers must sit **inside** the coloured `.page-hero` (absolutely positioned at its bottom) and be filled with the colour of the section that *follows*. Placed after the section they are invisible.
- **Product photos have inconsistent backgrounds** — three are white studio shots, three are PNGs on a green backdrop. `.pcard-media img` therefore uses `object-fit: cover` to fill the frame; switching to `contain` re-exposes each photo's own background as a mismatched box.
- The ten `PHOTO-*.jpg` files are **advertising creatives, not factory photos** — don't describe them as production/facility imagery in alt text. They're used as the decorative (aria-hidden) home hero slideshow and in the About page campaign gallery.
- `robots.txt` explicitly disallows crawling `resources/logic.js` and `resources/main.css` — keep this in mind if adding new shared assets that should (or shouldn't) be crawled.
- The contact form in `contact.html` posts to formsubmit.co (`action="https://formsubmit.co/<hash>"`) — server-side handling is entirely external, there's no backend in this repo. Validation lives in `initContactForm()`: inputs keep their `required` attributes as a no-JS fallback and the script sets `form.noValidate = true` at runtime so its own messages (rendered into each field's `.field-msg`) take over. Don't put `novalidate` in the HTML — that would disable the fallback.
- Google AdSense script tags are present but commented out in the `<head>` of pages (`pagead2.googlesyndication.com`); leave commented unless explicitly asked to enable ads.
- Keep new imagery web-sized. `raju-gota-pack.jpg`, `royal-gota-pack.jpg` and `raju-washing-powder.jpg` are 1200px-wide derivatives of the original multi-megapixel shots (`031A4876+.jpg`, `031A4883 +.jpg`, `IMG_2823.jpg`), which are kept as untouched originals but are *not* referenced by any page.
