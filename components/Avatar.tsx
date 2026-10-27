import { cn } from '@/lib/utils';
import type { Identity } from '@/lib/types';

export function Avatar({
  identity,
  size = 36,
  className,
  style,
  role,
}: {
  identity: Identity;
  size?: number;
  className?: string;
  style?: string;
  role?: 'citizen' | 'authority';
}) {
  const query = new URLSearchParams();
  if (style) query.set('style', style);
  if (role) query.set('role', role);
  const qs = query.toString();
  const src = `/api/avatar/${identity.avatarSeed}${qs ? `?${qs}` : ''}`;
  return (
    <img
      className={cn('avatar', className)}
      src={src}
      alt={`${identity.handle}'s generated avatar`}
      width={size}
      height={size}
      loading="lazy"
    />
  );
}

