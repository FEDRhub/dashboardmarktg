import { supabase } from './supabaseClient';

// Mirrors the window.storage API used by the original Claude artifact
// (get/set/delete/list), but backed by a real Postgres table via Supabase
// instead of Anthropic's ephemeral artifact storage.
//
// Every key is stored in one shared table (`dashboard_store`), readable and
// writable by any signed-in user — this is what makes the dashboard's data
// visible to everyone your team invites, instead of per-person storage.

const TABLE = 'dashboard_store';

async function get(key /*, shared */) {
  const { data, error } = await supabase.from(TABLE).select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Key not found: ${key}`);
  return { key, value: data.value, shared: true };
}

async function set(key, value /*, shared */) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
  return { key, value, shared: true };
}

async function del(key /*, shared */) {
  const { error } = await supabase.from(TABLE).delete().eq('key', key);
  if (error) throw error;
  return { key, deleted: true, shared: true };
}

async function list(prefix = '' /*, shared */) {
  let query = supabase.from(TABLE).select('key');
  if (prefix) query = query.like('key', `${prefix}%`);
  const { data, error } = await query;
  if (error) throw error;
  return { keys: (data || []).map((r) => r.key), prefix, shared: true };
}

export const storage = { get, set, delete: del, list };

export function installWindowStorage() {
  if (typeof window !== 'undefined') {
    window.storage = storage;
  }
}
