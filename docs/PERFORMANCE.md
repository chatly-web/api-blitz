# Loading-path improvements

Measured on 28 October 2026. Before changes, a signed-in Chrome map reload took approximately 3,175 ms until its main heading was visible. This is one warm browser measurement, not a Core Web Vitals score or a guarantee for other devices.

## Removed repeated work

- Proxy is session-refresh transport only. `getSession()` is never used for user identity, Google-provider checks or authority authorization. Protected pages and every protected API continue to validate the user with `getUser()` on the server. Anonymous page requests are rejected/redirected before rendering.
- Existing-profile reads perform no upsert. Profile and current authority-allowlist reads run concurrently. Missing profiles are still initialized on first use. Request-scoped React cache does not share identities or permissions between users/requests.
- Image delivery uses fresh authenticated-user validation without loading a profile or authority role. Upload ownership and report-membership queries run concurrently. Private, no-store response behavior remains.
- Map popup content is constructed only when opened. Previously constructing an image element and setting its source for every marker triggered evidence requests even for unopened pins.
- The assistant loads its code only on first opening. Its launch control is available immediately.
- Main report evidence uses eager/high-priority loading; lower-page photos stay lazy and placeholder images have low fetch priority.
- Specific route skeletons remain. The global skeleton was removed so it does not stream a success response before the authority layout rejects an invalid session.

## Validation

Automated tests cover existing-profile reads without writes, first-use initialization, unconfirmed emails and allowlist failures denying authority access, and the prior privacy/mutation invariants. HTTP checks cover signed-out redirects, unauthorized authority 404, image denial and a forged session cookie failing to reveal authority content. Browser checks cover deferred assistant opening and map popup images.

Authentication checks, RLS, private DTOs, authority allowlist and required photo evidence remain in place. Supabase architecture and data schema are unchanged.
