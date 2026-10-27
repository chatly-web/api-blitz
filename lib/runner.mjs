import { adapters } from './apis/registry.mjs';
import { buildSolution } from './solution.mjs';
export class ValidationError extends Error {}
export function validateRun(body, available = adapters) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('Send a JSON object.');
  const { selectedApiIds, input } = body;
  if (!Array.isArray(selectedApiIds) || selectedApiIds.length !== 3 || new Set(selectedApiIds).size !== 3) {
    throw new ValidationError('Choose exactly three different APIs.');
  }
  if (!selectedApiIds.every(id => available.some(adapter => adapter.id === id))) throw new ValidationError('Choose APIs from the five event slots.');
  if (typeof input !== 'string' || !input.trim() || input.length > 1000) throw new ValidationError('Enter a problem or test input between 1 and 1,000 characters.');
  return { selectedApiIds, input: input.trim() };
}
export async function runSolution(body, { available = adapters, timeoutMs = 9000 } = {}) {
  const { input, selectedApiIds } = validateRun(body, available);
  const chosen = selectedApiIds.map(id => available.find(adapter => adapter.id === id));
  const settled = await Promise.all(chosen.map(async adapter => {
    const start = performance.now();
    const controller = new AbortController();
    let timeout;
    try {
      const timedOut = new Promise((_, reject) => {
        timeout = setTimeout(() => { controller.abort(); reject(new Error('Timed out')); }, timeoutMs);
      });
      const data = await Promise.race([Promise.resolve().then(() => adapter.execute({ input, signal: controller.signal })), timedOut]);
      if (!data || !['mock', 'live'].includes(data.mode) || typeof data.summary !== 'string') throw new Error('Invalid adapter response');
      return { id: adapter.id, name: adapter.name, status: 'success', durationMs: Math.round(performance.now() - start), data };
    } catch {
      // Do not expose provider URLs, tokens, stack traces, or sensitive payloads.
      return { id: adapter.id, name: adapter.name, status: 'error', durationMs: Math.round(performance.now() - start), error: 'This API could not complete the request. Check its configuration and try again.' };
    } finally { clearTimeout(timeout); }
  }));
  const successful = settled.filter(result => result.status === 'success').length;
  return {
    status: successful === 3 ? 'success' : successful === 0 ? 'error' : 'partial',
    mode: chosen.some(adapter => adapter.mode === 'mock') || settled.some(result => result.data?.mode === 'mock') ? 'mock' : 'live',
    selectedApiIds,
    results: settled,
    solution: successful === 3 ? buildSolution({ input, results: settled }) : null,
    message: successful === 3 ? 'All three adapters completed.' : 'All three selected APIs must succeed before a combined result is available. Try again after fixing the failed API.',
  };
}
