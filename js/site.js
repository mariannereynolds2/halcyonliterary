/* Halcyon Literary House — site behaviour */

/* ===== Settings you may want to change ===== */
var HALCYON = {
  // Where the free roadmap PDF lives on your host (path from the site root).
  roadmapPdf: "assets/indie-author-growth-roadmap.pdf"
};

/* ===== Languages =====
   Each language has a full translation in /i18n. Visitors whose browser uses one
   of these languages see it automatically; anyone can switch from the globe menu. */
var HL_LANGS = [
  ["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"],
  ["pt", "Português"], ["it", "Italiano"], ["ar", "العربية"], ["zh", "中文"],
  ["ja", "日本語"], ["hi", "हिन्दी"], ["sw", "Kiswahili"], ["yo", "Yorùbá"]
];
var HL_RTL = { ar: true };
var HL_FONTS = {
  ar: "Noto+Naskh+Arabic:wght@400;500;600",
  zh: "Noto+Serif+SC:wght@400;500;600",
  ja: "Noto+Serif+JP:wght@400;500;600",
  hi: "Noto+Serif+Devanagari:wght@400;500;600"
};
var HL_FONT_NAMES = { ar: "Noto Naskh Arabic", zh: "Noto Serif SC", ja: "Noto Serif JP", hi: "Noto Serif Devanagari" };

/* If an image is missing from this server, load it from the live site instead. */
var HL_IMAGE_FALLBACK = "https://halcyonliterary.com/";
document.addEventListener("error", function (ev) {
  var img = ev.target;
  if (!img || img.tagName !== "IMG" || img.getAttribute("data-fallback-tried")) return;
  var src = img.getAttribute("src") || "";
  if (src.indexOf("assets/") !== 0) return;
  img.setAttribute("data-fallback-tried", "1");
  img.src = HL_IMAGE_FALLBACK + src;
}, true);

/* translation files call these */
window.HL_KEYS = window.HL_KEYS || null;
window.HL_DICT = window.HL_DICT || {};
function HL_I18N(lang, table) { window.HL_DICT[lang] = table; }

(function () {
  "use strict";

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function supported(code) {
    for (var i = 0; i < HL_LANGS.length; i++) if (HL_LANGS[i][0] === code) return true;
    return false;
  }

  function browserLang() {
    var list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var base = String(list[i] || "").toLowerCase().split(/[-_]/)[0];
      if (supported(base)) return base;
    }
    return "en";
  }

  /* ===== Choosing the language =====
     1. the visitor's own choice from the globe menu (remembered)
     2. a link with ?lang=xx
     3. the visitor's country (looked up once, then remembered for 30 days)
     4. the visitor's phone/computer language
     5. English */
  var COUNTRY_LANG = {
    // English-speaking countries
    US: "en", GB: "en", IE: "en", AU: "en", NZ: "en",
    // Spanish
    ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es", GT: "es", CU: "es",
    BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", PR: "es", GQ: "es",
    // French
    FR: "fr", LU: "fr", MC: "fr", CI: "fr", SN: "fr", CM: "fr", CD: "fr", CG: "fr", ML: "fr", BF: "fr", NE: "fr",
    TD: "fr", GN: "fr", BJ: "fr", TG: "fr", GA: "fr", MG: "fr", HT: "fr", BI: "fr", DJ: "fr", KM: "fr", CF: "fr",
    // German
    DE: "de", AT: "de", LI: "de",
    // Portuguese
    PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt", GW: "pt", ST: "pt", TL: "pt",
    // Italian
    IT: "it", SM: "it", VA: "it",
    // Arabic
    SA: "ar", AE: "ar", EG: "ar", MA: "ar", DZ: "ar", TN: "ar", LY: "ar", JO: "ar", LB: "ar", SY: "ar", IQ: "ar",
    KW: "ar", QA: "ar", BH: "ar", OM: "ar", YE: "ar", SD: "ar", PS: "ar", MR: "ar",
    // Chinese
    CN: "zh", TW: "zh", HK: "zh", MO: "zh",
    // Japanese
    JP: "ja",
    // Swahili
    TZ: "sw"
    // Countries with several languages (Nigeria, India, Kenya, Canada, Switzerland, Belgium, South Africa,
    // Singapore and others) follow the visitor's own phone/computer language instead.
  };
  var GEO_URL = "https://get.geojs.io/v1/ip/country.json";
  var GEO_DAYS = 30;

  var root = document.documentElement;
  var translator = null;
  var lang = "en";

  // the script lives in /js, so the translations sit beside it in /i18n
  var me = document.currentScript && document.currentScript.getAttribute("src") || "js/site.js";
  var base = me.replace(/js\/site\.js.*$/, "");

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src; s.async = false;
    s.onload = function () { cb(true); };
    s.onerror = function () { cb(false); };
    (document.head || root).appendChild(s);
  }

  var domReady = document.readyState !== "loading";
  var onReady = [];
  document.addEventListener("DOMContentLoaded", function () {
    domReady = true;
    onReady.splice(0).forEach(function (fn) { fn(); });
  });
  function whenReady(fn) { if (domReady) fn(); else onReady.push(fn); }
  function reveal() { root.classList.remove("i18n-loading"); }

  function startLang(code) {
    lang = supported(code) ? code : "en";
    whenReady(function () {
      document.querySelectorAll("select[data-lang-picker]").forEach(function (sel) { sel.value = lang; });
    });
    if (lang === "en") { reveal(); return; }
    root.classList.add("i18n-loading");
    root.setAttribute("lang", lang);
    if (HL_RTL[lang]) root.setAttribute("dir", "rtl");
    if (HL_FONTS[lang]) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=" + HL_FONTS[lang] + "&display=swap";
      (document.head || root).appendChild(l);
      var f = document.createElement("style");
      f.textContent = ":root{--serif:\"Cormorant Garamond\",\"" + HL_FONT_NAMES[lang] + "\",serif;--sans:\"Hanken Grotesk\",\"" + HL_FONT_NAMES[lang] + "\",system-ui,sans-serif}";
      (document.head || root).appendChild(f);
    }
    var pending = 2;
    var apply = function () {
      if (pending > 0) return;
      whenReady(function () {
        if (window.HL_KEYS && window.HL_DICT[lang]) {
          translator = makeTranslator(window.HL_KEYS, window.HL_DICT[lang]);
          translatePage(translator);
        }
        reveal();
      });
    };
    loadScript(base + "i18n/keys.js", function () { pending--; apply(); });
    loadScript(base + "i18n/" + lang + ".js", function () { pending--; apply(); });
  }

  function langForCountry(cc) {
    cc = String(cc || "").toUpperCase();
    return COUNTRY_LANG[cc] || browserLang();
  }

  var fromUrl = (location.search.match(/[?&]lang=([a-z]{2})/) || [])[1];
  var chosen = store("hl-lang");
  var geo = null;
  try { geo = JSON.parse(store("hl-geo") || "null"); } catch (e) { geo = null; }

  if (fromUrl && supported(fromUrl)) {
    startLang(fromUrl);
  } else if (chosen && supported(chosen)) {
    startLang(chosen);
  } else if (geo && geo.t && (Date.now() - geo.t) < (geo.c ? GEO_DAYS : 1) * 864e5) {
    // remembered country (or a failed lookup, remembered for one day)
    startLang(geo.c ? langForCountry(geo.c) : browserLang());
  } else {
    // first visit: look up the country, but never keep the page waiting long
    root.classList.add("i18n-loading");
    var settled = false;
    var settle = function (cc) {
      if (settled) return;
      settled = true;
      store("hl-geo", JSON.stringify({ c: cc || "", t: Date.now() }));
      startLang(cc ? langForCountry(cc) : browserLang());
    };
    setTimeout(function () { settle(null); }, 1500);
    try {
      fetch(GEO_URL, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { settle(d && d.country ? d.country : null); })
        .catch(function () { settle(null); });
    } catch (e) { settle(null); }
  }
  setTimeout(reveal, 3000); // the page is never left hidden

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  function makeTranslator(keys, table) {
    var index = {};
    for (var i = 0; i < keys.length; i++) index[keys[i]] = i;
    return function (text) {
      var k = norm(text);
      if (!k || !(k in index)) return null;
      var tr = table[index[k]];
      return tr ? tr : null;
    };
  }

  function blocked(el) {
    while (el && el.nodeType === 1) {
      if (el.getAttribute("translate") === "no" || (el.classList && el.classList.contains("notranslate"))) return true;
      var tn = el.tagName;
      if (tn === "SCRIPT" || tn === "STYLE" || tn === "svg") return true;
      el = el.parentNode;
    }
    return false;
  }

  function translatePage(t) {
    var tr = t(document.title);
    if (tr) document.title = tr;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var v = node.nodeValue;
      if (!v || !/\S/.test(v) || blocked(node.parentNode)) return;
      var out = t(v);
      if (out) {
        var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
        node.nodeValue = lead + out + trail;
      }
    });
    ["alt", "aria-label", "placeholder", "data-sending"].forEach(function (attr) {
      document.querySelectorAll("[" + attr + "]").forEach(function (el) {
        if (blocked(el)) return;
        var out = t(el.getAttribute(attr));
        if (out) el.setAttribute(attr, out);
      });
    });
  }

  function say(text) { // for words the script writes later
    return (translator && translator(text)) || text;
  }

  function chooseLang(code) {
    store("hl-lang", code);
    var url = location.href.replace(/([?&])lang=[a-z]{2}&?/, "$1").replace(/[?&]$/, "");
    if (url !== location.href) location.href = url; else location.reload();
  }

  document.addEventListener("DOMContentLoaded", function () {
    /* language picker */
    document.querySelectorAll("select[data-lang-picker]").forEach(function (sel) {
      HL_LANGS.forEach(function (l) {
        var o = document.createElement("option");
        o.value = l[0]; o.textContent = l[1];
        if (l[0] === lang) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { chooseLang(sel.value); });
    });

    /* ---------- Mobile menu ---------- */
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    if (toggle && nav) {
      var setOpen = function (open) {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = say(open ? "Close" : "Menu");
      };
      toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
      nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    }

    /* ---------- Team bios ---------- */
    document.querySelectorAll("[data-bio]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var d = document.getElementById(btn.getAttribute("data-bio"));
        if (d && d.showModal) d.showModal();
      });
    });
    document.querySelectorAll("dialog.bio").forEach(function (d) {
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
      var c = d.querySelector(".bio-close");
      if (c) c.addEventListener("click", function () { d.close(); });
    });
    if (location.hash.indexOf("#bio-") === 0) {
      var target = document.getElementById(location.hash.slice(1));
      if (target && target.showModal) target.showModal();
    }

    /* ---------- Review slider (home) ---------- */
    document.querySelectorAll(".quote-rotator").forEach(function (box) {
      var qs = box.querySelectorAll(".q");
      var count = box.querySelector(".q-count");
      var i = 0;
      function show(n) {
        i = (n + qs.length) % qs.length;
        qs.forEach(function (q, k) { q.classList.toggle("on", k === i); });
        if (count) count.textContent = (i + 1) + " / " + qs.length;
      }
      var prev = box.querySelector("[data-prev]"), next = box.querySelector("[data-next]");
      if (prev) prev.addEventListener("click", function () { show(i - 1); });
      if (next) next.addEventListener("click", function () { show(i + 1); });
      show(0);
    });

    /* ---------- Forms (sent by FormSubmit to your inbox) ---------- */
    document.querySelectorAll("form[data-hl-form]").forEach(function (form) {
      var frame = document.querySelector('iframe[name="' + form.getAttribute("target") + '"]');
      var card = form.closest(".form-card");
      var waiting = false;
      function done() {
        if (!waiting) return;
        waiting = false;
        card.classList.add("sent");
        var dl = card.querySelector("[data-roadmap-link]");
        if (dl) dl.setAttribute("href", HALCYON.roadmapPdf);
        var focusMe = card.querySelector(".form-done h3");
        if (focusMe) { focusMe.setAttribute("tabindex", "-1"); focusMe.focus(); }
      }
      var errBox = form.querySelector(".form-error");
      var isRoadmap = !!card.querySelector("[data-roadmap-link]");
      form.addEventListener("submit", function (ev) {
        waiting = true;
        // preview copies have no form address: show the thank-you state only
        if (!form.getAttribute("action")) { ev.preventDefault(); done(); return; }
        // the confirmation email goes out in the language the visitor is reading
        form.querySelectorAll("[data-say]").forEach(function (f) { f.value = say(f.getAttribute("data-say")); });
        var lf = form.querySelector("[data-lang-field]");
        if (lf) HL_LANGS.forEach(function (l) { if (l[0] === lang) lf.value = l[1] + " (" + l[0] + ")"; });
        var b = form.querySelector('button[type="submit"]');
        var label = b ? b.textContent : "";
        if (b) { b.disabled = true; b.textContent = b.getAttribute("data-sending") || "Sending…"; }
        if (errBox) errBox.hidden = true;
        if (!window.fetch || !window.FormData) { setTimeout(done, 4000); return; } // old browsers: normal post into the hidden frame
        ev.preventDefault();
        // FormSubmit's AJAX address answers with {success:"true"} only once the message is accepted for delivery
        var url = form.getAttribute("action").replace("formsubmit.co/", "formsubmit.co/ajax/");
        fetch(url, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function (data) {
            if (String(data.success) === "true") { done(); return; }
            throw new Error(data.message || "not accepted");
          })
          .catch(function (err) {
            if (window.console) console.warn("Form not sent:", err && err.message);
            if (isRoadmap) { done(); return; } // never withhold the guide from a reader
            waiting = false;
            if (b) { b.disabled = false; b.textContent = label; }
            if (errBox) { errBox.hidden = false; errBox.setAttribute("tabindex", "-1"); errBox.focus(); }
          });
      });
      if (frame) frame.addEventListener("load", done);
    });

    /* footer year */
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
