import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { currentViewer } from '@/lib/auth';
import { getReports } from '@/lib/data';
import { AppShell } from '@/components/AppShell';
import { Avatar } from '@/components/Avatar';
import { CloudImage } from '@/components/CloudImage';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dateLabel } from '@/lib/utils';
export const dynamic = 'force-dynamic';
export default async function MyReports() {
  const viewer = await currentViewer(); if (!viewer) redirect('/login');
  const reports = await getReports({ authorId:viewer.id });
  return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><div className="page"><div className="page-title"><div><h1>My reports</h1><p>Your contribution to a better neighborhood, from first photo to resolution.</p></div><span className="author-line small"><Avatar identity={viewer.identity} />{viewer.identity.handle}</span></div>{reports.length ? <div className="queue-list">{reports.map(report => <article key={report.id} className="queue-row"><div className="queue-thumb"><CloudImage publicId={report.beforePublicId} alt={report.category} width={150} /></div><div><h3><Link href={`/r/${report.id}`}>{report.category}</Link></h3><p>{report.description.slice(0,110)}</p><small>{dateLabel(report.createdAt)}</small></div><StatusBadge status={report.status} /><span className="small muted">{report.score} net votes</span><Link href={`/r/${report.id}`} className="small">View report →</Link></article>)}</div> : <div className="empty-state"><FileText size={28} /><h2>Your first report starts here.</h2><p>You haven’t submitted an issue yet. Add a photo and location when you spot something that needs attention.</p><Button asChild><Link href="/report/new"><Plus size={16} />Report an issue</Link></Button></div>}</div></AppShell>;
}
