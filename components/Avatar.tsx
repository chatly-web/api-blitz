import { cn } from '@/lib/utils';
import type { Identity } from '@/lib/types';
export function Avatar({ identity, size = 36, className }: { identity: Identity; size?: number; className?: string }) {
  return <img className={cn('avatar', className)} src={`/api/avatar/${identity.avatarSeed}`} alt={`${identity.handle}'s generated avatar`} width={size} height={size} loading="lazy" />;
}
