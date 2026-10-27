'use client';
import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCivicPicsumUrl } from '@/lib/picsum';
export function deliveryUrl(publicId: string, width = 1200) {
  return `/api/image?publicId=${encodeURIComponent(publicId)}&width=${width}`;
}
export function CloudImage({ publicId, alt, width = 1200, fill = false, demoSrc, className, priority=false }: { publicId: string; alt: string; width?: number; fill?: boolean; demoSrc?: string; className?: string; priority?:boolean }) {
  const [loaded, setLoaded] = useState(false); const [failed, setFailed] = useState(false);
  useEffect(()=>{setLoaded(false);setFailed(false);},[publicId,demoSrc,width]);
  return <div className={cn('cloud-image', fill && 'cloud-fill', className)}>
    {!loaded && !failed && <>
      <img src={getCivicPicsumUrl(publicId, 64, 48)} className="blur-placeholder" alt="" aria-hidden="true" loading="lazy" decoding="async" fetchPriority="low" />
      <div className="image-shimmer" aria-hidden="true" />
    </>}
    {!failed && <img src={demoSrc || deliveryUrl(publicId, width)} alt={alt} className={loaded ? 'image-ready' : 'image-loading'} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'} />}
    {failed && <div className="image-error"><ImageOff size={24} /><span>Photo unavailable</span><small>Image delivery may need configuration.</small></div>}
  </div>;
}

