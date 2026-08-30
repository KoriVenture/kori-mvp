"use client";

import { createClient } from "@/lib/supabase/client";
import {
  passkeysEnabled,
  phoneMfaEnabled,
} from "@/lib/supabase/config";

export type TotpEnrollment = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

export type PhoneEnrollment = {
  factorId: string;
  challengeId: string;
  phone: string;
};

function cleanCode(code: string) {
  return code.replace(/\D/g, "").slice(0, 6);
}

export async function registerKoriPasskey() {
  if (!passkeysEnabled()) {
    throw new Error(
      "Passkeys are not enabled for this environment. Configure Authentication > Passkeys in Supabase, then set NEXT_PUBLIC_ENABLE_PASSKEYS=true.",
    );
  }

  const supabase = createClient();
  const result = await supabase.auth.registerPasskey();

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function beginTotpEnrollment(): Promise<TotpEnrollment> {
  const supabase = createClient();

  const result = await supabase.auth.mfa.enroll({
    factorType: "totp",
  });

  if (result.error) {
    throw result.error;
  }

  if (!result.data.totp) {
    throw new Error("Supabase did not return TOTP enrollment data.");
  }

  return {
    factorId: result.data.id,
    qrCode: result.data.totp.qr_code,
    secret: result.data.totp.secret,
    uri: result.data.totp.uri,
  };
}

export async function verifyTotpEnrollment({
  factorId,
  code,
}: {
  factorId: string;
  code: string;
}) {
  const token = cleanCode(code);

  if (token.length !== 6) {
    throw new Error("Enter the six-digit code from your authenticator app.");
  }

  const supabase = createClient();
  const result = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: token,
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function beginPhoneEnrollment(
  phone: string,
): Promise<PhoneEnrollment> {
  if (!phoneMfaEnabled()) {
    throw new Error(
      "SMS Backup requires Supabase Advanced MFA Phone. This feature is not available on the current Supabase Free plan.",
    );
  }

  const normalizedPhone = phone.trim();

  if (!normalizedPhone.startsWith("+") || normalizedPhone.length < 8) {
    throw new Error(
      "Enter a valid international phone number, including the country code.",
    );
  }

  const supabase = createClient();

  const enrolled = await supabase.auth.mfa.enroll({
    factorType: "phone",
    phone: normalizedPhone,
  });

  if (enrolled.error) {
    throw enrolled.error;
  }

  const challenged = await supabase.auth.mfa.challenge({
    factorId: enrolled.data.id,
  });

  if (challenged.error) {
    await cancelMfaEnrollment(enrolled.data.id);
    throw challenged.error;
  }

  return {
    factorId: enrolled.data.id,
    challengeId: challenged.data.id,
    phone: normalizedPhone,
  };
}

export async function verifyPhoneEnrollment({
  factorId,
  challengeId,
  code,
}: {
  factorId: string;
  challengeId: string;
  code: string;
}) {
  const token = cleanCode(code);

  if (token.length !== 6) {
    throw new Error("Enter the six-digit SMS verification code.");
  }

  const supabase = createClient();

  const result = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code: token,
  });

  if (result.error) {
    throw result.error;
  }

  return result.data;
}

export async function cancelMfaEnrollment(factorId: string) {
  const supabase = createClient();

  const result = await supabase.auth.mfa.unenroll({
    factorId,
  });

  // Cancellation cleanup must never mask the user's original action.
  if (result.error) {
    console.warn(
      "Unable to clean up unverified MFA factor:",
      result.error.message,
    );
  }
}
