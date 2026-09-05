"use client";

import { useEffect, useRef, useState } from "react";
import { shouldAttemptEmailOtp } from "@/lib/auth/otp-attempt";
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
  onSkipSecurity,
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
  onSkipSecurity: () => Promise<void>;
  onSaveExit: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(45);
  const lastAttemptedOtp = useRef("");

  const showOtp = otpRequired && !draft.emailVerified;

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
      shouldAttemptEmailOtp({
        otp,
        otpRequired,
        emailVerified: draft.emailVerified,
        busy,
        lastAttemptedOtp: lastAttemptedOtp.current,
      })
    ) {
      lastAttemptedOtp.current = otp;
      void onVerifyOtp(otp);
    }
  }, [otp, otpRequired, draft.emailVerified, busy, onVerifyOtp]);

  function choose(value: SecurityMethod) {
    if (busy) return;
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
              {showOtp ? (
                <>
                  We sent a verification code to{" "}
                  <strong>{maskEmail(draft.email)}</strong>. Enter it below to
                  confirm your identity.
                </>
              ) : (
                <>
                  Your email <strong>{draft.email}</strong> is verified. Extra
                  account security is optional for now.
                </>
              )}
            </p>
          </div>

          {showOtp ? (
            <div className="ko-verify-block">
              <OtpInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (value.length < 6) {
                    lastAttemptedOtp.current = "";
                  }
                }}
              />
              <div className="ko-otp-actions">
                <button
                  type="button"
                  className="ko-link ko-link--coral"
                  disabled={seconds > 0 || busy}
                  onClick={async () => {
                    await onResend();
                    setOtp("");
                    lastAttemptedOtp.current = "";
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

          {draft.emailVerified ? (
            <>
              <section className="ko-security-choices">
                <div>
                  <h2>Add extra account security (optional)</h2>
                  <p>
                    You can configure an additional sign-in safeguard now, or
                    skip this step and configure it later.
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
                  selected={draft.securityMethod === "totp"}
                  onClick={() => choose("totp")}
                />
                <Choice
                  title="SMS Backup"
                  description="Secure mobile phone delivery of verification codes."
                  icon="/assets/onboarding/investor/mail.svg"
                  selected={draft.securityMethod === "sms"}
                  onClick={() => choose("sms")}
                />
              </section>

              <div className="ko-actions">
                <button
                  type="button"
                  className="ko-secondary"
                  disabled={busy}
                  onClick={() => void onSkipSecurity()}
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  className="ko-primary"
                  disabled={busy}
                  onClick={() => void onContinue()}
                >
                  {busy ? "Securing account…" : "Continue to profile"}
                </button>
              </div>
            </>
          ) : null}

          {message ? <p className="ko-message" role="status">{message}</p> : null}
        </div>
        <p className="ko-platform-note">Secure Platform</p>
      </section>
    </main>
  );
}
