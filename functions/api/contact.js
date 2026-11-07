/*
 * Halcyon Literary House: contact and roadmap forms, sent with Resend.
 * Cloudflare Pages Function, served at /api/contact
 *
 * Settings (Cloudflare Pages > your project > Settings > Variables and Secrets):
 *   RESEND_API_KEY   required  your Resend API key (add it as a Secret)
 *   TO_EMAIL         optional  where enquiries go   (default hello@halcyonliterary.com)
 *   FROM_EMAIL       optional  sender, on a domain verified in Resend
 *                              (default "Halcyon Literary House <hello@halcyonliterary.com>")
 */

const SITE = "https://halcyonliterary.com";
const ROADMAP_URL = SITE + "/assets/indie-author-growth-roadmap.pdf";

// Confirmation emails, one per language (generated from the site's translations)
const CONFIRM = {
  "consultation": {
    "en": "Thank you for contacting Halcyon Literary House. We have received your consultation request, and a member of our team will reply within two business days. If you would like to add anything, write to us at hello@halcyonliterary.com.",
    "es": "Gracias por contactar con Halcyon Literary House. Hemos recibido su solicitud de consulta y un miembro de nuestro equipo le responderá en un plazo de dos días hábiles. Si desea añadir algo, escríbanos a hello@halcyonliterary.com.",
    "fr": "Merci d’avoir contacté Halcyon Literary House. Nous avons bien reçu votre demande de consultation et un membre de notre équipe vous répondra sous deux jours ouvrés. Pour ajouter quoi que ce soit, écrivez-nous à hello@halcyonliterary.com.",
    "de": "Vielen Dank, dass Sie Halcyon Literary House kontaktiert haben. Wir haben Ihre Beratungsanfrage erhalten, und ein Mitglied unseres Teams antwortet Ihnen innerhalb von zwei Werktagen. Wenn Sie etwas ergänzen möchten, schreiben Sie uns an hello@halcyonliterary.com.",
    "pt": "Obrigado por entrar em contato com a Halcyon Literary House. Recebemos a sua solicitação de consulta e um membro da nossa equipe responderá em até dois dias úteis. Se quiser acrescentar algo, escreva para hello@halcyonliterary.com.",
    "it": "Grazie per aver contattato Halcyon Literary House. Abbiamo ricevuto la sua richiesta di consulenza e un membro del nostro team le risponderà entro due giorni lavorativi. Se desidera aggiungere qualcosa, ci scriva a hello@halcyonliterary.com.",
    "ar": "شكرًا لتواصلك مع Halcyon Literary House. وصلنا طلب الاستشارة الخاص بك، وسيرد عليك أحد أعضاء فريقنا خلال يومي عمل. إذا أردت إضافة أي شيء، راسلنا على hello@halcyonliterary.com.",
    "zh": "感谢您联系 Halcyon Literary House。我们已收到您的咨询请求，团队成员将在两个工作日内回复您。如需补充任何信息，请发送邮件至 hello@halcyonliterary.com。",
    "ja": "Halcyon Literary House にご連絡いただきありがとうございます。ご相談のお申し込みを受け付けました。2営業日以内にチームの担当者よりご返信します。追加でお伝えになりたいことがあれば、hello@halcyonliterary.com までお送りください。",
    "hi": "Halcyon Literary House से संपर्क करने के लिए धन्यवाद। हमें आपका परामर्श अनुरोध मिल गया है, और हमारी टीम का एक सदस्य दो कार्यदिवसों के भीतर आपको जवाब देगा। यदि आप कुछ जोड़ना चाहें, तो हमें hello@halcyonliterary.com पर लिखें।",
    "sw": "Asante kwa kuwasiliana na Halcyon Literary House. Tumepokea ombi lako la ushauri, na mmoja wa timu yetu atakujibu ndani ya siku mbili za kazi. Ukitaka kuongeza chochote, tuandikie kupitia hello@halcyonliterary.com.",
    "yo": "A dúpẹ́ pé o kàn sí Halcyon Literary House. A ti gba ìbéèrè ìgbìmọ̀ rẹ, ọ̀kan lára ẹgbẹ́ wa yóò sì dá ọ lóhùn láàrin ọjọ́ iṣẹ́ méjì. Bí o bá fẹ́ fi ohunkóhun kún un, kọ̀wé sí wa ní hello@halcyonliterary.com."
  },
  "roadmap": {
    "en": "Thank you for requesting The Indie Author Growth Roadmap. You can download it here: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. When you are ready to talk about your book, request a consultation at https://halcyonliterary.com/contact.html.",
    "es": "Gracias por solicitar La Hoja de Ruta de Crecimiento para Autores Independientes. Puede descargarla aquí: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Cuando quiera hablar de su libro, solicite una consulta en https://halcyonliterary.com/contact.html.",
    "fr": "Merci d’avoir demandé La Feuille de route de croissance pour auteurs indépendants. Vous pouvez la télécharger ici : https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Quand vous serez prêt à parler de votre livre, demandez une consultation sur https://halcyonliterary.com/contact.html.",
    "de": "Vielen Dank für Ihr Interesse an der Wachstums-Roadmap für unabhängige Autoren. Sie können sie hier herunterladen: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Wenn Sie über Ihr Buch sprechen möchten, fordern Sie eine Beratung an unter https://halcyonliterary.com/contact.html.",
    "pt": "Obrigado por solicitar O Roteiro de Crescimento para Autores Independentes. Você pode baixá-lo aqui: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Quando quiser conversar sobre o seu livro, solicite uma consulta em https://halcyonliterary.com/contact.html.",
    "it": "Grazie per aver richiesto La Roadmap di Crescita per Autori Indipendenti. Può scaricarla qui: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Quando vorrà parlare del suo libro, richieda una consulenza su https://halcyonliterary.com/contact.html.",
    "ar": "شكرًا لطلبك خريطة النمو للمؤلفين المستقلين. يمكنك تنزيلها من هنا: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. وعندما تكون مستعدًا للحديث عن كتابك، اطلب استشارة عبر https://halcyonliterary.com/contact.html.",
    "zh": "感谢您索取《独立作者成长路线图》。您可以在此下载：https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf 。当您准备好谈谈您的书时，请在 https://halcyonliterary.com/contact.html 预约咨询。",
    "ja": "「インディー作家のための成長ロードマップ」をお申し込みいただきありがとうございます。こちらからダウンロードいただけます：https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf 。ご自身の本についてご相談の際は、https://halcyonliterary.com/contact.html からお申し込みください。",
    "hi": "स्वतंत्र लेखकों के लिए ग्रोथ रोडमैप का अनुरोध करने के लिए धन्यवाद। आप इसे यहाँ से डाउनलोड कर सकते हैं: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. जब आप अपनी किताब के बारे में बात करने के लिए तैयार हों, तो https://halcyonliterary.com/contact.html पर परामर्श का अनुरोध करें।",
    "sw": "Asante kwa kuomba Ramani ya Ukuaji kwa Waandishi Huru. Unaweza kuipakua hapa: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Ukiwa tayari kuzungumza kuhusu kitabu chako, omba ushauri kupitia https://halcyonliterary.com/contact.html.",
    "yo": "A dúpẹ́ pé o béèrè fún Àtẹ Ìdàgbàsókè fún Àwọn Òǹkọ̀wé Aládàáṣe. O lè gbà á sílẹ̀ níbí: https://halcyonliterary.com/assets/indie-author-growth-roadmap.pdf. Nígbà tí o bá ṣe tán láti sọ̀rọ̀ nípa ìwé rẹ, béèrè fún ìgbìmọ̀ ní https://halcyonliterary.com/contact.html."
  }
};
const SUBJECTS = {
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
    "yo": "A ti gba ìbéèrè ìjíròrò rẹ"
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
    "yo": "Ìwé Atọ́nà Ìdàgbàsókè Òǹkọ̀wé Aládàáni rẹ"
  }
};
const LANG_NAMES = {"en": "English", "es": "Español", "fr": "Français", "de": "Deutsch", "pt": "Português", "it": "Italiano", "ar": "العربية", "zh": "中文", "ja": "日本語", "hi": "हिन्दी", "sw": "Kiswahili", "yo": "Yorùbá"};

// The fields we accept, in the order they appear in your inbox
const FIELDS = {
  consultation: [
    ["name", "Name"],
    ["email", "Email"],
    ["book", "Book title and genre"],
    ["stage", "Where the book is today"],
    ["tried", "What they have tried so far"],
    ["goal", "What success would look like"],
  ],
  roadmap: [
    ["name", "Name"],
    ["email", "Email"],
  ],
};

const MAX_LEN = 5000;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function reply(request, ok, status, message) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  if (wantsJson) {
    return new Response(JSON.stringify({ ok, message }), {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  // browsers without JavaScript: send them back to the page they came from
  const back = new URL(request.headers.get("Referer") || SITE + "/contact.html");
  back.searchParams.set(ok ? "sent" : "error", "1");
  return Response.redirect(back.toString(), 303);
}

async function sendEmail(env, payload) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error("Resend " + r.status + ": " + detail.slice(0, 300));
  }
  return r.json().catch(() => ({}));
}

function enquiryEmail(kind, values, lang, page) {
  const title = kind === "roadmap" ? "New roadmap request" : "New consultation request";
  const rows = FIELDS[kind]
    .map(([key, label]) => [label, values[key] || ""])
    .concat([["Language", LANG_NAMES[lang] || lang], ["Sent from", page]]);
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f5f0e6;font-family:Arial,Helvetica,sans-serif;color:#0b0a09">
<table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e3d8c3;border-collapse:collapse">
<tr><td style="background:#0b0a09;padding:20px 24px;color:#c9a96e;font-family:Georgia,serif;font-size:20px">${esc(title)}</td></tr>
<tr><td style="padding:8px 24px 20px">
<table role="presentation" width="100%" style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) => `<tr><td style="padding:12px 0 4px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a33;font-weight:bold">${esc(label)}</td></tr>
<tr><td style="padding:0 0 12px;border-bottom:1px solid #eee5d4;font-size:15px;line-height:1.55;white-space:pre-wrap">${esc(value) || "<span style=\"color:#999\">(left blank)</span>"}</td></tr>`
  )
  .join("\n")}
</table>
<p style="margin:20px 0 0;font-size:13px;color:#5b544b">Press Reply to answer ${esc(values.name)} directly.</p>
</td></tr></table></body></html>`;
  const text = title + "\n\n" + rows.map(([l, v]) => l + ":\n" + (v || "(left blank)")).join("\n\n") + "\n\nPress Reply to answer " + values.name + " directly.";
  return { subject: title + ": " + values.name, html, text };
}

function confirmationEmail(kind, lang) {
  const t = (CONFIRM[kind] && (CONFIRM[kind][lang] || CONFIRM[kind].en)) || "";
  const subject = (SUBJECTS[kind] && (SUBJECTS[kind][lang] || SUBJECTS[kind].en)) || "Halcyon Literary House";
  const rtl = lang === "ar";
  const linked = esc(t).replace(/https:\/\/[^\s]+?(?=[.,]?(\s|$))/g, (u) => `<a href="${u}" style="color:#8a6a33">${u}</a>`);
  const button =
    kind === "roadmap"
      ? `<p style="margin:24px 0 0"><a href="${ROADMAP_URL}" style="display:inline-block;background:#c9a96e;color:#0b0a09;text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:2px">The Indie Author Growth Roadmap (PDF)</a></p>`
      : "";
  const html = `<!doctype html><html${rtl ? ' dir="rtl"' : ""}><body style="margin:0;padding:24px;background:#f5f0e6;font-family:Arial,Helvetica,sans-serif;color:#0b0a09">
<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e3d8c3;border-collapse:collapse">
<tr><td style="background:#0b0a09;padding:22px 28px;color:#f5f0e6;font-family:Georgia,serif;font-size:22px;letter-spacing:.02em">HALCYON <span style="color:#c9a96e">·</span> <span style="font-size:12px;letter-spacing:.3em">LITERARY HOUSE</span></td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.65">
<p style="margin:0">${linked}</p>
${button}
<p style="margin:28px 0 0;font-family:Georgia,serif;font-style:italic;font-size:17px">Halcyon Literary House</p>
<p style="margin:4px 0 0;font-size:13px;color:#5b544b"><a href="${SITE}" style="color:#5b544b">halcyonliterary.com</a></p>
</td></tr></table></body></html>`;
  return { subject, html, text: t + "\n\nHalcyon Literary House\n" + SITE };
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY) return reply(request, false, 500, "Email is not configured yet (RESEND_API_KEY missing).");

  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return reply(request, false, 400, "Invalid form.");
  }
  const get = (k) => String(form.get(k) || "").trim().slice(0, MAX_LEN);

  // spam guards: hidden honeypot field, and forms submitted impossibly fast
  if (get("company_website")) return reply(request, true, 200, "ok");
  const started = Number(get("started"));
  if (started && Date.now() - started < 2500) return reply(request, true, 200, "ok");

  const kind = get("form") === "roadmap" ? "roadmap" : "consultation";
  const lang = /^[a-z]{2}$/.test(get("lang")) ? get("lang") : "en";
  const values = {};
  for (const [key] of FIELDS[kind]) values[key] = get(key);
  values.name = values.name.replace(/[\r\n]+/g, " ").slice(0, 200);

  if (!values.name || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email) || values.email.length > 254) {
    return reply(request, false, 422, "Please enter your name and a valid email address.");
  }
  if (kind === "consultation" && (!values.book || !values.goal)) {
    return reply(request, false, 422, "Please tell us about your book and your goal.");
  }

  const to = env.TO_EMAIL || "hello@halcyonliterary.com";
  const from = env.FROM_EMAIL || "Halcyon Literary House <hello@halcyonliterary.com>";
  const page = request.headers.get("Referer") || SITE;

  try {
    // 1. the enquiry, to your inbox. Reply goes straight to the author.
    const enquiry = enquiryEmail(kind, values, lang, page);
    await sendEmail(env, { from, to: [to], reply_to: values.email, ...enquiry });
  } catch (e) {
    console.error("Enquiry email failed", e.message);
    return reply(request, false, 502, "Your message could not be sent.");
  }

  try {
    // 2. the confirmation, to the author, in the language they read the site in
    const confirm = confirmationEmail(kind, lang);
    await sendEmail(env, { from, to: [values.email], reply_to: to, ...confirm });
  } catch (e) {
    // the enquiry already reached you, so the visitor still sees success
    console.error("Confirmation email failed", e.message);
  }

  return reply(request, true, 200, "ok");
}

// Status check: open /api/contact in a browser to see whether email is set up.
export async function onRequestGet({ env }) {
  const lines = ["Halcyon contact form: status check", ""];
  lines.push("1. Form sender is running: YES");
  if (!env.RESEND_API_KEY) {
    lines.push("2. RESEND_API_KEY found: NO");
    lines.push("");
    lines.push("Fix: Cloudflare > Workers & Pages > halcyonliterary > Settings > Variables and Secrets.");
    lines.push("Add RESEND_API_KEY for the Production environment, then Deployments > Retry deployment.");
  } else {
    const k = String(env.RESEND_API_KEY);
    lines.push("2. RESEND_API_KEY found: YES (" + k.length + " characters)");
    if (!k.startsWith("re_")) lines.push("   Warning: Resend keys normally start with re_. Check that the whole key was pasted.");
    const from = env.FROM_EMAIL || "Halcyon Literary House <hello@halcyonliterary.com>";
    const fromDomain = (from.match(/@([^>\s]+)/) || [])[1] || "";
    lines.push("3. Sending from: " + from);
    try {
      const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: "Bearer " + k } });
      const body = await r.json().catch(() => ({}));
      if (r.ok && Array.isArray(body.data)) {
        const d = body.data.find((x) => x.name === fromDomain);
        if (!d) lines.push("4. Domain " + fromDomain + " in Resend: NOT ADDED. Fix: Resend > Domains > Add domain.");
        else lines.push("4. Domain " + fromDomain + " in Resend: " + String(d.status).toUpperCase() + (d.status === "verified" ? "" : "  (must be VERIFIED before emails can be sent)"));
      } else if (r.status === 401 || r.status === 403) {
        const msg = body.message || body.name || "";
        if (/restricted/i.test(msg) || /restricted/i.test(body.name || "")) lines.push("4. Key is valid (sending-only key, so the domain status cannot be read here). Check Resend > Domains shows " + fromDomain + " as Verified.");
        else lines.push("4. Resend rejected the key: " + msg + "  Fix: create a new API key in Resend and paste it again.");
      } else {
        lines.push("4. Resend answered " + r.status + ": " + JSON.stringify(body).slice(0, 200));
      }
    } catch (e) {
      lines.push("4. Could not reach Resend: " + e.message);
    }
  }
  lines.push("", "Sending to: " + (env.TO_EMAIL || "hello@halcyonliterary.com"));
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
