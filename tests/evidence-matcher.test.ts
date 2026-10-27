import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEvidencePair, evaluateResolutionVerdict } from '../lib/evidence-matcher';

test('resolution evidence rejects missing before or after photo reference', () => {
  assert.equal(validateEvidencePair(null, 'civic/after-1').valid, false);
  assert.equal(validateEvidencePair('civic/before-1', null).valid, false);
  assert.equal(validateEvidencePair('civic/before-1', '  ').valid, false);
  assert.match(validateEvidencePair('civic/before-1', '').reason || '', /required/i);
});

test('resolution evidence rejects identical before and after photos', () => {
  const result = validateEvidencePair('civic/pothole-broken-road', 'civic/pothole-broken-road');
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /identical to the original/i);
});

test('resolution evidence accepts distinct valid before and after photo references', () => {
  const result = validateEvidencePair('civic/before-123', 'civic/after-456');
  assert.equal(result.valid, true);
  assert.equal(result.reason, undefined);
});

test('resolution AI evaluation rejects mismatched evidence with high or medium confidence', () => {
  const highConfMismatch = evaluateResolutionVerdict({
    matches: false,
    confidence: 'high',
    reason: 'The resolution photo depicts an unrelated indoor room, not the reported street pothole.',
  });
  assert.equal(highConfMismatch.accepted, false);
  assert.match(highConfMismatch.message, /indoor room/);

  const medConfMismatch = evaluateResolutionVerdict({
    matches: false,
    confidence: 'medium',
    reason: 'Photo shows a different street corner with no sign of asphalt repair.',
  });
  assert.equal(medConfMismatch.accepted, false);
  assert.match(medConfMismatch.message, /different street/);
});

test('resolution AI evaluation accepts legitimate matching resolution evidence', () => {
  const match = evaluateResolutionVerdict({
    matches: true,
    confidence: 'high',
    reason: 'The pothole shown in the report has been freshly repaved and sealed.',
  });
  assert.equal(match.accepted, true);
  assert.match(match.message, /repaved/);
});

test('resolution AI evaluation allows manual review for low confidence uncertainties', () => {
  const uncertain = evaluateResolutionVerdict({
    matches: false,
    confidence: 'low',
    reason: 'Extreme angle difference prevents definitive confirmation.',
  });
  assert.equal(uncertain.accepted, true);
  assert.match(uncertain.message, /Extreme angle difference/);
});
