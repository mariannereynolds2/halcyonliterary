"""Generate functions/api/contact.js (Cloudflare Pages Function) with the
confirmation texts taken from the site's own translations."""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
LANGS = ["en", "es", "fr", "de", "pt", "it", "ar", "zh", "ja", "hi", "sw", "yo"]
NAMES = {"en": "English", "es": "Español", "fr": "Français", "de": "Deutsch", "pt": "Português", "it": "Italiano",
         "ar": "العربية", "zh": "中文", "ja": "日本語", "hi": "हिन्दी", "sw": "Kiswahili", "yo": "Yorùbá"}
SUBJECTS = {
    "consultation": {
        "en": "We have received your consultation request",
        "es": "Hemos recibido su solicitud de consulta",
        "fr": "Nous avons bien reçu votre demande de consultation",
        "de": "Wir haben Ihre Beratungsanfrage erhalten",
        "pt": "Recebemos o seu pedido de consulta",
        "it": "Abbiamo ricevuto la tua richiesta di consulenza",
        "ar": "تلقّينا طلب الاستشارة الخاص بك",
        "zh": "我们已收到您的咨询申请",
        "ja": "ご相談のお申し込みを承りました",
        "hi": "हमें आपका परामर्श अनुरोध मिल गया है",
        "sw": "Tumepokea ombi lako la ushauri",
        "yo": "A ti gba ìbéèrè ìjíròrò rẹ",
    },
    "roadmap": {
        "en": "Your Indie Author Growth Roadmap",
        "es": "Su Hoja de Ruta de Crecimiento para Autores Independientes",
        "fr": "Votre feuille de route de croissance pour auteurs indépendants",
        "de": "Ihre Wachstums-Roadmap für unabhängige Autoren",
        "pt": "O seu Roteiro de Crescimento para Autores Independentes",
        "it": "La tua Roadmap di crescita per autori indipendenti",
        "ar": "خريطة طريق نمو المؤلف المستقل الخاصة بك",
        "zh": "您的独立作者成长路线图",
        "ja": "インディー作家のための成長ロードマップ",
        "hi": "आपका इंडी लेखक ग्रोथ रोडमैप",
        "sw": "Ramani yako ya Ukuaji wa Mwandishi Huru",
        "yo": "Ìwé Atọ́nà Ìdàgbàsókè Òǹkọ̀wé Aládàáni rẹ",
    },
}

def load_keys():
    s = open(os.path.join(HERE, "i18n/keys.js"), encoding="utf-8").read()
    return json.loads(s[s.index("["):s.rindex("]") + 1])

def load_lang(l):
    s = open(os.path.join(HERE, f"i18n/{l}.js"), encoding="utf-8").read()
    return json.loads(s[s.index("{"):s.rindex("}") + 1])

def build():
    keys = load_keys()
    ids = {"consultation": keys.index(next(k for k in keys if k.startswith("Thank you for contacting Halcyon Literary House"))),
           "roadmap": keys.index(next(k for k in keys if k.startswith("Thank you for requesting The Indie Author Growth Roadmap")))}
    confirm = {kind: {"en": keys[i]} for kind, i in ids.items()}
    for l in LANGS[1:]:
        t = load_lang(l)
        for kind, i in ids.items():
            if str(i) in t:
                confirm[kind][l] = t[str(i)]
    src = open(os.path.join(HERE, "functions_src/contact.template.js"), encoding="utf-8").read()
    src = (src.replace("__CONFIRM__", json.dumps(confirm, ensure_ascii=False, indent=2))
              .replace("__SUBJECTS__", json.dumps(SUBJECTS, ensure_ascii=False, indent=2))
              .replace("__LANG_NAMES__", json.dumps(NAMES, ensure_ascii=False)))
    out = os.path.join(HERE, "functions/api/contact.js")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(src)
    print("wrote", out, {k: len(v) for k, v in confirm.items()})

if __name__ == "__main__":
    build()
