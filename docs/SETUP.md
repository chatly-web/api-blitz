# Connect the real services

## 1. Local environment

Use Node.js 22 or newer. Run `npm ci`. `.env.local` is ignored by Git. A blank local template is created only when the file does not already exist; existing credentials are never overwritten. Fill it from `.env.example`.

| Variable | Where to get it | Visibility |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project settings → API | Public |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase project API anon key | Public; protected by RLS/grants |
| SUPABASE_SERVICE_ROLE_KEY | Supabase project API service-role key | Server secret |
| AVATAR_HMAC_SECRET | `openssl rand -hex 32` | Server secret; keep stable |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | Cloudinary product environment | Public |
| CLOUDINARY_API_KEY | Cloudinary API keys | Used by signed browser uploads |
| CLOUDINARY_API_SECRET | Cloudinary API keys | Server secret |
| CLOUDINARY_UPLOAD_PRESET | Cloudinary signed upload preset | Server configuration |
| NEXT_PUBLIC_GEOAPIFY_KEY | Geoapify Places API & styled map tiles | Public; optional (OpenStreetMap fallback) |
| GEMINI_API_KEY | Google AI Studio | Server secret; optional |
| GEMINI_MODEL | An available Google AI model | Server configuration; default gemini-3.1-flash-lite |
| NEXT_PUBLIC_SITE_URL | Your deployed origin, no trailing slash | Public |
| SEED_AUTHOR_ID | An existing Google test user's Supabase Auth ID | Seed-only |

For local development set NEXT_PUBLIC_SITE_URL=http://localhost:3000. For production use https://api-blitz-three.vercel.app. Restart/redeploy after environment changes. Do not copy real keys into .env.example or public files.

After editing your local file, run `npm run setup:check`. It validates required names, basic URL/secret rules and optional fallbacks without printing values or contacting providers. It does not apply SQL or verify live accounts.

## 2. Supabase schema and Google login

1. Create a Supabase project.
2. Apply `supabase/migrations/202610270001_civic_reporter.sql` using the SQL editor or Supabase migrations. Run it once against a fresh project.
3. In Google Cloud, configure an OAuth web application. Add Supabase's callback URL (`https://YOUR_PROJECT.supabase.co/auth/v1/callback`) as an authorized redirect URI. Configure the consent screen and test users if the app is still in testing mode.
4. In Supabase Authentication → Providers, enable **Google only** and enter the Google OAuth client ID/secret. Disable email/password and other providers for this app.
5. In Supabase Auth URL configuration set Site URL and add both local and production `/auth/callback` URLs to the redirect allowlist.
6. Add an authority email using the SQL editor, not the browser:

```sql
insert into public.official_emails(email)
values ('replace-with-authority-google-email@example.com');
```

Use lowercase and replace the example. The user must sign in through Google and have a verified email. Authorities see claim flags and generic Ward Authority updates; personal attribution is only in the private audit log.

## 3. Cloudinary

1. Create a **signed** upload preset. Allow JPG/JPEG, PNG and WebP, max 8 MB. Set delivery type to **authenticated**. Do not enable unsigned uploads for this flow.
2. Put the preset name, product cloud name, API key and secret in the environment.
3. Confirm your account supports `e_blur_faces` delivery. The app always requests it and checks transformed image delivery before accepting a report/photo. No unblurred fallback is used.
4. If strict transformations are enabled, allow the app's signed transformation sizes. Authenticated originals require a valid signature; public pages receive signed, blurred transformed delivery URLs only.
5. Test a small photo on both before and resolution uploads. The server verifies Cloudinary's response signature, authenticated resource metadata, actual byte count/type, and the blurred delivery URL.

Cloudinary receives the original upload to perform image processing. Generated handles hide Google identity; they do not make the underlying service provider or project owner untrusted.

## 4. Optional Geoapify and Gemini

Geoapify: create a free project at https://myprojects.geoapify.com/ (free 3,000 requests/day, no credit card required) and copy your API key. It provides styled base map tiles (`osm-bright`) via Leaflet and automatic reverse geocoding/places lookup in the report location picker. Without a key the app automatically uses Leaflet with standard OpenStreetMap tiles. Manual coordinate inputs and GPS location remain supported.

Gemini: add the API key and a model enabled for your project. Photo analysis suggests category, severity and description; the user must review them. Comments are checked for harmful content/private details. If Gemini fails or is disabled, comments are allowed but flagged for private review; obvious email/phone patterns are blocked locally. No blocked comment body is stored. Analysis is opt-in; clicking it sends the face-blurred photo to Google AI. No keys are sent to the browser.

## 5. Run and deploy

```sh
npm run dev
npm test
npm run check
npm run build
```

The existing GitHub repo is chatly-web/api-blitz. Push to main to trigger Vercel. If the Vercel project still has manual static-site overrides, change Application Preset to Next.js and clear the old static output/build overrides; `vercel.json` declares Next.js. Add the real environment values in Vercel project settings, then redeploy.

The SQL tests use an isolated embedded PostgreSQL engine with minimal test Auth tables. They exercise the migration and policies but do not replace verification in your actual Supabase project.

## 6. Demo seed (test project only)

First sign in with a real Google test account; set its Auth ID as SEED_AUTHOR_ID. Then run:

```sh
npm run seed -- --confirm-demo-seed
```

This uploads Picsum/LoremFlickr sample images to authenticated Cloudinary storage and inserts 36 visibly labeled [DEMO] reports with varied categories/statuses. It never creates fake Google logins or copies Google identity into profiles. Source images may not match a civic category; all seed content remains labeled demonstration data. Do not run it against a live civic dataset. Uploaded assets can remain if a seed insert fails and should be cleaned up manually in the test environment.

## References

- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://cloudinary.com/documentation/upload_images
- https://cloudinary.com/documentation/response_signatures
- https://ai.google.dev/gemini-api/docs
