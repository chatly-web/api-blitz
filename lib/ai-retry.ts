export const AI_RETRY_EVENT = 'civic:ai-retry';
export type AiRetryRequest = { provider: 'Gemini' | 'Groq'; message: string; signal?: AbortSignal; resolve: (retry: boolean) => void };
export function aiProviderForFailure(url: string, status?: number, code?: unknown): 'Gemini' | 'Groq' | null {
  if (code === 'AI_UNAVAILABLE') return 'Gemini';
  if (status !== undefined && status !== 429 && status < 500) return null;
  if (url === '/api/assistant') return 'Groq';
  if (url === '/api/analyze-photo' || url === '/api/admin/verify-resolution') return 'Gemini';
  return null;
}
export function requestAiRetry(provider: AiRetryRequest['provider'], message: string, signal?: AbortSignal): Promise<boolean> {
  if (typeof window === 'undefined' || signal?.aborted) return Promise.resolve(false);
  return new Promise(resolve => {
    let settled = false;
    const finish = (retry: boolean) => { if (settled) return; settled = true; signal?.removeEventListener('abort', abort); resolve(retry); };
    const abort = () => finish(false);
    signal?.addEventListener('abort', abort, { once: true });
    window.dispatchEvent(new CustomEvent<AiRetryRequest>(AI_RETRY_EVENT, { detail: { provider, message, signal, resolve: finish } }));
  });
}
