export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function supabaseConfig() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  };
}

export function passkeysEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_PASSKEYS === "true";
}

export function phoneMfaEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_PHONE_MFA === "true";
}
