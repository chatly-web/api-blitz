'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, ShieldCheck, Check } from 'lucide-react';
import type { Report, ReportStatus, UploadReceipt } from '@/lib/types';
import { statuses } from '@/lib/types';
import { statusLabels } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { PhotoUpload } from '@/components/PhotoUpload';
import { postJson, errorMessage } from '@/lib/client-api';
export function ClaimButton({ reportId,claimed }: { reportId: string; claimed: boolean }) {
  const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const router = useRouter();
  async function claim() {
    setBusy(true); setError('');
    try { await postJson('/api/admin/claim',{ reportId }); router.refresh(); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  }
  return <div><Button type="button" onClick={claim} disabled={claimed || busy}><LockKeyhole size={15} />{busy ? 'Claiming…' : claimed ? 'Already claimed' : 'Claim report'}</Button>{error && <p className="form-error" role="status">{error}</p>}</div>;
}
export function AdminActions({ report,canHandle }: { report: Report; canHandle: boolean }) {
  const [status,setStatus] = useState<ReportStatus>(report.status); const [publicNote,setPublicNote] = useState(report.publicNote || ''); const [internalNote,setInternalNote] = useState(''); const [photo,setPhoto] = useState<UploadReceipt | null>(null);
  const [photoBusy,setPhotoBusy] = useState(false);
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState(''); const [saved,setSaved] = useState(false); const router = useRouter();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (photoBusy || busy) return;
    setBusy(true); setMessage(''); setSaved(false);
    try { await postJson('/api/admin/update',{ reportId: report.id,status,publicNote,internalNote,afterPhoto: photo || undefined }); setInternalNote(''); setSaved(true); setMessage('Report updated. The public view shows Ward Authority only.'); router.refresh(); }
    catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }
  if (!canHandle) return <div className="admin-form"><h2>Handle this report</h2><p className="muted small">{report.claimed ? 'This report has already been claimed by another authority member. Their identity is not shared.' : 'Claim the report before making changes. Claiming is atomic, so only one authority member can take it.'}</p><ClaimButton reportId={report.id} claimed={report.claimed} /></div>;
  const missingProof = status === 'resolved' && !photo && !report.afterPublicId;
  return <form className="admin-form" onSubmit={submit}><h2>Authority workspace</h2><p className="notice"><ShieldCheck size={17} />Public updates use the generic Ward Authority badge. Internal notes are visible only in this workspace.</p><fieldset disabled={busy} style={{ border: 0,padding: 0,margin: 0 }}><div className="form-field" style={{ marginTop: 23 }}><label className="field-label" htmlFor="admin-status">Status</label><select className="input" id="admin-status" value={status} onChange={event => setStatus(event.target.value as ReportStatus)}>{statuses.map(value => <option value={value} key={value}>{statusLabels[value]}</option>)}</select></div><div className="form-field"><label className="field-label" htmlFor="public-note">Public update</label><Textarea id="public-note" maxLength={2000} value={publicNote} onChange={event => setPublicNote(event.target.value)} placeholder="A factual progress update for the community. Do not include names or contact details." /></div><div className="form-field"><label className="field-label" htmlFor="internal-note">Internal note <small>not public</small></label><Textarea id="internal-note" maxLength={2000} value={internalNote} onChange={event => setInternalNote(event.target.value)} placeholder="Add a private handling note. Author identities are kept in the audit log only." /></div><div className="form-field"><label className="field-label">Resolution photo {report.afterPublicId && <small>(a photo is already attached)</small>}</label><PhotoUpload purpose="after" value={photo} onChange={setPhoto} onBusyChange={setPhotoBusy} disabled={busy} />{missingProof && <p className="field-help">An after-photo is required before this report can be marked resolved.</p>}</div><Button type="submit" disabled={busy || photoBusy || missingProof}><Check size={16} />{photoBusy ? 'Waiting for photo…' : busy ? 'Saving…' : 'Save update'}</Button><p role="status" className={saved ? 'form-success' : 'form-error'}>{message}</p></fieldset></form>;
}
