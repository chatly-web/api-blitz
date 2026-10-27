import { NextResponse } from 'next/server';
import { apiError, ApiError, databaseError, readJson, requireViewer } from '@/lib/api';
import { adminUpdateSchema } from '@/lib/validation';
import { verifyUploadedImage } from '@/lib/cloudinary';
import { serviceClient } from '@/lib/supabase/service';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request, true);
    const input = await readJson(request, adminUpdateSchema);
    if (input.afterPhoto && !await verifyUploadedImage(input.afterPhoto, viewer.id, 'after')) throw new ApiError(400, 'The resolution photo could not be verified. Upload a JPG, PNG or WebP under 8 MB.');
    const { error } = await serviceClient().rpc('update_report', { p_actor: viewer.id, p_report_id: input.reportId, p_status: input.status, p_public_note: input.publicNote, p_internal_note: input.internalNote, p_after_public_id: input.afterPhoto?.publicId || null });
    databaseError(error);
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
