/*
 * Halcyon admin gate: protects everything under /admin.
 * Sign in with an allowed email address and a 6-digit code sent through Resend.
 *
 * Settings (Cloudflare Pages > Settings > Variables and Secrets), all optional:
 *   ADMIN_EMAILS   comma-separated list of allowed emails (default hello@halcyonliterary.com)
 *   ADMIN_SECRET   signing key; if not set, one is derived from RESEND_API_KEY
 */

const COOKIE = "hl_admin";
const SESSION_DAYS = 7;
const CODE_MINUTES = 10;
const FROM = "Halcyon Admin <hello@support.halcyonliterary.com>";

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64uText = (s) => b64u(enc.encode(s));
const fromB64uText = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)));

async function key(env) {
  const base = env.ADMIN_SECRET || (env.RESEND_API_KEY ? "derived:" + env.RESEND_API_KEY : "");
  if (!base) throw new Error("No secret available");
  return crypto.subtle.importKey("raw", enc.encode(base + ":halcyon-admin"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}
async function sign(env, text) {
  return b64u(await crypto.subtle.sign("HMAC", await key(env), enc.encode(text)));
}
function sameText(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function allowed(env) {
  return (env.ADMIN_EMAILS || "hello@halcyonliterary.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}
function cookieValue(request, name) {
  const m = (request.headers.get("Cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : "";
}
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
}

async function validSession(request, env) {
  const raw = cookieValue(request, COOKIE);
  if (!raw || !raw.includes(".")) return null;
  const [payload, sig] = raw.split(".");
  if (!sameText(sig, await sign(env, "session|" + payload))) return null;
  const [email, exp] = fromB64uText(payload).split("|");
  if (Date.now() > Number(exp) || !allowed(env).includes(email)) return null;
  return email;
}

async function sendCode(env, email, code) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.ADMIN_FROM || FROM,
      to: [email],
      subject: "Your Halcyon admin code: " + code,
      text: "Your sign-in code for the Halcyon admin is " + code + ".\n\nIt works for " + CODE_MINUTES + " minutes. If you did not try to sign in, you can ignore this email.",
      html: `<div style="font-family:Arial,sans-serif;background:#f5f0e6;padding:24px"><div style="max-width:480px;margin:auto;background:#fff;border:1px solid #e3d8c3"><div style="background:#0b0a09;color:#c9a96e;padding:18px 24px;font-family:Georgia,serif;font-size:18px">Halcyon admin</div><div style="padding:24px;font-size:15px;color:#0b0a09">Your sign-in code is<p style="font-size:34px;letter-spacing:8px;font-family:Georgia,serif;margin:16px 0;color:#8a6a33">${code}</p>It works for ${CODE_MINUTES} minutes. If you did not try to sign in, you can ignore this email.</div></div></div>`,
    }),
  });
  if (!r.ok) throw new Error("Resend " + r.status);
}

async function handleLogin(request, env) {
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const email = String(body.email || "").trim().toLowerCase();

  if (body.step === "send") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, message: "Please enter a valid email address." }, 400);
    const exp = Date.now() + CODE_MINUTES * 60000;
    let challenge = "";
    if (allowed(env).includes(email)) {
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
      try { await sendCode(env, email, code); } catch (e) { return json({ ok: false, message: "The code could not be sent. Please try again in a minute." }, 502); }
      challenge = b64uText(email + "|" + exp) + "." + (await sign(env, "code|" + email + "|" + exp + "|" + code));
    } else {
      // same answer for unknown emails, so the page never reveals who is allowed
      challenge = b64uText(email + "|" + exp) + "." + b64u(crypto.getRandomValues(new Uint8Array(32)));
    }
    return json({ ok: true, challenge });
  }

  if (body.step === "verify") {
    const code = String(body.code || "").replace(/\D/g, "");
    const [payload, sig] = String(body.challenge || "").split(".");
    if (!payload || !sig || code.length !== 6) return json({ ok: false, message: "That code is not right." }, 401);
    const [cEmail, exp] = fromB64uText(payload).split("|");
    if (Date.now() > Number(exp)) return json({ ok: false, message: "That code has expired. Ask for a new one." }, 401);
    const expected = await sign(env, "code|" + cEmail + "|" + exp + "|" + code);
    if (!allowed(env).includes(cEmail) || !sameText(sig, expected)) return json({ ok: false, message: "That code is not right." }, 401);
    const sExp = Date.now() + SESSION_DAYS * 86400000;
    const sPayload = b64uText(cEmail + "|" + sExp);
    const cookie = `${COOKIE}=${sPayload}.${await sign(env, "session|" + sPayload)}; Path=/admin; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`;
    return json({ ok: true }, 200, { "Set-Cookie": cookie });
  }
  return json({ ok: false, message: "Unknown request." }, 400);
}

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  try {
    if (url.pathname === "/admin/login" && request.method === "POST") return await handleLogin(request, env);
    if (url.pathname === "/admin/logout") {
      return new Response(null, { status: 302, headers: { Location: "/admin/", "Set-Cookie": `${COOKIE}=; Path=/admin; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
    }
    if (await validSession(request, env)) {
      const res = await next();
      const out = new Response(res.body, res);
      out.headers.set("Cache-Control", "no-store");
      out.headers.set("X-Robots-Tag", "noindex, nofollow");
      return out;
    }
  } catch (e) {
    return new Response("The admin is not configured yet: " + e.message, { status: 500 });
  }
  if (url.pathname.endsWith(".yml") || url.pathname.endsWith(".js")) return new Response("Sign in first.", { status: 401 });
  return new Response(LOGIN_PAGE, { status: 401, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}

const LOGIN_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Halcyon Admin</title><link rel="icon" href="/assets/favicon.svg">
<style>
:root{--ink:#0b0a09;--gold:#c9a96e;--gold-dk:#8a6a33;--paper:#f5f0e6}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--ink);color:var(--paper);font-family:Arial,Helvetica,sans-serif;padding:24px max(16px,env(safe-area-inset-left))}
.card{width:100%;max-width:380px;border:1px solid #3a342c;border-radius:4px;padding:32px 28px;background:#14120f}
img{height:44px;display:block;margin-bottom:24px}h1{font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 6px}p{color:#b9b0a2;font-size:14px;line-height:1.5;margin:0 0 20px}
label{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin-bottom:6px}
input{width:100%;padding:12px 14px;border-radius:3px;border:1px solid #3a342c;background:#0b0a09;color:var(--paper);font-size:16px;margin-bottom:16px}
input:focus{outline:2px solid var(--gold);outline-offset:1px}#code{letter-spacing:.4em;font-size:22px;text-align:center}
button{width:100%;padding:13px;border:0;border-radius:3px;background:var(--gold);color:var(--ink);font-weight:bold;font-size:15px;cursor:pointer}button:disabled{opacity:.6}
.msg{min-height:20px;font-size:13px;color:#f3c9bc;margin-top:12px}.link{background:none;color:var(--gold);font-weight:normal;font-size:13px;margin-top:10px;padding:6px}
[hidden]{display:none!important}
</style></head><body>
<main class="card">
  <img src="/assets/logo-light.svg" alt="Halcyon Literary House">
  <form id="s1"><h1>Admin sign in</h1><p>Enter your email. We will send you a 6-digit code.</p>
    <label for="email">Email</label><input id="email" type="email" autocomplete="email" required>
    <button type="submit">Send my code</button></form>
  <form id="s2" hidden><h1>Check your email</h1><p id="sent">If this email is allowed, a code is on its way. It works for 10 minutes.</p>
    <label for="code">6-digit code</label><input id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required>
    <button type="submit">Sign in</button><button class="link" type="button" id="back">Use another email or resend</button></form>
  <div class="msg" id="msg" role="alert"></div>
</main>
<script>
var challenge = "", msg = document.getElementById("msg");
function post(data){ return fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(r){return r.json();}); }
document.getElementById("s1").addEventListener("submit", function(e){ e.preventDefault(); var b=this.querySelector("button"); b.disabled=true; msg.textContent="";
  post({step:"send",email:document.getElementById("email").value}).then(function(d){ b.disabled=false; if(!d.ok){msg.textContent=d.message;return;} challenge=d.challenge;
    document.getElementById("s1").hidden=true; document.getElementById("s2").hidden=false; document.getElementById("code").focus(); }).catch(function(){b.disabled=false;msg.textContent="Connection problem. Please try again.";}); });
document.getElementById("s2").addEventListener("submit", function(e){ e.preventDefault(); var b=this.querySelector("button"); b.disabled=true; msg.textContent="";
  post({step:"verify",challenge:challenge,code:document.getElementById("code").value}).then(function(d){ if(d.ok){location.reload();return;} b.disabled=false; msg.textContent=d.message; }).catch(function(){b.disabled=false;msg.textContent="Connection problem. Please try again.";}); });
document.getElementById("back").addEventListener("click", function(){ document.getElementById("s2").hidden=true; document.getElementById("s1").hidden=false; msg.textContent=""; });
</script></body></html>`;
