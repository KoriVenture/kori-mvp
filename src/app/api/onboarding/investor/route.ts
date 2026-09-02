import { NextResponse } from "next/server";

import {
  invalid,
  requireRole,
} from "@/lib/onboarding/http";
import {
  investorEligibilitySchema,
  investorPatchSchema,
} from "@/lib/validation/investor-onboarding";

const AGREEMENT_VERSION = "mvp-1";

type DatabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function databaseError(
  context: string,
  error: DatabaseErrorLike,
) {
  console.error(`[Kori onboarding] ${context}`, {
    message: error.message ?? null,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  });

  return NextResponse.json(
    {
      error: context,
      ...(process.env.NODE_ENV !== "production"
        ? {
            database: {
              message: error.message ?? null,
              code: error.code ?? null,
              details: error.details ?? null,
              hint: error.hint ?? null,
            },
          }
        : {}),
    },
    { status: 500 },
  );
}

export async function GET() {
  const auth = await requireRole("investor");
  if (auth.error) return auth.error;

  const { supabase, userId, user } = auth;

  const [
    profile,
    investor,
    progress,
    agreements,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single(),

    supabase
      .from("investor_profiles")
      .select("*")
      .eq("user_id", userId)
      .single(),

    supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "investor")
      .maybeSingle(),

    supabase
      .from("agreement_acceptances")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "investor"),
  ]);

  if (profile.error) {
    return databaseError(
      "Unable to load investor profile.",
      profile.error,
    );
  }

  if (investor.error) {
    return databaseError(
      "Unable to load investor settings.",
      investor.error,
    );
  }

  if (progress.error) {
    return databaseError(
      "Unable to load onboarding progress.",
      progress.error,
    );
  }

  if (agreements.error) {
    return databaseError(
      "Unable to load agreements.",
      agreements.error,
    );
  }

  return NextResponse.json({
    auth: {
      email:
        user.email ??
        profile.data?.email ??
        null,
      emailVerified: Boolean(
        user.email_confirmed_at,
      ),
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

  const rawBody = await request
    .json()
    .catch(() => null);

  const parsed =
    investorPatchSchema.safeParse(rawBody);

  if (!parsed.success) {
    return invalid(parsed.error.flatten());
  }

  const { supabase, userId } = auth;
  const x = parsed.data;
  const now = new Date().toISOString();

  if (x.eligibility && x.screen >= 5) {
    const completeEligibility =
      investorEligibilitySchema.safeParse(
        x.eligibility,
      );

    if (!completeEligibility.success) {
      return NextResponse.json(
        {
          error:
            "Complete all required eligibility fields and acknowledge the risk disclosure before continuing.",
          ...(process.env.NODE_ENV !==
          "production"
            ? {
                details:
                  completeEligibility.error.flatten(),
              }
            : {}),
        },
        { status: 400 },
      );
    }
  }

  if (
    (x.screen === 6 &&
      x.complete !== true) ||
    (x.complete === true &&
      x.screen !== 6)
  ) {
    return NextResponse.json(
      {
        error:
          "Onboarding completion must use the final review step.",
      },
      { status: 400 },
    );
  }

  if (x.complete && !x.agreements) {
    return NextResponse.json(
      {
        error:
          "Accept all platform agreements and provide a signature before completing onboarding.",
      },
      { status: 400 },
    );
  }

  if (x.profile) {
    const v = x.profile;

    const saved = await supabase
      .from("profiles")
      .update({
        legal_first_name:
          v.legalFirstName,
        legal_last_name:
          v.legalLastName,
        country: v.country,
        city: v.city,
        timezone: v.timezone,
        linkedin_url: v.linkedinUrl,
        professional_title:
          v.professionalTitle,
        organization: v.organization,
        biography: v.biography,
        photo_path: v.photoPath,
        languages: v.languages,
        updated_at: now,
      })
      .eq("id", userId)
      .select("id")
      .single();

    if (saved.error) {
      return databaseError(
        "Unable to save investor profile.",
        saved.error,
      );
    }
  }

  if (x.preferences) {
    const v = x.preferences;

    const saved = await supabase
      .from("investor_profiles")
      .update({
        investor_type: v.investorType,
        contribution_areas:
          v.expertiseAreas,
        ask_me_about: v.askMeAbout,
        preferred_regions:
          v.preferredRegions,
        investment_stages:
          v.investmentStages,
        preferred_ticket_sizes:
          v.preferredTicketSizes,
        preferred_ticket_size:
          v.preferredTicketSizes[0] ??
          "",
        preferred_instruments:
          v.preferredInstruments,
        investment_horizon:
          v.investmentHorizon,
        investment_thesis:
          v.investmentThesis,
        updated_at: now,
      })
      .eq("user_id", userId)
      .select("user_id")
      .single();

    if (saved.error) {
      return databaseError(
        "Unable to save investment preferences.",
        saved.error,
      );
    }
  }

  if (x.eligibility) {
    const v = x.eligibility;

    const saved = await supabase
      .from("investor_profiles")
      .update({
        investor_classification:
          v.investorClassification,
        experience:
          v.investmentExperience,
        private_company_experience:
          v.privateCompanyExperience,
        source_of_funds:
          v.sourceOfFunds,
        risk_acknowledged:
          v.riskAcknowledged,
        updated_at: now,
      })
      .eq("user_id", userId)
      .select("user_id")
      .single();

    if (saved.error) {
      return databaseError(
        "Unable to save eligibility information.",
        saved.error,
      );
    }
  }

  if (x.agreements) {
    const rows = [
      ["terms", x.agreements.terms],
      ["privacy", x.agreements.privacy],
      ["platform", x.agreements.platform],
      [
        "investment_risk",
        x.agreements.risk,
      ],
    ] as const;

    for (const [
      agreementType,
      agreementAccepted,
    ] of rows) {
      if (!agreementAccepted) continue;

      const result = await supabase
        .from("agreement_acceptances")
        .upsert(
          {
            user_id: userId,
            role: "investor",
            agreement_type:
              agreementType,
            agreement_version:
              AGREEMENT_VERSION,
            accepted: true,
            signature_name:
              x.agreements.signatureName,
            signed_at:
              x.agreements.signedAt,
            accepted_at: now,
          },
          {
            onConflict:
              "user_id,role,agreement_type,agreement_version",
          },
        )
        .select("user_id")
        .single();

      if (result.error) {
        return databaseError(
          `Unable to save agreement: ${agreementType}.`,
          result.error,
        );
      }
    }
  }

  if (x.complete) {
    const completed = await supabase
      .from("investor_profiles")
      .update({
        onboarding_status:
          "completed",
        completed_at: now,
        updated_at: now,
      })
      .eq("user_id", userId)
      .select("user_id")
      .single();

    if (completed.error) {
      return databaseError(
        "Unable to complete investor onboarding.",
        completed.error,
      );
    }
  }

  const progress = await supabase
    .from("onboarding_progress")
    .upsert(
      {
        user_id: userId,
        role: "investor",
        current_screen: x.screen,
        completed_screens:
          Array.from(
            {
              length: Math.max(
                0,
                x.screen,
              ),
            },
            (_, index) => index,
          ),
        last_saved_at: now,
      },
      {
        onConflict: "user_id,role",
      },
    )
    .select("user_id")
    .single();

  if (progress.error) {
    return databaseError(
      "Unable to save onboarding progress.",
      progress.error,
    );
  }

  return NextResponse.json({
    ok: true,
    screen: x.screen,
  });
}
