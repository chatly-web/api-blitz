import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { currentViewer } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';
import { ReportForm } from '@/components/ReportForm';
export const dynamic = 'force-dynamic';
export default async function NewReport() {
  const viewer = await currentViewer(); if (!viewer) redirect('/login');
  return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><div className="page report-compose-page"><Link href="/map" className="back-link"><ArrowLeft size={14} />Back to map</Link><div className="page-title"><div><h1>Report a civic issue</h1><p>A clear photo and an exact location help your community take the next step.</p></div></div><ReportForm /></div></AppShell>;
}
