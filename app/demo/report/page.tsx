import { ReportHistory } from '@/components/ReportHistory';
import { AppShell } from '@/components/AppShell';
import { ReportDetail } from '@/components/ReportDetail';
import { demoReports,demoComments } from '@/lib/demo';
export default function DemoReport() { return <AppShell demo><ReportDetail report={demoReports[0]} comments={demoComments} demo history={<ReportHistory events={[{type:'submitted',status:'open',occurredAt:demoReports[0].createdAt},{type:'claimed',status:null,occurredAt:'2026-10-27T10:00:00Z'},{type:'status',status:'in_progress',occurredAt:'2026-10-27T11:00:00Z'},{type:'status',status:'resolved',occurredAt:'2026-10-27T13:00:00Z'}]}/>} /></AppShell>; }
