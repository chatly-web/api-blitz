import 'server-only';
import { serviceClient } from '@/lib/supabase/service';
import { ApiError } from '@/lib/api';
export async function rateLimit(actor: string, bucket: string, limit: number, windowSeconds = 60) {
  const { data, error } = await serviceClient().rpc('consume_rate_limit', { p_actor: actor, p_bucket: bucket, p_limit: limit, p_window_seconds: windowSeconds });
  if (error) throw new ApiError(503, 'The request limit could not be checked. Please try again.');
  if (!data) throw new ApiError(429, 'Too many requests. Please wait a minute and try again.');
}
