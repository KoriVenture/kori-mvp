import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { auth0 } from "@/lib/auth0";

import { supabaseConfig } from "./config";

export async function createClient() {
  const session = await auth0.getSession();

  if (!session) {
    throw new Error("Authentication required.");
  }

  const idToken = session.tokenSet.idToken;

  if (!idToken) {
    throw new Error("Auth0 ID token is missing.");
  }

  const { url, key } = supabaseConfig();

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => idToken,
  });
}

export function createAnonymousClient() {
  const { url, key } = supabaseConfig();

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
