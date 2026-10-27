# Plan coverage and verification

| Planned capability | Implementation |
| --- | --- |
| Google-only Supabase login | Auth client, callback, proxy refresh, server getUser/provider verification |
| Anonymous identities | HMAC handle/seed; local DiceBear SVG endpoint; explicit public DTOs |
| Cloudinary before/after uploads | Signed authenticated uploads, receipt verification, provider metadata checks |
| Face-blurred transformed images | Signed authenticated delivery with e_blur_faces, f_auto, q_auto, width limits |
| Picsum and LoremFlickr | Blurred load placeholders; explicit test-data seed |
| Exact pins and draggable location | Google Maps with OpenStreetMap fallback; manual coordinate input |
| Duplicate warning | SQL bounding-box + haversine, form warning, mandatory submit-time check |
| Comments and one-level replies | Server moderation, DB reply constraint, own-comment deletion |
| Votes | Atomic toggle RPC, score trigger and target locks |
| Anonymous authority queue | 404 guard, filters/sorting, claim flags only |
| Claim concurrency | Single conditional update + private audit in transaction |
| Status, private/public notes | Server/DB authority checks, private actor IDs, transactional update |
| Resolution photo requirement | UI disabled state, upload verification, DB check and RPC guard |
| My reports | Server-filtered author list |
| Seed | 36 explicit demo reports; requires real Google test account and service keys |

## Automated verification

The test suite runs the actual SQL migration in isolated embedded PostgreSQL (the pgcrypto extension statement is skipped there because gen_random_uuid is built in). It verifies private-table denial, denied direct client mutations/RPCs, vote toggling, single claim winner, after-photo constraints, private-note/audit restrictions, reply depth, nearby distance/category and persistent rate limits. Pure tests cover HMAC stability/privacy and request validation.

## Live setup still required

The following cannot be claimed as tested without your credentials: real Google OAuth, deployed Supabase RLS under actual project roles, real Cloudinary uploads/blur support, production Maps restrictions, Gemini classification and two-real-account interaction. Follow docs/SETUP.md and the PDF demo sequence after configuration.

The PDF's optional reopening button is deliberately deferred. Database writes are more restrictive than the sketch: all reads and mutations pass through server routes so moderation, upload validation and rate limits cannot be bypassed.

Privacy review corrections: random evidence IDs replace identity-based image paths; private upload ownership authorizes previews/submissions. All direct browser table reads are revoked, including raw profiles/reports/comments.

## Credential-independent follow-up

- Parent forms now wait for photo uploads before allowing submission, including replacement resolution photos.
- Discussion reads paginate instead of silently hiding comments beyond the first 500; vote lookups are batched.
- Public DTO regression tests inject private fields and assert those fields never reach browser-facing output.
- Transport tests cover structured validation failures, invalid JSON, unexpected responses and no automatic write retries.
- Network failures during Google sign-in reset the action and show a recoverable error.
- Anonymous as well as authenticated database roles are explicitly tested for denied direct table reads.

No seed data or live service mutations are part of these checks.
