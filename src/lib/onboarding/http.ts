import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";
import { createClient } from "@/lib/supabase/server";

import {
  authorizeProfileRole,
  resolveCurrentProfileId,
  type RequiredRole,
} from "./role-access";

export type { RequiredRole } from "./role-access";

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
  const profileMapping = resolveCurrentProfileId(profileIdResult);

  if (!profileMapping.ok) {
    return {
      error: NextResponse.json(
        {
          error: profileMapping.error,
        },
        {
          status: profileMapping.status,
        },
      ),
    };
  }

  const profileResult = await supabase
    .from("profiles")
    .select(
      "id,roles,verification_status,email,email_verified,auth0_user_id",
    )
    .eq("id", profileMapping.profileId)
    .single();
  const authorization = authorizeProfileRole(role, profileResult);

  if (!authorization.ok) {
    return {
      error: NextResponse.json(
        {
          error: authorization.error,
        },
        {
          status: authorization.status,
        },
      ),
    };
  }

  return {
    supabase,
    userId: authorization.profile.id,
    auth0User: session.user,
    profile: authorization.profile,
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
