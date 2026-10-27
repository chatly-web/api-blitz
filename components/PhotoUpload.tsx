'use client';
import { useState } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import { postJson, errorMessage } from '@/lib/client-api';
import type { UploadReceipt } from '@/lib/types';
import { CloudImage } from '@/components/CloudImage';
export function PhotoUpload({ purpose, value, onChange, disabled = false }: { purpose: 'before' | 'after'; value: UploadReceipt | null; onChange: (receipt: UploadReceipt | null) => void; disabled?: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function upload(file?: File) {
    if (!file) return;
    setError('');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Choose a JPG, PNG or WebP image under 8 MB.'); return; }
    setBusy(true); onChange(null);
    try {
      const signed = await postJson<{ params: Record<string,string>; signature: string; apiKey: string; cloudName: string }>('/api/upload-signature', { purpose });
      const form = new FormData(); form.append('file', file);
      Object.entries(signed.params).forEach(([key,value]) => form.append(key,value));
      form.append('api_key', signed.apiKey); form.append('signature', signed.signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error('Photo upload failed. Check your connection and Cloudinary configuration.');
      const image = await response.json();
      if (!image.public_id || !image.signature || !image.version) throw new Error('The upload response could not be verified. Try again.');
      onChange({ publicId: image.public_id, version: image.version, signature: image.signature });
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div><div className="upload-box"><Camera size={27} /><strong>{purpose === 'after' ? 'Add proof of resolution' : 'Show us the issue'}</strong><p>A clear photo helps your community understand the problem.</p><label className="button button-outline" htmlFor={`photo-${purpose}`}>{busy ? <><LoaderCircle size={16} className="spinner" />Uploading…</> : value ? 'Replace photo' : 'Choose photo'}<input className="sr-only" type="file" id={`photo-${purpose}`} accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy || disabled} onChange={event => { upload(event.target.files?.[0]); event.target.value = ''; }} /></label><small className="muted">JPG, PNG or WebP · up to 8 MB</small></div>{value && <div className="upload-preview"><CloudImage publicId={value.publicId} alt={purpose === 'before' ? 'Uploaded issue photo' : 'Uploaded resolution photo'} /></div>}<p role="status" className="form-error">{error}</p><p className="field-help">Faces are blurred on public image delivery. Avoid photos containing identifying details, number plates or private documents.</p></div>;
}
