import test from 'node:test';
import assert from 'node:assert/strict';
import { anonymousIdentity } from '../lib/identity';
import { reportSchema,commentSchema,voteSchema,locationSchema } from '../lib/validation';
test('anonymous handles and avatar seeds are stable, distinct and contain no original id', () => {
  const first = anonymousIdentity('private-auth-id','a-long-server-secret');
  assert.deepEqual(first,anonymousIdentity('private-auth-id','a-long-server-secret'));
  assert.notDeepEqual(first,anonymousIdentity('other-auth-id','a-long-server-secret'));
  assert.notDeepEqual(first,anonymousIdentity('private-auth-id','a-different-server-secret'));
  assert.match(first.avatarSeed,/^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(first).includes('private-auth-id'),false);
});
test('report validation requires evidence, meaningful text and valid coordinates', () => {
  const input = { category:'Pothole',description:'Road surface needs repair.',lat:23,lng:72,photo:{publicId:'civic/photo',version:1,signature:'a'.repeat(40)} };
  assert.equal(reportSchema.safeParse(input).success,true);
  for (const changes of [{photo:undefined},{description:'short'},{lat:91},{lng:-181},{category:'Unsupported'}]) assert.equal(reportSchema.safeParse({...input,...changes}).success,false);
});
test('comment and vote schemas reject arbitrary targets and excessive content', () => {
  assert.equal(commentSchema.safeParse({reportId:'bad',body:'hello'}).success,false);
  assert.equal(voteSchema.safeParse({targetId:'10000000-0000-4000-8000-000000000001',targetType:'report',value:2}).success,false);
  assert.equal(locationSchema.safeParse({lat:0,lng:0}).success,true);
});
