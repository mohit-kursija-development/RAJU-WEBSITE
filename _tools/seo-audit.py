#!/usr/bin/env python3
"""Static SEO audit for the RAJU ENTERPRISES site.

Run from anywhere:  python3 _tools/seo-audit.py
Exits non-zero if any check fails, so it can gate a deploy.

This directory starts with an underscore, so Jekyll (which GitHub Pages runs by
default) excludes it from the published site.
"""
import json, re, pathlib, html
from html.parser import HTMLParser
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEXABLE = ["index.html", "products.html", "founders.html", "contact.html"]
ALL = INDEXABLE + ["404.html"]

fails, warns = [], []
def bad(m): fails.append(m)
def warn(m): warns.append(m)


class Headings(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.hs = []; s._cur = None; s.imgs = []; s.in_main = 0; s.main = 0
    def handle_starttag(s, t, attrs):
        d = dict(attrs)
        if t in ('h1','h2','h3','h4','h5','h6'):
            s._cur = [int(t[1]), '']
        if t == 'img': s.imgs.append(d)
        if t == 'main': s.main += 1
    def handle_data(s, data):
        if s._cur is not None: s._cur[1] += data
    def handle_endtag(s, t):
        if t in ('h1','h2','h3','h4','h5','h6') and s._cur:
            s.hs.append((s._cur[0], ' '.join(s._cur[1].split()))); s._cur = None


titles, descs, canons = {}, {}, {}

for f in ALL:
    p = ROOT / f
    t = p.read_text()
    head = t.split('</head>')[0]
    label = f

    # --- lang / viewport / charset
    if 'lang="en-IN"' not in t: bad(f'{label}: <html lang> not set to en-IN')
    if 'name="viewport"' not in head: bad(f'{label}: missing viewport meta')
    if 'charset="UTF-8"' not in head: bad(f'{label}: missing charset')

    # --- title
    m = re.search(r'<title>(.*?)</title>', head, re.S)
    if not m: bad(f'{label}: missing <title>')
    else:
        ti = html.unescape(m.group(1).strip()); titles[f] = ti
        if not (15 <= len(ti) <= 65): warn(f'{label}: title length {len(ti)} outside 15-65 ("{ti}")')

    # --- description
    m = re.search(r'<meta name="description" content="([^"]*)"', head)
    if not m: bad(f'{label}: missing meta description')
    else:
        de = html.unescape(m.group(1)); descs[f] = de
        if not (70 <= len(de) <= 165): warn(f'{label}: description length {len(de)} outside 70-165')

    # --- canonical + robots
    m = re.search(r'<link rel="canonical" href="([^"]*)"', head)
    if f in INDEXABLE:
        if not m: bad(f'{label}: missing canonical')
        else: canons[f] = m.group(1)
        r = re.search(r'<meta name="robots" content="([^"]*)"', head)
        if not r: bad(f'{label}: missing robots meta')
        elif 'noindex' in r.group(1): bad(f'{label}: robots says noindex on an indexable page!')
    else:
        r = re.search(r'<meta name="robots" content="([^"]*)"', head)
        if not r or 'noindex' not in r.group(1): bad(f'{label}: 404 page must be noindex')

    # --- Open Graph / Twitter completeness
    for prop in ['og:type','og:title','og:description','og:image','og:url','og:site_name']:
        if f in INDEXABLE and f'property="{prop}"' not in head:
            bad(f'{label}: missing {prop}')
    for nm in ['twitter:card','twitter:title','twitter:description','twitter:image']:
        if f in INDEXABLE and f'name="{nm}"' not in head:
            bad(f'{label}: missing {nm}')

    # --- structured data
    if f in INDEXABLE:
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', t, re.S)
        if not blocks: bad(f'{label}: no JSON-LD')
        for b in blocks:
            try: json.loads(b)
            except Exception as e: bad(f'{label}: JSON-LD parse error: {e}')

    # --- headings / images / main
    hp = Headings(); hp.feed(t)
    h1s = [x for x in hp.hs if x[0] == 1]
    if len(h1s) != 1: bad(f'{label}: {len(h1s)} <h1> (must be exactly 1)')
    levels = [lv for lv, _ in hp.hs]
    for a, b_ in zip(levels, levels[1:]):
        if b_ - a > 1:
            warn(f'{label}: heading level jumps h{a} -> h{b_}'); break
    if hp.main != 1: bad(f'{label}: {hp.main} <main> landmark (must be 1)')

    for im in hp.imgs:
        src = im.get('src','?')
        if 'alt' not in im: bad(f'{label}: <img> without alt: {src}')
        if 'width' not in im or 'height' not in im:
            warn(f'{label}: <img> without width/height (CLS risk): {src}')

    # --- asset existence
    for ref in re.findall(r'(?:src|href)="((?!https?:|mailto:|tel:|#|data:)[^"]+)"', t):
        rp = ROOT / ref.lstrip('/').replace('%20',' ').replace('%2B','+')
        if not rp.exists(): bad(f'{label}: broken reference -> {ref}')

# --- uniqueness
for name, d in (('title', titles), ('description', descs), ('canonical', canons)):
    seen = {}
    for f, v in d.items():
        if f not in INDEXABLE: continue
        if v in seen: bad(f'duplicate {name} on {f} and {seen[v]}')
        seen[v] = f

# --- robots.txt
rt = (ROOT / 'robots.txt').read_text()
if re.search(r'Disallow:\s*/resources', rt): bad('robots.txt still blocks /resources (blocks rendering)')
if 'Sitemap:' not in rt: bad('robots.txt has no Sitemap directive')

# --- sitemap vs canonicals
sm = ET.parse(ROOT / 'sitemap.xml').getroot()
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
locs = {u.find('s:loc', ns).text for u in sm.findall('s:url', ns)}
cans = set(canons.values())
if locs != cans:
    bad(f'sitemap/canonical mismatch: only-in-sitemap={locs-cans} only-in-canonical={cans-locs}')

print('=' * 66)
print(f'  SEO AUDIT — {len(ALL)} pages')
print('=' * 66)
if fails:
    print(f'\nFAIL ({len(fails)}):')
    for m in fails: print('  x', m)
else:
    print('\nNo failures.')
if warns:
    print(f'\nWARN ({len(warns)}):')
    for m in warns: print('  !', m)
else:
    print('No warnings.')

print('\n--- titles ---')
for f in INDEXABLE: print(f'  [{len(titles[f]):>2}] {f:15} {titles[f]}')
print('--- descriptions ---')
for f in INDEXABLE: print(f'  [{len(descs[f]):>3}] {f:15} {descs[f][:88]}...')
print('--- canonicals ---')
for f in INDEXABLE: print(f'  {f:15} {canons[f]}')

import sys
sys.exit(1 if fails else 0)
