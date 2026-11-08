#!/usr/bin/env python3
"""Builds the Halcyon Literary House site into ./dist.
Wording for services, team, reviews and books lives in content.py.
Run:  python3 build.py
"""
import os, html, shutil, re
try:
    from PIL import Image
except ImportError:
    Image = None
from content import *

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, os.environ.get("HL_OUT", "dist"))
SITE = "https://halcyonliterary.com"
FORM_ACTION = "/api/contact"
import hashlib as _h
ASSET_V = _h.md5(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"css/site.css"),"rb").read()+open(os.path.join(os.path.dirname(os.path.abspath(__file__)),"js/site.js"),"rb").read()).hexdigest()[:8]

e = html.escape
NT = 'translate="no"'

ICONS = {
    "youtube": '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>',
    "facebook": '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.6c0-.9.6-1.1 1-1.1h2.6V1.6L14 1.5c-4 0-4.9 3-4.9 4.9v2.1H6.8v4h2.3V22.5h4.9V12.5h3.3l.4-4H14z"/></svg>',
    "instagram": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "globe": '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5s1.3-6.7 3.9-9.5z"/></svg>',
}
SOCIAL = [
    ("youtube", "YouTube", "https://www.youtube.com/channel/UCqBs1GNDCfhnReDUW3O8X4w"),
    ("facebook", "Facebook", "https://www.facebook.com/share/1HvPxzsmr6/?mibextid=wwXIfr"),
    ("instagram", "Instagram", "https://www.instagram.com/halcyonliteraryhouse/"),
]

# ---------------------------------------------------------------- layout
def head(title, desc, path):
    url = SITE + "/" + ("" if path == "index.html" else path)
    schema = ""
    if path == "index.html":
        import json as _j
        org = {"@context": "https://schema.org", "@type": "Organization", "name": "Halcyon Literary House",
               "url": SITE + "/", "logo": SITE + "/assets/logo.svg", "email": "hello@halcyonliterary.com",
               "description": BRAND_LINE, "sameAs": [u for _, _, u in SOCIAL]}
        schema = '\n<script type="application/ld+json">' + _j.dumps(org) + '</script>'
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0b0a09">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Halcyon Literary House">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="{SITE}/assets/og-image.jpg">{schema}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css?v={ASSET_V}">
<script src="js/site.js?v={ASSET_V}"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""

def header(active):
    links = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if k == active else ""}>{e(t)}</a>' for h, t, k in NAV)
    return f"""<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="index.html" aria-label="Halcyon Literary House, home">
      <img src="assets/logo-light.svg" alt="Halcyon Literary House" height="40">
    </a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <div class="lang lang-mobile">
        <label for="lang-pick-m">Language</label>
        {ICONS['globe']}
        <select id="lang-pick-m" data-lang-picker {NT}></select>
      </div>
      {links}
      <a class="btn btn-primary" href="contact.html"{" aria-current=\"page\"" if active == "contact" else ""}>{e(CTA_LABEL)}</a>
    </nav>
    <div class="lang">
      <label for="lang-pick">Language</label>
      {ICONS['globe']}
      <select id="lang-pick" data-lang-picker {NT}></select>
    </div>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
  </div>
</header>
<main id="main">
"""

def footer():
    social = "".join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}">{ICONS[k]}</a>' for k, n, u in SOCIAL)
    svc = "".join(f'<li><a href="services.html#{s[0]}">{e(s[1])}</a></li>' for s in SERVICES)
    extra_links = "".join(f'\n          <li><a href="{p["slug"]}.html">{e(p["title"])}</a></li>' for p in PAGES if p.get("show_in_footer", True))
    return f"""</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="index.html" aria-label="Halcyon Literary House, home">
          <img src="assets/logo-light.svg" alt="Halcyon Literary House" height="46">
        </a>
        <p class="foot-line">{e(BRAND_LINE)}</p>
        <div class="social">{social}</div>
      </div>
      <div>
        <h2>Services</h2>
        <ul>{svc}</ul>
      </div>
      <div>
        <h2>The house</h2>
        <ul>
          <li><a href="how-it-works.html">Process</a></li>
          <li><a href="titles-authors.html">Authors</a></li>
          <li><a href="team.html">Team</a></li>
          <li><a href="author-stories.html">Reviews</a></li>
          <li><a href="case-studies.html">Case studies</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="roadmap.html">The Growth Roadmap</a></li>
{extra_links}
          <li><a href="https://picked.halcyonliterary.com" target="_blank" rel="noopener" {NT}>Picked by Halcyon</a></li>
          <li><a href="https://directory.halcyonliterary.com" target="_blank" rel="noopener" {NT}>Author Directory</a></li>
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li><a href="mailto:hello@halcyonliterary.com" {NT}>hello@halcyonliterary.com</a></li>
          <li><a href="contact.html">{e(CTA_LABEL)}</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-base">
      <span>© <span data-year>2026</span> <span {NT}>Halcyon Literary House</span>, United States</span>
      <a href="legal.html">Privacy and terms</a>
    </div>
  </div>
</footer>
</body>
</html>
"""

def page(path, title, desc, active, body):
    with open(os.path.join(OUT, path), "w", encoding="utf-8") as f:
        f.write(head(title, desc, path) + header(active) + body + footer())

def cta(text, sub, btn=CTA_LABEL, href="contact.html"):
    return f"""<section class="section dark cta-band">
  <div class="wrap">
    <div>
      <h2>{e(text)}</h2>
      <p class="lede">{e(sub)}</p>
    </div>
    <a class="btn btn-primary" href="{href}">{e(btn)}</a>
  </div>
</section>
"""

def page_head(h1, lede):
    return f"""<section class="page-head dark">
  <div class="wrap">
    <h1>{e(h1)}</h1>
    <p class="lede">{e(lede)}</p>
  </div>
</section>
"""

def books_grid(cls="", items=None):
    out = []
    for img, t, a, g, series in (items if items is not None else BOOKS):
        ser = f'<span class="b-series" {NT}>{e(series)}</span>' if series else ""
        try:
            w, h = Image.open(os.path.join(HERE, "assets", "books", img)).size
        except Exception:
            w, h = 2, 3
        wide = " wide" if w > h else ""
        out.append(f"""<figure class="book{wide}">
  <img src="assets/books/{img}" alt="{e(t)}, {e(a)}" {NT} loading="lazy" width="400" height="600">
  <figcaption><span class="b-title" {NT}>{e(t)}</span><span class="b-author" {NT}>{e(a)}</span><span class="b-genre">{e(g)}</span>{ser}<a class="b-buy" href="{BUY_LINKS[img]}" target="_blank" rel="noopener">Buy the book<span class="visually-hidden" {NT}>: {e(t)}</span></a></figcaption>
</figure>""")
    return f'<div class="books {cls}">' + "\n".join(out) + "</div>"

def portrait(img, name, kind="card"):
    """Team photo, or a gold initials badge when no photo file is available yet."""
    if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "team", img)):
        size = ' width="400" height="500"' if kind == "card" else ""
        return f'<img src="assets/team/{img}" alt="{e(name)}" loading="lazy"{size}>'
    initials = "".join(p[0] for p in name.replace(".", "").split()[:2]).upper()
    return f'<span class="monogram" role="img" aria-label="{e(name)}" {NT}>{e(initials)}</span>'

def member_card(m, link_to_team):
    key, img, name, role, blurb, _ = m
    inner = f"""{portrait(img, name)}
  <span class="m-name" {NT}>{e(name)}</span><span class="m-role">{e(role)}</span>"""
    if link_to_team:
        return f'<a class="member" href="team.html#bio-{key}">{inner}</a>'
    return f"""<button class="member" type="button" data-bio="bio-{key}" aria-haspopup="dialog">{inner}
  <span class="m-blurb">{e(blurb)}</span><span class="m-more">Read the profile</span></button>"""

def bio_dialog(m):
    key, img, name, role, _, paras = m
    ps = "".join(f"<p>{e(p)}</p>" for p in paras)
    return f"""<dialog class="bio" id="bio-{key}" aria-labelledby="bio-{key}-h">
  <button class="bio-close" type="button" aria-label="Close">×</button>
  <div class="bio-inner">
    {portrait(img, name, 'bio')}
    <div class="bio-text"><p class="m-role">{e(role)}</p><h3 id="bio-{key}-h" {NT}>{e(name)}</h3>{ps}</div>
  </div>
</dialog>"""

def brief_form(fid):
    opts = "".join(f'<option value="{e(s)}">{e(s)}</option>' for s in STAGES)
    return f"""<div class="form-card">
  <form class="form-fields" data-hl-form action="{FORM_ACTION}" method="POST">
    <input type="hidden" name="lang" value="en" data-lang-field>
    <input type="hidden" name="started" value="" data-started>
    <input type="hidden" name="form" value="consultation">
    <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>
    <div class="form-row">
      <div class="field"><label for="{fid}-name">Your name</label><input id="{fid}-name" type="text" name="name" autocomplete="name" required></div>
      <div class="field"><label for="{fid}-email">Email address</label><input id="{fid}-email" type="email" name="email" autocomplete="email" required></div>
    </div>
    <div class="field"><label for="{fid}-book">Book title and genre</label><input id="{fid}-book" type="text" name="book" required></div>
    <div class="field"><label for="{fid}-stage">Where is your book today?</label><select id="{fid}-stage" name="stage" required>{opts}</select></div>
    <div class="field"><label for="{fid}-tried">What have you tried so far? <span class="optional">(optional)</span></label><textarea id="{fid}-tried" name="tried"></textarea></div>
    <div class="field"><label for="{fid}-goal">What would success look like for this book?</label><textarea id="{fid}-goal" name="goal" required></textarea></div>
    <button class="btn btn-primary" type="submit" data-sending="Sending your request…">{e(CTA_LABEL)}</button>
    <p class="form-error" role="alert" hidden>Your message could not be sent. Please try again in a moment, or write to us directly at hello@halcyonliterary.com.</p>
    <p class="form-note">Every request is read by our team. We reply within two business days.</p>
  </form>
  <div class="form-done" aria-live="polite">
    <h3>Thank you. Your request is with us.</h3>
    <p>A member of our team will reply within two business days.</p>
    <p>If your request is urgent, or to make sure our reply does not land in spam, write to us at <a href="mailto:hello@halcyonliterary.com" {NT}>hello@halcyonliterary.com</a>.</p>
  </div>
</div>"""

# ---------------------------------------------------------------- pages
def home():
    shelf = "".join(f'<img src="assets/books/{b[0]}" alt="{e(b[1])}, {e(b[2])}" {NT} width="300" height="450">' for b in [BOOKS[2], BOOKS[5], BOOKS[4], BOOKS[1]])
    contents = []
    for k, name, plain, h, p, inc, close in SERVICES:
        contents.append(f"""<li><a href="services.html#{k}">
  <span class="c-head"><span class="c-title"><span {NT}>{e(name)}</span></span><span class="c-leader" aria-hidden="true"></span></span>
  <span class="c-go">{e(plain)}</span>
  <p class="c-desc">{e(h)}</p>
</a></li>""")
    quotes = "".join(f"""<div class="q"><blockquote>{e(short)}</blockquote><p class="q-meta"><strong {NT}>{e(n)}</strong>{e(s)}</p></div>"""
                     for q, n, s, short in REVIEWS if short)
    team = "".join(member_card(m, True) for m in CORE_TEAM)
    results = "".join(f"""<a class="result" href="case-studies.html#{c[0]}"><span class="r-num">{e(c[4])}</span><span class="r-label">{e(c[5])}</span><span class="r-who"><span {NT}>{e(c[1])}</span>, <span {NT}>{e(c[2])}</span></span></a>""" for c in CASE_STUDIES)
    body = f"""
<section class="hero dark">
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <p class="kicker">{e(BRAND_LINE)}</p>
        <h1>Your book deserves a house.</h1>
        <p class="lede">One senior team shapes, positions and launches your book, then builds the readership that carries it forward.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="contact.html">{e(CTA_LABEL)}</a>
          <a class="btn btn-ghost" href="services.html">Explore our services</a>
        </div>
      </div>
      <div class="shelf" role="group" aria-label="Books from authors we work with">
        <div class="shelf-books">{shelf}</div>
      </div>
    </div>
    <div class="hero-foot">
      <div><strong>Eight specialists</strong>in one house, each named on your project</div>
      <div><strong>Six disciplines</strong>from the first page to the press room</div>
      <div><strong>One plan</strong>for your book, written before any work begins</div>
    </div>
  </div>
</section>

<section class="section" id="about">
  <div class="wrap split">
    <div class="split-img cover-fan" role="img" aria-label="Books published by Halcyon authors"><img src="assets/books/thresholds.jpg" alt="" loading="lazy" width="400" height="600"><img src="assets/books/wrecked-by-you.jpg" alt="" loading="lazy" width="400" height="600"><img src="assets/books/kenya-safari.jpg" alt="" loading="lazy" width="400" height="600"></div>
    <div>
      <p class="kicker">The house</p>
      <h2>Most books are not rejected. They are simply never seen.</h2>
      <p>A beautifully written book can still disappear when its production, positioning, marketing and readers are handled by people who never speak to each other.</p>
      <p>Halcyon brings that work under one roof. We find what is holding your book back, place it with the right specialist, and connect every step to one outcome: readers who choose your book.</p>
      <p><a class="text-link" href="how-it-works.html">See how we work</a></p>
    </div>
  </div>
</section>

<section class="section band" id="services">
  <div class="wrap">
    <p class="kicker">Services</p>
    <h2>Six disciplines. One house.</h2>
    <p class="lede">Engage a single discipline, or let us compose a complete plan around what your book needs most.</p>
    <ul class="contents">{"".join(contents)}</ul>
  </div>
</section>

<section class="section">
  <div class="wrap split top">
    <div>
      <p class="kicker">Who we work with</p>
      <h2>Authors who treat their book as serious work.</h2>
      <p class="lede">You don’t need to know which service to choose. You need to know what you want for your book. We take it from there.</p>
    </div>
    <ul class="checks">
      <li>First-time authors who want a professional path to publication</li>
      <li>Published authors whose books deserve to be found</li>
      <li>Authors preparing a launch, a relaunch or a new edition</li>
      <li>Writers who want readers, not another list of tactics</li>
      <li>Authors building a body of work and a lasting platform</li>
    </ul>
  </div>
</section>

<section class="section" id="results">
  <div class="wrap">
    <p class="kicker">Results</p>
    <h2>What the right work, in the right order, can do.</h2>
    <div class="results">{results}</div>
    <p style="margin-top:28px"><a class="text-link" href="case-studies.html">Read the case studies</a></p>
  </div>
</section>

<section class="section dark" id="process">
  <div class="wrap">
    <p class="kicker">Process</p>
    <h2>Clear work, in the right order.</h2>
    <p class="lede">Every engagement begins with the one problem that limits everything after it.</p>
    <ol class="steps">
      <li><h3>Private consultation</h3><p>Tell us about your book, where it stands, and what you want it to achieve.</p></li>
      <li><h3>The assessment</h3><p>We study the book’s foundation, positioning, discoverability and path to readers.</p></li>
      <li><h3>Your appointed team</h3><p>The specialists suited to your book take ownership of clear deliverables.</p></li>
      <li><h3>The next chapter</h3><p>With the first constraint resolved, we plan what brings the next level of growth.</p></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="kicker">Our authors</p>
    <h2>Readers judge with their eyes before they give their time.</h2>
    <p class="lede">A selection of books from authors we work alongside.</p>
    {books_grid("six", BOOKS[:6])}
    <p class="fineprint">All cover artwork remains the property of its author and rights holder. <a href="titles-authors.html">Meet our authors</a></p>
  </div>
</section>

<section class="section band">
  <div class="wrap">
    <p class="kicker">Team</p>
    <h2>The people who will know your book by name.</h2>
    <p class="lede">Your project is led by a core team, with specialist collaborators joining when their craft is needed.</p>
    <div class="team">{team}</div>
    <p style="margin-top:36px"><a class="text-link" href="team.html">Meet the full team</a></p>
  </div>
</section>

<section class="section dark">
  <div class="wrap">
    <p class="kicker">In their words</p>
    <div class="quote-rotator" role="region" aria-roledescription="carousel" aria-label="Author reviews">
      {quotes}
      <div class="q-controls">
        <button type="button" data-prev aria-label="Previous review">‹</button>
        <button type="button" data-next aria-label="Next review">›</button>
        <span class="q-count" aria-live="polite"></span>
        <a class="text-link" href="author-stories.html">Read every review</a>
      </div>
    </div>
    <p class="fineprint">Individual experiences vary by book, market, timing, platform conditions and execution.</p>
  </div>
</section>

<section class="section" id="reader-sites">
  <div class="wrap">
    <p class="kicker">Beyond the house</p>
    <h2>Where readers find their next book.</h2>
    <p class="lede">Halcyon also runs two destinations for readers. Both put good books in front of the people most likely to love them.</p>
    <div class="imprints">
      <a class="imprint" href="https://picked.halcyonliterary.com" target="_blank" rel="noopener">
        <span class="imp-name" {NT}>Picked by Halcyon</span>
        <span class="imp-line">Books we would actually hand to a friend.</span>
        <span class="imp-desc">Editorial book picks across eight genre shelves, with the story of why each book was chosen and the author behind it. Readers can receive the picks by email, and authors can submit their books for consideration.</span>
        <span class="imp-go">Visit Picked by Halcyon</span>
      </a>
      <a class="imprint" href="https://directory.halcyonliterary.com" target="_blank" rel="noopener">
        <span class="imp-name" {NT}>Halcyon Author Directory</span>
        <span class="imp-line">Find your next book by the mood you are in.</span>
        <span class="imp-desc">A free directory where readers browse books by genre and mood, meet authors, and discover reading groups and bookshops. Authors can be listed with a managed listing.</span>
        <span class="imp-go">Visit the Author Directory</span>
      </a>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="promo">
      <div>
        <p class="kicker">Complimentary</p>
        <h2>The Indie Author Growth Roadmap</h2>
        <p>A 22-page field guide to your publishing foundation, your position in the market, your path to readers and your next 90 days. Read it before you spend on another tactic.</p>
        <a class="btn btn-primary" href="roadmap.html">Receive the roadmap</a>
      </div>
      <div class="guide-cover" aria-hidden="true"><small>Halcyon field guide</small><b>The Indie Author Growth Roadmap</b><span></span></div>
    </div>
  </div>
</section>

<section class="section band" id="contact">
  <div class="wrap split top">
    <div>
      <p class="kicker">Private consultation</p>
      <h2>Begin with a conversation about your book.</h2>
      <p class="lede">Tell us where your book stands and where you want it to go. We will read every word and reply with the clearest next step.</p>
      <p><a class="text-link" href="faq.html">Questions first? Read the FAQ</a></p>
      <ul class="contact-lines">
        <li><a href="mailto:hello@halcyonliterary.com" {NT}>hello@halcyonliterary.com</a></li>
      </ul>
    </div>
    {brief_form("brief-home")}
  </div>
</section>
"""
    page("index.html", "Halcyon Literary House | A Private Literary House for Independent Authors",
         "Halcyon Literary House is a private literary house for independent authors: book production, positioning, marketing, reader connections, author platforms and PR, under one roof.",
         "home", body)

def services():
    jump = "".join(f'<a href="#{s[0]}" {NT}>{e(s[1])}</a>' for s in SERVICES)
    secs = []
    for k, name, plain, h, p, inc, close in SERVICES:
        li = "".join(f"<li>{e(i)}</li>" for i in inc)
        showcase = ""
        if k == "systems":
            cards = "".join(f"""<a class="work" href="{url}" target="_blank" rel="noopener">
        <span class="work-covers">{"".join(f'<img src="assets/books/{c}" alt="" loading="lazy" width="248" height="399">' for c in covers)}</span>
        <span class="work-text"><span class="work-name" {NT}>{e(who)}</span><span class="work-desc">{e(desc)}</span><span class="work-go">Visit the website</span></span>
      </a>""" for who, url, covers, desc in WEB_WORK)
            showcase = f"""
    <div class="work-wrap">
      <h3>Recent work</h3>
      {cards}
    </div>"""
        secs.append(f"""<section class="svc" id="{k}">
  <div class="wrap svc-grid">
    <div>
      <p class="svc-name"><span {NT}>{e(name)}</span><small>{e(plain)}</small></p>
      <h2>{e(h)}</h2>
      <p>{e(p)}</p>
      <p class="tagline">{e(close)}</p>
      <a class="btn btn-ghost" href="contact.html">Enquire about <span {NT}>{e(name)}</span></a>
    </div>
    <div>
      <h3>What it can include</h3>
      <ul class="checks cols-2">{li}</ul>
    </div>{showcase}
  </div>
</section>""")
    body = f"""
<section class="page-head dark">
  <div class="wrap">
    <h1>Services</h1>
    <p class="lede">Six signature disciplines, each led by a specialist, all connected by one plan for your book.</p>
    <nav class="jump" aria-label="Services on this page">{jump}</nav>
  </div>
</section>
<section class="section band">
  <div class="wrap split">
    <h2>Your book doesn’t need more tactics. It needs the right work, in the right order.</h2>
    <div>
      <p class="lede">We help independent authors produce professional books, sharpen their position in the market, reach their readers and build a platform that keeps working long after launch week.</p>
      <a class="btn btn-primary" href="contact.html">{e(CTA_LABEL)}</a>
    </div>
  </div>
</section>
{"".join(secs)}
<section class="section band">
  <div class="wrap split">
    <h2>Common questions, answered plainly.</h2>
    <div><p class="lede">Pricing, guarantees, ownership, refunds and who will work on your book.</p><a class="btn btn-ghost" href="faq.html">Read the FAQ</a></div>
  </div>
</section>
{cta("Not sure where to begin?", "Begin with the book, not the menu. Tell us where it stands and we will recommend the right first step.")}"""
    page("services.html", "Services | Halcyon Literary House",
         "Edition, Signal, Launch, Circle, Estate and Press: book production, positioning, marketing, reader connections, author platforms and PR for independent authors.", "services", body)

def how():
    body = f"""
{page_head("Process", "A clear path from a question about your book to a plan you can hold us to.")}
<section class="section">
  <div class="wrap split">
    <div><p class="kicker">Our approach</p><h2>We diagnose before we prescribe.</h2></div>
    <div>
      <p class="lede">A weak cover cannot be fixed with advertising. Unclear positioning cannot be fixed with more posts. A launch cannot build a lasting audience without a way to keep it. So we find the first constraint, resolve it, and only then move forward.</p>
      <a class="btn btn-primary" href="contact.html">{e(CTA_LABEL)}</a>
    </div>
  </div>
</section>
<section class="section dark">
  <div class="wrap">
    <h2>Five stages. One connected strategy.</h2>
    <ol class="steps five">
      <li><h3>Consultation</h3><p>Share your title, genre, stage, goals and what you have already tried. We want the facts: what works, what doesn’t, and what success would change for you.</p></li>
      <li><h3>Assessment</h3><p>We study the book’s foundation, positioning, discoverability and path to readers, and name the first problem that limits everything after it.</p></li>
      <li><h3>Proposal</h3><p>You receive a written proposal: the problem, the order of work, your appointed specialist, the deliverables and the timeline, before any paid work begins.</p></li>
      <li><h3>Production</h3><p>Your specialists do the work, with agreed review points, so you always know what is complete and what comes next.</p></li>
      <li><h3>Growth</h3><p>With the first constraint resolved, we plan the next stage, whether that is a launch, a relaunch or a lasting author platform.</p></li>
    </ol>
  </div>
</section>
<section class="section">
  <div class="wrap split top">
    <div>
      <p class="kicker">Your proposal</p>
      <h2>A plan you understand before the work begins.</h2>
      <p class="lede">We recommend the smallest engagement that achieves the outcome, never every service we offer. Your proposal sets out exactly what will happen, who will do it and when.</p>
      <p class="tagline">No guesswork. No scattered handoffs.</p>
    </div>
    <ul class="checks cols-2">
      <li>A clear objective</li><li>The priority diagnosis</li><li>Your named specialist</li><li>Defined deliverables</li>
      <li>A timeline</li><li>Review points</li><li>What we need from you</li><li>The recommended next stage</li>
    </ul>
  </div>
</section>
<section class="section band">
  <div class="wrap split">
    <div><p class="kicker">Your team</p><h2>The specialist follows the problem.</h2></div>
    <div>
      <p class="lede">A production question goes to production. A discovery question goes to positioning. A reader goal goes to community. Your engagement can be focused or span several disciplines, and ownership is always clear.</p>
      <a class="text-link" href="team.html">Meet the team</a>
    </div>
  </div>
</section>
{cta("Take the first step.", "Tell us where your book stands today. We will reply within two business days.")}"""
    page("how-it-works.html", "Process | Halcyon Literary House",
         "How Halcyon assesses what is holding a book back, writes a clear proposal and appoints the right specialists.", "how", body)

def titles():
    body = f"""
{page_head("Our authors", "Different books, different readers, one standard of care.")}
<section class="section">
  <div class="wrap">
    <h2 style="max-width:20em">No two books share a reader. Each one deserves its own path.</h2>
    <p class="lede">A selection of the stories, genres and ideas from authors we work alongside.</p>
    {books_grid()}
    <p class="fineprint">Cover artwork and title rights remain with their authors and rights holders.</p>
  </div>
</section>
{cta("Your cover is the first page of your marketing.", "Edition and Signal make sure it says the right thing to the right reader.", "Explore Edition and Signal", "services.html#publish")}"""
    page("titles-authors.html", "Our Authors | Halcyon Literary House",
         "Books from independent authors who work with Halcyon Literary House.", "titles", body)

def team():
    core = "".join(member_card(m, False) for m in CORE_TEAM)
    col = "".join(member_card(m, False) for m in COLLABORATORS)
    dialogs = "\n".join(bio_dialog(m) for m in CORE_TEAM + COLLABORATORS)
    body = f"""
{page_head("Team", "The people who lead your project, and the specialists who join when their craft is needed.")}
<section class="section" id="core-team">
  <div class="wrap">
    <p class="kicker">Core team</p>
    <h2>The people who will guide your book.</h2>
    <p class="lede">Our team works with Halcyon on a part-time and project basis. Before any work begins, you will know exactly who is responsible for it. Select a profile to read more.</p>
    <div class="team">{core}</div>
  </div>
</section>
<section class="section band" id="collaborators">
  <div class="wrap">
    <p class="kicker">Specialist collaborators</p>
    <h2>Additional craft, when your book calls for it.</h2>
    <div class="team five">{col}</div>
  </div>
</section>
{cta("Speak with Kate about your book.", "Kate will listen, answer your questions and introduce you to the right specialist.", "Start the conversation")}
{dialogs}"""
    page("team.html", "Team | Halcyon Literary House",
         "Meet the Halcyon Literary House team and specialist collaborators.", "team", body)

def stories():
    cards = []
    for i, (q, n, s, _) in enumerate(REVIEWS):
        cls = "review lead" if i == 0 else "review"
        cards.append(f"""<figure class="{cls}"><blockquote>{e(q)}</blockquote><figcaption><span class="r-name" {NT}>{e(n)}</span><span class="r-service">{e(s)}</span></figcaption></figure>""")
    body = f"""
{page_head("Reviews", "In their own words: authors on working with Halcyon.")}
<section class="section band">
  <div class="wrap">
    <h2>The work is technical. The experience is personal.</h2>
    <div class="reviews">{"".join(cards)}</div>
    <p class="fineprint">These reviews describe individual client experiences. Outcomes vary by book, market, timing, platform conditions and execution.</p>
  </div>
</section>
{cta("Your book could be the next story.", "Tell us where it stands and where you want it to go.")}"""
    page("author-stories.html", "Reviews | Halcyon Literary House",
         "Reviews from authors who worked with Halcyon Literary House on publishing, design, launch strategy and reader growth.", "stories", body)

def contact():
    body = f"""
{page_head("Private consultation", "Tell us about your book. We will reply with the clearest next step.")}
<section class="section band">
  <div class="wrap split top">
    <div>
      <h2>Where is your book today, and where do you want it to go?</h2>
      <p class="lede">You don’t need to choose a service. Describe the book, its stage and the result that matters to you. We will read every word personally and reply within two business days.</p>
      <ul class="contact-lines">
        <li><a href="mailto:hello@halcyonliterary.com" {NT}>hello@halcyonliterary.com</a></li>
      </ul>
    </div>
    {brief_form("brief-contact")}
  </div>
</section>"""
    page("contact.html", "Private Consultation | Halcyon Literary House",
         "Request a private consultation with Halcyon Literary House about your book.", "contact", body)

def roadmap():
    body = f"""
{page_head("The Indie Author Growth Roadmap", "A complimentary 22-page field guide to finding the right next move for your book.")}
<section class="section band">
  <div class="wrap split top">
    <div>
      <h2>Inside the roadmap</h2>
      <ul class="checks">
        <li>Your publishing foundation</li>
        <li>Your position in the market</li>
        <li>Your path to readers</li>
        <li>Building lasting reader relationships</li>
        <li>A 90-day plan</li>
        <li>A scorecard, worksheets and answers to common questions</li>
        <li>Lessons from other authors</li>
      </ul>
      <p class="form-note" style="margin-top:20px">Reads well on phone, tablet and computer. If your browser opens the PDF instead of saving it, use the download icon in the viewer.</p>
    </div>
    <div class="form-card">
      <form class="form-fields" data-hl-form action="{FORM_ACTION}" method="POST">
        <input type="hidden" name="lang" value="en" data-lang-field>
    <input type="hidden" name="started" value="" data-started>
        <input type="hidden" name="form" value="roadmap">
        <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>
        <div class="field"><label for="rm-name">Your name</label><input id="rm-name" type="text" name="name" autocomplete="name" required></div>
        <div class="field"><label for="rm-email">Email address</label><input id="rm-email" type="email" name="email" autocomplete="email" required></div>
        <p class="form-error" role="alert" hidden>Your message could not be sent. Please try again in a moment, or write to us directly at hello@halcyonliterary.com.</p>
        <button class="btn btn-primary" type="submit" data-sending="Preparing your roadmap…">Receive the roadmap</button>
        <p class="form-note">By continuing, you agree to receive emails about this guide and related author support. You can unsubscribe at any time.</p>
      </form>
      <div class="form-done" aria-live="polite">
        <h3>Your roadmap is ready.</h3>
        <p>Download it now and keep it on any device.</p>
        <a class="btn btn-primary" data-roadmap-link href="#" download>Download the roadmap (PDF)</a>
      </div>
    </div>
  </div>
</section>"""
    page("roadmap.html", "The Indie Author Growth Roadmap | Halcyon Literary House",
         "Receive the complimentary 22-page Indie Author Growth Roadmap for independent authors.", "", body)

def case_studies():
    blocks = []
    for k, who, svc, plain, num, lab, start, work, result in CASE_STUDIES:
        blocks.append(f"""<article class="case" id="{k}">
  <div class="case-head">
    <p class="case-svc"><span {NT}>{e(svc)}</span><small>{e(plain)}</small></p>
    <h2 {NT}>{e(who)}</h2>
  </div>
  <div class="case-num"><span class="r-num">{e(num)}</span><span class="r-label">{e(lab)}</span></div>
  <dl class="case-body">
    <div><dt>Where it started</dt><dd>{e(start)}</dd></div>
    <div><dt>What we did</dt><dd>{e(work)}</dd></div>
    <div><dt>The result</dt><dd>{e(result)}</dd></div>
  </dl>
</article>""")
    body = f"""
{page_head("Case studies", "Three books, three different problems, and what changed when each was solved in the right order.")}
<section class="section">
  <div class="wrap cases">
    {"".join(blocks)}
    <p class="fineprint">These results describe individual campaigns. Outcomes vary by book, market, timing, platform conditions and execution.</p>
  </div>
</section>
{cta("Your book could be the next case study.", "Tell us where it stands and where you want it to go.")}"""
    page("case-studies.html", "Case Studies | Halcyon Literary House",
         "How Halcyon helped independent authors grow reviews and sales through newsletter promotion, book club campaigns and Amazon audits.", "", body)

def faq():
    items = "".join(f"""<details class="faq-item"><summary>{e(q)}</summary><p>{e(a)}</p></details>""" for q, a in FAQ)
    body = f"""
{page_head("Questions, answered", "What authors most often ask before working with us.")}
<section class="section">
  <div class="wrap faq">
    {items}
    <p class="faq-more">Have a question that isn’t here? <a class="text-link" href="contact.html">Ask it in your consultation request</a>.</p>
  </div>
</section>
{cta("Ready when you are.", "Tell us about your book and we will reply within two business days.")}"""
    page("faq.html", "FAQ | Halcyon Literary House",
         "Answers to common questions about working with Halcyon Literary House: pricing, guarantees, ownership, refunds and timelines.", "", body)

def linkify(text):
    """escape text, then turn email addresses and web links into links"""
    t = e(text)
    t = re.sub(r"([\w.+]+@[\w-]+\.[\w.]+)", lambda m: f'<a href="mailto:{m.group(1)}" {NT}>{m.group(1)}</a>', t)
    t = re.sub(r"(https?://[^\s<]+)", lambda m: f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)}</a>', t)
    return t

def legal():
    secs = ""
    for i, s in enumerate(LEGAL["sections"]):
        style = ' style="margin-top:0"' if i == 0 else ""
        secs += f"\n    <h2{style}>{e(s['heading'])}</h2>" + "".join(f"\n    <p>{linkify(p)}</p>" for p in s["paras"])
    body = f"""
{page_head(LEGAL.get("title", "Privacy and terms"), LEGAL.get("intro", ""))}
<section class="section">
  <div class="wrap prose">{secs}
  </div>
</section>"""
    page("legal.html", f"{LEGAL.get('title', 'Privacy and terms')} | Halcyon Literary House",
         "Privacy, service terms, refunds and intellectual property at Halcyon Literary House.", "", body)

def render_markdown(text):
    try:
        import markdown
        return markdown.markdown(text or "", extensions=["extra", "sane_lists"])
    except ImportError:
        return "".join(f"<p>{linkify(p)}</p>" for p in re.split(r"\n\s*\n", text or "") if p.strip())

def custom_pages():
    for p in PAGES:
        img = ""
        if p.get("image"):
            img = f'<figure class="page-figure"><img src="{e(p["image"].lstrip("/"))}" alt="{e(p.get("image_alt", ""))}" loading="lazy"></figure>'
        btn = ""
        if p.get("button_text") and p.get("button_link"):
            btn = f'<p><a class="btn btn-primary" href="{e(p["button_link"])}">{e(p["button_text"])}</a></p>'
        body = f"""
{page_head(p["title"], p.get("intro", ""))}
<section class="section">
  <div class="wrap prose">{img}
{render_markdown(p.get("body", ""))}
{btn}
  </div>
</section>"""
        page(p["slug"] + ".html", f'{p.get("seo_title") or p["title"]} | Halcyon Literary House',
             p.get("seo_description") or p.get("intro", "")[:155], "", body)

if __name__ == "__main__":
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    shutil.copytree(os.path.join(HERE, "css"), os.path.join(OUT, "css"))
    shutil.copytree(os.path.join(HERE, "js"), os.path.join(OUT, "js"))
    shutil.copy(os.path.join(HERE, "HOW-TO-UPLOAD.txt"), OUT)
    shutil.copytree(os.path.join(HERE, "i18n"), os.path.join(OUT, "i18n"))
    shutil.copytree(os.path.join(HERE, "assets"), os.path.join(OUT, "assets"), ignore=shutil.ignore_patterns("staging"))
    if os.path.isdir(os.path.join(HERE, "admin")):
        shutil.copytree(os.path.join(HERE, "admin"), os.path.join(OUT, "admin"))
    for fn in (home, services, how, titles, team, stories, contact, roadmap, legal, case_studies, faq, custom_pages):
        fn()
    pages = ["index.html", "services.html", "how-it-works.html", "case-studies.html", "titles-authors.html", "team.html",
             "author-stories.html", "faq.html", "contact.html", "roadmap.html", "legal.html"] + [p["slug"] + ".html" for p in PAGES]
    with open(os.path.join(OUT, "sitemap.xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for pg in pages:
            f.write(f'  <url><loc>{SITE}/{"" if pg == "index.html" else pg}</loc></url>\n')
        f.write('</urlset>\n')
    with open(os.path.join(OUT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: {SITE}/sitemap.xml\n")
    print("built", sorted(os.listdir(OUT)))
