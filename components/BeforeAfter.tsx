'use client';
import { useId, useState } from 'react';
import { Columns2, ShieldCheck } from 'lucide-react';
import { CloudImage } from '@/components/CloudImage';
import { CIVIC_BEFORE_PHOTO, CIVIC_AFTER_PHOTO } from '@/lib/picsum';
export function BeforeAfter({ before, after, demo = false }: { before: string; after: string; demo?: boolean }) {
  const sliderId=useId();
  const [position, setPosition] = useState(50);
  return <section className="comparison" aria-label="Before and after resolution photos"><div className="comparison-images"><CloudImage publicId={after} alt="Issue after resolution" fill demoSrc={demo ? CIVIC_AFTER_PHOTO : undefined} /><div className="comparison-before" style={{ clipPath: `inset(0 ${100-position}% 0 0)` }}><CloudImage publicId={before} alt="Issue before resolution" fill demoSrc={demo ? CIVIC_BEFORE_PHOTO : undefined} /></div><span className="photo-label before-label">Before</span><span className="photo-label after-label">After</span><span className="comparison-divider" style={{ left: `${position}%` }} aria-hidden="true"><Columns2 size={18} /></span></div><div className="comparison-controls"><label htmlFor={sliderId}>Compare before and after</label><input id={sliderId} type="range" min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} aria-valuetext={`${position}% of before photo visible`} /></div><div className="authority-proof"><ShieldCheck size={17} />Resolved by Ward Authority{demo && <span>Sample resolution</span>}</div></section>;
}
