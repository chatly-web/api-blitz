import { Check, Clock3, FileText, LockKeyhole } from 'lucide-react';
import type { PublicReportEvent } from '@/lib/civic-intelligence';
import { statusLabels } from '@/components/ui/badge';
import { T } from '@/components/LanguageProvider';
export function ReportHistory({events}:{events:PublicReportEvent[]}){
 return <section className="report-history" aria-labelledby="history-heading"><div className="section-heading"><Clock3 size={18}/><h2 id="history-heading">Report history</h2></div><p className="small muted">Recorded milestones. Authority members stay anonymous.</p><ol>{events.map((event,index)=>{const Icon=event.type==='submitted'?FileText:event.type==='claimed'?LockKeyhole:Check;return <li key={`${event.occurredAt}-${index}`}><span className="history-marker"><Icon size={14}/></span><div><strong>{event.type==='submitted'?'Report submitted':event.type==='claimed'?'Claimed by Ward Authority':<T>{statusLabels[event.status!]}</T>}</strong><time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})} IST</time></div></li>;})}</ol></section>;
}
