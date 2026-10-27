import { redirect } from 'next/navigation';
import { currentViewer } from '@/lib/auth';
import { getReports } from '@/lib/data';
import { AppShell } from '@/components/AppShell';
import { MapContent } from '@/components/MapContent';
export const dynamic = 'force-dynamic';
export default async function MapPage() {
  const viewer = await currentViewer(); if (!viewer) redirect('/login');
  const reports = await getReports();
  return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><div className="page"><MapContent reports={reports} /></div></AppShell>;
}
