"""Site content, read from the JSON files in content/ (edited through /admin).

The rest of the build uses the same names and shapes as before, so the
admin can change any of this without touching code.
"""
import json, os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
CDIR = os.path.join(HERE, "content")


def _load(name):
    with open(os.path.join(CDIR, name + ".json"), encoding="utf-8") as f:
        return json.load(f)


def _file(path):
    """'/assets/books/x.jpg' or 'assets/books/x.jpg' -> 'x.jpg'"""
    return os.path.basename(path or "")


def _slug(text):
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s or "item"


def _paras(text):
    return [p.strip() for p in re.split(r"\n\s*\n", text or "") if p.strip()]


_site = _load("site")
BRAND_LINE = _site.get("brand_line", "")
CTA_LABEL = _site.get("cta_label", "Request a consultation")
STAGES = _site.get("stages", [])

_books = _load("books")["books"]
BOOKS = [(_file(b["cover"]), b["title"], b.get("author", ""), b.get("genre", ""), b.get("series", "")) for b in _books]
BUY_LINKS = {_file(b["cover"]): b["buy_link"] for b in _books if b.get("buy_link")}


def _person(m):
    return (m.get("id") or _slug(m["name"]), _file(m.get("photo")), m["name"], m.get("role", ""),
            m.get("summary", ""), _paras(m.get("bio", "")))


_team = _load("team")
CORE_TEAM = [_person(m) for m in _team.get("core", [])]
COLLABORATORS = [_person(m) for m in _team.get("collaborators", [])]

REVIEWS = [(r["quote"], r.get("name", ""), r.get("service", ""), r.get("short", "")) for r in _load("reviews")["reviews"]]

SERVICES = [(s["id"], s["name"], s.get("plain", ""), s.get("headline", ""), s.get("intro", ""), list(s.get("includes", [])), s.get("close", ""))
            for s in _load("services")["services"]]

CASE_STUDIES = [(c.get("id") or _slug(c["author"]), c["author"], c.get("service", ""), c.get("plain", ""), c.get("number", ""),
                 c.get("number_label", ""), c.get("start", ""), c.get("work", ""), c.get("result", ""))
                for c in _load("case_studies")["case_studies"]]

FAQ = [(q["question"], q["answer"]) for q in _load("faq")["faq"]]

WEB_WORK = [(p["name"], p["url"], [_file(x) for x in p.get("covers", [])], p.get("description", ""))
            for p in _load("web_work")["projects"]]

LEGAL = _load("legal")
LEGAL["sections"] = [{"heading": s["heading"], "paras": _paras(s.get("body", ""))} for s in LEGAL.get("sections", [])]

# extra pages created in the admin
PAGES = []
for fn in sorted(glob.glob(os.path.join(CDIR, "pages", "*.json"))):
    with open(fn, encoding="utf-8") as f:
        p = json.load(f)
    if p.get("published", True) is False:
        continue
    p["slug"] = _slug(p.get("slug") or p.get("title"))
    PAGES.append(p)

NAV = [
    ("index.html#about", "The house", "about"),
    ("services.html", "Services", "services"),
    ("how-it-works.html", "Process", "how"),
    ("titles-authors.html", "Authors", "titles"),
    ("team.html", "Team", "team"),
    ("author-stories.html", "Reviews", "stories"),
]
