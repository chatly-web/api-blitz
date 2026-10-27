import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Camera, MapPin, ShieldCheck, CircleCheck, Circle, EyeOff, Fingerprint, ArrowRight, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { GoogleSignIn } from '@/components/GoogleSignIn';
import { Button } from '@/components/ui/button';
import { authenticatedUser } from '@/lib/auth';
import { hasBackend, setupItems } from '@/lib/env';
export const dynamic = 'force-dynamic';
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await authenticatedUser()) redirect('/map');
  const params = await searchParams; const ready = hasBackend();
  return (
    <AppShell>
      <div className="login-page">
        <section className="login-story">
          <h1>A better street starts<br />with <span>a report.</span></h1>
          <p>Bring local issues into focus. Share photo evidence, mark the location, and follow the journey from reported to resolved.</p>
          <div className="story-steps">
            <div><Camera size={23} /><h3>Document it.</h3><p>A photo gives every issue a clear starting point.</p></div>
            <div><MapPin size={23} /><h3>Put it on the map.</h3><p>Help your community find the exact place.</p></div>
            <div><ShieldCheck size={23} /><h3>See the change.</h3><p>Before-and-after proof closes the loop.</p></div>
          </div>
        </section>
        <section className="login-panel">
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
              <Sparkles size={16} /> Explore Live Demo & API Sandbox
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#4b5563' }}>
              Test DiceBear Avatar Studio, Picsum Repair Sandbox, and Cloudinary Evidence directly without signing in.
            </p>
            <Button asChild size="default" style={{ width: '100%' }}>
              <Link href="/demo">
                Open Live Interactive Demo <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </Link>
            </Button>
          </div>

          <h2>Your city. Your voice.</h2>
          <p>Sign in to report an issue, support a report, or add a helpful update.</p>
          <GoogleSignIn enabled={ready} />
          {params.error && <p className="form-error" role="alert">Sign-in did not complete. Try again after confirming the Google OAuth callback settings.</p>}
          <div className="privacy-list">
            <div><EyeOff size={18} /><span>Your Google name and profile photo never appear in the community.</span></div>
            <div><Fingerprint size={18} /><span>You receive a generated handle and a unique anonymous avatar.</span></div>
            <div><ShieldCheck size={18} /><span>Authority actions use a single generic badge, with private accountability.</span></div>
          </div>
          {!ready && (
            <>
              <h3>Service setup required</h3>
              <p className="small muted">The interface is ready. Add your project credentials and run the database migration to enable sign-in.</p>
              <ul className="setup-list">
                {setupItems().map(item => (
                  <li key={item.label}>
                    {item.ready ? <CircleCheck size={15} color="#216c51" /> : <Circle size={15} />}
                    <span><strong>{item.label}</strong>{item.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="setup-note">Setup steps are documented in the project README. No account or report is simulated here.</p>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

