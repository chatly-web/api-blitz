'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Reply, Trash2 } from 'lucide-react';
import type { Comment, Identity } from '@/lib/types';
import { Avatar } from '@/components/Avatar';
import { VoteButtons } from '@/components/VoteButtons';
import { Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dateLabel } from '@/lib/utils';
import { postJson, errorMessage } from '@/lib/client-api';
function CommentForm({ reportId,parentId,identity,onDone }: { reportId: string; parentId?: string; identity: Identity; onDone?: () => void }) {
  const [body,setBody] = useState(''); const [busy,setBusy] = useState(false); const [message,setMessage] = useState(''); const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const result = await postJson<{ pendingReview: boolean }>('/api/comments', { reportId,parentId: parentId || null,body });
      setBody(''); setMessage(result.pendingReview ? 'Comment added and flagged for review because automated moderation is unavailable.' : 'Comment added.');
      router.refresh(); onDone?.();
    } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }
  return <form className="comment-form" onSubmit={submit}><Avatar identity={identity} size={34} /><div><label className="sr-only" htmlFor={`comment-${parentId || 'root'}`}>{parentId ? 'Write a reply' : 'Add a comment'}</label><Textarea id={`comment-${parentId || 'root'}`} value={body} onChange={event => setBody(event.target.value)} maxLength={1500} required placeholder={parentId ? 'Add a helpful reply…' : 'Add context, an update, or a helpful suggestion…'} disabled={busy} /><p className="field-help">Be constructive. Keep personal information out of the discussion.</p><Button type="submit" size="sm" disabled={busy || !body.trim()}>{busy ? 'Posting…' : parentId ? 'Post reply' : 'Post comment'}</Button><p className="field-help" role="status">{message}</p></div></form>;
}
export function CommentThread({ reportId,comments,identity,demo = false }: { reportId: string; comments: Comment[]; identity?: Identity; demo?: boolean }) {
  const [replyTo,setReplyTo] = useState<string | null>(null); const [deleting,setDeleting] = useState<string | null>(null); const [error,setError] = useState(''); const router = useRouter();
  async function remove(id: string) {
    if (!window.confirm('Delete your comment? Replies to it will also be deleted.')) return;
    setDeleting(id); setError('');
    try { await postJson('/api/comments',{ id },'DELETE'); router.refresh(); } catch (error) { setError(errorMessage(error)); } finally { setDeleting(null); }
  }
  function render(comment: Comment, reply = false) {
    return <article className="comment" key={comment.id}><div className="comment-header"><Avatar identity={comment.author} size={30} /><strong>{comment.author.handle}</strong><time dateTime={comment.createdAt}>{dateLabel(comment.createdAt)}</time></div><p className="comment-body">{comment.body}</p><div className="comment-actions"><VoteButtons targetId={comment.id} targetType="comment" initialScore={comment.score} initialVote={comment.myVote} disabled={demo || !identity} />{!reply && identity && !demo && <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}><Reply size={13} />{replyTo === comment.id ? 'Cancel reply' : 'Reply'}</Button>}{comment.isOwn && !demo && <Button type="button" variant="ghost" size="sm" onClick={() => remove(comment.id)} disabled={deleting === comment.id}><Trash2 size={13} />{deleting === comment.id ? 'Deleting…' : 'Delete'}</Button>}</div>{replyTo === comment.id && identity && <CommentForm reportId={reportId} parentId={comment.id} identity={identity} onDone={() => setReplyTo(null)} />}{!reply && comments.some(child => child.parentId === comment.id) && <div className="replies">{comments.filter(child => child.parentId === comment.id).map(child => render(child,true))}</div>}</article>;
  }
  return <section className="discussion"><h2>Community discussion <span className="muted small">({comments.length})</span></h2><p className="muted small">A shared space for useful updates. Everyone appears anonymously.</p>{identity && !demo ? <CommentForm reportId={reportId} identity={identity} /> : <p className="notice"><MessageSquare size={16} />{demo ? 'Discussion is read-only in this demonstration.' : 'Sign in to join the discussion.'}</p>}{comments.length ? comments.filter(comment => !comment.parentId).map(comment => render(comment)) : <p className="muted small" style={{ padding: '24px 0' }}>No comments yet. Add useful context for the community.</p>}<p className="form-error" role="status">{error}</p></section>;
}
