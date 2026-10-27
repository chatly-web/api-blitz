import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiError, databaseError, readJson, requireViewer } from '@/lib/api';
import { serviceClient } from '@/lib/supabase/service';
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer(request, true);
    const { reportId } = await readJson(request, z.object({ reportId: z.uuid() }));
    const { error } = await serviceClient().rpc('claim_report', { p_actor: viewer.id, p_report_id: reportId });
    databaseError(error);
    return NextResponse.json({ claimed: true });
  } catch (error) { return apiError(error); }
}
