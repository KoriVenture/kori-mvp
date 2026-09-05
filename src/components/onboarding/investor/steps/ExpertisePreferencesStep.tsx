"use client";

import {
  EXPERTISE_AREAS,
  INSTRUMENTS,
  TICKET_SIZES,
} from "../investor-onboarding.constants";
import type { InvestorOnboardingDraft } from "../investor-onboarding.types";
import { Chips } from "../../shared/Chips";
import { EditorialPanel } from "../../shared/EditorialPanel";
import { Field } from "../../shared/Field";
import { OnboardingProgress } from "../../shared/OnboardingProgress";

function csv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function ExpertisePreferencesStep({
  draft,
  busy,
  message,
  onSet,
  onContinue,
  onSkip,
  onSaveExit,
}: {
  draft: InvestorOnboardingDraft;
  busy: boolean;
  message: string;
  onSet: <K extends keyof InvestorOnboardingDraft>(key: K, value: InvestorOnboardingDraft[K]) => void;
  onContinue: () => Promise<void>;
  onSkip: () => Promise<void>;
  onSaveExit: () => void;
}) {
  return (
    <main className="kori-onboarding ko-page ko-screen--preferences">
      <EditorialPanel variant="network-alignment" />
      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step 4 of 4</span>
          <button type="button" className="ko-link ko-link--coral" onClick={onSaveExit}>Save and exit</button>
        </header>

        <div className="ko-form ko-long-form">
          <OnboardingProgress label="STEP 03 OF 06 · PREFERENCES" progress={64.285714} />
          <div className="ko-intro">
            <h1>What informs your investment perspective?</h1>
            <p>Kori uses your interests and expertise to surface relevant opportunities, people, and diligence conversations. These preferences do not automatically authorize investments.</p>
          </div>

          <section className="ko-section">
            <div className="ko-section-intro">
              <h2>Your Expertise Areas</h2>
              <p>Select industries, regional operations, or technical practices where you can support collective diligence.</p>
            </div>
            <Chips
              options={EXPERTISE_AREAS}
              selected={draft.expertiseAreas}
              onChange={(value) => onSet("expertiseAreas", value)}
            />
            <Field
              label="What can other members ask you about? (optional)"
              multiline
              value={draft.askMeAbout}
              placeholder="e.g. Regulatory landscape in ECOWAS, building payment rails in frontier markets..."
              onChange={(e) => onSet("askMeAbout", e.target.value)}
            />
          </section>

          <section className="ko-section">
            <h2>Investment Criteria</h2>
            <Field
              label="Preferred regions"
              value={draft.preferredRegions.join(", ")}
              placeholder="West Africa, East Africa, Caribbean"
              onChange={(e) => onSet("preferredRegions", csv(e.target.value))}
            />
            <Field
              label="Investment stages"
              value={draft.investmentStages.join(", ")}
              placeholder="Seed, Pre-seed"
              onChange={(e) => onSet("investmentStages", csv(e.target.value))}
            />
            <div className="ko-field-group">
              <span className="ko-field-label">Preferred ticket size</span>
              <Chips
                options={TICKET_SIZES}
                selected={draft.preferredTicketSizes}
                tone="coral"
                showStateIcon={false}
                onChange={(value) => onSet("preferredTicketSizes", value)}
              />
            </div>
            <div className="ko-field-group">
              <span className="ko-field-label">Preferred instruments</span>
              <Chips
                options={INSTRUMENTS}
                selected={draft.preferredInstruments}
                showStateIcon={false}
                onChange={(value) => onSet("preferredInstruments", value)}
              />
            </div>
            <Field
              label="Investment horizon"
              value={draft.investmentHorizon}
              placeholder="7–10 years"
              onChange={(e) => onSet("investmentHorizon", e.target.value)}
            />
          </section>

          <Field
            label="Describe the opportunities you want to support"
            multiline
            value={draft.investmentThesis}
            onChange={(e) => onSet("investmentThesis", e.target.value)}
          />

          <div className="ko-actions">
            <button type="button" className="ko-primary" disabled={busy} onClick={() => void onContinue()}>Continue</button>
            <button type="button" className="ko-secondary" disabled={busy} onClick={() => void onSkip()}>Skip for now</button>
          </div>
          {message ? <p className="ko-message" role="status">{message}</p> : null}
        </div>
        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
