import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Civic Issue Reporter · API Blitz', template: '%s · Civic' }, description: 'Report civic issues with photo evidence, exact locations, anonymous discussion and verified resolution updates.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
