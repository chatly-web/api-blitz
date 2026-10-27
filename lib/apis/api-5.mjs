import { mockResult } from './mock.mjs';

export const adapter = {
  id: 'api-5',
  name: 'API 5',
  description: 'Waiting for the event announcement.',
  mode: 'mock',
  // TODO: replace the mock with the provider request and normalize its response.
  // Keep credentials in process.env. Never return keys or raw provider errors.
  async execute({ input, signal }) {
    signal.throwIfAborted();
    return mockResult('api-5', input);
  },
};
