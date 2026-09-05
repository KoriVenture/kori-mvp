"use client";

import { useRef, useState } from "react";
import type { InvestorOnboardingDraft } from "../investor-onboarding.types";
import { EditorialPanel } from "../../shared/EditorialPanel";
import { Field } from "../../shared/Field";
import { OnboardingProgress } from "../../shared/OnboardingProgress";

export function InvestorProfileStep({
  draft,
  busy,
  message,
  onSet,
  onUploadPhoto,
  onRemovePhoto,
  onContinue,
  onLater,
  onSaveExit,
}: {
  draft: InvestorOnboardingDraft;
  busy: boolean;
  message: string;
  onSet: <K extends keyof InvestorOnboardingDraft>(key: K, value: InvestorOnboardingDraft[K]) => void;
  onUploadPhoto: (file: File) => Promise<void>;
  onRemovePhoto: () => Promise<void>;
  onContinue: () => Promise<void>;
  onLater: () => Promise<void>;
  onSaveExit: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [language, setLanguage] = useState("");

  function addLanguage() {
    const value = language.trim();
    if (!value || draft.languages.includes(value)) return;
    onSet("languages", [...draft.languages, value]);
    setLanguage("");
    setAddingLanguage(false);
  }

  return (
    <main className="kori-onboarding ko-page ko-screen--profile">
      <EditorialPanel variant="network-alignment" />
      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step 3 of 4</span>
          <button type="button" className="ko-link ko-link--coral" onClick={onSaveExit}>Save and exit</button>
        </header>

        <div className="ko-form ko-long-form">
          <OnboardingProgress label="STEP 02 OF 06 · PROFILE" progress={32.142857} />
          <div className="ko-intro">
            <h1>Tell us who you are.</h1>
            <p>Your profile helps other investors, fund managers, and experts understand the perspective you bring. You control what is visible to others.</p>
          </div>

          <section className="ko-section">
            <h2>Identity</h2>
            <div className="ko-photo-field">
              <span className="ko-field-label">Profile photograph</span>
              <div className="ko-photo-row">
                <img className="ko-profile-photo" src={draft.photoUrl} alt="Profile" />
                <div>
                  <div className="ko-inline-links">
                    <button type="button" className="ko-link ko-link--coral" disabled={busy} onClick={() => fileRef.current?.click()}>Upload new photo</button>
                    <span>·</span>
                    <button type="button" className="ko-link ko-link--danger" disabled={busy} onClick={() => void onRemovePhoto()}>Remove</button>
                  </div>
                  <small>PNG or JPG up to 5MB. Square aspect recommended.</small>
                </div>
              </div>
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onUploadPhoto(file);
                }}
              />
            </div>

            <div className="ko-languages">
              <span className="ko-field-label">Languages spoken</span>
              <div className="ko-language-row">
                {draft.languages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="ko-language-chip"
                    onClick={() =>
                      onSet(
                        "languages",
                        draft.languages.filter((x) => x !== item),
                      )
                    }
                  >
                    {item} <img src="/assets/onboarding/shared/x.svg" alt="" aria-hidden="true" />
                  </button>
                ))}
                {addingLanguage ? (
                  <span className="ko-language-entry">
                    <input
                      value={language}
                      autoFocus
                      onChange={(e) => setLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLanguage();
                        }
                      }}
                    />
                    <button type="button" onClick={addLanguage}>Add</button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="ko-add-language"
                    onClick={() => setAddingLanguage(true)}
                  >
                    + Add language
                  </button>
                )}
              </div>
            </div>

            <div className="ko-two-columns">
              <Field label="Legal first name" value={draft.legalFirstName} onChange={(e) => onSet("legalFirstName", e.target.value)} />
              <Field label="Legal last name" value={draft.legalLastName} onChange={(e) => onSet("legalLastName", e.target.value)} />
            </div>
            <Field label="Location" value={draft.city} placeholder="Lagos, Nigeria" onChange={(e) => onSet("city", e.target.value)} />
          </section>

          <section className="ko-section">
            <h2>Professional context</h2>
            <Field label="LinkedIn profile (optional)" type="url" value={draft.linkedinUrl} onChange={(e) => onSet("linkedinUrl", e.target.value)} />
            <Field label="Professional title" value={draft.professionalTitle} onChange={(e) => onSet("professionalTitle", e.target.value)} />
            <Field label="Organization" value={draft.organization} onChange={(e) => onSet("organization", e.target.value)} />
            <Field label="Short professional biography" multiline value={draft.biography} onChange={(e) => onSet("biography", e.target.value)} />
          </section>

          <div className="ko-actions">
            <button type="button" className="ko-primary" disabled={busy} onClick={() => void onContinue()}>Continue</button>
            <button type="button" className="ko-secondary" disabled={busy} onClick={() => void onLater()}>Complete this later</button>
          </div>
          {message ? <p className="ko-message" role="status">{message}</p> : null}
        </div>
        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
