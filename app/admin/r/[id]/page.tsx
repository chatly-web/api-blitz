import { notFound } from 'next/navigation';
import { z } from 'zod';
import { currentViewer } from '@/lib/auth';
import { getComments,getPrivateNotes,getReport,mayHandleReport } from '@/lib/data';
import { ReportDetail } from '@/components/ReportDetail';
import { AdminActions } from '@/components/AdminActions';
import { dateLabel } from '@/lib/utils';
export default async function HandleReport({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await currentViewer(); if (!viewer?.isAdmin) notFound();
  const { id } = await params; if (!z.uuid().safeParse(id).success) notFound();
  const report = await getReport(id,viewer.id); if (!report) notFound();
  const [comments,notes,canHandle] = await Promise.all([getComments(id,viewer.id),getPrivateNotes(id),mayHandleReport(id,viewer.id)]);
  return <ReportDetail report={report} comments={comments} identity={viewer.identity}><AdminActions report={report} canHandle={canHandle} />{notes.length > 0 && <section className="internal-notes"><h2>Internal notes</h2><p className="small muted">Authority-only notes. Author identities are not displayed.</p>{notes.map(note => <article key={note.id}><p>{note.body}</p><time dateTime={note.createdAt}>{dateLabel(note.createdAt)}</time></article>)}</section>}</ReportDetail>;
}
