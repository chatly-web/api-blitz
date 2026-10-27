import test from 'node:test';
import assert from 'node:assert/strict';
import { getPicsumUrl, getCivicPicsumUrl, CIVIC_SIMULATION_PAIRS } from '../lib/picsum';
import { deliveryUrl } from '../components/CloudImage';
import { createAvatar } from '@dicebear/core';
import { personas, bottts, lorelei, identicon, adventurer, shapes } from '@dicebear/collection';

test('picsum helper builds correct parametric URLs for simulation and thumbnails', () => {
  const standard = getPicsumUrl({ id: 142, width: 800, height: 500 });
  assert.equal(standard, 'https://picsum.photos/id/142/800/500');

  const withGrayscale = getPicsumUrl({ id: 142, width: 800, height: 500, grayscale: true });
  assert.equal(withGrayscale, 'https://picsum.photos/id/142/800/500?grayscale');

  const withBlur = getPicsumUrl({ id: 142, width: 800, height: 500, blur: 3 });
  assert.equal(withBlur, 'https://picsum.photos/id/142/800/500?blur=3');

  const withBoth = getPicsumUrl({ id: 142, width: 800, height: 500, grayscale: true, blur: 5 });
  assert.equal(withBoth, 'https://picsum.photos/id/142/800/500?grayscale&blur=5');

  // Blur clamped between 1 and 10
  const clampedMax = getPicsumUrl({ id: 84, width: 400, height: 300, blur: 99 });
  assert.equal(clampedMax, 'https://picsum.photos/id/84/400/300?blur=10');

  // Seeded civic picsum helper generates deterministic valid URL
  const seeded = getCivicPicsumUrl('test-seed-xyz', 64, 48);
  assert.match(seeded, /^https:\/\/picsum\.photos\/id\/\d+\/64\/48$/);

  // Civic simulation pairs define valid before and after references
  assert.ok(CIVIC_SIMULATION_PAIRS.length >= 3);
  for (const pair of CIVIC_SIMULATION_PAIRS) {
    assert.ok(pair.category);
    assert.ok((pair.beforeId as number) !== (pair.afterId as number));
  }
});

test('cloud deliveryUrl uses fill crop for thumbnails and limit for full evidence', () => {
  // Small width defaults to fill
  const thumbUrl = deliveryUrl('sample-public-id', 150);
  assert.ok(thumbUrl.includes('crop=fill'));

  // Large width defaults to limit
  const fullUrl = deliveryUrl('sample-public-id', 1200);
  assert.ok(fullUrl.includes('crop=limit'));

  // Explicit override is respected
  const explicitThumb = deliveryUrl('sample-public-id', 1200, 'fill');
  assert.ok(explicitThumb.includes('crop=fill'));
});

test('all supported DiceBear collections produce valid SVG outputs for citizen and authority roles', () => {
  const seed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const collections = { personas, bottts, lorelei, identicon, adventurer, shapes };

  for (const [name, collection] of Object.entries(collections)) {
    // Citizen variant
    const citizenSvg = createAvatar(collection as any, {
      seed,
      size: 80,
      radius: 50,
      backgroundColor: ['d1e7dd', 'cfe2ff'],
    }).toString();
    assert.ok(citizenSvg.startsWith('<svg'), `${name} citizen SVG rendered`);
    assert.ok(citizenSvg.includes('</svg>'), `${name} citizen SVG closed`);

    // Authority badge variant
    const authoritySvg = createAvatar(collection as any, {
      seed,
      size: 80,
      radius: 20,
      backgroundColor: ['153e2d', '216c51'],
    }).toString();
    assert.ok(authoritySvg.startsWith('<svg'), `${name} authority SVG rendered`);
    assert.ok(authoritySvg.includes('</svg>'), `${name} authority SVG closed`);
  }
});
