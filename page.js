'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { installWindowStorage } from '../lib/storage';
import DashboardCore from '../components/DashboardCore';

// Wire window.storage to Supabase as soon as this module loads on the client,
// so it's ready before DashboardCore's first effect runs.
installWindowStorage();

export default function Page() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        Chargement…
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', background: '#F4F4F5' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 16, width: 340, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Radar — Veille marketing</h1>
          <p style={{ fontSize: 13, color: '#71717A', marginBottom: 20 }}>
            Connecte-toi avec ton email pour accéder au dashboard partagé.
          </p>
          {sent ? (
            <p style={{ fontSize: 13, color: '#2F8F5E' }}>
              Lien de connexion envoyé à <strong>{email}</strong> — vérifie ta boîte mail.
            </p>
          ) : (
            <form onSubmit={handleSignIn}>
              <input
                type="email"
                required
                placeholder="ton.email@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid #E4E4E7', fontSize: 13, marginBottom: 12 }}
              />
              <button
                type="submit"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none', background: '#18181B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Recevoir le lien de connexion
              </button>
              {error && <p style={{ fontSize: 12, color: '#B23A5D', marginTop: 10 }}>{error}</p>}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDEBF5', padding: '20px 0' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto 12px auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '0 14px' }}>
        <span style={{ fontSize: 12, color: '#6E6A80' }}>{session.user.email}</span>
        <button
          onClick={handleSignOut}
          style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, border: '1px solid #E4E4E7', background: '#fff', cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>
      <DashboardCore />
    </div>
  );
}
