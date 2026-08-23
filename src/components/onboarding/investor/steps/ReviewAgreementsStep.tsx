"use client";

import type { InvestorOnboardingDraft } from "../investor-onboarding.types";
import { EditorialPanel } from "../../shared/EditorialPanel";
import { Field } from "../../shared/Field";
import { OnboardingProgress } from "../../shared/OnboardingProgress";

function Agreement({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="ko-agreement">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="ko-agreement__check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        Agree
      </span>
    </label>
  );
}

export function ReviewAgreementsStep({
  draft,
  busy,
  message,
  onSet,
  onEdit,
  onComplete,
  onSaveExit,
}: {
  draft: InvestorOnboardingDraft;
  busy: boolean;
  message: string;
  onSet: <K extends keyof InvestorOnboardingDraft>(key: K, value: InvestorOnboardingDraft[K]) => void;
  onEdit: (step: number) => void;
  onComplete: () => Promise<void>;
  onSaveExit: () => void;
}) {
  const legalName = `${draft.legalFirstName} ${draft.legalLastName}`.trim();
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date());

  return (
    <main className="kori-onboarding ko-page ko-screen--review">
      <EditorialPanel variant="review" />
      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step 6 of 6</span>
          <button type="button" className="ko-link ko-link--coral" onClick={onSaveExit}>Save and exit</button>
        </header>
        <div className="ko-form ko-long-form">
          <OnboardingProgress label="STEP 06 OF 06 · REVIEW" width={560} />
          <div className="ko-intro"><h1>Review your investor account.</h1></div>

          <div className="ko-review-stack">
            <article className="ko-review-card">
              <header>
                <strong>Personal Information</strong>
                <button type="button" className="ko-link ko-link--coral" onClick={() => onEdit(2)}>Edit</button>
              </header>
              <p>Name: {legalName || "Not provided"}</p>
              <p>DOB: Private</p>
              <p>Country: {draft.country || "Not provided"}</p>
            </article>

            <article className="ko-review-card">
              <header>
                <strong>Investor Type & Preferences</strong>
                <button type="button" className="ko-link ko-link--coral" onClick={() => onEdit(3)}>Edit</button>
              </header>
              <p>
                Structure: {draft.investorType === "fund_manager"
                  ? "Fund Manager"
                  : "Individual Investor"}
              </p>
              <div className="ko-review-chips">
                {draft.expertiseAreas.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>

            <article className="ko-review-card">
              <header>
                <strong>Compliance & Eligibility</strong>
                <button type="button" className="ko-link ko-link--coral" onClick={() => onEdit(4)}>Edit</button>
              </header>
              <p>Classification: {draft.investorClassification || "Not provided"}</p>
              <p>Status: <b className="ko-status-info">INFORMATION SUBMITTED</b></p>
              <p>Identity: <b className="ko-status-deferred">Deferred</b></p>
            </article>
          </div>

          <section className="ko-section">
            <h2>Platform Agreements</h2>
            <div className="ko-agreement-stack">
              <Agreement label="Terms of Use" description="How you can use Kori platform" checked={draft.terms} onChange={(value) => onSet("terms", value)} />
              <Agreement label="Privacy Policy" description="How we securely handle your data" checked={draft.privacy} onChange={(value) => onSet("privacy", value)} />
              <Agreement label="Platform Agreement" description="Your rights and responsibilities" checked={draft.platform} onChange={(value) => onSet("platform", value)} />
              <Agreement label="Investment Risk Disclosure" description="Understanding highly speculative risk" checked={draft.investmentRisk} onChange={(value) => onSet("investmentRisk", value)} />
            </div>
          </section>

          <section className="ko-signature-card">
            <h2>Electronic Signature</h2>
            <label>
              <span>Legal name (Pre-filled)</span>
              <div>{legalName || "Not provided"}</div>
            </label>
            <Field
              label="Signature"
              value={draft.signatureName}
              onChange={(e) => onSet("signatureName", e.target.value)}
            />
            <div className="ko-signature-date">
              <span>Date of signature</span>
              <code>{date}</code>
            </div>
            <p>
              “By signing, I confirm that the information provided is accurate
              and I agree to the documents listed above.”
            </p>
          </section>

          <div className="ko-actions">
            <button type="button" className="ko-primary" disabled={busy} onClick={() => void onComplete()}>Complete investor onboarding</button>
            <button type="button" className="ko-secondary" onClick={onSaveExit}>Save and exit</button>
          </div>
          {message ? <p className="ko-message" role="status">{message}</p> : null}
        </div>
        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
