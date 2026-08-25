export type PublicRole = "investor" | "founder";

function loginUrl(
  role: PublicRole,
  options?: {
    connection?: string;
    email?: string;
    signup?: boolean;
    prompt?: string;
    organization?: string;
  },
) {
  const params = new URLSearchParams();

  params.set("returnTo", `/onboarding/${role}?auth=complete`);

  if (options?.connection) {
    params.set("connection", options.connection);
  }

  if (options?.email) {
    params.set("login_hint", options.email);
  }

  if (options?.signup) {
    params.set("screen_hint", "signup");
  }

  if (options?.prompt) {
    params.set("prompt", options.prompt);
  }

  if (options?.organization) {
    params.set("organization", options.organization);
  }

  return `/auth/login?${params.toString()}`;
}

export function emailSignupUrl(role: PublicRole, email?: string) {
  return loginUrl(role, {
    signup: true,
    email,
    connection:
      process.env.NEXT_PUBLIC_AUTH0_DATABASE_CONNECTION ||
      "Username-Password-Authentication",
  });
}

export function googleLoginUrl(role: PublicRole) {
  return loginUrl(role, {
    connection:
      process.env.NEXT_PUBLIC_AUTH0_GOOGLE_CONNECTION || "google-oauth2",
  });
}

export function linkedinLoginUrl(role: PublicRole) {
  const connection =
    process.env.NEXT_PUBLIC_AUTH0_LINKEDIN_CONNECTION?.trim();

  return loginUrl(role, {
    ...(connection ? { connection } : {}),
  });
}

export function securityReauthUrl(role: PublicRole) {
  return loginUrl(role, {
    prompt: "login",
  });
}

export function organizationLoginUrl(
  role: PublicRole,
  organizationId: string,
) {
  return loginUrl(role, {
    organization: organizationId,
  });
}
