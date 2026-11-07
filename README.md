# Halcyon Literary House: halcyonliterary.com

Static website plus one Cloudflare Pages Function.

- `public/`: the website (HTML, CSS, JS, translations, images, roadmap PDF)
- `functions/api/contact.js`: sends the contact and roadmap forms through Resend

## Cloudflare Pages settings
- Framework preset: None
- Build command: (leave empty)
- Build output directory: `public`
- Secret: `RESEND_API_KEY` = your Resend API key
- Optional variables: `TO_EMAIL`, `FROM_EMAIL`

The sending domain (halcyonliterary.com) must be verified in Resend.
See `public/HOW-TO-UPLOAD.txt` for the full guide.
