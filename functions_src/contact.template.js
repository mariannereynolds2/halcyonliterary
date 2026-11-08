/*
 * Halcyon Literary House: contact and roadmap forms, sent with Resend.
 * Cloudflare Pages Function, served at /api/contact
 *
 * Settings (Cloudflare Pages > your project > Settings > Variables and Secrets):
 *   RESEND_API_KEY   required  your Resend API key (add it as a Secret)
 *   TO_EMAIL         optional  where enquiries go   (default hello@halcyonliterary.com)
 *   FROM_EMAIL       optional  sender, on a domain verified in Resend
 *                              (default "Halcyon Literary House <hello@support.halcyonliterary.com>")
 */

const SITE = "https://halcyonliterary.com";
const ROADMAP_URL = SITE + "/assets/indie-author-growth-roadmap.pdf";

// Confirmation emails, one per language (generated from the site's translations)
const CONFIRM = __CONFIRM__;
const SUBJECTS = __SUBJECTS__;
const LANG_NAMES = __LANG_NAMES__;

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
  const from = env.FROM_EMAIL || "Halcyon Literary House <hello@support.halcyonliterary.com>";
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
    const from = env.FROM_EMAIL || "Halcyon Literary House <hello@support.halcyonliterary.com>";
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
