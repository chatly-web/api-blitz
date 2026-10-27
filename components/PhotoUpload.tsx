'use client';
import { useState } from 'react';
import { Camera, LoaderCircle, AlertCircle, CheckCircle2, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { postJson, errorMessage } from '@/lib/client-api';
import type { UploadReceipt, Category } from '@/lib/types';
import { CloudImage } from '@/components/CloudImage';
import { getCategoryPicsumUrl } from '@/lib/picsum';

export function PhotoUpload({
  purpose,
  category,
  value,
  onChange,
  disabled = false,
  onBusyChange,
}: {
  purpose: 'before' | 'after';
  category?: Category | string;
  value: UploadReceipt | null;
  onChange: (receipt: UploadReceipt | null) => void;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  // Category-specific placeholder image from Picsum
  const activeCategoryPlaceholder = getCategoryPicsumUrl(category, 1000, 700);

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

    // Show category-specific placeholder while uploading
    setPlaceholderUrl(activeCategoryPlaceholder);

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

      // Successfully uploaded! Transition from Picsum placeholder to verified Cloudinary original
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

  // Quick test: load category-specific sample civic photo from Picsum and upload it
  async function usePicsumSample() {
    setError('');
    setBusy(true);
    onBusyChange?.(true);
    setPlaceholderUrl(activeCategoryPlaceholder);

    try {
      const res = await fetch(activeCategoryPlaceholder);
      if (!res.ok) throw new Error('Could not fetch sample photo.');
      const blob = await res.blob();
      const sampleFile = new File([blob], `civic-sample-${category || purpose}.jpg`, { type: 'image/jpeg' });
      await upload(sampleFile);
    } catch (err) {
      setPlaceholderUrl(null);
      setError(errorMessage(err) || 'Failed to fetch sample image.');
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div>
      {/* Unified Single-Box Upload Field with embedded photo & bottom replace button */}
      <div className="upload-unified-field">
        {/* Media Container: Shows either Verified Original, Uploading State, or Category Placeholder */}
        <div className="upload-media-container">
          {value && !busy ? (
            // Successfully uploaded original photo
            <>
              <CloudImage
                publicId={value.publicId}
                alt={purpose === 'after' ? 'Uploaded resolution photo' : 'Uploaded issue photo'}
              />
              <span className="upload-unified-badge badge-success">
                <CheckCircle2 size={13} />
                Original photo uploaded & verified
              </span>
            </>
          ) : busy ? (
            // Uploading state with shimmer and active category placeholder
            <>
              <img
                src={placeholderUrl || activeCategoryPlaceholder}
                alt={`${category || 'Issue'} placeholder while uploading`}
              />
              <div className="image-shimmer" aria-hidden="true" />
              <span className="upload-unified-badge">
                <LoaderCircle size={14} className="spinner" />
                Uploading photo… (Sample preview)
              </span>
            </>
          ) : (
            // Pre-upload state: Displays category-specific sample photo
            <>
              <img
                src={activeCategoryPlaceholder}
                alt={`${category || 'Civic'} placeholder`}
                style={{ filter: 'brightness(0.92)' }}
              />
              <span className="upload-unified-badge badge-placeholder">
                <Sparkles size={12} />
                {category ? `${category} sample photo` : 'Sample photo'}
              </span>
            </>
          )}
        </div>

        {/* Bottom Bar: Action buttons to choose, replace, or use sample photo */}
        <div className="upload-unified-bar">
          <div className="upload-unified-bar-text">
            {value && !busy ? (
              <>
                <Camera size={14} />
                <span>Ready for submission</span>
              </>
            ) : busy ? (
              <>
                <LoaderCircle size={14} className="spinner" />
                <span>Uploading to Cloudinary…</span>
              </>
            ) : (
              <span>Photo of {category || 'this issue'} (JPG, PNG, WebP)</span>
            )}
          </div>

          <div className="upload-unified-actions">
            {value && !busy ? (
              <>
                <label className="button button-sm button-outline upload-replace-label" htmlFor={`photo-${purpose}`}>
                  <RefreshCw size={13} />
                  Replace photo
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
                <button
                  type="button"
                  className="button button-sm button-ghost"
                  onClick={() => {
                    onChange(null);
                    setError('');
                  }}
                  disabled={busy || disabled}
                  title="Remove photo"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </>
            ) : (
              <>
                <label className="button button-sm button-primary upload-replace-label" htmlFor={`photo-${purpose}`}>
                  <Camera size={14} />
                  Choose photo
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
                <button
                  type="button"
                  className="button button-sm button-outline"
                  onClick={usePicsumSample}
                  disabled={busy || disabled}
                >
                  <Sparkles size={13} />
                  Use this sample
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Robust Error Handling Banner with Retry */}
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
