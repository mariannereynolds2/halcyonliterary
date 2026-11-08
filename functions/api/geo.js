// Returns the visitor's country, as seen by Cloudflare (no outside service needed).
export async function onRequestGet({ request }) {
  const country = (request.cf && request.cf.country) || request.headers.get("CF-IPCountry") || "";
  return new Response(JSON.stringify({ country }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
}
