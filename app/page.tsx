import { redirect } from 'next/navigation';
import { currentViewer } from '@/lib/auth';
export default async function Home() { redirect(await currentViewer() ? '/map' : '/login'); }
