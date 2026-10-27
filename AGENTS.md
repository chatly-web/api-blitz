# Civic Issue Reporter guidance

Implement and maintain the user-supplied civic issue reporter plan. Read PRODUCT.md, DESIGN.md and docs/SETUP.md before changes.

- Stack: Next.js App Router, TypeScript, Tailwind, shadcn-style components, Supabase, Cloudinary, DiceBear. The explicit plan supersedes the old plain-JavaScript/blank-starter constraints.
- Core APIs: Cloudinary, DiceBear, Picsum. LoremFlickr is seed-only. Google Maps and Gemini remain optional and have manual/fallback paths.
- Preserve a simple white UI. Use installed Impeccable/UI/UX Pro Max skills when relevant, inheriting DESIGN.md.
- Never print, commit or expose secret environment values. .env.local is ignored; .env.example contains names and blank placeholders only.
- Every mutation authenticates on the server. Every authority route checks the Google email allowlist. Public DTOs must omit raw user IDs and all acting admin IDs, emails and names.
- Audit logs, authority notes, rate-limit state and official emails have no anon/authenticated grants. Direct client reads and writes are denied; use server routes so moderation/upload validation cannot be bypassed.
- All report images use authenticated Cloudinary assets and signed, face-blurred delivery. Never silently serve unblurred originals.
- Resolved status requires photo evidence in both app/database validation. Claim and status/audit writes are atomic.
- Run npm test, npm run check and npm run build for meaningful logic changes. Check responsive layouts and credential-free setup states after UI work.
- Use Git push to main to deploy through the existing GitHub/Vercel connection. Do not browser-upload source or change unrelated credentials/settings.
