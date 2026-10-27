import 'server-only';
import { serviceClient } from '@/lib/supabase/service';
import type { Comment, Identity, Report } from '@/lib/types';
const reportColumns = 'id,category,description,lat,lng,ward,status,claimed,before_public_id,after_public_id,public_note,score,created_at,author_id,profiles!reports_author_id_fkey(handle,avatar_seed)';
function identity(profile: unknown): Identity {
  const p = (Array.isArray(profile) ? profile[0] : profile) as { handle?: string; avatar_seed?: string } | null;
  return { handle: p?.handle || 'neighbor', avatarSeed: p?.avatar_seed || '0'.repeat(64) };
}
function reportDto(row: Record<string, unknown>, vote = 0): Report {
  return {
    id: String(row.id), category: row.category as Report['category'], description: String(row.description), lat: Number(row.lat), lng: Number(row.lng),
    ward: row.ward as string | null, status: row.status as Report['status'], claimed: Boolean(row.claimed), beforePublicId: String(row.before_public_id),
    afterPublicId: row.after_public_id as string | null, publicNote: row.public_note as string | null, score: Number(row.score), createdAt: String(row.created_at), author: identity(row.profiles), myVote: vote,
  };
}
export async function getReports(options: { authorId?: string; status?: string; category?: string; ward?: string; sort?: string } = {}) {
  const db = serviceClient();
  let query = db.from('reports').select(reportColumns);
  if (options.authorId) query = query.eq('author_id', options.authorId);
  if (options.status) query = query.eq('status', options.status);
  if (options.category) query = query.eq('category', options.category);
  if (options.ward) query = query.ilike('ward', `%${options.ward.replace(/[%_]/g, '')}%`);
  if (options.sort === 'likes') query = query.order('score', { ascending: false });
  query = query.order('created_at', { ascending: options.sort === 'oldest' });
  const rows: Record<string, unknown>[] = [];
  for (let offset=0;;offset+=1000) {
    const { data,error } = await query.order('id').range(offset,offset+999);
    if (error) throw new Error('Could not load reports. Confirm the database migration has been applied.');
    rows.push(...(data || []) as unknown as Record<string, unknown>[]);
    if (!data || data.length<1000) break;
  }
  return rows.map(row => reportDto(row));
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
  return reportDto(data as unknown as Record<string, unknown>, vote);
}
export async function getComments(reportId: string, viewerId?: string): Promise<Comment[]> {
  const db = serviceClient();
  const { data, error } = await db.from('comments').select('id,report_id,parent_id,author_id,body,score,created_at,profiles!comments_author_id_fkey(handle,avatar_seed)').eq('report_id', reportId).order('created_at').limit(500);
  if (error) throw new Error('Could not load discussion.');
  const ids = (data || []).map(row => row.id);
  const ownVotes = viewerId && ids.length ? await db.from('votes').select('target_id,value').eq('user_id', viewerId).eq('target_type', 'comment').in('target_id', ids) : { data: [] };
  const votes = new Map((ownVotes.data || []).map(row => [row.target_id, row.value]));
  return (data || []).map(row => ({ id: row.id, reportId: row.report_id, parentId: row.parent_id, body: row.body, score: row.score, createdAt: row.created_at, author: identity(row.profiles), myVote: votes.get(row.id) || 0, isOwn: row.author_id === viewerId }));
}
export async function getVoterIdentities(reportId: string): Promise<Identity[]> {
  const { data } = await serviceClient().from('votes').select('profiles!votes_user_id_fkey(handle,avatar_seed)').eq('target_type', 'report').eq('target_id', reportId).limit(8);
  return (data || []).map(row => identity(row.profiles));
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
