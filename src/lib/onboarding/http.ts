import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "../supabase/config";
import { createClient } from "../supabase/server";
export async function requireRole(role: "investor" | "founder") {
  if (!hasSupabaseConfig()) return { error: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  const { data: user } = await supabase.from("users").select("role").eq("id", auth.user.id).single();
  if (user?.role !== role) return { error: NextResponse.json({ error: "Role not permitted." }, { status: 403 }) };
  return { supabase, userId: auth.user.id };
}
export function invalid(error: unknown) { return NextResponse.json({ error: "Invalid onboarding data.", details: error }, { status: 400 }); }
