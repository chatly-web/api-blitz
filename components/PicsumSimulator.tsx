'use client';

import { useState } from 'react';
import { CIVIC_SIMULATION_PAIRS, getPicsumUrl } from '@/lib/picsum';
import { Button } from '@/components/ui/button';
import { Sliders, Image as ImageIcon, ExternalLink, Check, Copy, Sparkles } from 'lucide-react';

export function PicsumSimulator() {
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [blurLevel, setBlurLevel] = useState(0);
  const [sizePreset, setSizePreset] = useState<'sm' | 'md' | 'lg'>('md');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const pair = CIVIC_SIMULATION_PAIRS[selectedPairIndex];

  const dimensions = {
    sm: { width: 400, height: 260, label: 'Thumb (400×260)' },
    md: { width: 800, height: 500, label: 'Standard (800×500)' },
    lg: { width: 1200, height: 750, label: 'Hi-Res (1200×750)' },
  }[sizePreset];

  const beforeUrl = getPicsumUrl({
    id: pair.beforeId,
    width: dimensions.width,
    height: dimensions.height,
    grayscale,
    blur: blurLevel,
  });

  const afterUrl = getPicsumUrl({
    id: pair.afterId,
    width: dimensions.width,
    height: dimensions.height,
    grayscale: false,
    blur: 0,
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <section className="card simulator-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} className="text-primary" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
              Civic Imagery Sandbox (Picsum API)
            </h2>
          </div>
          <p className="muted small" style={{ margin: '0.25rem 0 0' }}>
            Interactive evaluation of parametric placeholders: testing degradation filters, dynamic aspect ratios, and simulated repair evidence.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {CIVIC_SIMULATION_PAIRS.map((p, idx) => (
            <Button
              key={p.title}
              type="button"
              variant={selectedPairIndex === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPairIndex(idx)}
            >
              {p.category}
            </Button>
          ))}
        </div>
      </div>

      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="picsum-grayscale" style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
            <input
              id="picsum-grayscale"
              type="checkbox"
              checked={grayscale}
              onChange={e => setGrayscale(e.target.checked)}
              style={{ marginRight: '0.4rem', cursor: 'pointer' }}
            />
            Grayscale filter (?grayscale)
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="picsum-blur" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            Weather / Hazard Blur: <span style={{ fontWeight: 600 }}>{blurLevel > 0 ? `Level ${blurLevel}` : 'Off'}</span>
          </label>
          <input
            id="picsum-blur"
            type="range"
            min="0"
            max="5"
            step="1"
            value={blurLevel}
            onChange={e => setBlurLevel(Number(e.target.value))}
            style={{ width: '100px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Resolution:</span>
          {(['sm', 'md', 'lg'] as const).map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setSizePreset(preset)}
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: sizePreset === preset ? '1px solid #00875a' : '1px solid #d1d5db',
                background: sizePreset === preset ? '#00875a' : '#fff',
                color: sizePreset === preset ? '#fff' : '#374151',
                cursor: 'pointer',
              }}
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.9rem', color: '#b91c1c' }}>Before: Reported Condition (ID #{pair.beforeId})</strong>
            <button
              type="button"
              onClick={() => handleCopy(beforeUrl)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {copiedUrl === beforeUrl ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
              Copy API URL
            </button>
          </div>
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', aspectRatio: '16/10', background: '#e5e7eb' }}>
            <img
              src={beforeUrl}
              alt="Reported Condition Simulation"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
            <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
              Citizen Submission
            </span>
          </div>
          <p className="muted small" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            {pair.description}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.9rem', color: '#00875a' }}>After: Remediated Baseline (ID #{pair.afterId})</strong>
            <button
              type="button"
              onClick={() => handleCopy(afterUrl)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {copiedUrl === afterUrl ? <Check size={12} color="#00875a" /> : <Copy size={12} />}
              Copy API URL
            </button>
          </div>
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', aspectRatio: '16/10', background: '#e5e7eb' }}>
            <img
              src={afterUrl}
              alt="Remediated Condition Simulation"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
            <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,135,90,0.85)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
              Verified Resolution
            </span>
          </div>
          <p className="muted small" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            Remediated infrastructure standard verified by municipal audit trail.
          </p>
        </div>
      </div>
    </section>
  );
}
