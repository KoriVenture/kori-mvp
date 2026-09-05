"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createEmailPasswordAccount,
  resendEmailAccountOtp,
  startSocialAccountCreation,
  verifyEmailAccountOtp,
} from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/client";
import { passkeysEnabled } from "@/lib/supabase/config";

import { Completion } from "../shared/Completion";
import { Field } from "../shared/Field";
import { OtpInput } from "../shared/OtpInput";
import { PasswordField } from "../shared/PasswordField";
import { SelectField } from "../shared/SelectField";
import { Shell } from "../shared/Shell";
import {
  initialFounderDraft,
  type FounderDraft,
} from "./founder-onboarding.types";

const PREAUTH_KEY = "kori:onboarding:founder:preauth";

type Agreement = {
  agreement_type?: string;
  accepted?: boolean;
};

function accepted(items: Agreement[] | undefined, type: string) {
  return Boolean(
    items?.some(
      (item) => item.agreement_type === type && item.accepted === true,
    ),
  );
}

function readPreAuth(): Partial<FounderDraft> {
  try {
    const raw = sessionStorage.getItem(PREAUTH_KEY);
    return raw ? (JSON.parse(raw) as Partial<FounderDraft>) : {};
  } catch {
    return {};
  }
}

export function FounderOnboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<FounderDraft>(initialFounderDraft);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpRequired, setOtpRequired] = useState(true);
  const [startupFile, setStartupFile] = useState<File | null>(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);

  function set<K extends keyof FounderDraft>(
    key: K,
    value: FounderDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const bootstrap = useCallback(
    async (preAuth?: Partial<FounderDraft>) => {
      const source = preAuth ?? readPreAuth();
      const response = await fetch("/api/onboarding/bootstrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role: "founder",
          country: source.country ?? draft.country,
          termsAccepted: source.accountTerms ?? draft.accountTerms,
          newsletter: source.newsletter ?? draft.newsletter,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          body.error ?? "Unable to initialize founder onboarding.",
        );
      }
      sessionStorage.removeItem(PREAUTH_KEY);
      return body;
    },
    [draft.accountTerms, draft.country, draft.newsletter],
  );

  const load = useCallback(async () => {
    const response = await fetch("/api/onboarding/founder", {
      cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) return false;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load founder onboarding.");
    }

    const profile = data.profile ?? {};
    const startup = data.startup ?? {};
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
      biography: profile.biography ?? "",
      startupId: startup.id ?? "",
      legalName: startup.legal_name ?? "",
      displayName: startup.display_name ?? "",
      startupCountry: startup.country ?? "",
      sector: startup.sector ?? "",
      website: startup.website ?? "",
      description: startup.description ?? "",
      foundingYear: startup.founding_year?.toString() ?? "",
      stage: startup.stage ?? "",
      terms: accepted(data.agreements, "terms"),
      privacy: accepted(data.agreements, "privacy"),
      platform: accepted(data.agreements, "platform"),
      signatureName: [
        profile.legal_first_name,
        profile.legal_last_name,
      ]
        .filter(Boolean)
        .join(" "),
    }));

    setDocumentUploaded(
      Array.isArray(data.documents) && data.documents.length > 0,
    );
    setStep(
      Math.max(1, Math.min(Number(data.progress?.current_screen ?? 1), 6)),
    );
    return true;
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const supabase = createClient();
        const auth = await supabase.auth.getUser();

        if (query.get("auth") === "complete" && auth.data.user) {
          const preAuth = readPreAuth();
          await bootstrap(preAuth);
          if (!active) return;

          setOtpRequired(false);
          window.history.replaceState({}, "", "/onboarding/founder");
          await load();
        } else if (query.get("auth") === "error") {
          setMessage(
            "Social sign-in could not be completed. Please try again.",
          );
        } else if (auth.data.user) {
          await load();
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load founder onboarding.",
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
    if (!draft.country) throw new Error("Country of residence is required.");
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
      if (!draft.email.trim()) throw new Error("Email is required.");
      if (draft.password.length < 8) {
        throw new Error("Password must contain at least 8 characters.");
      }
      savePreAuth();

      const result = await createEmailPasswordAccount({
        email: draft.email,
        password: draft.password,
        role: "founder",
      });

      setOtpRequired(!result.session);
      set(
        "emailVerified",
        Boolean(result.user?.email_confirmed_at),
      );

      if (result.session) await bootstrap();
      setStep(1);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create founder account.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "linkedin_oidc") {
    setMessage("");
    setBusy(true);

    try {
      savePreAuth();

      await startSocialAccountCreation({
        provider,
        next: "/onboarding/founder",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start social sign-in.",
      );
      setBusy(false);
    }
  }

  async function verifyEmailOtp() {
    if (otp.length !== 6) {
      setMessage("Enter the six-digit verification code.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await verifyEmailAccountOtp({
        email: draft.email,
        token: otp,
      });
      set("emailVerified", true);
      await bootstrap();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Invalid verification code.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resendOtp() {
    try {
      await resendEmailAccountOtp(draft.email);
      setMessage("A new verification code was sent.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to resend verification code.",
      );
    }
  }

  async function patch(
    screen: number,
    payload: Record<string, unknown>,
    complete = false,
  ) {
    const response = await fetch("/api/onboarding/founder", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        screen,
        ...payload,
        ...(complete ? { complete: true } : {}),
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error ?? "Unable to save founder onboarding.");
    }
    if (body.startupId) set("startupId", body.startupId);
    return body;
  }

  async function secureAccount() {
    if (!draft.emailVerified) {
      setMessage("Verify your email before continuing.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (passkeysEnabled()) {
        const result = await createClient().auth.registerPasskey();
        if (result.error) throw result.error;
      }
      await patch(2, {});
      setStep(2);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to secure account.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveProfile() {
    await patch(3, {
      profile: {
        legalFirstName: draft.legalFirstName,
        legalLastName: draft.legalLastName,
        country: draft.country,
        city: draft.city,
        timezone: draft.timezone,
        linkedinUrl: draft.linkedinUrl,
        professionalTitle: draft.professionalTitle,
        organization: "",
        biography: draft.biography,
        photoPath: "",
        languages: [],
      },
    });
    setStep(3);
  }

  async function saveStartup() {
    const body = await patch(4, {
      startup: {
        ...(draft.startupId ? { id: draft.startupId } : {}),
        legalName: draft.legalName,
        displayName: draft.displayName,
        country: draft.startupCountry,
        sector: draft.sector,
        website: draft.website,
        description: draft.description,
        foundingYear: Number(draft.foundingYear) || undefined,
        stage: draft.stage,
      },
    });
    if (body.startupId) set("startupId", body.startupId);
    setStep(4);
  }

  async function uploadDocument() {
    if (!startupFile || !draft.startupId) {
      setMessage("Save the startup profile and select a document first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", startupFile);
      form.set("startupId", draft.startupId);
      form.set("documentType", "pitch_deck");
      form.set("title", startupFile.name);
      const response = await fetch("/api/onboarding/founder/documents", {
        method: "POST",
        body: form,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Document upload failed.");
      }
      setDocumentUploaded(true);
      setMessage("Document uploaded.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Document upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    setMessage("");
    try {
      if (step === 0) return void (await createEmailAccount());
      if (step === 1) return void (await secureAccount());
      if (step === 2) return void (await saveProfile());
      if (step === 3) return void (await saveStartup());
      if (step === 4) {
        await patch(5, {});
        setStep(5);
        return;
      }
      if (step === 5) {
        if (!draft.terms || !draft.privacy || !draft.platform) {
          throw new Error(
            "Accept all platform agreements before completing onboarding.",
          );
        }
        if (!draft.signatureName.trim()) {
          throw new Error("Electronic signature is required.");
        }
        await patch(
          6,
          {
            agreements: {
              terms: true,
              privacy: true,
              platform: true,
              signatureName: draft.signatureName.trim(),
              signedAt: new Date().toISOString(),
            },
          },
          true,
        );
        setStep(6);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to continue.",
      );
    }
  }

  function saveExit() {
    window.location.assign("/");
  }

  if (loading) {
    return (
      <main className="kori-onboarding ko-loading">
        <p>Loading onboarding…</p>
      </main>
    );
  }

  if (step === 6) return <Completion founder />;

  let body;

  if (step === 0) {
    body = (
      <>
        <div className="ko-role-banner">
          Joining as: <b>Founder</b>
        </div>
        <div className="ko-social-row">
          <button type="button" onClick={() => void social("google")}>
            <img src="/assets/onboarding/shared/google.svg" alt="" /> Google
          </button>
          <button
            type="button"
            onClick={() => void social("linkedin_oidc")}
          >
            <img src="/assets/onboarding/shared/linkedin.svg" alt="" /> LinkedIn
          </button>
        </div>
        <Field
          label="Email"
          type="email"
          required
          value={draft.email}
          onChange={(event) => set("email", event.target.value)}
        />
        <PasswordField
          value={draft.password}
          onChange={(value) => set("password", value)}
        />
        <SelectField
          label="Country"
          value={draft.country}
          options={[
            "Canada",
            "France",
            "Nigeria",
            "United Kingdom",
            "United States",
            "Other",
          ]}
          onChange={(value) => set("country", value)}
        />
        <div className="ko-consents">
          <label>
            <input
              type="checkbox"
              checked={draft.accountTerms}
              onChange={(event) =>
                set("accountTerms", event.target.checked)
              }
            />
            I accept the Terms of Use and Privacy Policy.
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.newsletter}
              onChange={(event) =>
                set("newsletter", event.target.checked)
              }
            />
            Send me occasional Kori updates.
          </label>
        </div>
      </>
    );
  } else if (step === 1) {
    body = (
      <section className="ko-founder-card">
        <h3>Email verification</h3>
        {otpRequired && !draft.emailVerified ? (
          <>
            <p>Enter the six-digit code sent to {draft.email}.</p>
            <OtpInput value={otp} onChange={setOtp} />
            <button
              type="button"
              className="ko-secondary ko-full-width"
              disabled={busy}
              onClick={() => void verifyEmailOtp()}
            >
              Verify email
            </button>
            <button
              type="button"
              className="ko-link"
              onClick={() => void resendOtp()}
            >
              Resend code
            </button>
          </>
        ) : (
          <p>Email verified: {draft.email}</p>
        )}
        <div className="ko-guidance">
          <b>Passkey</b>
          <p>
            When enabled for this environment, Continue enrolls a Supabase
            passkey.
          </p>
        </div>
      </section>
    );
  } else if (step === 2) {
    body = (
      <section className="ko-founder-card">
        <div className={"ko-two-columns"}>
          <Field
            label="Legal first name"
            required
            value={draft.legalFirstName}
            onChange={(event) => set("legalFirstName", event.target.value)}
          />
          <Field
            label="Legal last name"
            required
            value={draft.legalLastName}
            onChange={(event) => set("legalLastName", event.target.value)}
          />
        </div>
        <Field
          label="Location"
          value={draft.city}
          onChange={(event) => set("city", event.target.value)}
        />
        <Field
          label="LinkedIn"
          type="url"
          value={draft.linkedinUrl}
          onChange={(event) => set("linkedinUrl", event.target.value)}
        />
        <Field
          label="Professional title"
          value={draft.professionalTitle}
          onChange={(event) => set("professionalTitle", event.target.value)}
        />
        <Field
          label="Professional biography"
          multiline
          value={draft.biography}
          onChange={(event) => set("biography", event.target.value)}
        />
      </section>
    );
  } else if (step === 3) {
    body = (
      <section className="ko-founder-card">
        <Field
          label="Legal company name"
          required
          value={draft.legalName}
          onChange={(event) => set("legalName", event.target.value)}
        />
        <Field
          label="Startup display name"
          value={draft.displayName}
          onChange={(event) => set("displayName", event.target.value)}
        />
        <SelectField
          label="Country"
          value={draft.startupCountry}
          options={[
            "Canada",
            "France",
            "Nigeria",
            "United Kingdom",
            "United States",
            "Other",
          ]}
          onChange={(value) => set("startupCountry", value)}
        />
        <Field
          label="Sector"
          required
          value={draft.sector}
          onChange={(event) => set("sector", event.target.value)}
        />
        <Field
          label="Website"
          type="url"
          value={draft.website}
          onChange={(event) => set("website", event.target.value)}
        />
        <Field
          label="Short description"
          multiline
          value={draft.description}
          onChange={(event) => set("description", event.target.value)}
        />
        <Field
          label="Founding year"
          type="number"
          value={draft.foundingYear}
          onChange={(event) => set("foundingYear", event.target.value)}
        />
        <Field
          label="Stage"
          value={draft.stage}
          onChange={(event) => set("stage", event.target.value)}
        />
      </section>
    );
  } else if (step === 4) {
    body = (
      <section className="ko-founder-card">
        <h3>Startup Documents</h3>
        <p>
          Upload a Pitch deck, Company overview, or Supporting document. Files
          remain private.
        </p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(event) =>
            setStartupFile(event.target.files?.[0] ?? null)
          }
        />
        <button
          type="button"
          className="ko-secondary ko-full-width"
          disabled={!startupFile || !draft.startupId || busy}
          onClick={() => void uploadDocument()}
        >
          {busy ? "Uploading…" : "Upload document"}
        </button>
        {documentUploaded ? <p>Document submitted.</p> : null}
      </section>
    );
  } else {
    body = (
      <>
        <section className="ko-review-card">
          <h3>Founder Information</h3>
          <p>
            {draft.legalFirstName} {draft.legalLastName}
          </p>
        </section>
        <section className="ko-review-card">
          <h3>Startup Information</h3>
          <p>{draft.displayName || draft.legalName}</p>
        </section>
        <section className="ko-review-card">
          <h3>Startup Documents</h3>
          <p>
            {documentUploaded ? "Document submitted" : "No document submitted"}
          </p>
        </section>
        <section className="ko-founder-card">
          <h3>Platform Agreements</h3>
          {(
            [
              ["terms", "Terms of Use"],
              ["privacy", "Privacy Policy"],
              ["platform", "Platform Agreement"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={(event) => set(key, event.target.checked)}
              />
              I accept the {label}.
            </label>
          ))}
          <Field
            label="Electronic signature"
            required
            value={draft.signatureName}
            onChange={(event) => set("signatureName", event.target.value)}
          />
        </section>
      </>
    );
  }

  const title =
    step === 0
      ? "Create your Kori founder account."
      : step === 1
        ? "Secure your account."
        : step === 2
          ? "Create your founder profile."
          : step === 3
            ? "Build your startup profile."
            : step === 4
              ? "Add startup documents."
              : "Review your information.";

  return (
    <div className="kori-onboarding">
      {message ? (
        <p role="status" className="ko-message ko-founder-status">
          {message}
        </p>
      ) : null}
      <Shell
        step={step}
        total={6}
        title={title}
        subtitle={step === 0 ? "Joining as: Founder" : undefined}
        founder
        next={() => void next()}
        back={step ? () => setStep((current) => current - 1) : undefined}
        save={saveExit}
        action={step === 5 ? "Complete onboarding" : "Continue"}
      >
        {body}
      </Shell>
    </div>
  );
}
