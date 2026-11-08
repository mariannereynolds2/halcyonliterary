# Halcyon Literary House: halcyonliterary.com

The website is generated from the content files in `content/`, which you edit at
**halcyonliterary.com/admin**. Every save in the admin is committed here, and
Cloudflare rebuilds and publishes the site within a minute or two.

## Folders
- `content/`: everything editable (team, books, reviews, case studies, services, FAQ, legal, extra pages)
- `assets/`: images (book covers in `assets/books`, team photos in `assets/team`, other uploads in `assets/uploads`)
- `admin/`: the admin editor (Sveltia CMS) and its settings
- `i18n/`: the hand-checked translations (12 languages)
- `functions/api/contact.js`: sends the contact and roadmap forms through Resend
- `public/`: the generated website (rebuilt automatically, do not edit by hand)

## Signing in to the admin
Open halcyonliterary.com/admin, enter hello@halcyonliterary.com and type the 6-digit code you receive (sent through Resend). You stay signed in for 7 days on that browser; go to /admin/logout to sign out. To allow another email, add ADMIN_EMAILS (comma-separated) in Cloudflare Pages settings.
The gate is `functions/admin/_middleware.js`.

## Cloudflare Pages settings
- Build command: `bash build.sh`
- Build output directory: `public`
- Secret: `RESEND_API_KEY`

## Translations
Text that already existed keeps its hand-checked translations. Anything new or changed
through the admin is translated automatically during the build (free MyMemory service).
If the free daily limit is reached, the text shows in English until the next publish.
