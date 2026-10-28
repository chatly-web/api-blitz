import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_RETRY_EVENT, aiProviderForFailure, requestAiRetry, type AiRetryRequest } from '../lib/ai-retry';
import { postJson } from '../lib/client-api';

test('AI retry excludes authentication, validation and ordinary mutation failures', () => {
  assert.equal(aiProviderForFailure('/api/assistant', 401), null);
  assert.equal(aiProviderForFailure('/api/analyze-photo', 400), null);
  assert.equal(aiProviderForFailure('/api/comments', 500), null);
  assert.equal(aiProviderForFailure('/api/admin/update', 500), null);
  assert.equal(aiProviderForFailure('/api/comments', 503, 'AI_UNAVAILABLE'), 'Gemini');
  assert.equal(aiProviderForFailure('/api/admin/update', 503, 'AI_UNAVAILABLE'), 'Gemini');
  assert.equal(aiProviderForFailure('/api/assistant', 429), 'Groq');
  assert.equal(aiProviderForFailure('/api/analyze-photo'), 'Gemini');
});

test('retry repeats only the failed request with its original draft; dismiss never retries', async () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const oldFetch = globalThis.fetch;
  const surface = new EventTarget();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: surface });
  try {
    let requests = 0;
    let popups = 0;
    const body = { messages: [{ role: 'user', content: 'A broken streetlight' }] };
    surface.addEventListener(AI_RETRY_EVENT, event => {
      popups++;
      if (popups <= 2) (event as CustomEvent<AiRetryRequest>).detail.resolve(popups === 1);
    });
    globalThis.fetch = async (_url, options) => {
      requests++;
      assert.deepEqual(JSON.parse(options?.body as string), body);
      return Response.json(requests === 1 ? { error: 'Unavailable' } : { reply: 'Ready' }, { status: requests === 1 ? 503 : 200 });
    };
    assert.deepEqual(await postJson('/api/assistant', body), { reply: 'Ready' });
    assert.equal(requests, 2);
    globalThis.fetch = async () => { requests++; return Response.json({ error: 'Unavailable' }, { status: 503 }); };
    await assert.rejects(postJson('/api/assistant', body), /Unavailable/);
    assert.equal(requests, 3);
    assert.equal(popups, 2);
    const controller = new AbortController();
    const pending = requestAiRetry('Gemini', 'Unavailable', controller.signal);
    controller.abort();
    assert.equal(await pending, false);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
