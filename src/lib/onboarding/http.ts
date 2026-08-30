import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasRole } from "./role-access";

export function invalid(details?: unknown) {
  return NextResponse.json(
    { error: "Invalid request.", details },
    { status: 400 },
  );
}

export async function requireRole(role: "investor" | "founder") {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();

  if (auth.error || !auth.data.user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    } as const;
  }

  const user = auth.data.user;
  const profile = await supabase
    .from("profiles")
    .select("id,roles")
    .eq("id", user.id)
    .maybeSingle();

  if (profile.error) {
    return {
      error: NextResponse.json(
        { error: "Unable to read Kori profile." },
        { status: 500 },
      ),
    } as const;
  }

  if (!profile.data || !hasRole(profile.data.roles, role)) {
    return {
      error: NextResponse.json(
        { error: "Role not permitted." },
        { status: 403 },
      ),
    } as const;
  }

  return {
    error: null,
    supabase,
    user,
    userId: user.id,
  } as const;
}
