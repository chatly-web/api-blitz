import 'server-only';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentViewer } from '@/lib/auth';
import { hasBackend } from '@/lib/env';
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!origin || origin !== new URL(expected).origin) throw new ApiError(403, 'This action must be sent from this site.');
}
export async function requireViewer(request: Request, admin = false) {
  assertSameOrigin(request);
  if (!hasBackend()) throw new ApiError(admin ? 404 : 503, admin ? 'Not found.' : 'Service configuration is not complete yet.');
  const viewer = await currentViewer();
  if (!viewer) throw new ApiError(401, 'Sign in with Google to continue.');
  if (admin && !viewer.isAdmin) throw new ApiError(404, 'Not found.');
  return viewer;
}
export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new ApiError(415, 'Send a JSON request.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 20000) throw new ApiError(413, 'Request is too large.');
  let value;
  try { value = JSON.parse(text); } catch { throw new ApiError(400, 'Invalid JSON request.'); }
  const result = schema.safeParse(value);
  if (!result.success) throw new ApiError(400, result.error.issues[0]?.message || 'Check your form values.');
  return result.data;
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
  return NextResponse.json({ error: 'The request could not be completed. Please try again.' }, { status: 500 });
}
export function databaseError(error: { message: string } | null) {
  if (!error) return;
  if (error.message.includes('RATE_LIMIT')) throw new ApiError(429, 'Too many requests. Please wait a minute and try again.');
  if (error.message.includes('ALREADY_CLAIMED')) throw new ApiError(409, 'Another authority member already claimed this report.');
  if (error.message.includes('CLAIM_REQUIRED')) throw new ApiError(409, 'Claim this report before updating it.');
  if (error.message.includes('AFTER_PHOTO_REQUIRED')) throw new ApiError(400, 'Upload an after-photo before resolving the report.');
  throw new ApiError(400, 'The change could not be saved. Refresh the page and try again.');
}
