import { redirect } from 'next/navigation';
import { currentViewer } from '@/lib/auth';
import { getReports } from '@/lib/data';
import { AppShell } from '@/components/AppShell';
import { CommunityOutcomes } from '@/components/CommunityOutcomes';
export const dynamic='force-dynamic';
export default async function Insights(){const viewer=await currentViewer();if(!viewer)redirect('/login');const reports=await getReports();return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><CommunityOutcomes reports={reports}/></AppShell>;}
