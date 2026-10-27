import { categories,statuses,type Report,type ReportStatus } from '@/lib/types';
export type WorkPriority={total:number;age:number;support:number;unclaimed:number;daysWaiting:number};
/** Work ordering only: not a safety assessment or a promised service deadline. */
export function workPriority(report:Pick<Report,'status'|'createdAt'|'score'|'claimed'>,now=Date.now()):WorkPriority{
 const timestamp=Date.parse(report.createdAt);const daysWaiting=Number.isFinite(timestamp)?Math.max(0,(now-timestamp)/86400000):0;
 if(report.status==='resolved')return {total:0,age:0,support:0,unclaimed:0,daysWaiting};
 const age=Math.min(60,Math.floor(daysWaiting/14*60));
 const support=Number.isFinite(report.score)?Math.min(25,Math.max(0,Math.floor(report.score))):0;
 const unclaimed=report.claimed?0:15;
 return {total:age+support+unclaimed,age,support,unclaimed,daysWaiting};
}
export function orderForAttention<T extends Pick<Report,'id'|'status'|'createdAt'|'score'|'claimed'>>(reports:T[],now=Date.now()):T[]{
 return [...reports].sort((a,b)=>workPriority(b,now).total-workPriority(a,now).total || (Date.parse(a.createdAt)||0)-(Date.parse(b.createdAt)||0) || a.id.localeCompare(b.id));
}
export type PublicReportEvent={type:'submitted'|'claimed'|'status';status:ReportStatus|null;occurredAt:string};
/** Never forward audit rows: actor ids, private-note actions and unknown actions are discarded. */
export function reportHistory(createdAt:string,rows:Record<string,unknown>[]):PublicReportEvent[]{
 const events:PublicReportEvent[]=[{type:'submitted',status:'open',occurredAt:createdAt}];let previous:ReportStatus='open';let claimed=false;
 const ordered=[...rows].filter(row=>typeof row.created_at==='string' && Number.isFinite(Date.parse(row.created_at))).sort((a,b)=>Date.parse(String(a.created_at))-Date.parse(String(b.created_at)) || Number(a.id||0)-Number(b.id||0));
 for(const row of ordered){
  if(Date.parse(String(row.created_at))<Date.parse(createdAt))continue;
  if(row.action==='claim'&&!claimed){events.push({type:'claimed',status:null,occurredAt:String(row.created_at)});claimed=true;continue;}
  const value=typeof row.action==='string'&&row.action.startsWith('status:')?row.action.slice(7):'';
  if(statuses.includes(value as ReportStatus)&&value!==previous){previous=value as ReportStatus;events.push({type:'status',status:previous,occurredAt:String(row.created_at)});}
 }
 return events;
}
export function communityOutcomes(reports:Report[]){
 const counts=Object.fromEntries(statuses.map(status=>[status,reports.filter(report=>report.status===status).length])) as Record<ReportStatus,number>;
 const resolvedWithPhoto=reports.filter(report=>report.status==='resolved'&&report.afterPublicId).length;
 return {total:reports.length,counts,resolvedWithPhoto,awaitingClaim:reports.filter(report=>report.status!=='resolved'&&!report.claimed).length,resolutionRate:reports.length?Math.round(counts.resolved/reports.length*100):0,categories:categories.map(category=>{const group=reports.filter(report=>report.category===category);return {category,total:group.length,resolved:group.filter(report=>report.status==='resolved').length};})};
}
