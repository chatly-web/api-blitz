import 'server-only';
import { cache } from 'react';
import { serverClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { hasBackend, requiredEnv } from '@/lib/env';
import { anonymousIdentity } from '@/lib/identity';
import type { Viewer } from '@/lib/types';
export const currentViewer = cache(async (): Promise<Viewer | null> => {
  if (!hasBackend()) return null;
  const supabase = await serverClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || !user.app_metadata.providers?.includes('google')) return null;
  const db = serviceClient();
  const generated = anonymousIdentity(user.id, requiredEnv('AVATAR_HMAC_SECRET'));
  const { error: createError } = await db.from('profiles').upsert({ id: user.id, handle: generated.handle, avatar_seed: generated.avatarSeed }, { onConflict: 'id', ignoreDuplicates: true });
  if (createError) throw new Error('Could not load your anonymous profile. Check the database migration.');
  const { data: profile, error: profileError } = await db.from('profiles').select('handle,avatar_seed').eq('id', user.id).single();
  if (profileError || !profile) throw new Error('Could not load your anonymous profile.');
  let isAdmin = false;
  if (user.email && user.email_confirmed_at) {
    const { data: official } = await db.from('official_emails').select('email').eq('email', user.email.toLowerCase()).maybeSingle();
    isAdmin = Boolean(official);
  }
  return { id: user.id, identity: { handle: profile.handle, avatarSeed: profile.avatar_seed }, isAdmin };
});
