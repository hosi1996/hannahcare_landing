# Hannah Care

Fast, local-first Next.js landing site for Hannah Care Property Maintenance. The public site has four English pages, a conversion form, SEO system routes, and a password-protected leads view.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set a strong `LEADS_PASSWORD` and `SESSION_SECRET`.
4. Run `npm run dev` and open `http://localhost:3000`.

Production check: `npm run build`, then `npm start`.

## Edit the site

All public copy, contact details, CTA labels, navigation data, SEO copy, service data, form labels, and theme values live in `content/site.json`. Replace every value in square brackets before launch. The build prints a list of unresolved placeholders.

Images use the paths in `content/site.json`. Until real photographs are supplied, the site renders lightweight designed placeholders with the supplied art-direction brief. Put a final optimized AVIF/WebP/JPEG at the matching path under `public/images/` when ready. Brand SVGs are local in `public/brand/`; no CDN is used.

## Leads

Submitted leads are validated on client/server boundaries and stored in `data/leads.db`. Open `/leads`; unauthenticated visitors are redirected to `/leads/login`. Change access using `LEADS_PASSWORD`; changing `SESSION_SECRET` invalidates sessions. `LEADS_WEBHOOK_URL` can optionally receive a non-blocking POST after saves. SQLite needs persistent disk; for serverless deployment, replace the `lib/store.ts` adapter with managed Postgres using `DATABASE_URL`.

## Tracking

Replace tracking placeholders in `content/site.json` only after consent and conversion IDs are confirmed. Placeholder IDs are never loaded. Click/form events use the `dataLayer` event names from the brief. Add a consent-managed, locally reviewed GTM loader before paid traffic goes live.

## Deployment

- VPS/Node: install dependencies, set environment variables, run `npm run build`, then run `npm start` behind Nginx/Caddy with HTTPS and a persistent `data/` volume.
- Vercel: import the repository and set environment variables. Vercel's ephemeral filesystem is not suitable for the SQLite adapter; use a managed Postgres adapter first.

## Pre-launch checklist

- Replace every `[PLACEHOLDER]` in `content/site.json`.
- Confirm phone, WhatsApp, email, service area, and trade licence.
- Replace placeholder imagery with optimized real photos.
- Add verified rating/review data only; then enable reviews.
- Configure tracking IDs, conversion labels, and consent.
- Test Call, WhatsApp, all anchor links, and form submissions.
- Test `/leads`, password rotation, persistence, and webhook delivery.
- Run `npm run test`, `npm run check`, `npm run build`, and a mobile Lighthouse audit.
