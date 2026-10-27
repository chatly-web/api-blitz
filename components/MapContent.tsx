'use client';
import { useState } from 'react';
import Link from 'next/link';
import { List, MapPin, Plus } from 'lucide-react';
import type { Report } from '@/lib/types';
import { MapView, statusColors } from '@/components/MapView';
import { statusLabels, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dateLabel } from '@/lib/utils';
export function MapContent({ reports,demo = false }: { reports: Report[]; demo?: boolean }) {
  const [list,setList] = useState(false);
  return <><div className="page-title"><div><h1>Every issue has a place.</h1><p>Explore reported issues in your community. Select a pin to see the evidence, join the conversation, and follow progress.</p></div><Button variant="outline" type="button" onClick={() => setList(!list)}><List size={15} />{list ? 'Hide accessible list' : 'Show accessible list'}</Button></div><div className="map-summary"><div><h2>Your community, on the map</h2><p>Exact locations. Real evidence. Updates from your Ward Authority.</p></div><span className="map-count"><MapPin size={16} />{reports.length} {demo ? 'sample reports' : reports.length === 1 ? 'report' : 'reports'}</span></div><MapView reports={reports} demo={demo} /><div className="map-legend" aria-label="Report status legend">{Object.entries(statusColors).map(([status,color]) => <span key={status}><i className="legend-dot" style={{ background:color }} aria-hidden="true" />{statusLabels[status as keyof typeof statusLabels]}</span>)}</div>{reports.length === 0 && <div className="empty-state"><MapPin size={27} /><h2>No reports yet</h2><p>Be the first to document a civic issue. Add a photo and a location to start a clear record.</p><Button asChild><Link href="/report/new"><Plus size={16} />Report an issue</Link></Button></div>}{list && <div className="queue-list" aria-label="Accessible report list">{reports.map(report => <article className="queue-row" key={report.id}><MapPin size={19} /><div><h3><Link href={demo ? '/demo/report' : `/r/${report.id}`}>{report.category}</Link></h3><p>{report.description.slice(0,130)}</p><small>{dateLabel(report.createdAt)} · {report.lat.toFixed(5)}, {report.lng.toFixed(5)}</small></div><StatusBadge status={report.status} /><span className="small muted">{report.score} net votes</span><Link href={demo ? '/demo/report' : `/r/${report.id}`} className="small">View report →</Link></article>)}</div>}</>;
}
