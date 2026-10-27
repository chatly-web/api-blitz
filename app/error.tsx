'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="page narrow"><div className="empty-state"><h1>Something didn’t load.</h1><p>Please try again. If you’re setting up the project, confirm the database migration and environment settings.</p><Button onClick={reset}>Try again</Button></div></div>; }
