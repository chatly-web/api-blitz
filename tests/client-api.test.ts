import test from 'node:test';
import assert from 'node:assert/strict';
import { postJson,errorMessage } from '../lib/client-api';
test('transport preserves structured validation errors without retrying writes', async t => {
  let calls=0;
  t.mock.method(globalThis,'fetch',async () => { calls++; return Response.json({error:'Check nearby reports.',nearby:[{id:'existing-report'}]},{status:409}); });
  await assert.rejects(postJson('/api/reports',{}),error=>{
    const value=error as Error & {status:number;payload:{nearby:{id:string}[]}};
    assert.equal(value.status,409); assert.equal(value.message,'Check nearby reports.');
    assert.equal(value.payload.nearby[0].id,'existing-report'); return true;
  });
  assert.equal(calls,1);
});
test('invalid JSON and unexpected success payloads produce recoverable messages', async t => {
  const mocked=t.mock.method(globalThis,'fetch',async()=>new Response('<html>Upstream unavailable</html>',{status:502}));
  await assert.rejects(postJson('/api/comments',{}),/server response could not be read/);
  mocked.mock.mockImplementation(async()=>Response.json(null));
  await assert.rejects(postJson('/api/comments',{}),/unexpected response/);
});
test('timeouts and network failures have useful user-facing messages',()=>{
  assert.match(errorMessage(new DOMException('operation expired','TimeoutError')),/timed out/);
  assert.match(errorMessage(new TypeError('Failed to fetch')),/Check your connection/);
  assert.match(errorMessage({}),/try again/);
});
