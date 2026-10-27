import { notFound } from 'next/navigation';
import { currentViewer } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await currentViewer(); if (!viewer?.isAdmin) notFound();
  return <AppShell identity={viewer.identity} isAdmin>{children}</AppShell>;
}
