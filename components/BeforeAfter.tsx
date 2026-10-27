'use client';
import { useId, useState, useRef, useCallback } from 'react';
import { Columns2, ShieldCheck } from 'lucide-react';
import { CloudImage } from '@/components/CloudImage';
import { CIVIC_BEFORE_PHOTO, CIVIC_AFTER_PHOTO } from '@/lib/picsum';

export function BeforeAfter({ before, after, demo = false, priority = false }: { before: string; after: string; demo?: boolean; priority?: boolean }) {
  const sliderId = useId();
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
    setPosition(Math.round(percentage));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      updateFromPointer(e.clientX);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <section className="comparison" aria-label="Before and after resolution photos">
      <div
        ref={containerRef}
        className="comparison-images"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: 'ew-resize', touchAction: 'none', userSelect: 'none' }}
      >
        <CloudImage publicId={after} alt="Issue after resolution" priority={priority} fill demoSrc={demo ? CIVIC_AFTER_PHOTO : undefined} />
        <div className="comparison-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <CloudImage publicId={before} alt="Issue before resolution" priority={priority} fill demoSrc={demo ? CIVIC_BEFORE_PHOTO : undefined} />
        </div>
        <span className="photo-label before-label">Before</span>
        <span className="photo-label after-label">After</span>
        <span className="comparison-divider" style={{ left: `${position}%` }} aria-hidden="true">
          <Columns2 size={18} />
        </span>
      </div>
      <div className="comparison-controls">
        <label htmlFor={sliderId}>Compare before and after (drag photo or slider)</label>
        <input
          id={sliderId}
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={event => setPosition(Number(event.target.value))}
          aria-valuetext={`${position}% of before photo visible`}
        />
      </div>
      <div className="authority-proof">
        <ShieldCheck size={17} />
        Resolved by Ward Authority
        {demo && <span>Sample resolution</span>}
      </div>
    </section>
  );
}
