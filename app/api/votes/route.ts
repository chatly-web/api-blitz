import { NextResponse } from 'next/server';
import { apiError, databaseError, readJson, requireViewer } from '@/lib/api';
import { voteSchema } from '@/lib/validation';
import { serviceClient } from '@/lib/supabase/service';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request);
    const input = await readJson(request, voteSchema);
    await rateLimit(viewer.id, 'vote', 60);
    const { data, error } = await serviceClient().rpc('cast_vote', { p_actor: viewer.id, p_target_type: input.targetType, p_target_id: input.targetId, p_value: input.value });
    databaseError(error);
    return NextResponse.json(data);
  } catch (error) { return apiError(error); }
}
