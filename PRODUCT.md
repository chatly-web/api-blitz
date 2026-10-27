# Civic Issue Reporter · API Blitz
<!-- impeccable:product-schema 1 -->
## Platform
web
## Stack
Next.js App Router, React, TypeScript, Tailwind CSS and shadcn-style UI primitives. Supabase Auth/Postgres/RLS, Cloudinary signed authenticated image uploads, locally generated DiceBear avatars, Picsum image placeholders. Optional Google Maps and Gemini; Leaflet/OpenStreetMap fallback.
## Purpose
Implement the user-supplied Civic Issue Reporter plan: Google-authenticated citizens report a civic issue with a photo and exact coordinates, discuss and vote using anonymous public identities, and see before/after proof of resolution. Allowlisted authorities handle reports without exposing personal attribution.
## Identity and privacy
Public identities contain generated handles and HMAC-derived avatar seeds only. No Google name, photo or email is displayed. Authority actor IDs exist only in private database tables. Account information remains in Supabase Auth; the project owner is trusted. Exact report locations and submitted descriptions are intentionally shared with signed-in community members.
## Core workflows
Login → map → photo/location report → report detail → votes and one-level replies. Authority queue → atomic claim → internal/public updates → resolution requiring an after-photo. My Reports shows the signed-in citizen's submissions.
## Current configuration
Real credentials and provider console settings must be supplied before live authentication, uploads and database writes work. Missing configuration renders a clear setup state. /demo and /demo/report are explicitly read-only samples and cannot impersonate an authenticated citizen or authority.
## Scope
No home feed, citizen sorting, notifications, comment photos, WhatsApp, escalation, offline mode or ward polygons. Optional reopening-by-vote is deferred. The old blank homepage request is superseded by the explicit implementation-plan request.
