"use client";

import type { ReactNode } from "react";

import { EditorialPanel } from "./EditorialPanel";
import { OnboardingProgress } from "./OnboardingProgress";

const FOUNDER_STEP_LABELS = [
  "ACCOUNT",
  "SECURITY",
  "FOUNDER",
  "STARTUP",
  "DOCUMENTS",
  "REVIEW",
] as const;

export function Shell({
  step,
  total,
  title,
  subtitle,
  children,
  next,
  back,
  save,
  founder = false,
  action = "Continue",
  busy = false,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  next: () => void;
  back?: () => void;
  save: () => void;
  founder?: boolean;
  action?: string;
  busy?: boolean;
}) {
  const variant = !founder
    ? "network-basic"
    : step === 0
      ? "founder-basic"
      : step === total - 1
        ? "founder-review"
        : "founder-profile";
  const stepLabel = founder
    ? FOUNDER_STEP_LABELS[step] ?? "PROFILE"
    : "PROFILE";
  const progressWidth = Math.round(((step + 1) / total) * 560);

  return (
    <main className="ko-page ko-screen--founder">
      <EditorialPanel variant={variant} />

      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Step {step + 1} of {total}</span>
          {step === 0 ? (
            <span>
              Already have an account?{" "}
              <a className="ko-link ko-link--coral" href="/login">
                Sign in
              </a>
            </span>
          ) : (
            <button
              type="button"
              className="ko-link ko-link--coral"
              onClick={save}
            >
              Save and exit
            </button>
          )}
        </header>

        <form
          className="ko-form ko-long-form ko-founder-form"
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <OnboardingProgress
            label={`STEP ${String(step + 1).padStart(2, "0")} OF ${String(total).padStart(2, "0")} · ${stepLabel}`}
            width={progressWidth}
          />

          <div className="ko-intro">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>

          {children}

          <div className={back ? "ko-actions" : "ko-actions ko-actions--single"}>
            {back ? (
              <button
                type="button"
                className="ko-secondary"
                disabled={busy}
                onClick={back}
              >
                Back
              </button>
            ) : null}
            <button className="ko-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : action}
            </button>
          </div>
        </form>

        <p className="ko-platform-note">Secure Platform · Stellar Testnet demo</p>
      </section>
    </main>
  );
}
