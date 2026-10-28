import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiError, ApiError, databaseError, readJson, requireViewer } from '@/lib/api';
import { commentSchema } from '@/lib/validation';
import { moderateComment } from '@/lib/gemini';
import { serviceClient } from '@/lib/supabase/service';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request);
    const input = await readJson(request, commentSchema);
    await rateLimit(viewer.id, 'comment', 5);
    const moderation = await moderateComment(input.body);
    if (moderation.reviewRequired) throw new ApiError(503, 'Comment moderation is temporarily unavailable. Your comment has not been posted.', 'AI_UNAVAILABLE');
    if (moderation.blocked) throw new ApiError(422, moderation.reason);
    const { error } = await serviceClient().from('comments').insert({ report_id: input.reportId, parent_id: input.parentId || null, author_id: viewer.id, body: input.body, review_required: moderation.reviewRequired });
    databaseError(error);
    return NextResponse.json({ ok: true, pendingReview: moderation.reviewRequired }, { status: 201 });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request) {
  try {
    const viewer = await requireViewer(request);
    const { id } = await readJson(request, z.object({ id: z.uuid() }));
    const { data, error } = await serviceClient().from('comments').delete().eq('id', id).eq('author_id', viewer.id).select('id');
    databaseError(error);
    if (!data?.length) throw new ApiError(404, 'Comment not found.');
    return NextResponse.json({ ok: true });
  } catch (error) { return apiError(error); }
}
