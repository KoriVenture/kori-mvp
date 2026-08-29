import { NextResponse } from "next/server";
import { bootstrapOnboardingIdentity } from "@/lib/onboarding/bootstrap";
import { bootstrapSchema } from "@/lib/onboarding/contracts";
import { createClient } from "@/lib/supabase/server";

const AGREEMENT_VERSION = "mvp-1";

export async function POST(request: Request) {
  const parsed = bootstrapSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid bootstrap request." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const auth = await supabase.auth.getUser();

  if (auth.error || !auth.data.user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { role, country, newsletter } = parsed.data;

  try {
    const profileId = await bootstrapOnboardingIdentity({
      supabase,
      user: auth.data.user,
      role,
      country,
      newsletter,
    });

    const acceptedAt = new Date().toISOString();
    const agreements = ["terms", "privacy"].map((agreementType) => ({
      user_id: profileId,
      role,
      agreement_type: agreementType,
      agreement_version: AGREEMENT_VERSION,
      accepted: true,
      signature_name: null,
      signed_at: null,
      accepted_at: acceptedAt,
    }));

    const savedAgreements = await supabase
      .from("agreement_acceptances")
      .upsert(agreements, {
        onConflict: "user_id,role,agreement_type,agreement_version",
      });

    if (savedAgreements.error) throw savedAgreements.error;

    return NextResponse.json({
      ok: true,
      profileId,
      role,
      auth: {
        email: auth.data.user.email ?? null,
        emailVerified: Boolean(auth.data.user.email_confirmed_at),
      },
    });
  } catch (error) {
    console.error(
      "Kori identity bootstrap failed:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Unable to initialize Kori onboarding." },
      { status: 500 },
    );
  }
}
