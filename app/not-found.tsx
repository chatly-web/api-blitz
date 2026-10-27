import Link from 'next/link';
import { MapPinned } from 'lucide-react';
export default function NotFound() { return <main className="page narrow"><div className="empty-state" style={{ marginTop:80 }}><MapPinned size={30} /><h1>Page not found</h1><p>This page doesn’t exist or isn’t available to your account.</p><Link href="/" className="button button-primary">Return to Civic</Link></div></main>; }
