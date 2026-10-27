// Normalized adapter contract: return a small, display-safe result.
export function mockResult(id, input) {
  return {
    mode: 'mock',
    summary: `Placeholder response from ${id.replace('-', ' ').toUpperCase()}.`,
    data: { input, message: 'Replace this fixture after the API is announced.' },
  };
}
