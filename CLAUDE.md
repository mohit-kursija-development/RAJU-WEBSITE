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

- `index.html` — home page: hero slideshow, trust marquee, stats, feature grid, story split, product preview, FAQ, CTA, map
- `products.html` — product listing (6 product cards) + bulk/custom order section
- `founders.html` — "About Us": CEO profile, stats, story timeline, capacity, campaign gallery
- `contact.html` — contact form + info tiles + map
- `404.html` — GitHub Pages serves this automatically for unknown paths; it is `noindex` and uses **root-absolute** asset/link paths (`/resources/…`) because it can be served from any URL depth
- `sitemap.xml` — the four indexable URLs, referenced from `robots.txt`
- `resources/main.css` — the single shared stylesheet for all pages (design system + all components + responsive rules)
- `resources/logic.js` — all shared behaviour, one IIFE with a `boot()` at the bottom: mobile nav, sticky-header state, scroll reveal, hero slideshow, soap bubbles, count-up stats, footer year, contact form validation. Every function no-ops when its markup is absent, so the same file is safe to load on every page.
- `resources/images/` — all site imagery
- `Raju Enterprises.pdf` — company brochure, linked from the footer's "Download Brochure" button on every page
- `favicon.ico`, `google9eb8a245f5ce9915.html` — Google Search Console verification file, do not remove
- `CNAME` — GitHub Pages custom domain config
- `ads.txt`, `robots.txt` — SEO/ad network config

## SEO rules (do not regress these)

The canonical host is **`https://rajuenterprise.in`** (no `www`), set by `CNAME`.

- **Never add `Disallow` rules for `/resources/`** in `robots.txt`. Google renders each page to judge mobile-friendliness and Core Web Vitals; blocking the CSS/JS breaks that. This was the single biggest problem with the old setup.
- **Every indexable page needs, in `<head>`:** a unique `<title>` (≈50–60 chars), a unique `<meta name="description">` (≈140–160 chars), `<link rel="canonical">`, `<meta name="robots" content="index, follow, max-image-preview:large, …">`, the full Open Graph + Twitter card set, and a JSON-LD block. Copy the pattern from an existing page.
- The home page canonical is the bare `https://rajuenterprise.in/` (not `/index.html`). Internal links still point at `index.html`; the canonical consolidates them, so don't "fix" one without the other.
- **Adding or renaming a page means updating `sitemap.xml`** — its `<loc>` values must exactly match the pages' `rel=canonical` values. `scripts`-free check: run the audit script described below.
- **Exactly one `<h1>` per page**, and heading levels must not skip (`h1 → h2 → h3`). Footer column headings are `<h3>` (styled by `.footer-col h3`) specifically so the last section's `h2` doesn't jump to `h4`.
- **Every `<img>` needs `alt` plus intrinsic `width`/`height`** attributes. The dimensions cost nothing (CSS still controls display size) and prevent layout shift, which is a ranking signal. Decorative icons take `alt=""`.
- **The FAQ on `index.html` is mirrored in the `FAQPage` JSON-LD.** Google requires marked-up Q&As to match visible text — if you edit one, edit the other. The FAQ uses native `<details>`, whose content is indexable even while collapsed.
- Structured data is a single `@graph` per page: an `Organization`+`LocalBusiness` node and a `WebSite` node (identical on every page), a page-type node (`WebPage`/`CollectionPage`/`AboutPage`/`ContactPage`), plus `BreadcrumbList` on inner pages, `ItemList` of `Product` on products, `Person` on founders, `FAQPage` on the home page.
- **Don't invent facts for schema or copy.** There is deliberately no `foundingDate`, no `openingHours` and no `priceRange`, and `Product` nodes carry no `offers`/price, because none of that is known. The site says "over four decades", never a specific founding year. Verify with the owner before adding any of it.
- Social sharing uses `resources/images/og-image.jpg` (1200×630). It was generated by rendering an HTML card with headless Chrome, so it matches the site's fonts and palette; regenerate it the same way if the branding changes.
- A `<main id="main">` landmark wraps the page body on every page, targeted by the `.skip-link` immediately after `<body>`.

**After touching any page, run the audit:**

```
python3 _tools/seo-audit.py
```

It checks every bullet above — title/description length and uniqueness, canonicals, robots directives, the OG/Twitter set, JSON-LD validity, one-`h1`-no-skipped-levels, `alt` + `width`/`height` on all images, `<main>` presence, sitemap↔canonical agreement, `robots.txt` sanity, and broken local `src`/`href` references. It exits non-zero on failure. `_tools/` is underscore-prefixed so Jekyll keeps it out of the published site.

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
