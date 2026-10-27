'use client';
import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { postJson, errorMessage } from '@/lib/client-api';
export function VoteButtons({ targetId, targetType, initialScore, initialVote, disabled = false, demo = false }: { targetId: string; targetType: 'report' | 'comment'; initialScore: number; initialVote: number; disabled?: boolean; demo?: boolean }) {
  const [score,setScore] = useState(initialScore); const [vote,setVote] = useState(initialVote); const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  async function cast(value: 1 | -1) {
    if (busy || disabled) return;
    if (demo) {
      const nextVote = vote === value ? 0 : value;
      const delta = nextVote - vote;
      setVote(nextVote);
      setScore(s => s + delta);
      return;
    }
    setBusy(true); setError('');
    try { const result = await postJson<{ score: number; myVote: number }>('/api/votes', { targetType,targetId,value }); setScore(result.score); setVote(result.myVote); }
    catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <div><div className="vote-controls" aria-label={`Vote on ${targetType}`}><button type="button" aria-label="Like" aria-pressed={vote === 1} disabled={busy || disabled} onClick={() => cast(1)}><ThumbsUp size={14} /></button><output aria-live="polite" aria-label="Net votes">{score}</output><button type="button" aria-label="Dislike" aria-pressed={vote === -1} disabled={busy || disabled} onClick={() => cast(-1)}><ThumbsDown size={14} /></button></div>{error && <p className="form-error" role="status">{error}</p>}</div>;
}
