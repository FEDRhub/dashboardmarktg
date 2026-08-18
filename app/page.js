'use client';

export const dynamic = 'force-dynamic';

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
