import { NextResponse } from "next/server";
import { resolveEmailVerified } from "@/lib/onboarding/auth-state";
import { invalid, requireRole } from "@/lib/onboarding/http";
import { investorPatchSchema } from "@/lib/validation/investor-onboarding";

export async function GET() {
  const auth = await requireRole("investor");
  if (auth.error) return auth.error;
  const { supabase, userId, auth0User } = auth;
  const [profile, investor, progress, agreements] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("investor_profiles").select("*").eq("user_id", userId).single(),
    supabase.from("onboarding_progress").select("*").eq("user_id", userId).eq("role", "investor").maybeSingle(),
    supabase.from("agreement_acceptances").select("*").eq("user_id", userId).eq("role", "investor"),
  ]);

  const email = auth0User.email ?? profile.data?.email ?? null;
  const emailVerified = resolveEmailVerified(
    auth0User.email_verified,
    profile.data?.email_verified,
  );

  return NextResponse.json({
    auth: {
      email,
      emailVerified,
    },
    user: {
      email,
      roles: profile.data?.roles ?? [],
      verificationStatus:
        profile.data?.verification_status ?? "deferred",
      emailVerified,
    },
    profile: profile.data,
    investor: investor.data,
    progress: progress.data,
    agreements: agreements.data ?? [],
  });
}

export async function PATCH(request: Request) {
  const auth = await requireRole("investor");
  if (auth.error) return auth.error;
  const parsed = investorPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error.flatten());
  const { supabase, userId } = auth;
  const p = parsed.data;

  if (p.profile) {
    const x = p.profile;
    const saved = await supabase.from("profiles").update({
      legal_first_name: x.legalFirstName, legal_last_name: x.legalLastName,
      country: x.country, city: x.city, timezone: x.timezone,
      linkedin_url: x.linkedinUrl, professional_title: x.professionalTitle,
      organization: x.organization, biography: x.biography,
      photo_path: x.photoPath, languages: x.languages, updated_at: new Date().toISOString(),
    }).eq("id", userId);
    if (saved.error) return NextResponse.json({ error: "Unable to save profile." }, { status: 500 });
  }

  if (p.preferences || p.eligibility || p.complete) {
    const row: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };
    if (p.preferences) Object.assign(row, {
      investor_type: p.preferences.investorType,
      contribution_areas: p.preferences.expertiseAreas,
      ask_me_about: p.preferences.askMeAbout,
      preferred_regions: p.preferences.preferredRegions,
      investment_stages: p.preferences.investmentStages,
      preferred_ticket_size: p.preferences.preferredTicketSize,
      preferred_instruments: p.preferences.preferredInstruments,
      investment_horizon: p.preferences.investmentHorizon,
      investment_thesis: p.preferences.investmentThesis,
    });
    if (p.eligibility) Object.assign(row, {
      investor_classification: p.eligibility.investorClassification,
      experience: p.eligibility.investmentExperience,
      private_company_experience: p.eligibility.privateCompanyExperience,
      source_of_funds: p.eligibility.sourceOfFunds,
      risk_acknowledged: p.eligibility.riskAcknowledged,
    });
    if (p.complete) Object.assign(row, { onboarding_status: "completed", completed_at: new Date().toISOString() });
    const saved = await supabase.from("investor_profiles").upsert(row, { onConflict: "user_id" });
    if (saved.error) return NextResponse.json({ error: "Unable to save investor profile." }, { status: 500 });
  }

  if (p.agreements) {
    const rows = [
      ["terms", p.agreements.terms], ["privacy", p.agreements.privacy],
      ["platform", p.agreements.platform], ["investment_risk", p.agreements.risk],
    ].filter(([, accepted]) => accepted);
    for (const [type] of rows) {
      const result = await supabase.from("agreement_acceptances").upsert({
        user_id: userId, role: "investor", agreement_type: type,
        agreement_version: "mvp-1", accepted: true,
        signature_name: p.agreements.signatureName, signed_at: p.agreements.signedAt,
      }, { onConflict: "user_id,role,agreement_type,agreement_version" });
      if (result.error) return NextResponse.json({ error: "Unable to save agreements." }, { status: 500 });
    }
  }

  const verification = await supabase.from("profiles").update({ verification_status: "deferred", updated_at: new Date().toISOString() }).eq("id", userId);
  if (verification.error) return NextResponse.json({ error: "Unable to update verification status." }, { status: 500 });
  const progress = await supabase.from("onboarding_progress").upsert({
    user_id: userId, role: "investor", current_screen: p.screen,
    completed_screens: Array.from({ length: p.screen }, (_, index) => index),
    last_saved_at: new Date().toISOString(),
  }, { onConflict: "user_id,role" });
  if (progress.error) return NextResponse.json({ error: "Unable to save onboarding progress." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
