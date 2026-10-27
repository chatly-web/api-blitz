import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { anonymousIdentity } from '../lib/identity';
import { categories, statuses } from '../lib/types';
function env(name: string) { const value=process.env[name]; if (!value) throw new Error(`Set ${name} before seeding.`); return value; }
if (!process.argv.includes('--confirm-demo-seed')) throw new Error('This uploads demo images and creates 36 labeled reports. Run npm run seed -- --confirm-demo-seed only in a test project.');
const db=createClient(env('NEXT_PUBLIC_SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
const authorId=env('SEED_AUTHOR_ID');
const {data:{user},error:userError}=await db.auth.admin.getUserById(authorId);
if (userError || !user?.app_metadata.providers?.includes('google')) throw new Error('SEED_AUTHOR_ID must be an existing Google test account.');
const identity=anonymousIdentity(authorId,env('AVATAR_HMAC_SECRET'));
const profile=await db.from('profiles').upsert({id:authorId,handle:identity.handle,avatar_seed:identity.avatarSeed},{onConflict:'id',ignoreDuplicates:true});
if (profile.error) throw new Error('Could not create demo profile. Apply the database migration first.');
cloudinary.config({cloud_name:env('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),api_key:env('CLOUDINARY_API_KEY'),api_secret:env('CLOUDINARY_API_SECRET'),secure:true});
async function image(index:number,category:string,purpose:'before'|'after') {
  const options={public_id:`civic/evidence/${randomUUID()}`,type:'authenticated' as const,resource_type:'image' as const,overwrite:false,upload_preset:env('CLOUDINARY_UPLOAD_PRESET')};
  const keyword=category==='Pothole'?'pothole':category==='Garbage'?'garbage':'street';
  const source=index%2===0?`https://loremflickr.com/1000/700/${keyword}?lock=${index+101}`:`https://picsum.photos/seed/civic-${index}-${purpose}/1000/700`;
  try { return (await cloudinary.uploader.upload(source,options)).public_id; }
  catch { return (await cloudinary.uploader.upload(`https://picsum.photos/seed/civic-fallback-${index}-${purpose}/1000/700`,options)).public_id; }
}
for(let index=0;index<36;index++) {
  const category=categories[index%categories.length],status=statuses[index%statuses.length];
  const before=await image(index,category,'before');
  const after=status==='resolved'?await image(index,category,'after'):null;
  const result=await db.from('reports').insert({author_id:authorId,category,description:`[DEMO] ${category} sample report ${index+1}. Generated for an event demonstration; the source image and location do not represent a verified issue.`,lat:23.0225+(index%6-3)*.0018,lng:72.5714+(Math.floor(index/6)-3)*.002,ward:`Demo ward ${index%3+1}`,status,claimed:status!=='open',before_public_id:before,after_public_id:after,public_note:status==='resolved'?'[DEMO] Sample resolution only. Not an actual authority action.':null,created_at:new Date(Date.now()-index*3600000).toISOString()});
  if (result.error) throw new Error(`Could not insert demo report ${index+1}. Uploaded assets may need manual cleanup.`);
  console.log(`Created labeled demo report ${index+1}/36`);
}
console.log('Done. Demo reports are visibly labeled [DEMO]. No Google names or emails were copied into public profiles.');
