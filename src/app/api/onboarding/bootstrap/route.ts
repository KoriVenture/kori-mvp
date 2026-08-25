import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { bootstrapOnboardingIdentity } from "@/lib/onboarding/bootstrap";
import { publicSignupRole } from "@/lib/onboarding/contracts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json(
      {
        error: "Authentication required.",
      },
      {
        status: 401,
      },
    );
  }

  const body = await request.json().catch(() => null);
  const role = publicSignupRole(body?.role);

  if (!role) {
    return NextResponse.json(
      {
        error: "Invalid onboarding role.",
      },
      {
        status: 400,
      },
    );
  }

  const supabase = await createClient();
  const result = await bootstrapOnboardingIdentity(supabase, role);

  if (!result.ok) {
    console.error("Kori identity bootstrap failed:", result.error);

    return NextResponse.json(
      {
        error: result.error,
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    profileId: result.profileId,
    role,
    auth: {
      sub: session.user.sub,
      email: session.user.email ?? null,
      emailVerified: session.user.email_verified === true,
      name: session.user.name ?? null,
      organizationId: session.user.org_id ?? null,
    },
  });
}
