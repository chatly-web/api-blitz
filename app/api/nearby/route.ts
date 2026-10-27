import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentViewer } from '@/lib/auth';
import { apiError, ApiError, databaseError } from '@/lib/api';
import { serviceClient } from '@/lib/supabase/service';
import { categories } from '@/lib/types';
export async function GET(request: Request) {
  try {
    if (!await currentViewer()) throw new ApiError(401, 'Sign in to check nearby issues.');
    const url = new URL(request.url);
    const parsed = z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180), category: z.enum(categories) }).safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) throw new ApiError(400, 'Choose a valid location and category.');
    const { data, error } = await serviceClient().rpc('nearby_reports', { p_lat: parsed.data.lat, p_lng: parsed.data.lng, p_category: parsed.data.category, p_radius_m: 30 });
    databaseError(error);
    return NextResponse.json({ nearby: data || [] });
  } catch (error) { return apiError(error); }
}
