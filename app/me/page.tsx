import { T } from '@/components/LanguageProvider';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { currentViewer } from '@/lib/auth';
import { getReports } from '@/lib/data';
import { AppShell } from '@/components/AppShell';
import { Avatar } from '@/components/Avatar';
import { CloudImage } from '@/components/CloudImage';
import { statuses } from '@/lib/types';
import { StatusBadge, statusLabels } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dateLabel } from '@/lib/utils';
export const dynamic = 'force-dynamic';
export default async function MyReports({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const viewer = await currentViewer(); if (!viewer) redirect('/login');
  const query = await searchParams;
  const status = statuses.includes(query.status as typeof statuses[number]) ? query.status : '';
  const reports = await getReports({ authorId:viewer.id,status });
  return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><div className="page"><div className="page-title"><div><h1><T>My reports</T></h1><p><T>Your contribution to a better neighborhood, from first photo to resolution.</T></p></div><span className="author-line small"><Avatar identity={viewer.identity} />{viewer.identity.handle}</span></div><form className="filter-bar" method="get"><div><label htmlFor="my-status"><T>Report status</T></label><select id="my-status" className="input" name="status" defaultValue={status}><option value=""><T>All statuses</T></option>{statuses.map(value => <option value={value} key={value}><T>{statusLabels[value]}</T></option>)}</select></div><Button type="submit"><T>Apply filter</T></Button><Button asChild variant="ghost"><Link href="/me"><T>Reset</T></Link></Button></form>{reports.length ? <div className="queue-list">{reports.map(report => <article key={report.id} className="queue-row citizen-row"><div className="queue-thumb"><CloudImage publicId={report.beforePublicId} alt={report.category} width={150} /></div><div><h3><Link href={`/r/${report.id}`}>{report.category}</Link></h3><p>{report.description.slice(0,110)}</p><small>{dateLabel(report.createdAt)}</small></div><div className="queue-status"><StatusBadge status={report.status} /></div><span className="small muted">{report.score} net votes</span><Link href={`/r/${report.id}`} className="small queue-action"><T>View report →</T></Link></article>)}</div> : <div className="empty-state"><FileText size={28} /><h2>{status ? 'No reports with this status' : 'Your first report starts here.'}</h2><p>{status ? 'Choose another status or reset the filter to see all your reports.' : 'You haven’t submitted an issue yet. Add a photo and location when you spot something that needs attention.'}</p><Button asChild><Link href="/report/new"><Plus size={16} /><T>Report an issue</T></Link></Button></div>}</div></AppShell>;
}
