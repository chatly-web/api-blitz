export async function postJson<T = Record<string, unknown>>(url: string, body: unknown, method = 'POST'): Promise<T> {
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const payload = await response.json();
  if (!response.ok) throw Object.assign(new Error(payload.error || 'The request could not be completed.'), { payload, status: response.status });
  return payload as T;
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? (error.name === 'TimeoutError' ? 'The request timed out. Please try again.' : error.message) : 'Something went wrong. Please try again.';
}
