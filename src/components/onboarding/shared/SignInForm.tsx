"use client";

import { useState } from "react";

import {
  signInEmailPassword,
  startSocialSignIn,
  type KoriAuthRedirectPath,
  type KoriSocialProvider,
} from "@/lib/auth/account";

export function SignInForm({
  redirectTo = "/dashboard",
  onBusyChange,
}: {
  redirectTo?: KoriAuthRedirectPath;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function setWorking(value: boolean) {
    setBusy(value);
    onBusyChange?.(value);
  }

  async function emailSignIn() {
    setWorking(true);
    setMessage("");

    try {
      if (!email.trim()) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");

      await signInEmailPassword({ email, password });
      window.location.assign(redirectTo);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
      setWorking(false);
    }
  }

  async function social(provider: KoriSocialProvider) {
    setWorking(true);
    setMessage("");

    try {
      await startSocialSignIn(provider, redirectTo);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start social sign-in.",
      );
      setWorking(false);
    }
  }

  return (
    <div className="ko-sign-in-form">
      <div className="ko-social-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => void social("google")}
        >
          <img src="/assets/onboarding/shared/google.svg" alt="" />
          Google
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => void social("linkedin_oidc")}
        >
          <img src="/assets/onboarding/shared/linkedin.svg" alt="" />
          LinkedIn
        </button>
      </div>

      <div className="ko-divider">
        <span>OR CONTINUE WITH EMAIL</span>
      </div>

      <label className="ko-field">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="ko-field">
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="ko-primary"
        disabled={busy}
        onClick={() => void emailSignIn()}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>

      {message ? (
        <p className="ko-message" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
