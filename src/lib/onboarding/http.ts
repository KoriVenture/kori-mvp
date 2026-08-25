import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "../supabase/config";
import { createClient } from "../supabase/server";

export type RequiredRole = "investor" | "founder";

export async function requireRole(role: RequiredRole) {
  if (!hasSupabaseConfig()) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };

  const profileResult = await supabase.from("profiles").select("id,roles,verification_status").eq("id", auth.user.id).maybeSingle();
  if (profileResult.error) return { error: NextResponse.json({ error: "Unable to read Kori profile." }, { status: 500 }) };
  if (!profileResult.data) return { error: NextResponse.json({ error: "Kori profile does not exist." }, { status: 409 }) };

  const roles = Array.isArray(profileResult.data.roles) ? profileResult.data.roles : [];
  if (!roles.includes(role)) return { error: NextResponse.json({ error: "Role not permitted." }, { status: 403 }) };
  return { supabase, userId: auth.user.id, user: auth.user, profile: profileResult.data };
}

export function invalid(error: unknown) {
  return NextResponse.json({ error: "Invalid onboarding data.", details: error }, { status: 400 });
}
