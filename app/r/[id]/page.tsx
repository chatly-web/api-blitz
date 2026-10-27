import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';
import { currentViewer } from '@/lib/auth';
import { getComments, getReport, getVoterIdentities, getReportHistory } from '@/lib/data';
import { AppShell } from '@/components/AppShell';
import { ReportHistory } from '@/components/ReportHistory';
import { ReportDetail } from '@/components/ReportDetail';
export const dynamic = 'force-dynamic';
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!z.uuid().safeParse(id).success) notFound();
  const viewer = await currentViewer(); if (!viewer) redirect('/login');
  const report = await getReport(id,viewer.id); if (!report) notFound();
  const [comments,voters,history] = await Promise.all([getComments(id,viewer.id),getVoterIdentities(id),getReportHistory(report)]);
  return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><ReportDetail report={report} comments={comments} voters={voters} identity={viewer.identity} history={<ReportHistory events={history}/>} /></AppShell>;
}
