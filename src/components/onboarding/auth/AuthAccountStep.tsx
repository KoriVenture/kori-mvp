"use client";

import type { PublicRole } from "@/lib/onboarding/auth-links";

import { Field } from "../shared/Field";
import { SelectField } from "../shared/SelectField";

export function AuthAccountStep({
  role,
  email,
  country,
  accountTerms,
  newsletter,
  onEmail,
  onCountry,
  onTerms,
  onNewsletter,
  onGoogle,
  onLinkedIn,
}: {
  role: PublicRole;
  email: string;
  country: string;
  accountTerms: boolean;
  newsletter: boolean;
  onEmail: (value: string) => void;
  onCountry: (value: string) => void;
  onTerms: (value: boolean) => void;
  onNewsletter: (value: boolean) => void;
  onGoogle: () => void;
  onLinkedIn: () => void;
}) {
  return (
    <>
      <div className="role-banner">
        Joining as: <b>{role === "founder" ? "Founder" : "Investor"}</b>
      </div>

      <div className="social-row">
        <button type="button" onClick={onGoogle}>
          <img src="/assets/onboarding/shared/google.svg" alt="" />
          Google
        </button>

        <button type="button" onClick={onLinkedIn}>
          <img src="/assets/onboarding/shared/linkedin.svg" alt="" />
          LinkedIn
        </button>
      </div>

      <Field
        label="Email"
        type="email"
        required
        value={email}
        onChange={(event) => onEmail(event.target.value)}
      />

      <div className="notice">
        <b>Password secured by Auth0</b>
        <p>
          Continue to Auth0 to create your password and verify your email with
          the one-time code.
        </p>
      </div>

      <SelectField
        label="Country"
        name="country"
        value={country}
        options={[
          "Canada",
          "France",
          "Spain",
          "United Kingdom",
          "United States",
          "Other",
        ]}
        onChange={onCountry}
      />

      <div className="consents">
        <label>
          <input
            type="checkbox"
            required
            checked={accountTerms}
            onChange={(event) => onTerms(event.target.checked)}
          />
          I accept the Terms of Use and Privacy Policy.
        </label>

        <label>
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(event) => onNewsletter(event.target.checked)}
          />
          Send me occasional Kori updates.
        </label>
      </div>
    </>
  );
}
