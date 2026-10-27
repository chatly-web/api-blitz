import { redirect } from 'next/navigation';
import { authenticatedUser,currentViewer } from '@/lib/auth';
import { getReports } from '@/lib/data';
import { AppShell } from '@/components/AppShell';
import { CommunityOutcomes } from '@/components/CommunityOutcomes';
export const dynamic='force-dynamic';
export default async function Insights(){const user=await authenticatedUser();if(!user)redirect('/login');const [viewer,reports]=await Promise.all([currentViewer(),getReports()]);if(!viewer)redirect('/login');return <AppShell identity={viewer.identity} isAdmin={viewer.isAdmin}><CommunityOutcomes reports={reports}/></AppShell>;}
