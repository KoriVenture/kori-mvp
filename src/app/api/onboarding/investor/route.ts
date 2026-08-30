import { NextResponse } from "next/server";
import { invalid, requireRole } from "@/lib/onboarding/http";
import { investorPatchSchema } from "@/lib/validation/investor-onboarding";

const AGREEMENT_VERSION = "mvp-1";

export async function GET() {
  const auth = await requireRole("investor");
  if (auth.error) return auth.error;

  const { supabase, userId, user } = auth;
  const [profile, investor, progress, agreements] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("investor_profiles").select("*").eq("user_id", userId).single(),
    supabase.from("onboarding_progress").select("*")
      .eq("user_id", userId).eq("role", "investor").maybeSingle(),
    supabase.from("agreement_acceptances").select("*")
      .eq("user_id", userId).eq("role", "investor"),
  ]);

  if (profile.error || investor.error) {
    return NextResponse.json(
      { error: "Unable to load investor onboarding." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    auth: {
      email: user.email ?? profile.data?.email ?? null,
      emailVerified: Boolean(user.email_confirmed_at),
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

  const parsed = investorPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());

  const { supabase, userId } = auth;
  const x = parsed.data;
  const now = new Date().toISOString();

  if (x.profile) {
    const v = x.profile;
    const saved = await supabase.from("profiles").update({
      legal_first_name: v.legalFirstName,
      legal_last_name: v.legalLastName,
      country: v.country,
      city: v.city,
      timezone: v.timezone,
      linkedin_url: v.linkedinUrl,
      professional_title: v.professionalTitle,
      organization: v.organization,
      biography: v.biography,
      photo_path: v.photoPath,
      languages: v.languages,
      updated_at: now,
    }).eq("id", userId);
    if (saved.error) {
      return NextResponse.json(
        { error: "Unable to save investor profile." },
        { status: 500 },
      );
    }
  }

  if (x.preferences) {
    const v = x.preferences;
    const saved = await supabase.from("investor_profiles").update({
      investor_type: v.investorType,
      contribution_areas: v.expertiseAreas,
      ask_me_about: v.askMeAbout,
      preferred_regions: v.preferredRegions,
      investment_stages: v.investmentStages,
      preferred_ticket_sizes: v.preferredTicketSizes,
      preferred_ticket_size: v.preferredTicketSizes[0] ?? "",
      preferred_instruments: v.preferredInstruments,
      investment_horizon: v.investmentHorizon,
      investment_thesis: v.investmentThesis,
      updated_at: now,
    }).eq("user_id", userId);
    if (saved.error) {
      return NextResponse.json(
        { error: "Unable to save investment preferences." },
        { status: 500 },
      );
    }
  }

  if (x.eligibility) {
    const v = x.eligibility;
    const saved = await supabase.from("investor_profiles").update({
      investor_classification: v.investorClassification,
      experience: v.investmentExperience,
      private_company_experience: v.privateCompanyExperience,
      source_of_funds: v.sourceOfFunds,
      risk_acknowledged: v.riskAcknowledged,
      updated_at: now,
    }).eq("user_id", userId);
    if (saved.error) {
      return NextResponse.json(
        { error: "Unable to save eligibility information." },
        { status: 500 },
      );
    }
  }

  if (x.agreements) {
    const rows = [
      ["terms", x.agreements.terms],
      ["privacy", x.agreements.privacy],
      ["platform", x.agreements.platform],
      ["investment_risk", x.agreements.risk],
    ] as const;

    for (const [agreementType, accepted] of rows) {
      if (!accepted) continue;
      const result = await supabase.from("agreement_acceptances").upsert({
        user_id: userId,
        role: "investor",
        agreement_type: agreementType,
        agreement_version: AGREEMENT_VERSION,
        accepted: true,
        signature_name: x.agreements.signatureName,
        signed_at: x.agreements.signedAt,
        accepted_at: now,
      }, { onConflict: "user_id,role,agreement_type,agreement_version" });
      if (result.error) {
        return NextResponse.json(
          { error: "Unable to save agreements." },
          { status: 500 },
        );
      }
    }
  }

  if (x.complete) {
    const complete = await supabase.from("investor_profiles").update({
      onboarding_status: "completed",
      completed_at: now,
      updated_at: now,
    }).eq("user_id", userId);
    if (complete.error) {
      return NextResponse.json(
        { error: "Unable to complete investor onboarding." },
        { status: 500 },
      );
    }
  }

  const progress = await supabase.from("onboarding_progress").upsert({
    user_id: userId,
    role: "investor",
    current_screen: x.screen,
    completed_screens: Array.from(
      { length: Math.max(0, x.screen) },
      (_, index) => index,
    ),
    last_saved_at: now,
  }, { onConflict: "user_id,role" });

  if (progress.error) {
    return NextResponse.json(
      { error: "Unable to save onboarding progress." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
