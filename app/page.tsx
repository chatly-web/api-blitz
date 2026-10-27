import { redirect } from 'next/navigation';
import { authenticatedUser } from '@/lib/auth';

export default async function Home({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = await searchParams;
  if (params?.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }
  redirect(await authenticatedUser() ? '/map' : '/login');
}
