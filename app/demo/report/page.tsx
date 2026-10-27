import { AppShell } from '@/components/AppShell';
import { ReportDetail } from '@/components/ReportDetail';
import { demoReports,demoComments } from '@/lib/demo';
export default function DemoReport() { return <AppShell demo><ReportDetail report={demoReports[0]} comments={demoComments} demo /></AppShell>; }
