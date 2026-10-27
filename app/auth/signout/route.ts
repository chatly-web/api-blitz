import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server';
import { apiError, assertSameOrigin } from '@/lib/api';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await (await serverClient()).auth.signOut();
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || request.url), 303);
  } catch (error) { return apiError(error); }
}
