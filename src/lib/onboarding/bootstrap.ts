import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { PublicSignupRole } from "./contracts";

function displayName(user: User) {
  const metadata = user.user_metadata ?? {};
  const candidate =
    metadata.full_name ?? metadata.name ?? metadata.user_name ?? user.email;
  return typeof candidate === "string" ? candidate : null;
}

export async function bootstrapOnboardingIdentity({
  supabase,
  user,
  role,
  country,
  newsletter,
}: {
  supabase: SupabaseClient;
  user: User;
  role: PublicSignupRole;
  country: string;
  newsletter: boolean;
}) {
  const existing = await supabase
    .from("profiles")
    .select("id,roles,country,marketing_opt_in,marketing_opt_in_at")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.error) throw existing.error;

  const roles = Array.from(
    new Set([...(existing.data?.roles ?? []), role]),
  );
  const profileCountry = country || existing.data?.country || "";
  const marketingOptIn =
    newsletter || existing.data?.marketing_opt_in === true;
  const marketingOptInAt = marketingOptIn
    ? existing.data?.marketing_opt_in_at ?? new Date().toISOString()
    : null;

  const profile = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName(user),
      roles,
      country: profileCountry,
      email: user.email ?? null,
      email_verified: Boolean(user.email_confirmed_at),
      verification_status: "deferred",
      marketing_opt_in: marketingOptIn,
      marketing_opt_in_at: marketingOptInAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profile.error) throw profile.error;

  if (role === "investor") {
    const investor = await supabase.from("investor_profiles").upsert(
      {
        user_id: user.id,
        onboarding_status: "in_progress",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
    if (investor.error) throw investor.error;
  }

  if (role === "founder") {
    const founder = await supabase.from("founder_profiles").upsert(
      {
        user_id: user.id,
        onboarding_status: "in_progress",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
    if (founder.error) throw founder.error;
  }

  const progress = await supabase.from("onboarding_progress").upsert(
    {
      user_id: user.id,
      role,
      current_screen: 1,
      completed_screens: [0],
      last_saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );
  if (progress.error) throw progress.error;

  return user.id;
}
