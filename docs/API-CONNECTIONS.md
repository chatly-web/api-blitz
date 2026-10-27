# Connect the real APIs

No providers are known yet. Do not guess endpoints, authentication or response schemas. Each API slot stays in mock mode until its actual integration works.

1. Read the provider's official documentation. Record authentication, allowed use, input/output fields, quotas, pagination, CORS and error responses.
2. Pick the relevant `lib/apis/api-N.mjs`. Set its real name and description. Preserve its ID so saved selections remain valid.
3. Set credentials in `.env.local` for local work and Vercel project settings for deployed work. The current empty environment names are conventions to replace as needed. Never put secrets in `public/`, browser storage or Git.
4. Replace `execute({ input, signal })`. Validate and transform input, make the provider request on the server, and normalize the response into `{ mode: 'live', summary: string, data: object }`. Set adapter metadata `mode: 'live'` only when real requests are implemented. Return only data safe for the UI.
5. Import `fetchJson` from `../http.mjs`. It forwards cancellation, limits request duration and rejects HTTP errors. Provider URLs must be fixed in adapter code or trusted server configuration, never accepted as arbitrary user URLs.
6. Write a focused contract test using a recorded, sanitized fixture. Manually verify one real request without committing the response if it contains private data.
7. Compose meaningful output in `lib/solution.mjs`. Show what each selected API contributed. The current parallel runner is suitable for independent requests; change it to a sequential pipeline when later calls depend on earlier results.
8. Before enabling paid APIs publicly, decide access controls, rate limiting and spending limits based on the event rules and provider quotas. No paid API is currently connected.

## Adapter shape

```js
import { fetchJson } from '../http.mjs';

// Inside execute({ input, signal }):
// const raw = await fetchJson(theActualDocumentedEndpoint, {
//   signal,
//   headers: theProvidersDocumentedAuthHeaders,
// });
// return { mode: 'live', summary: userReadableSummary, data: safeNormalizedFields };
```

The endpoint, request parameters, authentication and fields above are deliberately not invented. The helper does not retry automatically: provider-specific rate-limit and idempotency behavior must be known first.

## Browser/server contract

`GET /api/catalog` → `{ apis: [{ id, name, description, mode }], requiredCount: 3 }`

`POST /api/run`, JSON body:

```json
{
  "selectedApiIds": ["api-1", "api-3", "api-5"],
  "input": "One problem or test input"
}
```

Run result: `{ status, mode, selectedApiIds, results, solution, message }`. A partial/error result keeps per-API diagnostics but has `solution: null`. Request validation errors use HTTP 400; unsupported methods use 405. Provider details are not echoed in public error messages.

## References

- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)

Provider-specific official documentation must be added when the five APIs arrive.
