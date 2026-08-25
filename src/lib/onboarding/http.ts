import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { createClient } from "@/lib/supabase/server";

export type RequiredRole = "investor" | "founder";

export async function requireRole(role: RequiredRole) {
  const session = await auth0.getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  let supabase;

  try {
    supabase = await createClient();
  } catch (error) {
    return {
      error: NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to create authenticated Supabase client.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  const profileIdResult = await supabase.rpc("current_profile_id");
  const profileId = profileIdResult.data as string | null;

  if (profileIdResult.error || !profileId) {
    return {
      error: NextResponse.json(
        {
          error: "Kori profile does not exist. Bootstrap onboarding first.",
        },
        {
          status: 409,
        },
      ),
    };
  }

  const profileResult = await supabase
    .from("profiles")
    .select(
      "id,roles,verification_status,email,email_verified,auth0_user_id",
    )
    .eq("id", profileId)
    .single();

  if (profileResult.error || !profileResult.data) {
    return {
      error: NextResponse.json(
        {
          error: "Unable to read Kori profile.",
        },
        {
          status: 500,
        },
      ),
    };
  }

  const roles = Array.isArray(profileResult.data.roles)
    ? profileResult.data.roles
    : [];

  if (!roles.includes(role)) {
    return {
      error: NextResponse.json(
        {
          error: "Role not permitted.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    supabase,
    userId: profileResult.data.id as string,
    auth0User: session.user,
    profile: profileResult.data,
  };
}

export function invalid(error: unknown) {
  return NextResponse.json(
    {
      error: "Invalid onboarding data.",
      details: error,
    },
    {
      status: 400,
    },
  );
}
