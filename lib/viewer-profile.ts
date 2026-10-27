import type { SupabaseClient,User } from '@supabase/supabase-js';
import { anonymousIdentity } from '@/lib/identity';
import type { Viewer } from '@/lib/types';
/** Resolve only the data the shell needs. Existing profiles are never written on page reads. */
export async function resolveViewerProfile(user:User,db:SupabaseClient,hmacSecret:string):Promise<Viewer>{
 const profileTask=db.from('profiles').select('handle,avatar_seed').eq('id',user.id).maybeSingle();
 const officialTask=user.email&&user.email_confirmed_at?db.from('official_emails').select('email').eq('email',user.email.toLowerCase()).maybeSingle():Promise.resolve({data:null,error:null});
 const [profileResult,official]=await Promise.all([profileTask,officialTask]);
 if(profileResult.error)throw new Error('Could not load your anonymous profile.');
 let profile=profileResult.data;
 if(!profile){
  const generated=anonymousIdentity(user.id,hmacSecret);
  const {error}=await db.from('profiles').upsert({id:user.id,handle:generated.handle,avatar_seed:generated.avatarSeed},{onConflict:'id',ignoreDuplicates:true});
  if(error)throw new Error('Could not create your anonymous profile.');
  const result=await db.from('profiles').select('handle,avatar_seed').eq('id',user.id).single();
  if(result.error||!result.data)throw new Error('Could not load your anonymous profile.');
  profile=result.data;
 }
 return {id:user.id,identity:{handle:profile.handle,avatarSeed:profile.avatar_seed},isAdmin:!official.error&&Boolean(official.data)};
}
