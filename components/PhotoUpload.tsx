'use client';
import { useState } from 'react';
import { Camera, LoaderCircle, AlertCircle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { postJson, errorMessage } from '@/lib/client-api';
import type { UploadReceipt } from '@/lib/types';
import { CloudImage } from '@/components/CloudImage';
import { getCivicPicsumUrl } from '@/lib/picsum';

export function PhotoUpload({
  purpose,
  value,
  onChange,
  disabled = false,
  onBusyChange,
}: {
  purpose: 'before' | 'after';
  value: UploadReceipt | null;
  onChange: (receipt: UploadReceipt | null) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  async function upload(file?: File) {
    if (!file) return;
    setError('');

    // Format & size validation
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please choose a valid JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Photo exceeds 8 MB size limit. Please choose a smaller photo.');
      return;
    }

    setLastFile(file);
    setBusy(true);
    onBusyChange?.(true);

    // Immediately display dynamic civic placeholder from Picsum API
    const placeholder = getCivicPicsumUrl(file.name + '-' + Date.now(), 800, 600);
    setPlaceholderUrl(placeholder);

    try {
      const signed = await postJson<{
        params: Record<string, string>;
        signature: string;
        apiKey: string;
        cloudName: string;
      }>('/api/upload-signature', { purpose });

      const form = new FormData();
      form.append('file', file);
      Object.entries(signed.params).forEach(([key, val]) => form.append(key, val));
      form.append('api_key', signed.apiKey);
      form.append('signature', signed.signature);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`,
        { method: 'POST', body: form, signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        let message = 'Upload failed. Please check your connection.';
        try {
          const errData = await response.json();
          if (errData.error?.message) message = `Upload error: ${errData.error.message}`;
        } catch {
          /* keep default message */
        }
        throw new Error(message);
      }

      const image = await response.json();
      if (!image.public_id || !image.signature || !image.version) {
        throw new Error('Upload succeeded but server response could not be verified.');
      }

      // Successfully uploaded! Clear placeholder and set the verified original photo
      setPlaceholderUrl(null);
      onChange({ publicId: image.public_id, version: image.version, signature: image.signature });
    } catch (err) {
      // Error handling: reset placeholder and surface error clearly
      setPlaceholderUrl(null);
      if ((err as Error)?.name === 'AbortError') {
        setError('Upload timed out after 60 seconds. Check your connection and try again.');
      } else {
        setError(errorMessage(err) || 'Photo upload failed. Please try again.');
      }
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  // Quick test: load sample civic photo from Picsum and upload it
  async function usePicsumSample() {
    setError('');
    setBusy(true);
    onBusyChange?.(true);
    const sampleUrl = getCivicPicsumUrl(purpose + '-' + Date.now(), 800, 600);
    setPlaceholderUrl(sampleUrl);

    try {
      const res = await fetch(sampleUrl);
      if (!res.ok) throw new Error('Could not fetch sample photo from Picsum.');
      const blob = await res.blob();
      const sampleFile = new File([blob], `civic-sample-${purpose}.jpg`, { type: 'image/jpeg' });
      await upload(sampleFile);
    } catch (err) {
      setPlaceholderUrl(null);
      setError(errorMessage(err) || 'Failed to fetch sample image from Picsum.');
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div>
      <div className="upload-box">
        <Camera size={27} />
        <strong>{purpose === 'after' ? 'Add proof of resolution' : 'Show us the issue'}</strong>
        <p>A clear photo helps your community understand the problem.</p>
        <div className="upload-action-row">
          <label className="button button-outline" htmlFor={`photo-${purpose}`}>
            {busy ? (
              <>
                <LoaderCircle size={16} className="spinner" />
                Uploading photo…
              </>
            ) : value ? (
              'Replace photo'
            ) : (
              'Choose photo'
            )}
            <input
              className="sr-only"
              type="file"
              id={`photo-${purpose}`}
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              disabled={busy || disabled}
              onChange={event => {
                upload(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
        </div>
        <div className="upload-subactions">
          <small className="muted">JPG, PNG or WebP · up to 8 MB</small>
          <span className="muted" aria-hidden="true">·</span>
          <button
            type="button"
            className="upload-sample-btn"
            onClick={usePicsumSample}
            disabled={busy || disabled}
          >
            <Sparkles size={12} />
            Use sample civic photo (Picsum)
          </button>
        </div>
      </div>

      {/* Picsum placeholder shown immediately while upload is in progress */}
      {busy && placeholderUrl && (
        <div className="upload-placeholder-loading" role="status" aria-live="polite">
          <div className="placeholder-badge">
            <LoaderCircle size={15} className="spinner" />
            <span>Uploading photo… (Picsum preview)</span>
          </div>
          <img src={placeholderUrl} alt="Picsum placeholder while uploading" />
        </div>
      )}

      {/* Successfully uploaded original photo */}
      {value && !busy && (
        <div className="upload-preview">
          <CloudImage
            publicId={value.publicId}
            alt={purpose === 'before' ? 'Uploaded issue photo' : 'Uploaded resolution photo'}
          />
          <div className="upload-success-tag">
            <CheckCircle2 size={13} />
            <span>Photo successfully uploaded and encrypted</span>
          </div>
        </div>
      )}

      {/* Robust error handling banner */}
      {error && (
        <div className="upload-error-box" role="alert">
          <AlertCircle size={18} />
          <div style={{ flex: 1 }}>
            <strong>Upload problem: </strong>
            <span>{error}</span>
            {lastFile && (
              <div className="upload-error-actions">
                <button
                  type="button"
                  className="button button-sm button-outline"
                  onClick={() => upload(lastFile)}
                  disabled={busy}
                >
                  <RefreshCw size={13} />
                  Retry upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="field-help" style={{ marginTop: 10 }}>
        Faces are blurred on public image delivery. Avoid photos containing identifying details, number plates or private documents.
      </p>
    </div>
  );
}
