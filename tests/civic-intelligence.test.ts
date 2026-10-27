import test from 'node:test';
import assert from 'node:assert/strict';
import { workPriority,orderForAttention,reportHistory,communityOutcomes } from '../lib/civic-intelligence';
import { demoReports } from '../lib/demo';
const now=Date.parse('2026-10-28T12:00:00Z');
test('attention ordering is bounded, age-led, explainable and never promotes resolved work',()=>{
 const old={...demoReports[1],createdAt:'2026-10-01T00:00:00Z',score:1000,claimed:false};
 assert.deepEqual(workPriority(old,now),{total:100,age:60,support:25,unclaimed:15,daysWaiting:(now-Date.parse(old.createdAt))/86400000});
 assert.equal(workPriority({...old,status:'resolved'},now).total,0);
 assert.equal(workPriority({...old,score:-100},now).age,60);
 assert.equal(workPriority({...old,createdAt:'invalid'},now).age,0);
 assert.equal(workPriority({...old,createdAt:'2027-01-01'},now).age,0);
 assert.ok(workPriority({...old,score:-100},now).total>=60);
 const rows=[{...old,id:'b'},{...old,id:'a'}];const sorted=orderForAttention(rows,now);assert.equal(sorted[0].id,'a');assert.equal(rows[0].id,'b');
});
test('public timeline whitelists milestones and never exposes actor identity or private notes',()=>{
 const events=reportHistory('2026-10-27T09:00:00Z',[
  {id:1,action:'claim',created_at:'2026-10-27T10:00:00Z',actor_id:'secret-admin'},
  {id:2,action:'internal_note',created_at:'2026-10-27T11:00:00Z',body:'private-note',actor_id:'secret-admin'},
  {id:3,action:'status:in_progress',created_at:'2026-10-27T12:00:00Z',actor_id:'secret-admin'},
  {id:4,action:'status:in_progress',created_at:'2026-10-27T13:00:00Z'},
  {id:5,action:'status:resolved',created_at:'2026-10-27T14:00:00Z'},
  {id:6,action:'status:open',created_at:'2026-10-27T15:00:00Z'},
  {id:7,action:'status:unknown',created_at:'2026-10-27T16:00:00Z'},
  {id:8,action:'status:resolved',created_at:'invalid'},
 ]);
 assert.deepEqual(events.map(event=>event.type),['submitted','claimed','status','status','status']);
 assert.deepEqual(events.map(event=>event.status),['open',null,'in_progress','resolved','open']);
 for(const value of ['secret-admin','private-note','actor_id','internal_note'])assert.equal(JSON.stringify(events).includes(value),false);
 assert.deepEqual(Object.keys(events[1]).sort(),['occurredAt','status','type']);
});
test('outcome metrics use real denominators, missing evidence stays visible and empty data is safe',()=>{
 const result=communityOutcomes(demoReports);assert.equal(result.total,3);assert.equal(result.counts.resolved,1);assert.equal(result.resolvedWithPhoto,1);assert.equal(result.resolutionRate,33);assert.equal(result.awaitingClaim,1);
 assert.equal(communityOutcomes([{...demoReports[0],afterPublicId:null}]).resolvedWithPhoto,0);
 assert.equal(communityOutcomes([]).resolutionRate,0);assert.equal(communityOutcomes([]).total,0);
 assert.equal(result.categories.reduce((total,row)=>total+row.total,0),result.total);
});
