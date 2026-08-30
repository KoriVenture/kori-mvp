"use client";

import type { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export type KoriSocialProvider = "google" | "linkedin_oidc";
export type KoriOnboardingRole = "investor" | "founder";
export type KoriOnboardingPath =
  | "/onboarding/investor"
  | "/onboarding/founder";
export type KoriAuthRedirectPath =
  | "/onboarding/investor"
  | "/onboarding/founder"
  | "/profile";

type EmailAccountInput = {
  email: string;
  password: string;
  role: KoriOnboardingRole;
};

type EmailAccountResult = {
  user: User | null;
  session: Session | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createEmailPasswordAccount({
  email,
  password,
  role,
}: EmailAccountInput): Promise<EmailAccountResult> {
  const supabase = createClient();

  const result = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: {
      data: {
        onboarding_role: role,
      },
    },
  });

  if (result.error) {
    throw result.error;
  }

  return {
    user: result.data.user,
    session: result.data.session,
  };
}

export async function startSocialAccountCreation({
  provider,
  next,
}: {
  provider: KoriSocialProvider;
  next: KoriAuthRedirectPath;
}) {
  const supabase = createClient();

  const redirect = new URL("/auth/callback", window.location.origin);
  redirect.searchParams.set("next", next);

  const result = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirect.toString(),
    },
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function verifyEmailAccountOtp({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const supabase = createClient();

  const result = await supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token: token.trim(),
    type: "email",
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function resendEmailAccountOtp(email: string) {
  const supabase = createClient();

  const result = await supabase.auth.resend({
    type: "signup",
    email: normalizeEmail(email),
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function signInEmailPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = createClient();

  const result = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function startSocialSignIn(
  provider: KoriSocialProvider,
) {
  const supabase = createClient();

  const redirect = new URL(
    "/auth/callback",
    window.location.origin,
  );
  redirect.searchParams.set("next", "/profile");

  const result = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirect.toString(),
    },
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}
