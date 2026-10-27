import 'server-only';
import { serviceClient } from '@/lib/supabase/service';
import type { Comment, Identity } from '@/lib/types';
import { publicIdentity, publicReport, publicComment } from '@/lib/public-dto';
const reportColumns = 'id,category,description,lat,lng,ward,status,claimed,before_public_id,after_public_id,public_note,score,created_at,author_id,profiles!reports_author_id_fkey(handle,avatar_seed)';
export async function getReports(options: { authorId?: string; activeOnly?: boolean; status?: string; category?: string; ward?: string; sort?: string } = {}) {
  const db = serviceClient();
  let query = db.from('reports').select(reportColumns);
  if (options.authorId) query = query.eq('author_id', options.authorId);
  if (options.activeOnly) query = query.neq('status', 'resolved');
  if (options.status) query = query.eq('status', options.status);
  if (options.category) query = query.eq('category', options.category);
  if (options.ward) query = query.ilike('ward', `%${options.ward.replace(/[%_]/g, '')}%`);
  if (options.sort === 'likes') query = query.order('score', { ascending: false });
  query = query.order('created_at', { ascending: options.sort === 'oldest' });
  query = query.order('id');
  const rows: Record<string, unknown>[] = [];
  for (let offset=0;;offset+=1000) {
    const { data,error } = await query.range(offset,offset+999);
    if (error) throw new Error('Could not load reports. Confirm the database migration has been applied.');
    rows.push(...(data || []) as unknown as Record<string, unknown>[]);
    if (!data || data.length<1000) break;
  }
  const reports=rows.map(row => publicReport(row));
  if(options.sort==='attention'){const {orderForAttention}=await import('@/lib/civic-intelligence');return orderForAttention(reports);}
  return reports;
}
export async function getReport(id: string, viewerId?: string) {
  const db = serviceClient();
  const { data, error } = await db.from('reports').select(reportColumns).eq('id', id).maybeSingle();
  if (error) throw new Error('Could not load this report.');
  if (!data) return null;
  let vote = 0;
  if (viewerId) {
    const { data: own } = await db.from('votes').select('value').eq('user_id', viewerId).eq('target_type', 'report').eq('target_id', id).maybeSingle();
    vote = own?.value || 0;
  }
  return publicReport(data as unknown as Record<string, unknown>, vote);
}
export async function getComments(reportId: string, viewerId?: string): Promise<Comment[]> {
  const db = serviceClient();
  const query = db.from('comments').select('id,report_id,parent_id,author_id,body,score,created_at,profiles!comments_author_id_fkey(handle,avatar_seed)').eq('report_id', reportId).order('created_at').order('id');
  const rows: Record<string, unknown>[] = [];
  for (let offset=0;;offset+=1000) {
    const { data,error } = await query.range(offset,offset+999);
    if (error) throw new Error('Could not load discussion.');
    rows.push(...(data || []) as unknown as Record<string,unknown>[]);
    if (!data || data.length<1000) break;
  }
  const votes = new Map<string,number>();
  // Keep PostgREST query URLs bounded when a discussion has many comments.
  if (viewerId) for (let offset=0;offset<rows.length;offset+=100) {
    const ids=rows.slice(offset,offset+100).map(row=>String(row.id));
    const { data,error }=await db.from('votes').select('target_id,value').eq('user_id',viewerId).eq('target_type','comment').in('target_id',ids);
    if (error) throw new Error('Could not load your comment votes.');
    (data || []).forEach(row=>votes.set(row.target_id,row.value));
  }
  return rows.map(row=>publicComment(row,viewerId,votes.get(String(row.id)) || 0));
}
export async function getVoterIdentities(reportId: string): Promise<Identity[]> {
  const { data } = await serviceClient().from('votes').select('profiles!votes_user_id_fkey(handle,avatar_seed)').eq('target_type', 'report').eq('target_id', reportId).limit(8);
  return (data || []).map(row => publicIdentity(row.profiles));
}
export async function mayHandleReport(reportId: string, actorId: string) {
  const { data } = await serviceClient().from('audit_log').select('id').eq('report_id', reportId).eq('actor_id', actorId).eq('action', 'claim').limit(1);
  return Boolean(data?.length);
}
export async function getPrivateNotes(reportId: string) {
  const { data, error } = await serviceClient().from('admin_notes').select('id,body,created_at').eq('report_id', reportId).order('created_at');
  if (error) throw new Error('Could not load internal notes.');
  return (data || []).map(row => ({ id: row.id, body: row.body, createdAt: row.created_at }));
}

export async function getReportHistory(report: { id:string;createdAt:string }) {
  const {reportHistory}=await import('@/lib/civic-intelligence');
  const rows:Record<string,unknown>[]=[];
  for(let offset=0;;offset+=1000){
    const {data,error}=await serviceClient().from('audit_log').select('id,action,created_at').eq('report_id',report.id).order('created_at').order('id').range(offset,offset+999);
    if(error)throw new Error('Could not load report history.');
    rows.push(...(data||[]));if(!data||data.length<1000)break;
  }
  return reportHistory(report.createdAt,rows);
}
