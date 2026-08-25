"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Completion } from "./shared/Completion";
import { Field } from "./shared/Field";
import { SelectField } from "./shared/SelectField";
import { Shell } from "./shared/Shell";

type Role = "investor" | "founder";
type DraftValue = string | boolean | string[];
type Draft = Record<string, DraftValue>;
type Agreement = { agreement_type?: string; accepted?: boolean };

const investorTitles = ["Create your Kori investor account.", "Secure your account.", "Build your investor profile.", "Set your investment preferences.", "Confirm your eligibility.", "Review your information."];
const founderTitles = ["Create your Kori founder account.", "Secure your account.", "Create your founder profile.", "Build your startup profile.", "Add startup documents.", "Review your information."];
const text = (value: DraftValue | undefined) => typeof value === "string" ? value : "";
const bool = (value: DraftValue | undefined) => value === true;
const accepted = (items: Agreement[] | undefined, type: string) => Boolean(items?.some((item) => item.agreement_type === type && item.accepted));

export function OnboardingController({ role }: { role: Role }) {
  const founder = role === "founder";
  const titles = founder ? founderTitles : investorTitles;
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({ accountTerms: false, newsletter: false, riskAcknowledged: false, terms: false, privacy: false, platform: false, investmentRisk: false });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [securityVerified, setSecurityVerified] = useState(false);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupFile, setStartupFile] = useState<File | null>(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (key: string, value: DraftValue) => setDraft((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        if (!active || !sessionData.session) return;
        setSecurityVerified(true);
        const response = await fetch(`/api/onboarding/${role}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        const profile = data.profile ?? {};
        const common: Draft = {
          legalFirstName: profile.legal_first_name ?? "", legalLastName: profile.legal_last_name ?? "",
          country: profile.country ?? "", city: profile.city ?? "", timezone: profile.timezone ?? "",
          linkedinUrl: profile.linkedin_url ?? "", professionalTitle: profile.professional_title ?? "",
          organization: profile.organization ?? "", biography: profile.biography ?? "",
          terms: accepted(data.agreements, "terms"), privacy: accepted(data.agreements, "privacy"),
          platform: accepted(data.agreements, "platform"), investmentRisk: accepted(data.agreements, "investment_risk"),
        };
        if (founder) {
          const startup = data.startup ?? {};
          setDraft((current) => ({ ...current, ...common,
            legalName: startup.legal_name ?? "", displayName: startup.display_name ?? "",
            startupCountry: startup.country ?? "", sector: startup.sector ?? "", website: startup.website ?? "",
            description: startup.description ?? "", foundingYear: startup.founding_year?.toString() ?? "", stage: startup.stage ?? "",
          }));
          if (startup.id) setStartupId(startup.id);
          if (Array.isArray(data.documents) && data.documents.length > 0) setDocumentUploaded(true);
        } else {
          const investor = data.investor ?? {};
          setDraft((current) => ({ ...current, ...common,
            investorType: investor.investor_type === "fund_manager" ? "Fund manager" : "Individual investor",
            askMeAbout: investor.ask_me_about ?? "", ticket: investor.preferred_ticket_size ?? "",
            horizon: investor.investment_horizon ?? "", thesis: investor.investment_thesis ?? "",
            classification: investor.investor_classification ?? "", experience: investor.experience ?? "",
            privateExperience: investor.private_company_experience ?? "", sourceFunds: investor.source_of_funds ?? "",
            riskAcknowledged: investor.risk_acknowledged === true,
          }));
        }
        setStep(Math.max(0, Math.min(Number(data.progress?.current_screen ?? 0), 6)));
      } catch {
        // New visitors remain on the Account step.
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [role, founder]);

  async function bootstrap() {
    const response = await fetch("/api/onboarding/bootstrap", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role }) });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? "Unable to initialise the Kori profile.");
    }
  }

  async function account() {
    setMessage("");
    if (!bool(draft.accountTerms)) return setMessage("You must accept the Terms of Use and Privacy Policy.");
    const email = text(draft.email).trim();
    const password = text(draft.password);
    if (!email || !password) return setMessage("Email and password are required.");
    try {
      const { data, error } = await createClient().auth.signUp({ email, password, options: { data: { role }, emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding/${role}` } });
      if (error) throw error;
      if (data.session) { await bootstrap(); setSecurityVerified(true); }
      setStep(1);
      setMessage(data.session ? "Account created. Continue with the security step." : "Check your email for the verification code or confirmation link.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication is unavailable."); }
  }

  async function oauth(provider: "google" | "linkedin_oidc") {
    setMessage("");
    if (!bool(draft.accountTerms)) return setMessage("Accept the Terms of Use and Privacy Policy before continuing.");
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/auth/callback?next=/onboarding/${role}` } });
      if (error) throw error;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Authentication is unavailable."); }
  }

  async function verifyCode() {
    setMessage("");
    const email = text(draft.email).trim();
    const token = text(draft.otp).trim();
    if (!email || !token) return setMessage("Enter the email address and verification code.");
    try {
      const { error } = await createClient().auth.verifyOtp({ email, token, type: "signup" });
      if (error) throw error;
      await bootstrap();
      setSecurityVerified(true);
      setMessage("Email verified. You can continue.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Verification failed."); }
  }

  function payload(nextStep = step) {
    const profile = {
      legalFirstName: text(draft.legalFirstName), legalLastName: text(draft.legalLastName),
      country: text(draft.country), city: text(draft.city), timezone: text(draft.timezone),
      linkedinUrl: text(draft.linkedinUrl), professionalTitle: text(draft.professionalTitle),
      organization: text(draft.organization), biography: text(draft.biography), photoPath: "", languages: [],
    };
    if (founder) return {
      screen: nextStep,
      ...(step === 2 ? { profile } : {}),
      ...(step === 3 ? { startup: {
        ...(startupId ? { id: startupId } : {}), legalName: text(draft.legalName), displayName: text(draft.displayName),
        country: text(draft.startupCountry), sector: text(draft.sector), website: text(draft.website),
        description: text(draft.description), foundingYear: Number(text(draft.foundingYear)) || undefined, stage: text(draft.stage),
      } } : {}),
      ...(step === 5 ? { agreements: { terms: bool(draft.terms), privacy: bool(draft.privacy), platform: bool(draft.platform), signatureName: text(draft.signatureName), signedAt: new Date().toISOString() } } : {}),
      ...(nextStep === 6 ? { complete: true } : {}),
    };
    return {
      screen: nextStep,
      ...(step === 2 ? { profile } : {}),
      ...(step === 3 ? { preferences: {
        investorType: text(draft.investorType) === "Fund manager" ? "fund_manager" : "individual",
        expertiseAreas: [], askMeAbout: text(draft.askMeAbout), preferredRegions: [], investmentStages: [],
        preferredTicketSize: text(draft.ticket), preferredInstruments: [], investmentHorizon: text(draft.horizon), investmentThesis: text(draft.thesis),
      } } : {}),
      ...(step === 4 ? { eligibility: {
        investorClassification: text(draft.classification), investmentExperience: text(draft.experience),
        privateCompanyExperience: text(draft.privateExperience), sourceOfFunds: text(draft.sourceFunds),
        riskDisclosure: true, riskAcknowledged: bool(draft.riskAcknowledged),
      } } : {}),
      ...(step === 5 ? { agreements: { terms: bool(draft.terms), privacy: bool(draft.privacy), platform: bool(draft.platform), risk: bool(draft.investmentRisk), signatureName: text(draft.signatureName), signedAt: new Date().toISOString() } } : {}),
      ...(nextStep === 6 ? { complete: true } : {}),
    };
  }

  async function save(next = false) {
    if (step === 0) { if (next) await account(); return; }
    if (step === 1 && next && !securityVerified) return setMessage("Verify your email before continuing.");
    const target = next ? Math.min(step + 1, 6) : step;
    const response = await fetch(`/api/onboarding/${role}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload(target)) });
    if (!response.ok) { const body = await response.json().catch(() => ({})); return setMessage(body.error ?? "Unable to save."); }
    const body = await response.json().catch(() => ({}));
    if (body.startupId) setStartupId(body.startupId);
    if (next) setStep(target); else location.href = "/";
  }

  async function uploadDocument() {
    if (!startupFile || !startupId) return setMessage("Save the startup profile and select a document first.");
    setUploading(true); setMessage("");
    try {
      const form = new FormData();
      form.set("file", startupFile); form.set("startupId", startupId); form.set("documentType", "pitch_deck"); form.set("title", startupFile.name);
      const response = await fetch("/api/onboarding/founder/documents", { method: "POST", body: form });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error ?? "Upload failed."); }
      setDocumentUploaded(true); setMessage("Document uploaded.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(false); }
  }

  if (loading) return <main className="completion"><p>Loading onboarding…</p></main>;
  if (step === 6) return <Completion founder={founder} />;

  let body;
  if (step === 0) body = <><div className="role-banner">Joining as: <b>{founder ? "Founder" : "Investor"}</b></div><div className="social-row"><button type="button" onClick={() => oauth("google")}><img src="/assets/onboarding/shared/google.svg" alt="" />Google</button><button type="button" onClick={() => oauth("linkedin_oidc")}><img src="/assets/onboarding/shared/linkedin.svg" alt="" />LinkedIn</button></div><Field label="Email" type="email" required defaultValue={text(draft.email)} onChange={(e) => set("email", e.target.value)} /><Field label="Password" type="password" required minLength={8} onChange={(e) => set("password", e.target.value)} /><SelectField label="Country" name="country" options={["Canada", "France", "Spain", "United Kingdom", "United States", "Other"]} value={text(draft.country)} onChange={(value) => set("country", value)} /><div className="consents"><label><input type="checkbox" required checked={bool(draft.accountTerms)} onChange={(e) => set("accountTerms", e.target.checked)} />I accept the Terms of Use and Privacy Policy.</label><label><input type="checkbox" checked={bool(draft.newsletter)} onChange={(e) => set("newsletter", e.target.checked)} />Send me occasional Kori updates.</label></div></>;
  else if (step === 1) body = <><section className="form-section"><h3>Email one-time code</h3><p>Enter the verification code sent to your email.</p><Field label="Email" type="email" defaultValue={text(draft.email)} onChange={(e) => set("email", e.target.value)} /><Field label="Verification code" inputMode="numeric" onChange={(e) => set("otp", e.target.value)} /><button type="button" className="secondary-button full" onClick={verifyCode}>Verify code</button>{securityVerified && <p>Email verified.</p>}</section><section className="form-section"><h3>Passkey</h3><p>Passkeys are coming later and are disabled for this MVP.</p><button type="button" className="secondary-button full" disabled>Add a passkey</button></section></>;
  else if (step === 2) body = <section className="form-section"><div className="two-columns"><Field label="Legal first name" required defaultValue={text(draft.legalFirstName)} onChange={(e) => set("legalFirstName", e.target.value)} /><Field label="Legal last name" required defaultValue={text(draft.legalLastName)} onChange={(e) => set("legalLastName", e.target.value)} /></div><Field label="Location" defaultValue={text(draft.city)} onChange={(e) => set("city", e.target.value)} /><Field label="LinkedIn" type="url" defaultValue={text(draft.linkedinUrl)} onChange={(e) => set("linkedinUrl", e.target.value)} /><Field label="Professional title" defaultValue={text(draft.professionalTitle)} onChange={(e) => set("professionalTitle", e.target.value)} />{!founder && <Field label="Organization" defaultValue={text(draft.organization)} onChange={(e) => set("organization", e.target.value)} />}<Field label="Professional biography" multiline defaultValue={text(draft.biography)} onChange={(e) => set("biography", e.target.value)} /></section>;
  else if (!founder && step === 3) body = <section className="form-section"><SelectField label="Investor type" name="investorType" options={["Individual investor", "Fund manager"]} value={text(draft.investorType)} onChange={(value) => set("investorType", value)} /><Field label="Ask me about" multiline defaultValue={text(draft.askMeAbout)} onChange={(e) => set("askMeAbout", e.target.value)} /><Field label="Preferred ticket size" defaultValue={text(draft.ticket)} onChange={(e) => set("ticket", e.target.value)} /><Field label="Investment horizon" defaultValue={text(draft.horizon)} onChange={(e) => set("horizon", e.target.value)} /><Field label="Investment thesis" multiline defaultValue={text(draft.thesis)} onChange={(e) => set("thesis", e.target.value)} /></section>;
  else if (!founder && step === 4) body = <><section className="form-section"><SelectField label="Investor classification" name="classification" options={["Self-declared individual", "Professional investor", "Institutional investor"]} value={text(draft.classification)} onChange={(value) => set("classification", value)} /><Field label="Investment experience" multiline defaultValue={text(draft.experience)} onChange={(e) => set("experience", e.target.value)} /><Field label="Private-company experience" multiline defaultValue={text(draft.privateExperience)} onChange={(e) => set("privateExperience", e.target.value)} /><SelectField label="Source of funds" name="sourceFunds" options={["Employment income", "Business income", "Investments", "Other lawful source"]} value={text(draft.sourceFunds)} onChange={(value) => set("sourceFunds", value)} /><label><input type="checkbox" required checked={bool(draft.riskAcknowledged)} onChange={(e) => set("riskAcknowledged", e.target.checked)} />I understand private-market investments are high risk and illiquid.</label></section><section className="form-section"><h3>Identity verification (KYC)</h3><div className="notice"><b>Identity verification is deferred for the MVP.</b><p>You can complete your investor profile now.</p></div></section></>;
  else if (founder && step === 3) body = <section className="form-section"><Field label="Legal company name" required defaultValue={text(draft.legalName)} onChange={(e) => set("legalName", e.target.value)} /><Field label="Startup display name" defaultValue={text(draft.displayName)} onChange={(e) => set("displayName", e.target.value)} /><SelectField label="Country" name="startupCountry" options={["Canada", "France", "Spain", "Other"]} value={text(draft.startupCountry)} onChange={(value) => set("startupCountry", value)} /><Field label="Sector" required defaultValue={text(draft.sector)} onChange={(e) => set("sector", e.target.value)} /><Field label="Website" type="url" defaultValue={text(draft.website)} onChange={(e) => set("website", e.target.value)} /><Field label="Short description" multiline defaultValue={text(draft.description)} onChange={(e) => set("description", e.target.value)} /><Field label="Founding year" type="number" defaultValue={text(draft.foundingYear)} onChange={(e) => set("foundingYear", e.target.value)} /><Field label="Stage" defaultValue={text(draft.stage)} onChange={(e) => set("stage", e.target.value)} /></section>;
  else if (founder && step === 4) body = <section className="form-section"><h3>Startup Documents</h3><p>Upload a Pitch deck, Company overview, or Supporting document. Files remain private.</p><input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setStartupFile(e.target.files?.[0] ?? null)} /><button type="button" className="secondary-button full" disabled={!startupFile || !startupId || uploading} onClick={uploadDocument}>{uploading ? "Uploading…" : "Upload document"}</button>{documentUploaded && <p>Document submitted.</p>}</section>;
  else body = <><section className="review-card"><h3>{founder ? "Founder Information" : "Investor Information"}</h3><p>Review your profile information before signing.</p></section>{founder ? <><section className="review-card"><h3>Startup Information</h3><p>{text(draft.displayName) || text(draft.legalName)}</p></section><section className="review-card"><h3>Startup Documents</h3><p>{documentUploaded ? "Document submitted" : "No document submitted"}</p></section></> : <section className="review-card"><h3>Eligibility: Self-declared</h3><p>Identity verification: Deferred for MVP</p></section>}<section className="form-section"><h3>Platform Agreements</h3>{[["terms", "Terms of Use"], ["privacy", "Privacy Policy"], ["platform", "Platform Agreement"], ...(!founder ? [["investmentRisk", "Investment Risk Disclosure"]] : [])].map(([key, label]) => <label key={key}><input type="checkbox" required checked={bool(draft[key])} onChange={(e) => set(key, e.target.checked)} />I accept the {label}.</label>)}<Field label="Electronic signature" required defaultValue={text(draft.signatureName)} onChange={(e) => set("signatureName", e.target.value)} /></section></>;

  return <div className="kori-onboarding">{message && <p role="status" className="onboarding-error">{message}</p>}<Shell step={step} total={6} title={titles[step]} subtitle={step === 0 ? `Joining as: ${founder ? "Founder" : "Investor"}` : undefined} founder={founder} next={() => save(true)} back={step ? () => setStep((current) => current - 1) : undefined} save={() => save(false)} action={step === 5 ? "Complete onboarding" : "Continue"}>{body}</Shell></div>;
}
