'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPinned, UserRound, ShieldCheck, ChartNoAxesCombined } from 'lucide-react';
import { T } from '@/components/LanguageProvider';
export function PrimaryNavigation({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const path = usePathname();
  const links = [
    { href: signedIn ? '/map' : '/demo', label: signedIn ? 'Issue map' : 'Live Demo', icon: MapPinned, visible: true },
    { href: signedIn ? '/insights' : '/demo/insights', label: 'Outcomes', icon: ChartNoAxesCombined, visible: true },
    { href: '/me', label: 'My reports', icon: UserRound, visible: signedIn },
    { href: '/admin', label: 'Authority', icon: ShieldCheck, visible: isAdmin },
  ];
  return (
    <nav aria-label="Main navigation">
      {links.filter(link => link.visible).map(({ href, label, icon: Icon }) => {
        const active = path === href || (href === '/admin' && path.startsWith('/admin/')) || ((href === '/map' || href === '/demo') && (path === '/demo' || path === '/map'));
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            <Icon size={16} aria-hidden="true" />
            <T>{label}</T>
          </Link>
        );
      })}
    </nav>
  );
}

