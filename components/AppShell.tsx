import Link from 'next/link';
import { PrimaryNavigation } from '@/components/PrimaryNavigation';
import { LanguageSelector, T } from '@/components/LanguageProvider';
import { CivicAssistant } from '@/components/CivicAssistant';
import { MapPinned, Plus, ShieldCheck, ArrowUpRight, LogOut } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import type { Identity } from '@/lib/types';
import { Button } from '@/components/ui/button';
export function AppShell({ children, identity, isAdmin = false, demo = false }: { children: React.ReactNode; identity?: Identity; isAdmin?: boolean; demo?: boolean }) {
  return <><a href="#main" className="skip-link"><T>Skip to content</T></a><header className="site-header"><div className="header-inner"><Link href={demo ? '/demo' : '/map'} className="brand"><span className="brand-mark"><MapPinned size={21} strokeWidth={1.8} /></span><span>Civic<span className="brand-sub"><T>Issue reporter</T></span></span></Link><PrimaryNavigation signedIn={Boolean(identity)} isAdmin={isAdmin}/><div className="header-actions"><LanguageSelector/>{identity ? <><span className="header-identity"><Avatar identity={identity} size={32} /><span>{identity.handle}</span></span><form action="/auth/signout" method="post"><Button variant="ghost" size="icon" title="Sign out" aria-label="Sign out"><LogOut size={17} /></Button></form></> : <Button variant="outline" size="sm" asChild><Link href="/login"><T>Sign in</T> <ArrowUpRight size={15} /></Link></Button>}<Button size="sm" asChild><Link href="/report/new"><Plus size={16} /><T>Report an issue</T></Link></Button></div></div></header>{demo && <div className="demo-banner">Read-only demonstration. Sample data and photos, not actual civic reports.</div>}<main id="main">{children}</main><footer className="site-footer"><span><ShieldCheck size={15} /><T>Anonymous to the community. Accountable to your city.</T></span><span>Civic Issue Reporter · API Blitz</span></footer><CivicAssistant signedIn={Boolean(identity)}/></>;
}
