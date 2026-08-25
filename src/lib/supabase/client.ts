import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { supabaseConfig } from "./config";

export function createClient() {
  const { url, key } = supabaseConfig();

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
