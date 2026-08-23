import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/onboarding/contracts";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const url = new URL(request.url); const next = safeRedirectPath(url.searchParams.get("next"));
  if (!hasSupabaseConfig()) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  const code = url.searchParams.get("code");
  if (code) { const { error } = await (await createClient()).auth.exchangeCodeForSession(code); if (!error) return NextResponse.redirect(new URL(next, url.origin)); }
  return NextResponse.redirect(new URL("/join", url.origin));
}
