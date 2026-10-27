import test from 'node:test';
import assert from 'node:assert/strict';
import { publicIdentity, publicReport, publicComment } from '../lib/public-dto';
const privateId = 'private-auth-user-id';
const rawProfile = { id: privateId, email: 'private@example.invalid', full_name: 'Private Name', handle: 'neighbor-example', avatar_seed: 'a'.repeat(64) };
test('public report DTO whitelists data even when database joins contain private fields', () => {
  const row = { id:'report-id',author_id:privateId,actor_id:'private-admin-id',category:'Pothole',description:'A damaged public road.',lat:23,lng:72,ward:null,status:'open',claimed:false,before_public_id:'civic/evidence/random',after_public_id:null,public_note:null,score:2,created_at:'2026-10-27T10:00:00Z',profiles:rawProfile,admin_notes:'Private handling note' };
  const result = publicReport(row,1);
  assert.equal(result.myVote,1);
  assert.deepEqual(result.author,{handle:rawProfile.handle,avatarSeed:rawProfile.avatar_seed});
  const output = JSON.stringify(result);
  for (const privateValue of [privateId,'private-admin-id',rawProfile.email,rawProfile.full_name,'Private handling note']) assert.equal(output.includes(privateValue),false);
  assert.equal('author_id' in result,false);
  assert.equal('actor_id' in result,false);
});
test('public comment DTO reveals ownership as a boolean and omits moderation/private identity fields', () => {
  const row = { id:'comment-id',report_id:'report-id',parent_id:null,author_id:privateId,body:'A helpful update.',score:3,created_at:'2026-10-27T10:00:00Z',profiles:[rawProfile],review_required:true };
  const result = publicComment(row,privateId,-1);
  assert.equal(result.isOwn,true);
  assert.equal(result.myVote,-1);
  assert.equal(publicComment(row,'someone-else').isOwn,false);
  const output=JSON.stringify(result);
  for (const value of [privateId,rawProfile.email,rawProfile.full_name,'review_required']) assert.equal(output.includes(value),false);
  assert.deepEqual(publicIdentity([rawProfile]),{handle:rawProfile.handle,avatarSeed:rawProfile.avatar_seed});
});
