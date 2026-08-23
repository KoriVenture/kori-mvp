"use client";

import { COUNTRIES } from "../investor-onboarding.constants";
import type { InvestorOnboardingDraft } from "../investor-onboarding.types";
import { EditorialPanel } from "../../shared/EditorialPanel";
import { PasswordField } from "../../shared/PasswordField";
import { SelectField } from "../../shared/SelectField";

export function CreateAccountStep({
  draft,
  message,
  busy,
  onSet,
  onCreate,
  onGoogle,
  onLinkedIn,
}: {
  draft: InvestorOnboardingDraft;
  message: string;
  busy: boolean;
  onSet: <K extends keyof InvestorOnboardingDraft>(
    key: K,
    value: InvestorOnboardingDraft[K],
  ) => void;
  onCreate: () => void;
  onGoogle: () => void;
  onLinkedIn: () => void;
}) {
  return (
    <main className="kori-onboarding ko-page ko-screen--create">
      <EditorialPanel variant="network-basic" />
      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step 1 of 4</span>
          <span>
            Already have an account?{" "}
            <button
              type="button"
              className="ko-link ko-link--coral"
              title="A separate approved sign-in screen is required before wiring this action."
            >
              Sign in
            </button>
          </span>
        </header>

        <div className="ko-form ko-create-form">
          <div className="ko-intro">
            <h1>Create your Kori investor account.</h1>
            <p>
              Discover opportunities, invest alongside trusted communities,
              and bring your expertise to collective diligence.
            </p>
          </div>

          <div className="ko-role-banner">
            <img src="/assets/onboarding/shared/user.svg" alt="" />
            <span>Joining as: <strong>Investor</strong></span>
            <span className="ko-role-banner__change">(CHANGE)</span>
          </div>

          <div className="ko-social-row">
            <button type="button" onClick={onGoogle} disabled={busy}>
              <img src="/assets/onboarding/shared/google.svg" alt="" />
              Google
            </button>
            <button type="button" onClick={onLinkedIn} disabled={busy}>
              <img src="/assets/onboarding/shared/linkedin.svg" alt="" />
              LinkedIn
            </button>
          </div>

          <div className="ko-divider"><span>OR CONTINUE WITH EMAIL</span></div>

          <label className="ko-field">
            <span>Work or personal email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={draft.email}
              placeholder="adaeze@sahelventures.com"
              onChange={(event) => onSet("email", event.target.value)}
            />
          </label>

          <PasswordField
            value={draft.password}
            onChange={(value) => onSet("password", value)}
          />

          <SelectField
            label="Country of residence"
            value={draft.country}
            options={COUNTRIES}
            required
            onChange={(value) => onSet("country", value)}
          />

          <button
            className="ko-primary"
            type="button"
            disabled={busy}
            onClick={onCreate}
          >
            {busy ? "Creating account…" : "Create account"}
          </button>

          <p className="ko-disclaimer">
            Creating an account does not commit you to an investment.
            Eligibility requirements may vary by opportunity and jurisdiction.
          </p>

          <div className="ko-consents">
            <label>
              <input
                type="checkbox"
                checked={draft.accountTerms}
                onChange={(event) =>
                  onSet("accountTerms", event.target.checked)
                }
              />
              <span>
                I agree to Kori&apos;s <u>Terms of Use</u> and{" "}
                <u>Privacy Policy</u>.
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.newsletter}
                onChange={(event) =>
                  onSet("newsletter", event.target.checked)
                }
              />
              <span>
                Keep me updated on new opportunities and platform news.
              </span>
            </label>
          </div>

          {message ? (
            <p className="ko-message" role="status">{message}</p>
          ) : null}
        </div>

        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
