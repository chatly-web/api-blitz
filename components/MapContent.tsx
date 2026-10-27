'use client';
import { useState } from 'react';
import Link from 'next/link';
import { List, MapPin, Plus } from 'lucide-react';
import { statuses } from '@/lib/types';
import type { Report } from '@/lib/types';
import { MapView, statusColors } from '@/components/MapView';
import { statusLabels, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dateLabel } from '@/lib/utils';
export function MapContent({ reports,demo = false }: { reports: Report[]; demo?: boolean }) {
  const [list,setList] = useState(false);
  const [status,setStatus] = useState('');
  const visible = reports.filter(report => !status || report.status === status);
  return <><div className="page-title"><div><h1>Every issue has a place.</h1><p>Explore reported issues in your community. Select a pin to see the evidence, join the conversation, and follow progress.</p></div><Button variant="outline" type="button" onClick={() => setList(!list)}><List size={15} />{list ? 'Hide accessible list' : 'Show accessible list'}</Button></div><div className="map-status-filter"><label className="field-label" htmlFor="map-status">Report status</label><select id="map-status" className="input" value={status} onChange={event => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map(value => <option value={value} key={value}>{statusLabels[value]}</option>)}</select></div><div className="map-summary"><div><h2>Your community, on the map</h2><p>Exact locations. Real evidence. Updates from your Ward Authority.</p></div><span className="map-count"><MapPin size={16} />{visible.length} {demo ? 'sample reports' : visible.length === 1 ? 'report' : 'reports'}</span></div><MapView reports={visible} demo={demo} /><div className="map-legend" aria-label="Report status legend">{Object.entries(statusColors).map(([status,color]) => <span key={status}><i className="legend-dot" style={{ background:color }} aria-hidden="true" />{statusLabels[status as keyof typeof statusLabels]}</span>)}</div>{visible.length === 0 && <div className="empty-state"><MapPin size={27} /><h2>{status ? 'No reports with this status' : 'No reports yet'}</h2><p>{status ? 'Choose another status to explore other reports in your community.' : 'Be the first to document a civic issue. Add a photo and a location to start a clear record.'}</p><Button asChild><Link href="/report/new"><Plus size={16} />Report an issue</Link></Button></div>}{list && <div className="queue-list" aria-label="Accessible report list">{visible.map(report => <article className="queue-row citizen-row" key={report.id}><MapPin size={19} /><div><h3><Link href={demo ? '/demo/report' : `/r/${report.id}`}>{report.category}</Link></h3><p>{report.description.slice(0,130)}</p><small>{dateLabel(report.createdAt)} · {report.lat.toFixed(5)}, {report.lng.toFixed(5)}</small></div><div className="queue-status"><StatusBadge status={report.status} /></div><span className="small muted">{report.score} net votes</span><Link href={demo ? '/demo/report' : `/r/${report.id}`} className="small queue-action">View report →</Link></article>)}</div>}</>;
}
