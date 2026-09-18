# Karakoram Disability Forum — Site

Next.js 14 (App Router, JavaScript) + MongoDB, built from `kdf-nextjs-mongodb-build-spec.md`.

## Sections beyond the original spec

Added on top of the base build:

- **Cabinet** (`#cabinet`) — a flexible-depth org chart (`cabinetMembers` collection, each
  member optionally pointing at a parent) rendered as a pure-CSS tree. Manage it at
  `/admin/cabinet`.
- **Donate** (`#donate`) — read-only bank transfer details pulled from Settings. No payment
  processing happens on the site.
- **Become a Member** (`#become-a-member`) — two options, Honorary or Permanent; submitting
  posts to `/api/membership` and lands in the `/admin/membership-requests` inbox (same
  no-account, no-payment pattern as the contact form).
- **Partners** (`#partners`) — logo strip for funders (AKRSP, SCOM, etc.), managed at
  `/admin/partners`.
- **Footer socials** — Facebook/Instagram/WhatsApp/LinkedIn icons, shown only when a URL is
  set in Settings.
- **Google Map** — embedded in the Contact section using the address already in Settings
  (no API key needed; if you'd rather use exact coordinates or a Place ID later, swap the
  `src` in `components/site/MapEmbed.js`).

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in MONGODB_URI at minimum
npm run seed                        # creates indexes, a super_admin, and site settings
npm run dev
```

The seed script creates `admin@kdf.org.pk` / `ChangeMe123!` unless `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` env vars are set — **change this password after first login**, or
seed with your own values:

```bash
SEED_ADMIN_EMAIL=you@kdf.org.pk SEED_ADMIN_PASSWORD='a-strong-password' npm run seed
```

## Required environment variables

See `.env.local.example`. At minimum for local development:

- `MONGODB_URI` — a MongoDB Atlas (or local) connection string
- `NEXTAUTH_SECRET` — `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` locally

Optional (features degrade gracefully without them):

- `CLOUDINARY_*` — enables the admin image uploader (`/api/upload`); without it, admins can
  paste image URLs directly, and unpublished items fall back to the illustrated placeholder art.
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` — enables distributed rate limiting on `/api/contact`
  and login; without it, an in-memory fallback rate-limits per server instance.
- `REVALIDATE_SECRET` — enables instant ISR revalidation on publish; without it, the
  homepage/shop/gallery still refresh via the 300s `revalidate` window.

## What was verified in this environment

- `npx next build` compiles cleanly (no syntax/type/lint errors), for both the base build
  and after adding Cabinet/Donate/Become a Member/Partners/socials/map.
- `/admin/login` renders correctly at runtime (screenshot-verified), including after the
  new features were added.
- Fixed two real bugs caught by runtime testing: the CSP's `font-src` blocked `next/font`'s
  self-hosted font files (needed `'self'`, not just `fonts.gstatic.com`), and `script-src`
  needed `'unsafe-eval'` in dev only for webpack's HMR — both fixed in `next.config.js`.
- The homepage, `/shop`, and `/gallery` require a **reachable MongoDB** to render (they
  query the database directly in Server Components per the spec's caching strategy) — no
  MongoDB instance was available in this sandbox, so those pages (and the new Cabinet tree,
  Donate section, membership form, and Partners strip) could not be runtime-verified
  end-to-end here. Once `MONGODB_URI` points at a real cluster (Atlas or local `mongod`)
  and `npm run seed` has run, `npm run dev` and click through: homepage → cabinet → shop →
  gallery → donate → become a member → partners → contact/map → admin CRUD for each →
  contact/membership form submissions → admin inboxes.

## Notes on the Next.js version

The spec calls for "Next.js 14+"; this is pinned to `14.2.35`, the latest patch on the 14.x
line, rather than jumping to Next 16 (`npm audit`'s suggested fix). Next 16 would require
React 19 and breaks `next-auth` v4's App Router integration — not a safe drop-in for this
stack. 14.2.35 carries the individual security fixes relevant to this app's surface area
(no custom server, no i18n rewrites, no Server Actions in use).
