import type { SupabaseClient, User } from "@supabase/supabase-js";

export type OnboardingRole = "investor" | "founder";
type BootstrapResult = { ok: true } | { ok: false; error: string };

export async function bootstrapOnboardingUser(
  supabase: SupabaseClient,
  user: User,
  role: OnboardingRole,
  minimumScreen = 1,
): Promise<BootstrapResult> {
  const profileResult = await supabase.from("profiles").select("id,roles").eq("id", user.id).maybeSingle();
  if (profileResult.error) return { ok: false, error: profileResult.error.message };

  if (!profileResult.data) {
    const insertResult = await supabase.from("profiles").insert({
      id: user.id,
      roles: [role],
      verification_status: "deferred",
    });
    if (insertResult.error) {
      return {
        ok: false,
        error: "The auth user exists, but the Kori profile could not be created. Check the profiles RLS policy or the auth.users → profiles trigger.",
      };
    }
  } else {
    const currentRoles = Array.isArray(profileResult.data.roles) ? profileResult.data.roles : [];
    const nextRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];
    const updateResult = await supabase
      .from("profiles")
      .update({ roles: nextRoles, verification_status: "deferred", updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (updateResult.error) return { ok: false, error: updateResult.error.message };
  }

  const roleTable = role === "investor" ? "investor_profiles" : "founder_profiles";
  const existing = await supabase.from(roleTable).select("user_id").eq("user_id", user.id).maybeSingle();
  if (existing.error) return { ok: false, error: existing.error.message };
  if (!existing.data) {
    const created = await supabase.from(roleTable).insert({ user_id: user.id, onboarding_status: "in_progress" });
    if (created.error) return { ok: false, error: created.error.message };
  }

  const progress = await supabase
    .from("onboarding_progress")
    .select("current_screen")
    .eq("user_id", user.id)
    .eq("role", role)
    .maybeSingle();
  if (progress.error) return { ok: false, error: progress.error.message };

  if (!progress.data) {
    const created = await supabase.from("onboarding_progress").insert({
      user_id: user.id,
      role,
      current_screen: minimumScreen,
      completed_screens: minimumScreen > 0 ? [0] : [],
      last_saved_at: new Date().toISOString(),
    });
    if (created.error) return { ok: false, error: created.error.message };
  } else if (progress.data.current_screen < minimumScreen) {
    const updated = await supabase
      .from("onboarding_progress")
      .update({
        current_screen: minimumScreen,
        completed_screens: Array.from({ length: minimumScreen }, (_, index) => index),
        last_saved_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("role", role);
    if (updated.error) return { ok: false, error: updated.error.message };
  }

  return { ok: true };
}
