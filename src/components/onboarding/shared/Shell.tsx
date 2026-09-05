"use client";

import type { ReactNode } from "react";

import { Editorial } from "./Editorial";

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
}) {
  const progress = Math.min(
    100,
    Math.max(0, ((step + 1) / Math.max(total, 1)) * 100),
  );

  return (
    <main className="kori-onboarding ko-page ko-founder-page">
      <Editorial founder={founder} />
      <section className={"ko-form-panel"}>
        <header className="ko-topline">
          <span>
            Step {step + 1} of {total}
          </span>
          <button type="button" className="ko-link" onClick={save}>
            Save and exit
          </button>
        </header>
        <form
          className="ko-form ko-long-form"
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
        >
          <div className="ko-progress-block">
            <div className="ko-progress-meta">
              <span>
                STEP {String(step + 1).padStart(2, "0")} OF{" "}
                {String(total).padStart(2, "0")}
              </span>
              <span>Onboarding Progress</span>
            </div>
            <div className="ko-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="ko-intro">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {children}
          <div className="ko-actions">
            {back ? (
              <button type="button" className="ko-secondary" onClick={back}>
                Back
              </button>
            ) : null}
            <button className="ko-primary" type="submit">
              {action}
            </button>
          </div>
        </form>
        <footer className="ko-platform-note">
          Secure demonstration platform · No real funds
        </footer>
      </section>
    </main>
  );
}
