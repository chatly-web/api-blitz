// A server-only helper for the future adapters. URLs must come from trusted
// adapter code/environment configuration, never arbitrary browser input.
export async function fetchJson(url, { signal, headers, ...options } = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { Accept: 'application/json', ...headers },
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  return response.json();
}
