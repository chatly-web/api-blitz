import { AppShell } from '@/components/AppShell';
import { CommunityOutcomes } from '@/components/CommunityOutcomes';
import { demoReports } from '@/lib/demo';
export default function DemoInsights(){return <AppShell demo><CommunityOutcomes reports={demoReports} demo/></AppShell>;}
