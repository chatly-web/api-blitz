import test from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient,User } from '@supabase/supabase-js';
import { resolveViewerProfile } from '../lib/viewer-profile';
const user={id:'11111111-1111-4111-8111-111111111111',email:'authority@example.invalid',email_confirmed_at:'2026-10-01',app_metadata:{providers:['google']}} as User;
function fixture(profile:{handle:string;avatar_seed:string}|null,official=false,officialError=false){
 const calls:string[]=[];
 const db={from(table:string){return {select(){calls.push(`select:${table}`);const result=()=>table==='profiles'?{data:profile,error:null}:{data:official?{email:user.email}:null,error:officialError?{message:'unavailable'}:null};const query={eq(){return query;},maybeSingle:async()=>result(),single:async()=>result()};return query;},async upsert(value:{handle:string;avatar_seed:string}){calls.push('write:profile');profile=value;return {error:null};}};}} as unknown as SupabaseClient;
 return {db,calls};
}
test('existing viewers use parallel reads and perform no profile write',async()=>{
 const {db,calls}=fixture({handle:'neighbor-existing',avatar_seed:'a'.repeat(64)},true);
 const viewer=await resolveViewerProfile(user,db,'test-stable-secret');
 assert.equal(viewer.identity.handle,'neighbor-existing');assert.equal(viewer.isAdmin,true);
 assert.deepEqual(calls,['select:profiles','select:official_emails']);
});
test('profile creation happens only for a missing profile',async()=>{
 const {db,calls}=fixture(null);
 const viewer=await resolveViewerProfile(user,db,'test-stable-secret');
 assert.match(viewer.identity.avatarSeed,/^[a-f0-9]{64}$/);
 assert.equal(calls.filter(call=>call==='write:profile').length,1);
 assert.equal(viewer.isAdmin,false);
});
test('unconfirmed emails and allowlist errors cannot grant authority access',async()=>{
 const f=fixture({handle:'neighbor',avatar_seed:'a'.repeat(64)},true,true);
 assert.equal((await resolveViewerProfile(user,f.db,'secret')).isAdmin,false);
 const unconfirmed=fixture({handle:'neighbor',avatar_seed:'a'.repeat(64)},true);
 assert.equal((await resolveViewerProfile({...user,email_confirmed_at:undefined},unconfirmed.db,'secret')).isAdmin,false);
 assert.equal(unconfirmed.calls.includes('select:official_emails'),false);
});
