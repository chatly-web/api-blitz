import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
export async function GET(_request: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  if (!/^[a-f0-9]{64}$/.test(seed)) return new Response('Not found', { status: 404 });
  const svg = createAvatar(shapes, { seed, size: 80, backgroundColor: ['e8f0e9','f4e9d8','e6edf5'], radius: 50 }).toString();
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" } });
}
