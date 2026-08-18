import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaces a clear error in the browser console instead of a cryptic Supabase failure
  // if someone forgets to set the environment variables.
  console.warn(
    'Variables Supabase manquantes : vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local (ou dans les variables d\u2019environnement Vercel).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
