'use client';

import { useState, useEffect } from 'react';
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
  const [activeStyle, setActiveStyle] = useState<string | undefined>(style);
  const [activeRole, setActiveRole] = useState<'citizen' | 'authority' | undefined>(role);

  useEffect(() => {
    // Read saved preference for this specific seed or fallback
    const savedStyle = localStorage.getItem(`civic_avatar_style_${identity.avatarSeed}`) || localStorage.getItem('civic_avatar_style');
    const savedRole = localStorage.getItem(`civic_avatar_role_${identity.avatarSeed}`) || localStorage.getItem('civic_avatar_role');

    if (!style && savedStyle) {
      setActiveStyle(savedStyle);
    }
    if (!role && (savedRole === 'citizen' || savedRole === 'authority')) {
      setActiveRole(savedRole as 'citizen' | 'authority');
    }

    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ seed?: string; style?: string; role?: 'citizen' | 'authority' }>;
      if (!custom.detail) return;
      if (!custom.detail.seed || custom.detail.seed === identity.avatarSeed) {
        if (custom.detail.style) setActiveStyle(custom.detail.style);
        if (custom.detail.role) setActiveRole(custom.detail.role);
      }
    };

    window.addEventListener('civic:avatar-updated', handler);
    return () => window.removeEventListener('civic:avatar-updated', handler);
  }, [identity.avatarSeed, style, role]);

  const query = new URLSearchParams();
  const currentStyle = activeStyle || style;
  const currentRole = activeRole || role;
  if (currentStyle) query.set('style', currentStyle);
  if (currentRole) query.set('role', currentRole);
  const qs = query.toString();
  const src = `/api/avatar/${identity.avatarSeed}${qs ? `?${qs}` : ''}`;

  return (
    <img
      className={cn('avatar', currentRole === 'authority' && 'avatar-authority', className)}
      style={currentRole === 'authority' ? { borderRadius: '22%', border: '2px solid #153e2d' } : undefined}
      src={src}
      alt={`${identity.handle}'s generated avatar`}
      width={size}
      height={size}
      loading="lazy"
    />
  );
}


