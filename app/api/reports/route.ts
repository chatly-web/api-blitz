import { NextResponse } from 'next/server';
import { apiError, ApiError, databaseError, readJson, requireViewer } from '@/lib/api';
import { reportSchema } from '@/lib/validation';
import { verifyUploadedImage } from '@/lib/cloudinary';
import { serviceClient } from '@/lib/supabase/service';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request);
    const input = await readJson(request, reportSchema);
    await rateLimit(viewer.id, 'report', 5, 300);
    if (!await verifyUploadedImage(input.photo, viewer.id, 'before')) throw new ApiError(400, 'The uploaded image could not be verified. Use a JPG, PNG or WebP under 8 MB and try again.');
    const db = serviceClient();
    const nearby = await db.rpc('nearby_reports', { p_lat: input.lat, p_lng: input.lng, p_category: input.category, p_radius_m: 30 });
    databaseError(nearby.error);
    if (nearby.data?.length && !input.duplicateAcknowledged) return NextResponse.json({ error: 'A similar report is nearby. Check it before submitting another.', nearby: nearby.data }, { status: 409 });
    const { data, error } = await db.from('reports').insert({ author_id: viewer.id, category: input.category, description: input.description, lat: input.lat, lng: input.lng, ward: input.ward || null, before_public_id: input.photo.publicId }).select('id').single();
    databaseError(error);
    return NextResponse.json({ id: data!.id }, { status: 201 });
  } catch (error) { return apiError(error); }
}
