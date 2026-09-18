# Deploying the KDF Website

## 1. Environment variables

Copy `.env.local.example` to `.env.local` (for local dev) or set these directly
in your hosting platform's environment variable settings (for production —
never commit `.env.local` or paste secrets into files that get pushed to git).

### Required — the site will not run without these

| Variable | Where to get it | Notes |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Firebase console → Project settings → General | Your Firebase project's ID. **This project already has a live production Firestore database with real KDF content** (settings, cabinet members, partners, etc.) — ask the previous developer/owner for access to that exact project rather than creating a new empty one, unless you intend to start fresh. |
| `FIREBASE_CLIENT_EMAIL` | Firebase console → Project settings → Service accounts → Generate new private key (downloads a JSON file) | The `client_email` field from that downloaded JSON. |
| `FIREBASE_PRIVATE_KEY` | Same downloaded JSON | The `private_key` field. Paste it exactly as downloaded, including the `\n` escape sequences — the app un-escapes them at startup. Wrap the whole value in quotes in `.env.local`. |
| `NEXTAUTH_SECRET` | Generate one: `openssl rand -base64 32` | Signs admin login sessions. Must be a long random string, kept secret. |
| `NEXTAUTH_URL` | Your production domain, e.g. `https://kdf.org.pk` | Must match the real deployed URL exactly (protocol + domain, no trailing slash). |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard | Used for all image uploads (products, gallery, leaders, partners, cabinet photos). |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard | |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard | Keep secret — used server-side to sign upload requests. |

### Optional — site works without them, with reduced functionality

| Variable | Effect if left blank |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No rate-limiting on public forms (membership/contact) — recommended for production but not required to run. |
| `REVALIDATE_SECRET` | Only protects the manual `/api/revalidate` cache-busting endpoint. |
| `WHATSAPP_NUMBER` | Falls back to the real KDF WhatsApp number already hardcoded as a default. |
| `RESEND_API_KEY`, `ADMIN_NOTIFY_EMAIL` | Currently unused in code — reserved for a future email-notification feature, not wired up yet. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Only used by the one-off seed script (see below). |

## 2. Does the site seed itself automatically?

**No.** Seeding (`scripts/seed.js`) never runs automatically — not on build,
not on start, not on deploy. It only runs if someone manually executes:

```bash
npm run seed
```

### When you actually need to run it

- **Only if `FIREBASE_PROJECT_ID` points at a brand-new, empty Firestore database.**
- If you're pointed at the existing production Firestore project (the one
  this project has been developed and tested against, migrated from the
  original MongoDB data — see below), **do not run seed** — it already has
  real organizational data, and re-running the seed script against it risks
  creating duplicate admin/settings records.

### If you do need to seed a fresh database

1. Set `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
   to the new empty project's service-account credentials.
2. Optionally set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` first — otherwise
   the seed script creates a default admin login
   (`admin@kdf.org.pk` / `ChangeMe123!`) that you must change immediately
   after first login.
3. Run `npm run seed` once, from a machine with those env vars set (locally,
   or as a one-off shell command against production — not as part of the
   deploy/build pipeline).
4. Log into `/admin` with the seeded credentials and change the password.
5. Never run it again against that same database.

## 3. Firestore composite indexes

`firestore.indexes.json` in the repo root lists the composite indexes the
public/admin queries need (status + sort-field combinations). If a query ever
errors with "requires an index", Firestore's error message includes a direct
console link to create it — click it and the index builds in a minute or two.
To deploy them all at once instead: install the Firebase CLI, `firebase login`,
`firebase use <project-id>`, then `firebase deploy --only firestore:indexes`.

## 4. Build & start

Standard Next.js production flow — no custom steps required beyond the env
vars above:

```bash
npm install
npm run build
npm run start
```

For platforms like Vercel, just set the environment variables in the project
dashboard and connect the git repo — build/start is handled automatically.
