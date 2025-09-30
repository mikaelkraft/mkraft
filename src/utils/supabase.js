import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function buildNoopClient(reason = "supabase_env_missing") {
  const errorResp = () =>
    Promise.resolve({ data: null, error: { message: reason } });
  return {
    auth: new Proxy(
      {},
      { get: () => async () => ({ data: null, error: { message: reason } }) },
    ),
    from: () => ({
      select: errorResp,
      update: errorResp,
      insert: errorResp,
      delete: errorResp,
      upsert: errorResp,
      maybeSingle: errorResp,
      single: errorResp,
      eq: () => ({ select: errorResp, update: errorResp, delete: errorResp }),
      order: () => ({ select: errorResp }),
    }),
    rpc: async () => ({ data: null, error: { message: reason } }),
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: () => {},
  };
}

let supabaseInstance;
export let isSupabaseNoop = false;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY; using no-op client.",
  );
  supabaseInstance = buildNoopClient();
  isSupabaseNoop = true;
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: { enabled: true },
  });
}

if (
  isSupabaseNoop &&
  typeof window !== "undefined" &&
  process.env.NODE_ENV !== "production"
) {
  // eslint-disable-next-line no-console
  console.info("[supabase] operating in no-op mode (frontend)");
}

export default supabaseInstance;
