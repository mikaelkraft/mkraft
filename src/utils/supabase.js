import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In test environments we may not have real Supabase credentials; provide a no-op shim.
let supabase;
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    supabase = new Proxy({}, {
      get() {
        return () => Promise.resolve({ data: null, error: { message: 'supabase_disabled_in_test' } });
      }
    });
  } else {
    throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    enabled: true
  }
  });
}

export default supabase;