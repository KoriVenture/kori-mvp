import { NextResponse } from "next/server";

import { bootstrapOnboardingUser } from "@/lib/onboarding/bootstrap";
import { publicSignupRole } from "@/lib/onboarding/contracts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const role = publicSignupRole(body?.role);
  if (!role) return NextResponse.json({ error: "Invalid onboarding role." }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const result = await bootstrapOnboardingUser(supabase, data.user, role, 1);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
