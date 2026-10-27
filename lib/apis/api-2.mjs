import { mockResult } from './mock.mjs';

export const adapter = {
  id: 'api-2',
  name: 'API 2',
  description: 'Waiting for the event announcement.',
  mode: 'mock',
  // TODO: replace the mock with the provider request and normalize its response.
  // Keep credentials in process.env. Never return keys or raw provider errors.
  async execute({ input, signal }) {
    signal.throwIfAborted();
    return mockResult('api-2', input);
  },
};
