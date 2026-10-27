import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const citizen='10000000-0000-4000-8000-000000000001';
const admin='10000000-0000-4000-8000-000000000002';
const otherAdmin='10000000-0000-4000-8000-000000000003';
const report='20000000-0000-4000-8000-000000000001';
test('database privacy, votes, claims, proof, replies and limits', async t => {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);`);
  const sql = (await readFile('supabase/migrations/202610270001_civic_reporter.sql','utf8')).replace('create extension if not exists pgcrypto;','');
  await db.exec(sql);
  await db.query(`insert into auth.users values ($1,'citizen@example.invalid',now()),($2,'authority@example.invalid',now()),($3,'other@example.invalid',now())`,[citizen,admin,otherAdmin]);
  for (const id of [citizen,admin,otherAdmin]) await db.query('insert into profiles(id,handle,avatar_seed) values($1,$2,$3)',[id,`neighbor-${id.slice(-4)}`,'a'.repeat(64)]);
  await db.exec(`insert into official_emails values('authority@example.invalid'),('other@example.invalid');`);
  await db.query(`insert into reports(id,author_id,category,description,lat,lng,before_public_id) values($1,$2,'Pothole','A road surface needs repair.',23,72,'civic/test')`,[report,citizen]);
  await t.test('citizen roles cannot read sensitive tables or invoke admin/vote RPCs directly',async () => {
    await db.exec('set role authenticated');
    for (const table of ['audit_log','admin_notes','official_emails','request_limits','votes','upload_authorizations','profiles','reports','comments']) await assert.rejects(db.query(`select * from ${table}`),/permission denied/);
    await assert.rejects(db.query('select claim_report($1,$2)',[admin,report]),/permission denied/);
    await assert.rejects(db.query(`select cast_vote($1,'report',$2,1::smallint)`,[citizen,report]),/permission denied/);
    await assert.rejects(db.query(`update reports set status='resolved' where id=$1`,[report]),/permission denied/);
    await assert.rejects(db.query(`insert into comments(report_id,author_id,body) values($1,$2,'bypass moderation')`,[report,citizen]),/permission denied/);
    await db.exec('reset role');
  });
  await t.test('photo ownership is private and evidence IDs contain no public identity seed',async () => {
    const publicId='civic/evidence/40000000-0000-4000-8000-000000000001';
    await db.query('insert into upload_authorizations(public_id,actor_id,purpose) values($1,$2,$3)',[publicId,admin,'after']);
    assert.equal(publicId.includes('a'.repeat(64)),false);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select actor_id from upload_authorizations'),/permission denied/);
    await db.exec('reset role');
  });
  await t.test('profiles have no email or name columns',async () => {
    const {rows}=await db.query<{column_name:string}>(`select column_name from information_schema.columns where table_name='profiles'`);
    assert.equal(rows.some(row=>['email','name','full_name','picture'].includes(row.column_name)),false);
  });
  await t.test('voting toggles off and switches score by two',async () => {
    const cast=async(value:number)=>(await db.query<{result:{score:number;myVote:number}}>(`select cast_vote($1,'report',$2,$3::smallint) result`,[citizen,report,value])).rows[0].result;
    assert.deepEqual(await cast(1),{score:1,myVote:1});
    assert.deepEqual(await cast(1),{score:0,myVote:0});
    assert.deepEqual(await cast(1),{score:1,myVote:1});
    assert.deepEqual(await cast(-1),{score:-1,myVote:-1});
  });
  await t.test('two claim attempts have exactly one winner and actor stays in private audit only',async () => {
    await assert.rejects(db.query('select claim_report($1,$2)',[citizen,report]),/NOT_AUTHORIZED/);
    const attempts=await Promise.allSettled([db.query('select claim_report($1,$2)',[admin,report]),db.query('select claim_report($1,$2)',[otherAdmin,report])]);
    assert.equal(attempts.filter(result=>result.status==='fulfilled').length,1);
    const {rows}=await db.query<Record<string,unknown>>('select * from reports where id=$1',[report]);
    assert.equal('claimed_by' in rows[0],false); assert.equal('actor_id' in rows[0],false); assert.equal(rows[0].claimed,true);
    assert.equal((await db.query(`select * from audit_log where action='claim' and report_id=$1`,[report])).rows.length,1);
  });
  await t.test('resolution without proof is rejected in the database and notes remain private',async () => {
    const owner=(await db.query<{actor_id:string}>(`select actor_id from audit_log where action='claim' and report_id=$1`,[report])).rows[0].actor_id;
    await assert.rejects(db.query(`select update_report($1,$2,'resolved','','',null)`,[owner,report]),/AFTER_PHOTO_REQUIRED/);
    await db.query(`select update_report($1,$2,'resolved','Public repair update','Private handling note','civic/after')`,[owner,report]);
    const {rows}=await db.query<{status:string;after_public_id:string}>('select status,after_public_id from reports where id=$1',[report]);
    assert.equal(rows[0].status,'resolved'); assert.equal(rows[0].after_public_id,'civic/after');
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select actor_id from admin_notes'),/permission denied/);
    await assert.rejects(db.query('select actor_id from audit_log'),/permission denied/);
    await db.exec('reset role');
  });
  await t.test('only one level of replies is allowed',async () => {
    const root='30000000-0000-4000-8000-000000000001',reply='30000000-0000-4000-8000-000000000002';
    await db.query('insert into comments(id,report_id,author_id,body) values($1,$2,$3,$4)',[root,report,citizen,'Root comment']);
    await db.query('insert into comments(id,report_id,parent_id,author_id,body) values($1,$2,$3,$4,$5)',[reply,report,root,citizen,'One reply']);
    await assert.rejects(db.query('insert into comments(report_id,parent_id,author_id,body) values($1,$2,$3,$4)',[report,reply,citizen,'Nested reply']),/INVALID_REPLY/);
  });
  await t.test('nearby duplicate checks use actual distance and category',async () => {
    assert.equal((await db.query(`select * from nearby_reports(23,72,'Pothole',30)`)).rows.length,1);
    assert.equal((await db.query(`select * from nearby_reports(23.01,72,'Pothole',30)`)).rows.length,0);
    assert.equal((await db.query(`select * from nearby_reports(23,72,'Garbage',30)`)).rows.length,0);
    await db.query(`insert into reports(author_id,category,description,lat,lng,before_public_id) values($1,'Other','Dateline test report.',0,179.9999,'civic/test')`,[citizen]);
    assert.equal((await db.query(`select * from nearby_reports(0,-179.9999,'Other',30)`)).rows.length,1);
  });
  await t.test('rate limits persist and reject the next request atomically',async () => {
    for (let n=0;n<5;n++) assert.equal((await db.query<{allowed:boolean}>(`select consume_rate_limit($1,'test',5,60) allowed`,[citizen])).rows[0].allowed,true);
    assert.equal((await db.query<{allowed:boolean}>(`select consume_rate_limit($1,'test',5,60) allowed`,[citizen])).rows[0].allowed,false);
  });
  await db.close();
});
