import { createAvatar } from '@dicebear/core';
import { personas } from '@dicebear/collection';
export async function GET(_request: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  if (!/^[a-f0-9]{64}$/.test(seed)) return new Response('Not found', { status: 404 });
  const svg = createAvatar(personas, {
    seed,
    size: 80,
    radius: 50,
    backgroundColor: ['d1e7dd', 'cfe2ff', 'e2d9f3', 'fde8cd', 'd4edda', 'f8d7da'],
  }).toString();
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" } });
}

