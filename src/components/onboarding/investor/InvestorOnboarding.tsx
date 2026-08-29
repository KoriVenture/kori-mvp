"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { passkeysEnabled } from "@/lib/supabase/config";
import {
  initialInvestorDraft,
  type InvestorOnboardingDraft,
} from "./investor-onboarding.types";
import { CompletionStep } from "./steps/CompletionStep";
import { CreateAccountStep } from "./steps/CreateAccountStep";
import { ExpertisePreferencesStep } from "./steps/ExpertisePreferencesStep";
import { InvestmentEligibilityStep } from "./steps/InvestmentEligibilityStep";
import { InvestorProfileStep } from "./steps/InvestorProfileStep";
import { ReviewAgreementsStep } from "./steps/ReviewAgreementsStep";
import { VerifySecureStep } from "./steps/VerifySecureStep";

const PREAUTH_KEY = "kori:onboarding:investor:preauth";
type Agreement = { agreement_type?: string; accepted?: boolean };

function accepted(items: Agreement[] | undefined, type: string) {
  return Boolean(
    items?.some(
      (item) => item.agreement_type === type && item.accepted,
    ),
  );
}

function readPreAuth() {
  try {
    const value = sessionStorage.getItem(PREAUTH_KEY);
    return value
      ? (JSON.parse(value) as Partial<InvestorOnboardingDraft>)
      : {};
  } catch {
    return {};
  }
}

export function InvestorOnboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<InvestorOnboardingDraft>(
    initialInvestorDraft,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otpRequired, setOtpRequired] = useState(true);

  function set<K extends keyof InvestorOnboardingDraft>(
    key: K,
    value: InvestorOnboardingDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const bootstrap = useCallback(
    async (preAuth?: Partial<InvestorOnboardingDraft>) => {
      const values = preAuth ?? readPreAuth();
      const response = await fetch("/api/onboarding/bootstrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: "investor",
          country: values.country ?? draft.country,
          termsAccepted:
            values.accountTerms ?? draft.accountTerms,
          newsletter: values.newsletter ?? draft.newsletter,
        }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          body.error ?? "Unable to initialize onboarding.",
        );
      }
      sessionStorage.removeItem(PREAUTH_KEY);
      return body;
    },
    [draft.accountTerms, draft.country, draft.newsletter],
  );

  const load = useCallback(async () => {
    const response = await fetch("/api/onboarding/investor", {
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) {
      return false;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.error ?? "Unable to load onboarding.",
      );
    }

    const profile = data.profile ?? {};
    const investor = data.investor ?? {};

    setDraft((current) => ({
      ...current,
      email: data.auth?.email ?? current.email,
      emailVerified: data.auth?.emailVerified === true,
      country: profile.country ?? current.country,
      legalFirstName: profile.legal_first_name ?? "",
      legalLastName: profile.legal_last_name ?? "",
      city: profile.city ?? "",
      timezone: profile.timezone ?? "",
      linkedinUrl: profile.linkedin_url ?? "",
      professionalTitle: profile.professional_title ?? "",
      organization: profile.organization ?? "",
      biography: profile.biography ?? "",
      photoPath: profile.photo_path ?? "",
      photoUrl: profile.photo_path
        ? `${process.env.NEXT_SUPABASE_URL}/storage/v1/object/public/profile-photos/${profile.photo_path}`
        : current.photoUrl,
      languages: profile.languages ?? [],
      investorType:
        investor.investor_type === "fund_manager"
          ? "fund_manager"
          : "individual",
      expertiseAreas: investor.contribution_areas ?? [],
      askMeAbout: investor.ask_me_about ?? "",
      preferredRegions: investor.preferred_regions ?? [],
      investmentStages: investor.investment_stages ?? [],
      preferredTicketSizes:
        investor.preferred_ticket_sizes ??
        (investor.preferred_ticket_size
          ? [investor.preferred_ticket_size]
          : []),
      preferredInstruments:
        investor.preferred_instruments ?? [],
      investmentHorizon:
        investor.investment_horizon ?? "",
      investmentThesis: investor.investment_thesis ?? "",
      investorClassification:
        investor.investor_classification ?? "",
      investmentExperience: investor.experience ?? "",
      privateCompanyExperience:
        investor.private_company_experience ?? "",
      sourceOfFunds: investor.source_of_funds ?? "",
      riskAcknowledged:
        investor.risk_acknowledged === true,
      terms: accepted(data.agreements, "terms"),
      privacy: accepted(data.agreements, "privacy"),
      platform: accepted(data.agreements, "platform"),
      investmentRisk: accepted(
        data.agreements,
        "investment_risk",
      ),
      signatureName: [
        profile.legal_first_name,
        profile.legal_last_name,
      ]
        .filter(Boolean)
        .join(" "),
    }));

    setStep(
      Math.max(
        1,
        Math.min(Number(data.progress?.current_screen ?? 1), 6),
      ),
    );
    return true;
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const query = new URLSearchParams(
          window.location.search,
        );
        const supabase = createClient();
        const auth = await supabase.auth.getUser();

        if (
          query.get("auth") === "complete" &&
          auth.data.user
        ) {
          const preAuth = readPreAuth();
          await bootstrap(preAuth);
          if (!active) return;

          setOtpRequired(false);
          setDraft((current) => ({
            ...current,
            email:
              auth.data.user?.email ?? current.email,
            emailVerified: Boolean(
              auth.data.user?.email_confirmed_at,
            ),
            country: preAuth.country ?? current.country,
            accountTerms:
              preAuth.accountTerms ?? current.accountTerms,
            newsletter:
              preAuth.newsletter ?? current.newsletter,
          }));

          window.history.replaceState(
            {},
            "",
            "/onboarding/investor",
          );
          setStep(1);
        } else if (auth.data.user) {
          await load();
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load onboarding.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [bootstrap, load]);

  function validateAccount() {
    if (!draft.accountTerms) {
      throw new Error(
        "Accept the Terms of Use and Privacy Policy before continuing.",
      );
    }
    if (!draft.country) {
      throw new Error("Country of residence is required.");
    }
  }

  function savePreAuth() {
    sessionStorage.setItem(
      PREAUTH_KEY,
      JSON.stringify({
        email: draft.email,
        country: draft.country,
        accountTerms: draft.accountTerms,
        newsletter: draft.newsletter,
      }),
    );
  }

  async function createEmailAccount() {
    setMessage("");
    setBusy(true);
    try {
      validateAccount();
      if (!draft.email) throw new Error("Email is required.");
      if (draft.password.length < 8) {
        throw new Error(
          "Password must contain at least 8 characters.",
        );
      }

      savePreAuth();
      const supabase = createClient();
      const result = await supabase.auth.signUp({
        email: draft.email.trim(),
        password: draft.password,
        options: {
          data: { onboarding_role: "investor" },
        },
      });
      if (result.error) throw result.error;

      setOtpRequired(!result.data.session);
      set(
        "emailVerified",
        Boolean(result.data.user?.email_confirmed_at),
      );

      if (result.data.session) {
        await bootstrap();
      }
      setStep(1);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create account.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function social(
    provider: "google" | "linkedin_oidc",
  ) {
    setMessage("");
    try {
      validateAccount();
      savePreAuth();
      const supabase = createClient();
      const origin = window.location.origin;
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=/onboarding/investor`,
          queryParams:
            provider === "google"
              ? { access_type: "offline", prompt: "consent" }
              : undefined,
        },
      });
      if (result.error) throw result.error;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start social sign-in.",
      );
    }
  }

  const verifyOtp = useCallback(
    async (token: string) => {
      setBusy(true);
      setMessage("");
      try {
        const supabase = createClient();
        const result = await supabase.auth.verifyOtp({
          email: draft.email,
          token,
          type: "email",
        });
        if (result.error) throw result.error;
        set("emailVerified", true);
        await bootstrap();
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Invalid verification code.",
        );
      } finally {
        setBusy(false);
      }
    },
    [bootstrap, draft.email],
  );

  async function resendOtp() {
    const supabase = createClient();
    const result = await supabase.auth.resend({
      type: "signup",
      email: draft.email,
    });
    if (result.error) throw result.error;
    setMessage("A new verification code was sent.");
  }

  async function saveStep(
    target: number,
    data: Record<string, unknown>,
    complete = false,
  ) {
    const response = await fetch("/api/onboarding/investor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen: target,
        ...data,
        ...(complete ? { complete: true } : {}),
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        body.error ?? "Unable to save onboarding.",
      );
    }
  }

  async function secureAndContinue() {
    if (!draft.emailVerified) {
      setMessage("Verify your email before continuing.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      if (
        draft.securityMethod === "passkey" &&
        passkeysEnabled()
      ) {
        const supabase = createClient();
        const result = await supabase.auth.registerPasskey();
        if (result.error) throw result.error;
      }
      await saveStep(2, {});
      setStep(2);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to secure the account.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile(target = 3) {
    await saveStep(target, {
      profile: {
        legalFirstName: draft.legalFirstName,
        legalLastName: draft.legalLastName,
        country: draft.country,
        city: draft.city,
        timezone: draft.timezone,
        linkedinUrl: draft.linkedinUrl,
        professionalTitle: draft.professionalTitle,
        organization: draft.organization,
        biography: draft.biography,
        photoPath: draft.photoPath,
        languages: draft.languages,
      },
    });
  }

  async function savePreferences(target = 4) {
    await saveStep(target, {
      preferences: {
        investorType: draft.investorType,
        expertiseAreas: draft.expertiseAreas,
        askMeAbout: draft.askMeAbout,
        preferredRegions: draft.preferredRegions,
        investmentStages: draft.investmentStages,
        preferredTicketSizes: draft.preferredTicketSizes,
        preferredInstruments: draft.preferredInstruments,
        investmentHorizon: draft.investmentHorizon,
        investmentThesis: draft.investmentThesis,
      },
    });
  }

  async function saveEligibility(target = 5) {
    await saveStep(target, {
      eligibility: {
        investorClassification:
          draft.investorClassification,
        investmentExperience:
          draft.investmentExperience,
        privateCompanyExperience:
          draft.privateCompanyExperience,
        sourceOfFunds: draft.sourceOfFunds,
        riskAcknowledged: draft.riskAcknowledged,
      },
    });
  }

  async function uploadPhoto(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch(
        "/api/onboarding/investor/photo",
        { method: "POST", body: form },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          body.error ?? "Photo upload failed.",
        );
      }
      set("photoPath", body.path);
      set("photoUrl", body.publicUrl);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Photo upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    const response = await fetch(
      "/api/onboarding/investor/photo",
      { method: "DELETE" },
    );
    if (response.ok) {
      set("photoPath", "");
      set(
        "photoUrl",
        "/assets/onboarding/investor/profile-photo.png",
      );
    }
  }

  async function complete() {
    setBusy(true);
    setMessage("");
    try {
      if (
        !(
          draft.terms &&
          draft.privacy &&
          draft.platform &&
          draft.investmentRisk
        )
      ) {
        throw new Error(
          "Accept all platform agreements before completing onboarding.",
        );
      }
      if (!draft.signatureName.trim()) {
        throw new Error("Signature is required.");
      }

      await saveStep(
        6,
        {
          agreements: {
            terms: true,
            privacy: true,
            platform: true,
            risk: true,
            signatureName: draft.signatureName.trim(),
            signedAt: new Date().toISOString(),
          },
        },
        true,
      );
      setStep(6);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete onboarding.",
      );
    } finally {
      setBusy(false);
    }
  }

  function saveExit() {
    window.location.assign("/");
  }

  if (loading) {
    return (
      <main className="kori-onboarding ko-loading">
        Loading onboarding…
      </main>
    );
  }

  if (step === 6) {
    return (
      <CompletionStep firstName={draft.legalFirstName} />
    );
  }

  if (step === 0) {
    return (
      <CreateAccountStep
        draft={draft}
        message={message}
        busy={busy}
        onSet={set}
        onCreate={createEmailAccount}
        onGoogle={() => void social("google")}
        onLinkedIn={() => void social("linkedin_oidc")}
      />
    );
  }

  if (step === 1) {
    return (
      <VerifySecureStep
        draft={draft}
        otpRequired={otpRequired}
        message={message}
        busy={busy}
        onSet={set}
        onVerifyOtp={verifyOtp}
        onResend={resendOtp}
        onChangeEmail={() => setStep(0)}
        onContinue={secureAndContinue}
        onSaveExit={saveExit}
      />
    );
  }

  if (step === 2) {
    return (
      <InvestorProfileStep
        draft={draft}
        busy={busy}
        message={message}
        onSet={set}
        onUploadPhoto={uploadPhoto}
        onRemovePhoto={removePhoto}
        onContinue={async () => {
          setBusy(true);
          try {
            await saveProfile(3);
            setStep(3);
          } finally {
            setBusy(false);
          }
        }}
        onLater={async () => {
          await saveProfile(3);
          setStep(3);
        }}
        onSaveExit={saveExit}
      />
    );
  }

  if (step === 3) {
    return (
      <ExpertisePreferencesStep
        draft={draft}
        busy={busy}
        message={message}
        onSet={set}
        onContinue={async () => {
          setBusy(true);
          try {
            await savePreferences(4);
            setStep(4);
          } finally {
            setBusy(false);
          }
        }}
        onSkip={async () => {
          await savePreferences(4);
          setStep(4);
        }}
        onSaveExit={saveExit}
      />
    );
  }

  if (step === 4) {
    return (
      <InvestmentEligibilityStep
        draft={draft}
        busy={busy}
        message={message}
        onSet={set}
        onContinue={async () => {
          setBusy(true);
          try {
            await saveEligibility(5);
            setStep(5);
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to save eligibility.",
            );
          } finally {
            setBusy(false);
          }
        }}
        onSaveLater={async () => {
          await saveEligibility(4);
          saveExit();
        }}
        onSaveExit={saveExit}
      />
    );
  }

  return (
    <ReviewAgreementsStep
      draft={draft}
      busy={busy}
      message={message}
      onSet={set}
      onEdit={setStep}
      onComplete={complete}
      onSaveExit={saveExit}
    />
  );
}
