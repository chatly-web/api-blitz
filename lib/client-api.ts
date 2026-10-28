import { aiProviderForFailure, requestAiRetry } from '@/lib/ai-retry';
export async function postJson<T = Record<string, unknown>>(url: string, body: unknown, method = 'POST', requestSignal?: AbortSignal): Promise<T> {
  for (;;) {
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: requestSignal ? AbortSignal.any([requestSignal,AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000) });
      let payload: unknown;
      try { payload = await response.json(); }
      catch { throw new Error('The server response could not be read. Please try again.'); }
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('The server returned an unexpected response. Please try again.');
      if (!response.ok) {
        const message = 'error' in payload && typeof payload.error === 'string' ? payload.error : 'The request could not be completed.';
        throw Object.assign(new Error(message), { payload, status: response.status });
      }
      return payload as T;
    } catch (error) {
      if (requestSignal?.aborted) throw error;
      const failure = error as { status?: number; payload?: { code?: unknown } };
      const provider = aiProviderForFailure(url, failure.status, failure.payload?.code);
      if (!provider || !await requestAiRetry(provider, errorMessage(error), requestSignal)) throw error;
    }
  }
}
export function errorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') return 'The request timed out. Please try again.';
    if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) return 'Could not reach the server. Check your connection and try again.';
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
