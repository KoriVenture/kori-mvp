"use client";

import { createBrowserClient } from "@supabase/ssr";

import { supabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key } = supabaseConfig();

  browserClient = createBrowserClient(url, key, {
    auth: {
      experimental: {
        passkey: true,
      },
    },
  });

  return browserClient;
}
