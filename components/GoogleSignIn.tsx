'use client';
import { useState } from 'react';
import { browserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
export function GoogleSignIn({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function signIn() {
    setBusy(true); setError('');
    try {
      const { error } = await browserClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`, queryParams: { prompt: 'select_account' } } });
      if (error) throw error;
    } catch {
      setError('Google sign-in could not start. Check your connection and provider configuration, then try again.');
      setBusy(false);
    }
  }
  return <><Button type="button" onClick={signIn} disabled={!enabled || busy} className="google-button"><svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.4ZM12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2.1.9-3.4.9-2.6 0-4.9-1.8-5.7-4.2H2.9v2.6A10 10 0 0 0 12 22ZM6.3 13.7a6 6 0 0 1 0-3.4V7.7H2.9a10 10 0 0 0 0 8.6l3.4-2.6ZM12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.1 5.7l3.4 2.6A6 6 0 0 1 12 6.1Z"/></svg>{busy ? 'Opening Google…' : 'Continue with Google'}</Button><p role="status" className="form-error">{error}</p></>;
}
