import { NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/onboarding/contracts";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(`${next}?auth=error`, url.origin));
  }

  const supabase = await createClient();
  const exchanged = await supabase.auth.exchangeCodeForSession(code);

  if (exchanged.error) {
    console.error("Supabase OAuth callback failed:", exchanged.error.message);
    return NextResponse.redirect(new URL(`${next}?auth=error`, url.origin));
  }

  return NextResponse.redirect(new URL(`${next}?auth=complete`, url.origin));
}
