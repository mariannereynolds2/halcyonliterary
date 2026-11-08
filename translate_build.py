"""Fill in translations for any text on the built pages that has none yet.

Runs after build.py. The hand-checked translations in i18n/ are never changed.
Text that is new (added through /admin) is translated automatically with the
free MyMemory service, and the results are written into dist/i18n/.

So the same text is not translated again on every publish, the previous
results are read back from the live site (i18n/auto-cache.json) and reused.
"""
import json, os, re, sys, time, urllib.parse, urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, os.environ.get("HL_OUT", "dist"))
LANGS = ["es", "fr", "de", "pt", "it", "ar", "zh", "ja", "hi", "sw", "yo"]
MYMEMORY_CODES = {"zh": "zh-CN"}
CONTACT_EMAIL = "hello@halcyonliterary.com"   # raises MyMemory's free daily limit
LIVE_CACHE = "https://halcyonliterary.com/i18n/auto-cache.json"
ATTRS = ("alt", "aria-label", "placeholder", "data-sending")
SKIP = {"script", "style", "svg", "noscript"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def worth_translating(s):
    if len(s) < 2 or not re.search(r"[A-Za-z]{2}", s):
        return False
    if re.fullmatch(r"(https?://|www\.)\S+|[\w.+-]+@[\w.-]+", s):
        return False
    return True


class Collector(HTMLParser):
    """Collects text exactly the way the browser translator sees it."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []      # (tag, blocked)
        self.found = set()
        self.in_title = False

    def blocked(self):
        return any(b for _, b in self.stack)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        block = tag in SKIP or a.get("translate") == "no" or "notranslate" in (a.get("class") or "").split()
        if tag == "title":
            self.in_title = True
        if not (self.blocked() or block):
            for at in ATTRS:
                v = a.get(at)
                if v and worth_translating(norm(v)):
                    self.found.add(norm(v))
        if tag not in VOID:
            self.stack.append((tag, block))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        t = norm(data)
        if not t or not worth_translating(t):
            return
        if self.in_title or not self.blocked():
            self.found.add(t)


def read_js_array(path):
    s = open(path, encoding="utf-8").read()
    return json.loads(s[s.index("["):s.rindex("]") + 1])


def read_lang(path):
    s = open(path, encoding="utf-8").read()
    return s[:s.index("{")], json.loads(s[s.index("{"):s.rindex("}") + 1]), s[s.rindex("}") + 1:]


def fetch_json(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": "halcyon-site-build"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def mymemory(text, lang):
    code = MYMEMORY_CODES.get(lang, lang)
    q = urllib.parse.urlencode({"q": text, "langpair": f"en|{code}", "de": CONTACT_EMAIL})
    data = fetch_json("https://api.mymemory.translated.net/get?" + q)
    if str(data.get("responseStatus")) != "200":
        raise RuntimeError(data.get("responseDetails") or "translation refused")
    out = (data.get("responseData") or {}).get("translatedText") or ""
    if not out or out.strip().upper().startswith("MYMEMORY WARNING") or "QUERY LENGTH LIMIT" in out.upper():
        raise RuntimeError(out or "empty")
    return out


def main():
    i18n = os.path.join(OUT, "i18n")
    keys = read_js_array(os.path.join(i18n, "keys.js"))
    index = {k: i for i, k in enumerate(keys)}

    seen = set()
    for fn in os.listdir(OUT):
        if fn.endswith(".html"):
            c = Collector()
            c.feed(open(os.path.join(OUT, fn), encoding="utf-8").read())
            seen |= c.found

    new = sorted(s for s in seen if s not in index)
    for s in new:
        index[s] = len(keys)
        keys.append(s)

    tables = {l: read_lang(os.path.join(i18n, f"{l}.js")) for l in LANGS}
    # Only text that is new since the hand-checked translations is translated.
    # Existing text without a translation (names, brands) stays in English on purpose.
    missing = {l: [s for s in new if str(index[s]) not in tables[l][1]] for l in LANGS}
    total = sum(len(v) for v in missing.values())
    print(f"[translate] {len(seen)} texts on the site, {len(new)} new, {total} translations to fill")

    cache = {}
    if total:
        try:
            cache = fetch_json(LIVE_CACHE)
            print(f"[translate] reused {sum(len(v) for v in cache.values())} earlier automatic translations")
        except Exception as ex:
            print(f"[translate] no earlier cache ({ex})")

    new_cache, failures = {}, 0
    for l in LANGS:
        pre, table, post = tables[l]
        for s in missing[l]:
            tr = (cache.get(l) or {}).get(s)
            if not tr and failures < 5:
                try:
                    tr = mymemory(s, l)
                    time.sleep(0.25)
                except Exception as ex:
                    failures += 1
                    print(f"[translate] {l}: could not translate {s[:40]!r}: {ex}")
            if tr:
                table[str(index[s])] = tr
                new_cache.setdefault(l, {})[s] = tr
        with open(os.path.join(i18n, f"{l}.js"), "w", encoding="utf-8") as f:
            f.write(pre + json.dumps(table, ensure_ascii=False) + post)

    raw = open(os.path.join(i18n, "keys.js"), encoding="utf-8").read()
    with open(os.path.join(i18n, "keys.js"), "w", encoding="utf-8") as f:
        f.write(raw[:raw.index("[")] + json.dumps(keys, ensure_ascii=False, indent=0) + raw[raw.rindex("]") + 1:])
    with open(os.path.join(i18n, "auto-cache.json"), "w", encoding="utf-8") as f:
        json.dump(new_cache, f, ensure_ascii=False)
    if failures:
        print("[translate] some text stays in English for now; it will be retried on the next publish")
    print("[translate] done")


if __name__ == "__main__":
    try:
        main()
    except Exception as ex:   # never block a publish because of translation
        print(f"[translate] skipped: {ex}", file=sys.stderr)
