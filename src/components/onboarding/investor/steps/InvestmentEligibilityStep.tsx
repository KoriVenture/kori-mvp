"use client";

import {
  CLASSIFICATIONS,
  INVESTMENT_EXPERIENCE,
  SOURCES_OF_FUNDS,
} from "../investor-onboarding.constants";
import type { InvestorOnboardingDraft } from "../investor-onboarding.types";
import { Choice } from "../../shared/Choice";
import { EditorialPanel } from "../../shared/EditorialPanel";
import { OnboardingProgress } from "../../shared/OnboardingProgress";
import { SelectField } from "../../shared/SelectField";

export function InvestmentEligibilityStep({
  draft,
  busy,
  message,
  onSet,
  onContinue,
  onSaveLater,
  onSaveExit,
}: {
  draft: InvestorOnboardingDraft;
  busy: boolean;
  message: string;
  onSet: <K extends keyof InvestorOnboardingDraft>(key: K, value: InvestorOnboardingDraft[K]) => void;
  onContinue: () => Promise<void>;
  onSaveLater: () => Promise<void>;
  onSaveExit: () => void;
}) {
  return (
    <main className="kori-onboarding ko-page ko-screen--eligibility">
      <EditorialPanel variant="eligibility" />
      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step 4 of 4</span>
          <button type="button" className="ko-link ko-link--coral" onClick={onSaveExit}>Save and exit</button>
        </header>

        <div className="ko-form ko-long-form">
          <OnboardingProgress label="STEP 04 OF 06 · ELIGIBILITY" progress={67.857143} />
          <div className="ko-intro">
            <h1>Help us understand which opportunities you may access.</h1>
            <p>Investment eligibility depends on your country, investor classification, and the requirements of each opportunity. Your answers help Kori show you the appropriate next steps.</p>
          </div>

          <div className="ko-why">
            <img src="/assets/onboarding/investor/shield.svg" alt="" />
            <strong>Why we ask</strong>
            <p>Kori uses this information to support eligibility review. Your financial information is never shown on your public profile.</p>
          </div>

          <section className="ko-section ko-section--tight">
            <h3>Investor classification</h3>
            <div className="ko-choice-list">
              {CLASSIFICATIONS.map((item) => (
                <Choice
                  key={item.value}
                  title={item.value}
                  description={item.description}
                  selected={draft.investorClassification === item.value}
                  onClick={() => onSet("investorClassification", item.value)}
                />
              ))}
            </div>
            <div className="ko-guidance">
              <strong>Need guidance? </strong>
              Eligibility rules vary by jurisdiction and offering. Kori does
              not determine legal accreditation through this self-declaration
              alone.
            </div>
          </section>

          <section className="ko-section">
            <SelectField
              label="Investment experience"
              value={draft.investmentExperience}
              options={INVESTMENT_EXPERIENCE}
              onChange={(value) => onSet("investmentExperience", value)}
            />
            <div className="ko-field-group">
              <span className="ko-field-label">
                Experience with private-company investments
              </span>
              <div className="ko-segmented">
                {(["Yes", "No", "Some"] as const).map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={draft.privateCompanyExperience === option ? "is-selected" : ""}
                    onClick={() => onSet("privateCompanyExperience", option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <SelectField
              label="Expected source of investment funds"
              value={draft.sourceOfFunds}
              options={SOURCES_OF_FUNDS}
              onChange={(value) => onSet("sourceOfFunds", value)}
            />
          </section>

          {/* Intentionally no KYC block in this MVP. */}

          <label className="ko-risk-card">
            <strong>RISK DISCLOSURE</strong>
            <span>
              “Private investments can be speculative, illiquid, and result in
              the loss of the entire amount invested.”
            </span>
            <span className="ko-risk-ack">
              <input
                type="checkbox"
                checked={draft.riskAcknowledged}
                onChange={(e) => onSet("riskAcknowledged", e.target.checked)}
              />
              I acknowledge and understand these risks.
            </span>
          </label>

          <div className="ko-actions">
            <button type="button" className="ko-primary" disabled={busy} onClick={() => void onContinue()}>Continue to review</button>
            <button type="button" className="ko-secondary" disabled={busy} onClick={() => void onSaveLater()}>Save and continue later</button>
          </div>
          {message ? <p className="ko-message" role="status">{message}</p> : null}
        </div>
        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
