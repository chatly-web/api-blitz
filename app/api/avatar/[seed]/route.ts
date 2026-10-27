import { createAvatar } from '@dicebear/core';
import { personas, bottts, lorelei, identicon, adventurer, shapes } from '@dicebear/collection';

// Supported DiceBear styles for anonymous citizen personas and official ward badges
const COLLECTIONS = {
  personas,
  bottts,
  lorelei,
  identicon,
  adventurer,
  shapes,
} as const;

type StyleKey = keyof typeof COLLECTIONS;

export async function GET(request: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  if (!/^[a-f0-9]{64}$/.test(seed)) return new Response('Not found', { status: 404 });

  const url = new URL(request.url);
  const requestedStyle = url.searchParams.get('style') as StyleKey;
  const isAuthority = url.searchParams.get('role') === 'authority';

  // Authorities use identicon / bottts badges by default; citizens use chosen style or personas
  const styleKey: StyleKey = requestedStyle && requestedStyle in COLLECTIONS
    ? requestedStyle
    : isAuthority
      ? 'identicon'
      : 'personas';

  const collection = COLLECTIONS[styleKey];

  const svg = createAvatar(collection as any, {
    seed,
    size: 80,
    radius: isAuthority ? 20 : 50,
    backgroundColor: isAuthority
      ? ['153e2d', '216c51', '2f855a']
      : ['d1e7dd', 'cfe2ff', 'e2d9f3', 'fde8cd', 'd4edda', 'f8d7da'],
  }).toString();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    }
  });
}

