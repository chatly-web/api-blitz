import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiError, ApiError, readJson, requireViewer } from '@/lib/api';
import { receiptSchema } from '@/lib/validation';
import { verifyReceipt, ownsUpload } from '@/lib/cloudinary';
import { analyzePhoto } from '@/lib/gemini';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request);
    const { photo } = await readJson(request, z.object({ photo: receiptSchema }));
    if ((!verifyReceipt(photo) || !await ownsUpload(photo.publicId,viewer.id,'before'))) throw new ApiError(400, 'Upload your photo first.');
    await rateLimit(viewer.id, 'analysis', 5);
    if (!process.env.GEMINI_API_KEY) throw new ApiError(503, 'Photo suggestions are unavailable. Fill in the form manually.');
    try { return NextResponse.json(await analyzePhoto(photo.publicId)); }
    catch { throw new ApiError(503, 'Photo analysis is unavailable. You can still fill in and submit the form manually.'); }
  } catch (error) { return apiError(error); }
}
