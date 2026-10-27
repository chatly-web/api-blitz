'use client';

import { useState, useEffect } from 'react';
import type { Identity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, Copy, Sparkles, Shield, User } from 'lucide-react';

const STYLES = [
  { id: 'personas', label: 'Personas', desc: 'Friendly civic portrait' },
  { id: 'bottts', label: 'Bottts', desc: 'Civic automation scout' },
  { id: 'lorelei', label: 'Lorelei', desc: 'Modern minimal vector' },
  { id: 'identicon', label: 'Identicon', desc: 'Cryptographic fingerprint' },
  { id: 'adventurer', label: 'Adventurer', desc: 'Field inspector portrait' },
  { id: 'shapes', label: 'Shapes', desc: 'Abstract ward mosaic' },
] as const;

export function PersonaStudio({ identity, isAdmin }: { identity: Identity; isAdmin?: boolean }) {
  const [selectedStyle, setSelectedStyle] = useState<string>('personas');
  const [rolePreview, setRolePreview] = useState<'citizen' | 'authority'>('citizen');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('civic_avatar_style');
    if (saved && STYLES.some(s => s.id === saved)) {
      setSelectedStyle(saved);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedStyle(id);
    localStorage.setItem('civic_avatar_style', id);
  };

  const copyHandle = () => {
    navigator.clipboard.writeText(identity.handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewUrl = `/api/avatar/${identity.avatarSeed}?style=${selectedStyle}&role=${rolePreview}`;

  return (
    <div className="card studio-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} className="text-primary" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Citizen Persona Studio</h2>
          </div>
          <p className="muted small" style={{ margin: '0.25rem 0 0' }}>
            Powered by DiceBear multi-collection API. Every civic handle generates a distinct deterministic avatar.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            type="button"
            variant={rolePreview === 'citizen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRolePreview('citizen')}
          >
            <User size={14} style={{ marginRight: '0.25rem' }} /> Citizen
          </Button>
          <Button
            type="button"
            variant={rolePreview === 'authority' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRolePreview('authority')}
          >
            <Shield size={14} style={{ marginRight: '0.25rem' }} /> Authority Badge
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: rolePreview === 'authority' ? '18px' : '999px',
              border: rolePreview === 'authority' ? '2px solid #153e2d' : '2px dashed #00875a',
              background: '#fff',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <img
              src={previewUrl}
              alt="Avatar Preview"
              width={96}
              height={96}
              style={{
                borderRadius: rolePreview === 'authority' ? '12px' : '999px',
                display: 'block',
              }}
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge" style={{ fontSize: '0.75rem' }}>
              {rolePreview === 'authority' ? 'Municipal Seal' : 'Verified Resident'}
            </span>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <strong style={{ fontSize: '0.95rem' }}>{identity.handle}</strong>
            <button
              type="button"
              onClick={copyHandle}
              aria-label="Copy handle"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.8rem',
                color: '#666',
              }}
            >
              {copied ? <Check size={14} color="#00875a" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {STYLES.map(s => {
              const active = selectedStyle === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.5rem 0.65rem',
                    border: active ? '2px solid #00875a' : '1px solid #e5e7eb',
                    backgroundColor: active ? '#f0fdf4' : '#ffffff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: active ? '#00875a' : '#111827' }}>
                    {s.label}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
