import { catalog } from '../lib/apis/registry.mjs';
import { runSolution, ValidationError } from '../lib/runner.mjs';
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
export async function handleRequest(request) {
  const url = new URL(request.url);
  const route = url.searchParams.get('route') || url.pathname.split('/').pop();
  if (route === 'catalog') {
    return request.method === 'GET' ? json({ apis: catalog(), requiredCount: 3 }) : json({ error: 'Use GET for the catalog.' }, 405, { Allow: 'GET' });
  }
  if (route !== 'run') return json({ error: 'API route not found.' }, 404);
  if (request.method !== 'POST') return json({ error: 'Use POST to run a solution.' }, 405, { Allow: 'POST' });
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Send application/json.' }, 415);
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 12000) return json({ error: 'Request body is too large.' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: 'The JSON body is invalid.' }, 400); }
  try { return json(await runSolution(body)); }
  catch (error) { return error instanceof ValidationError ? json({ error: error.message }, 400) : json({ error: 'Unable to run the solution. Please try again.' }, 500); }
}
export default { fetch: handleRequest };
