import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function OperatorAccess({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const verify = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setAllowed(Boolean(data.user && !data.user.is_anonymous && data.user.app_metadata.grievance_admin === true));
      setChecking(false);
    };
    void verify();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      // Defer the Auth API call until the auth event releases its internal lock.
      setTimeout(() => { if (active) void verify(); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setPassword('');
    setBusy(false);
    if (signInError) setError('Sign-in failed. Check your email and password.');
    else if (data.user?.app_metadata.grievance_admin !== true || data.user.is_anonymous) {
      setError('This account does not have operator access.');
    }
  };

  if (checking) return <p className="p-8 text-center">Checking access…</p>;
  if (allowed) return <>
    <div className="max-w-7xl mx-auto px-4 pt-4 text-right">
      <button className="text-purple-700 underline" onClick={() => { void supabase.auth.signOut(); }}>Sign out</button>
    </div>
    {children}
  </>;

  return <section className="max-w-md mx-auto my-12 rounded-xl bg-white p-8 shadow-lg">
    <h2 className="text-2xl font-bold text-gray-800">Operator sign-in</h2>
    <p className="mt-3 text-gray-600">The case dashboard is available to authorized operators. You can submit a report without an email account.</p>
    <form onSubmit={signIn} className="mt-6 space-y-4">
      <label className="block">Email
        <input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block">Password
        <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button disabled={busy} className="w-full rounded bg-purple-700 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </section>;
}
