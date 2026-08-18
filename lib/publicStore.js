import { supabase } from './supabaseClient';

// Read-only fetch, usable without a signed-in session (relies on the
// public-read RLS policy added for the digest — see supabase/schema.sql).
export async function fetchStoreValue(key) {
  const { data, error } = await supabase.from('dashboard_store').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}
