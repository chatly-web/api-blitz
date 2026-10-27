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
Login → map → photo/location report → report detail → votes and one-level replies. Authority queue with explainable attention ordering → atomic claim → internal/public updates → resolution requiring an after-photo. My Reports shows the signed-in citizen's submissions. Report history exposes sanitized milestones; Community Outcomes summarizes the current dataset and links resolution evidence.
## Current configuration
Real credentials and provider console settings must be supplied before live authentication, uploads and database writes work. Missing configuration renders a clear setup state. /demo and /demo/report are explicitly read-only samples and cannot impersonate an authenticated citizen or authority.
## Scope
No home feed, citizen sorting, notifications, comment photos, WhatsApp, escalation, offline mode or ward polygons. Optional reopening-by-vote is deferred. The user explicitly confirmed no Neon and no architecture replacement under the updated event requirements. The old blank homepage request is superseded by the explicit implementation-plan request.

## Current judging rubric and automatic intake
The user supplied the current weights: API Integration Depth 30%, Technical Execution 25%, Originality & Utility 25%, Demo & Presentation 20%. Intake connects a clearly labeled category preview to signed Cloudinary upload/delivery, automatic photo suggestions and permission-aware device location/reverse geocoding, then review under the citizen’s generated DiceBear identity. Users edit and explicitly submit; no AI or location failure fabricates evidence or silently submits a report.

Category upload previews now use licensed local photos because Picsum has no category-search capability. Picsum remains used for generic demo/loading imagery elsewhere. All sample images remain separate from citizen evidence.
