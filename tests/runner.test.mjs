import test from 'node:test';
import assert from 'node:assert/strict';
import { runSolution, validateRun } from '../lib/runner.mjs';
import { handleRequest } from '../api/index.mjs';
const request = { selectedApiIds: ['api-1', 'api-3', 'api-5'], input: 'Help a user complete a task.' };
test('runs exactly the chosen three and labels fixtures as mocks', async () => {
  const result = await runSolution(request);
  assert.equal(result.status, 'success');
  assert.equal(result.mode, 'mock');
  assert.deepEqual(result.results.map(row => row.id), request.selectedApiIds);
  assert.equal(result.solution.contributions.length, 3);
});
test('rejects duplicate, unknown, missing and oversized input', () => {
  for (const body of [null, {}, { ...request, selectedApiIds: ['api-1', 'api-1', 'api-2'] }, { ...request, selectedApiIds: ['api-1', 'api-2'] }, { ...request, selectedApiIds: ['api-1', 'api-2', 'unknown'] }, { ...request, input: ' ' }, { ...request, input: 'x'.repeat(1001) }]) assert.throws(() => validateRun(body));
});
test('one failed API keeps diagnostics but does not invent a combined solution or leak provider errors', async () => {
  const available = request.selectedApiIds.map((id, index) => ({ id, name: id, execute: async () => { if (index === 1) throw new Error('secret-token'); return { mode: 'live', summary: 'Useful data', data: {} }; } }));
  const result = await runSolution(request, { available });
  assert.equal(result.status, 'partial');
  assert.equal(result.solution, null);
  assert.equal(result.results.filter(row => row.status === 'error').length, 1);
  assert.equal(JSON.stringify(result).includes('secret-token'), false);
});
test('an unresponsive adapter times out without blocking the run indefinitely', async () => {
  const available = request.selectedApiIds.map(id => ({ id, name: id, execute: () => new Promise(() => {}) }));
  const result = await runSolution(request, { available, timeoutMs: 10 });
  assert.equal(result.status, 'error');
  assert.equal(result.solution, null);
});
test('HTTP handler enforces methods and validates JSON', async () => {
  assert.equal((await handleRequest(new Request('http://localhost/api/catalog'))).status, 200);
  assert.equal((await handleRequest(new Request('http://localhost/api/run'))).status, 405);
  assert.equal((await handleRequest(new Request('http://localhost/api/run', { method: 'POST' }))).status, 415);
  assert.equal((await handleRequest(new Request('http://localhost/api/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid' }))).status, 400);
  const response = await handleRequest(new Request('http://localhost/api?route=run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).results.length, 3);
});
