import { z } from "zod";

export type RequiredRole = "investor" | "founder";

export type KoriProfile = {
  id: string;
  roles: unknown;
  verification_status: unknown;
  email: unknown;
  email_verified: unknown;
  auth0_user_id: unknown;
};

type QueryResult = {
  data: unknown;
  error: unknown;
};

type AccessFailure = {
  ok: false;
  status: 403 | 409 | 500;
  error: string;
};

export function resolveCurrentProfileId(
  result: QueryResult,
): { ok: true; profileId: string } | AccessFailure {
  const profileId = z.uuid().safeParse(result.data);

  if (result.error || !profileId.success) {
    return {
      ok: false,
      status: 409,
      error: "Kori profile does not exist. Bootstrap onboarding first.",
    };
  }

  return {
    ok: true,
    profileId: profileId.data,
  };
}

export function authorizeProfileRole(
  role: RequiredRole,
  result: QueryResult,
): { ok: true; profile: KoriProfile } | AccessFailure {
  if (
    result.error ||
    !result.data ||
    typeof result.data !== "object" ||
    typeof (result.data as { id?: unknown }).id !== "string"
  ) {
    return {
      ok: false,
      status: 500,
      error: "Unable to read Kori profile.",
    };
  }

  const profile = result.data as KoriProfile;
  const roles = Array.isArray(profile.roles) ? profile.roles : [];

  if (!roles.includes(role)) {
    return {
      ok: false,
      status: 403,
      error: "Role not permitted.",
    };
  }

  return {
    ok: true,
    profile,
  };
}
