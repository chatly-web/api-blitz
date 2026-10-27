import 'server-only';
import { cache } from 'react';
import { serverClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';
import { hasBackend,requiredEnv } from '@/lib/env';
import { resolveViewerProfile } from '@/lib/viewer-profile';
import type { Viewer } from '@/lib/types';
/** Fresh server validation is authoritative; no cookie user object grants access. */
export const authenticatedUser=cache(async()=>{
 if(!hasBackend())return null;
 const {data:{user},error}=await (await serverClient()).auth.getUser();
 return !error&&user?.app_metadata.providers?.includes('google')?user:null;
});
export const currentViewer=cache(async():Promise<Viewer|null>=>{
 const user=await authenticatedUser();
 if(!user)return null;
 return resolveViewerProfile(user,serviceClient(),requiredEnv('AVATAR_HMAC_SECRET'));
});
