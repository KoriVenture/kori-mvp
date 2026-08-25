import { NextResponse, type NextRequest } from "next/server";
import { bootstrapOnboardingUser, type OnboardingRole } from "@/lib/onboarding/bootstrap";
import { safeRedirectPath } from "@/lib/onboarding/contracts";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function roleFromNext(next: string): OnboardingRole {
  return next === "/onboarding/founder" ? "founder" : "investor";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeRedirectPath(url.searchParams.get("next"));
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/join?auth=missing-code", url.origin));

  const supabase = await createClient();
  const exchange = await supabase.auth.exchangeCodeForSession(code);
  if (exchange.error) return NextResponse.redirect(new URL("/join?auth=exchange-failed", url.origin));
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return NextResponse.redirect(new URL("/join?auth=session-failed", url.origin));

  const bootstrap = await bootstrapOnboardingUser(supabase, auth.user, roleFromNext(next), 1);
  if (!bootstrap.ok) {
    console.error("Kori onboarding bootstrap failed:", bootstrap.error);
    return NextResponse.redirect(new URL("/join?auth=profile-failed", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
