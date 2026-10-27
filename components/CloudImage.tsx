'use client';
import { useEffect,useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCivicPicsumUrl } from '@/lib/picsum';
export function deliveryUrl(publicId: string, width = 1200, crop?: 'limit' | 'fill') {
  const actualCrop = crop || (width <= 300 ? 'fill' : 'limit');
  return `/api/image?publicId=${encodeURIComponent(publicId)}&width=${width}&crop=${actualCrop}`;
}
export function CloudImage({
  publicId,
  alt,
  width = 1200,
  crop,
  fill = false,
  demoSrc,
  className,
  priority = false,
  placeholderSrc,
  showShimmer = true,
  onReady,
  onDeliveryError
}: {
  publicId: string;
  alt: string;
  width?: number;
  crop?: 'limit' | 'fill';
  fill?: boolean;
  demoSrc?: string;
  className?: string;
  priority?: boolean;
  placeholderSrc?: string;
  showShimmer?: boolean;
  onReady?: () => void;
  onDeliveryError?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setLoaded(false); setFailed(false); }, [publicId, demoSrc, width, crop]);
  return (
    <div className={cn('cloud-image', fill && 'cloud-fill', className)}>
      {!failed && (
        <>
          <img
            src={placeholderSrc || getCivicPicsumUrl(publicId, 64, 48)}
            className={cn('blur-placeholder', loaded && 'placeholder-hidden')}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
          {showShimmer && <div className={cn('image-shimmer', loaded && 'shimmer-finished')} aria-hidden="true" />}
          <img
            src={demoSrc || deliveryUrl(publicId, width, crop)}
            alt={alt}
            className={loaded ? 'image-ready' : 'image-loading'}
            onLoad={() => { setLoaded(true); onReady?.(); }}
            onError={() => { setFailed(true); onDeliveryError?.(); }}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </>
      )}
      {failed && (
        <div className="image-error">
          <ImageOff size={24} />
          <span>Photo unavailable</span>
          <small>Image delivery may need configuration.</small>
        </div>
      )}
    </div>
  );
}
