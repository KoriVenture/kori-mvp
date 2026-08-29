"use client";

import { useEffect, useState } from "react";
import type {
  InvestorOnboardingDraft,
  SecurityMethod,
} from "../investor-onboarding.types";
import { Choice } from "../../shared/Choice";
import { EditorialPanel } from "../../shared/EditorialPanel";
import { OtpInput } from "../../shared/OtpInput";

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 4)}••••@${domain}`;
}

export function VerifySecureStep({
  draft,
  otpRequired,
  message,
  busy,
  onSet,
  onVerifyOtp,
  onResend,
  onChangeEmail,
  onContinue,
  onSaveExit,
}: {
  draft: InvestorOnboardingDraft;
  otpRequired: boolean;
  message: string;
  busy: boolean;
  onSet: <K extends keyof InvestorOnboardingDraft>(
    key: K,
    value: InvestorOnboardingDraft[K],
  ) => void;
  onVerifyOtp: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onChangeEmail: () => void;
  onContinue: () => Promise<void>;
  onSaveExit: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setInterval(
      () => setSeconds((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [seconds]);

  useEffect(() => {
    if (
      otpRequired &&
      otp.length === 6 &&
      !draft.emailVerified &&
      !busy
    ) {
      void onVerifyOtp(otp);
    }
  }, [otp, otpRequired, draft.emailVerified, busy, onVerifyOtp]);

  function choose(value: SecurityMethod) {
    // TOTP and SMS require approved enrollment interaction states that do not
    // exist in the embedded visual contract. Do not invent them in this implementation.
    if (value === "totp" || value === "sms") return;
    onSet("securityMethod", value);
  }

  return (
    <main className="kori-onboarding ko-page ko-screen--secure">
      <EditorialPanel variant="network-basic" />
      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step 2 of 4</span>
          <button type="button" className="ko-link ko-link--coral" onClick={onSaveExit}>
            Save and exit
          </button>
        </header>

        <div className="ko-form ko-security-form">
          <div className="ko-intro">
            <h1>Let&apos;s secure your account.</h1>
            <p>
              {otpRequired ? (
                <>
                  We sent a verification code to{" "}
                  <strong>{maskEmail(draft.email)}</strong>. Enter it below to
                  confirm your identity.
                </>
              ) : (
                <>
                  Your email <strong>{draft.email}</strong> was confirmed
                  through your social sign-in provider.
                </>
              )}
            </p>
          </div>

          {otpRequired ? (
            <div className="ko-verify-block">
              <OtpInput value={otp} onChange={setOtp} />
              <div className="ko-otp-actions">
                <button
                  type="button"
                  className="ko-link ko-link--coral"
                  disabled={seconds > 0 || busy}
                  onClick={async () => {
                    await onResend();
                    setSeconds(45);
                  }}
                >
                  {seconds > 0
                    ? `Resend code (in ${seconds}s)`
                    : "Resend code"}
                </button>
                <span>·</span>
                <button type="button" className="ko-link" onClick={onChangeEmail}>
                  Change email
                </button>
              </div>
            </div>
          ) : null}

          <section className="ko-security-choices">
            <div>
              <h2>Choose how you sign in</h2>
              <p>
                Kori accounts hold sensitive financial data. Select a robust
                primary sign-in safeguard.
              </p>
            </div>

            <Choice
              title="Passkey"
              badge="RECOMMENDED"
              description="Biometrics like FaceID, TouchID, or security keys."
              icon="/assets/onboarding/investor/key.svg"
              selected={draft.securityMethod === "passkey"}
              onClick={() => choose("passkey")}
            />
            <Choice
              title="Authenticator App"
              description="Use Google Authenticator, 1Password, or Authy."
              icon="/assets/onboarding/investor/smartphone.svg"
              selected={false}
              disabled
              onClick={() => choose("totp")}
            />
            <Choice
              title="SMS Backup"
              description="Secure mobile phone delivery of verification codes."
              icon="/assets/onboarding/investor/mail.svg"
              selected={false}
              disabled
              onClick={() => choose("sms")}
            />
          </section>

          <button
            type="button"
            className="ko-primary"
            disabled={busy || !draft.emailVerified}
            onClick={() => void onContinue()}
          >
            {busy ? "Securing account…" : "Continue to profile"}
          </button>

          {message ? <p className="ko-message" role="status">{message}</p> : null}
        </div>
        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
