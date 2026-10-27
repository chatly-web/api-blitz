import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiError, ApiError, readJson, requireViewer } from '@/lib/api';
import { createUploadSignature } from '@/lib/cloudinary';
import { serviceClient } from '@/lib/supabase/service';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request);
    const { purpose } = await readJson(request, z.object({ purpose: z.enum(['before','after']) }));
    if (purpose === 'after' && !viewer.isAdmin) throw new ApiError(404, 'Not found.');
    await rateLimit(viewer.id, 'upload', 10);
    const signed=createUploadSignature();
    const {error}=await serviceClient().from('upload_authorizations').insert({public_id:signed.params.public_id,actor_id:viewer.id,purpose});
    if (error) throw new ApiError(503,'Photo authorization could not be created. Please try again.');
    return NextResponse.json(signed);
  } catch (error) { return apiError(error); }
}
