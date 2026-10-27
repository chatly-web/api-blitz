import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticatedUser } from '@/lib/auth';
import { serviceClient } from '@/lib/supabase/service';
import { cloudinaryUrl, ownsUpload } from '@/lib/cloudinary';
export async function GET(request: Request) {
  const viewer = await authenticatedUser();
  if (!viewer) return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  const parsed = z.object({ publicId: z.string().regex(/^civic\/evidence\/[a-f0-9-]{36}$/), width: z.coerce.number().int().min(64).max(1600).default(1200) }).safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return new Response('Not found', { status: 404 });
  const { publicId,width } = parsed.data;
  const [owned,reported]=await Promise.all([ownsUpload(publicId,viewer.id),serviceClient().from('reports').select('id').or(`before_public_id.eq.${publicId},after_public_id.eq.${publicId}`).limit(1)]);
  if(!owned&&(reported.error||!reported.data?.length))return new Response('Not found',{status:404});
  const response = NextResponse.redirect(cloudinaryUrl(publicId,width));
  response.headers.set('Cache-Control','private, no-store');
  return response;
}
