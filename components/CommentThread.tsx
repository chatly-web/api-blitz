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
function CommentForm({ reportId,parentId,identity,demo = false,onDone,onDemoAdd }: { reportId: string; parentId?: string; identity: Identity; demo?: boolean; onDone?: () => void; onDemoAdd?: (body: string, parentId?: string) => void }) {
  const [body,setBody] = useState(''); const [busy,setBusy] = useState(false); const [message,setMessage] = useState(''); const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    if (demo && onDemoAdd) {
      onDemoAdd(body, parentId);
      setBody('');
      setMessage('Demonstration comment added.');
      setBusy(false);
      onDone?.();
      return;
    }
    try {
      const result = await postJson<{ pendingReview: boolean }>('/api/comments', { reportId,parentId: parentId || null,body });
      setBody(''); setMessage(result.pendingReview ? 'Comment added and flagged for review because automated moderation is unavailable.' : 'Comment added.');
      router.refresh(); onDone?.();
    } catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }
  return <form className="comment-form" onSubmit={submit}><Avatar identity={identity} size={34} /><div><label className="sr-only" htmlFor={`comment-${parentId || 'root'}`}>{parentId ? 'Write a reply' : 'Add a comment'}</label><Textarea id={`comment-${parentId || 'root'}`} value={body} onChange={event => setBody(event.target.value)} maxLength={1500} required placeholder={parentId ? 'Add a helpful reply…' : 'Add context, an update, or a helpful suggestion…'} disabled={busy} /><p className="field-help">Be constructive. Keep personal information out of the discussion.</p><Button type="submit" size="sm" disabled={busy || !body.trim()}>{busy ? 'Posting…' : parentId ? 'Post reply' : 'Post comment'}</Button><p className="field-help" role="status">{message}</p></div></form>;
}
export function CommentThread({ reportId,comments: initialComments,identity,demo = false }: { reportId: string; comments: Comment[]; identity?: Identity; demo?: boolean }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyTo,setReplyTo] = useState<string | null>(null); const [deleting,setDeleting] = useState<string | null>(null); const [error,setError] = useState(''); const router = useRouter();
  const handleDemoAdd = (body: string, parentId?: string) => {
    if (!identity) return;
    const newComment: Comment = {
      id: `demo-cmt-${Date.now()}`,
      reportId,
      parentId: parentId || null,
      body,
      score: 1,
      createdAt: new Date().toISOString(),
      author: identity,
      myVote: 1,
      isOwn: true,
    };
    setComments(prev => [newComment, ...prev]);
  };
  async function remove(id: string) {
    if (!window.confirm('Delete your comment? Replies to it will also be deleted.')) return;
    if (demo) {
      setComments(prev => prev.filter(c => c.id !== id && c.parentId !== id));
      return;
    }
    setDeleting(id); setError('');
    try { await postJson('/api/comments',{ id },'DELETE'); router.refresh(); } catch (error) { setError(errorMessage(error)); } finally { setDeleting(null); }
  }
  function render(comment: Comment, reply = false) {
    return <article className="comment" key={comment.id}><div className="comment-header"><Avatar identity={comment.author} size={30} /><strong>{comment.author.handle}</strong><time dateTime={comment.createdAt}>{dateLabel(comment.createdAt)}</time></div><p className="comment-body">{comment.body}</p><div className="comment-actions"><VoteButtons targetId={comment.id} targetType="comment" initialScore={comment.score} initialVote={comment.myVote} disabled={!demo && !identity} demo={demo} />{!reply && identity && <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}><Reply size={13} />{replyTo === comment.id ? 'Cancel reply' : 'Reply'}</Button>}{comment.isOwn && <Button type="button" variant="ghost" size="sm" onClick={() => remove(comment.id)} disabled={deleting === comment.id}><Trash2 size={13} />{deleting === comment.id ? 'Deleting…' : 'Delete'}</Button>}</div>{replyTo === comment.id && identity && <CommentForm reportId={reportId} parentId={comment.id} identity={identity} demo={demo} onDemoAdd={handleDemoAdd} onDone={() => setReplyTo(null)} />}{!reply && comments.some(child => child.parentId === comment.id) && <div className="replies">{comments.filter(child => child.parentId === comment.id).map(child => render(child,true))}</div>}</article>;
  }
  return <section className="discussion"><h2>Community discussion <span className="muted small">({comments.length})</span></h2><p className="muted small">A shared space for useful updates. Everyone appears anonymously.</p>{identity ? <CommentForm reportId={reportId} identity={identity} demo={demo} onDemoAdd={handleDemoAdd} /> : <p className="notice"><MessageSquare size={16} />{demo ? 'Discussion available with demo identity.' : 'Sign in to join the discussion.'}</p>}{comments.length ? comments.filter(comment => !comment.parentId).map(comment => render(comment)) : <p className="muted small" style={{ padding: '24px 0' }}>No comments yet. Add useful context for the community.</p>}<p className="form-error" role="status">{error}</p></section>;
}
