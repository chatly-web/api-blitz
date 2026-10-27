# Civic Issue Reporter · API Blitz

A Next.js implementation of the supplied civic reporting plan. Citizens sign in with Google, submit photo/location evidence, discuss and vote under generated identities, and follow anonymous authority updates with required resolution photos.

**Configuration is required for live services.** No credentials are committed. Fill the ignored `.env.local` file and Vercel project environment variables, apply the Supabase migration, and configure Google OAuth. See [the setup guide](docs/SETUP.md).

## Start

```sh
npm ci
npm run setup:check  # after filling .env.local; prints status only
npm run dev
# http://localhost:3000
npm test
npm run check
npm run build
```

## Pages

| Route | Purpose |
| --- | --- |
| /login | Google sign-in and an honest missing-configuration state |
| /map | Authenticated issue pins, popups, status legend, accessible report links |
| /report/new | Signed photo upload, optional analysis, GPS/manual location, duplicate check |
| /r/[id] | Before/after proof, votes, comments and one-level replies |
| /me | Your submitted reports |
| /admin | Allowlisted authority queue with claim flags, filters and sorting |
| /admin/r/[id] | Claim, status, internal/public notes and after-photo resolution |
| /demo and /demo/report | Clearly labeled, read-only samples, available without credentials |

## Project structure

```text
app/                 App Router pages, auth callback and protected API routes
components/          Avatar, CloudImage, BeforeAfter, maps, votes, comments, uploads
components/ui/       shadcn-style accessible Button/Input/Textarea/Badge primitives
lib/supabase/        Browser, cookie-aware server and server-only service clients
lib/                 Auth, private data access, validation, Cloudinary, Gemini
supabase/migrations/ Database schema, RLS, triggers and atomic server RPCs
scripts/seed.ts      Explicitly confirmed 36-report test-data seed
tests/               Validation, identities and embedded PostgreSQL security tests
docs/SETUP.md        Exact provider, environment, OAuth and deployment setup
```

## Important implementation details

- HMAC-derived avatar seeds and handles; Google names/emails/photos stay out of public profiles.
- All mutations authenticate server-side. Authority checks happen on every admin endpoint and in the database RPCs.
- Private tables have both RLS and revoked client grants. Clients cannot directly bypass sanitized reads, moderation or signed-upload validation.
- Cloudinary uploads use authenticated assets, signed receipts and signed face-blurred delivery. Originals are not anonymously readable.
- Votes toggle; target-level locking keeps scores correct. Claims, status changes and audit entries are transactional.
- Resolution requires an after-photo in both application validation and a database constraint.
- Optional Gemini failure permits manual reporting and flags allowed comments for review. Maps have OpenStreetMap/manual-coordinate fallbacks.
- PostgreSQL tests run locally using PGlite, without contacting a Supabase project.

Optional reopening votes are not included. No home feed, notifications, comment photos, WhatsApp, escalation, offline mode or ward polygons were added.

## Current live configuration

The connected site is https://api-blitz-three.vercel.app. Until real service variables and the database migration are applied, sign-in/write actions are unavailable and the app says so. The read-only preview never pretends to be a real logged-in account or a verified civic report.

Photo IDs are random and never include a citizen/authority avatar seed or user ID. Upload ownership is recorded in a private table. Direct browser table reads are denied to prevent bypassing the sanitized data layer.
