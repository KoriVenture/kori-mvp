import { NextResponse } from "next/server";

import { invalid, requireRole } from "@/lib/onboarding/http";
import { founderPatchSchema } from "@/lib/validation/founder-onboarding";

const AGREEMENT_VERSION = "mvp-1";

export async function GET() {
  const auth = await requireRole("founder");
  if (auth.error) return auth.error;

  const { supabase, userId, user } = auth;

  const [profile, founder, startup, documents, progress, agreements] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("founder_profiles")
        .select("*")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("startups")
        .select("*")
        .eq("primary_founder_user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("startup_documents")
        .select("*")
        .eq("uploaded_by_user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "founder")
        .maybeSingle(),
      supabase
        .from("agreement_acceptances")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "founder"),
    ]);

  if (profile.error || founder.error) {
    return NextResponse.json(
      { error: "Unable to load founder onboarding." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    auth: {
      email: user.email ?? null,
      emailVerified: Boolean(user.email_confirmed_at),
    },
    profile: profile.data,
    founder: founder.data,
    startup: startup.data,
    documents: documents.data ?? [],
    progress: progress.data,
    agreements: agreements.data ?? [],
  });
}

export async function PATCH(request: Request) {
  const auth = await requireRole("founder");
  if (auth.error) return auth.error;

  const parsed = founderPatchSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return invalid(parsed.error.flatten());

  const { supabase, userId } = auth;
  const x = parsed.data;
  const now = new Date().toISOString();

  if (x.profile) {
    const v = x.profile;
    const saved = await supabase
      .from("profiles")
      .update({
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
      })
      .eq("id", userId);

    if (saved.error) {
      return NextResponse.json(
        { error: "Unable to save founder profile." },
        { status: 500 },
      );
    }
  }

  let startupId: string | undefined;

  if (x.startup) {
    const v = x.startup;
    const existing = v.id
      ? await supabase
          .from("startups")
          .select("id")
          .eq("id", v.id)
          .eq("primary_founder_user_id", userId)
          .maybeSingle()
      : await supabase
          .from("startups")
          .select("id")
          .eq("primary_founder_user_id", userId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

    if (existing.error) {
      return NextResponse.json(
        { error: "Unable to read startup." },
        { status: 500 },
      );
    }

    const values = {
      legal_name: v.legalName,
      display_name: v.displayName,
      country: v.country,
      sector: v.sector,
      website: v.website,
      description: v.description,
      founding_year: v.foundingYear,
      stage: v.stage,
    };

    if (existing.data) {
      startupId = existing.data.id;
      const updated = await supabase
        .from("startups")
        .update({ ...values, updated_at: now })
        .eq("id", startupId)
        .eq("primary_founder_user_id", userId);

      if (updated.error) {
        return NextResponse.json(
          { error: "Unable to update startup." },
          { status: 500 },
        );
      }
    } else {
      const created = await supabase
        .from("startups")
        .insert({
          primary_founder_user_id: userId,
          ...values,
          status: "draft",
        })
        .select("id")
        .single();

      if (created.error || !created.data) {
        return NextResponse.json(
          { error: "Unable to create startup." },
          { status: 500 },
        );
      }

      startupId = created.data.id;
    }
  }

  if (x.agreements) {
    for (const agreementType of ["terms", "privacy", "platform"] as const) {
      const result = await supabase
        .from("agreement_acceptances")
        .upsert(
          {
            user_id: userId,
            role: "founder",
            agreement_type: agreementType,
            agreement_version: AGREEMENT_VERSION,
            accepted: true,
            signature_name: x.agreements.signatureName,
            signed_at: x.agreements.signedAt,
            accepted_at: now,
          },
          {
            onConflict:
              "user_id,role,agreement_type,agreement_version",
          },
        );

      if (result.error) {
        return NextResponse.json(
          { error: "Unable to save agreements." },
          { status: 500 },
        );
      }
    }
  }

  if (x.complete) {
    const complete = await supabase
      .from("founder_profiles")
      .upsert(
        {
          user_id: userId,
          onboarding_status: "completed",
          completed_at: now,
          updated_at: now,
        },
        { onConflict: "user_id" },
      );

    if (complete.error) {
      return NextResponse.json(
        { error: "Unable to complete founder onboarding." },
        { status: 500 },
      );
    }
  }

  const progress = await supabase
    .from("onboarding_progress")
    .upsert(
      {
        user_id: userId,
        role: "founder",
        current_screen: x.screen,
        completed_screens: Array.from(
          { length: Math.max(0, x.screen) },
          (_, index) => index,
        ),
        last_saved_at: now,
      },
      { onConflict: "user_id,role" },
    );

  if (progress.error) {
    return NextResponse.json(
      { error: "Unable to save onboarding progress." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, startupId });
}
