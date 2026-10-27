import type { Comment, Identity, Report } from '@/lib/types';
// Whitelists only: never spread database rows into browser-facing objects.
export function publicIdentity(profile: unknown): Identity {
  const p = (Array.isArray(profile) ? profile[0] : profile) as { handle?: string; avatar_seed?: string } | null;
  return { handle: p?.handle || 'neighbor', avatarSeed: p?.avatar_seed || '0'.repeat(64) };
}
export function publicReport(row: Record<string, unknown>, vote = 0): Report {
  return {
    id: String(row.id), category: row.category as Report['category'], description: String(row.description), lat: Number(row.lat), lng: Number(row.lng),
    ward: row.ward as string | null, status: row.status as Report['status'], claimed: Boolean(row.claimed), beforePublicId: String(row.before_public_id),
    afterPublicId: row.after_public_id as string | null, publicNote: row.public_note as string | null, score: Number(row.score), createdAt: String(row.created_at), author: publicIdentity(row.profiles), myVote: vote,
  };
}
export function publicComment(row: Record<string, unknown>, viewerId?: string, vote = 0): Comment {
  return {
    id: String(row.id), reportId: String(row.report_id), parentId: row.parent_id as string | null,
    body: String(row.body), score: Number(row.score), createdAt: String(row.created_at),
    author: publicIdentity(row.profiles), myVote: vote, isOwn: row.author_id === viewerId,
  };
}
