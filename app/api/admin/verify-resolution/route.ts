import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiError, ApiError, readJson, requireViewer } from '@/lib/api';
import { receiptSchema } from '@/lib/validation';
import { verifyUploadedImage } from '@/lib/cloudinary';
import { serviceClient } from '@/lib/supabase/service';
import { verifyResolutionEvidence } from '@/lib/gemini';

const verifyResolutionSchema = z.object({
  reportId: z.string().uuid(),
  afterPhoto: receiptSchema,
});

export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request, true);
    const input = await readJson(request, verifyResolutionSchema);

    // Verify authority owns this upload for the 'after' purpose
    if (!await verifyUploadedImage(input.afterPhoto, viewer.id, 'after')) {
      throw new ApiError(400, 'Invalid resolution photo. Please upload a valid JPG, PNG, or WebP.');
    }

    // Fetch the citizen report to get the original before-photo
    const { data: report, error } = await serviceClient()
      .from('reports')
      .select('before_public_id, category')
      .eq('id', input.reportId)
      .maybeSingle();

    if (error || !report) {
      throw new ApiError(404, 'Report not found.');
    }

    const result = await verifyResolutionEvidence(
      report.before_public_id,
      input.afterPhoto.publicId,
      report.category
    );

    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
