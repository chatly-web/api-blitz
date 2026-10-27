// The single place for the eventual problem-specific product logic.
// Independent providers run in parallel for now. If one provider needs another's
// result, change runner.mjs to call them in that dependency order.
export function buildSolution({ input, results }) {
  return {
    title: 'Integration preview',
    summary: 'The selected adapters ran. The event problem and API capabilities are still unknown, so this is a wiring check, not a finished solution.',
    input,
    contributions: results.filter(result => result.status === 'success').map(result => ({
      apiId: result.id,
      mode: result.data.mode,
      summary: result.data.summary,
    })),
    nextStep: 'Connect the real APIs, then define how their three contributions help one user solve one problem.',
  };
}
