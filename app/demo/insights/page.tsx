import { AppShell } from '@/components/AppShell';
import { CommunityOutcomes } from '@/components/CommunityOutcomes';
import { demoReports, DEMO_IDENTITY } from '@/lib/demo';
export default function DemoInsights(){return <AppShell demo identity={DEMO_IDENTITY}><CommunityOutcomes reports={demoReports} demo/></AppShell>;}
