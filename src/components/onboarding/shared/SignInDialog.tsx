"use client";

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  signInEmailPassword,
  startSocialSignIn,
} from "@/lib/auth/account";

export function SignInDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const frame = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>(
          "input:not(:disabled), button:not(:disabled)",
        )
        ?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      previousFocus.current?.focus();
      previousFocus.current = null;
    };
  }, [open]);

  if (!open) return null;

  async function emailSignIn() {
    setBusy(true);
    setMessage("");

    try {
      if (!email.trim()) {
        throw new Error("Email is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      await signInEmailPassword({
        email,
        password,
      });

      window.location.assign("/profile");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
      );
      setBusy(false);
    }
  }

  async function social(
    provider: "google" | "linkedin_oidc",
  ) {
    setBusy(true);
    setMessage("");

    try {
      await startSocialSignIn(provider);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start social sign-in.",
      );
      setBusy(false);
    }
  }

  function handleDialogKeyDown(
    event: KeyboardEvent<HTMLElement>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!busy) onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const controls = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
      ) ?? [],
    );
    if (!controls.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = controls[0];
    const last = controls[controls.length - 1];

    if (
      event.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === dialogRef.current)
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="kori-onboarding ko-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="ko-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ko-sign-in-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="ko-dialog__header">
          <h2 id="ko-sign-in-title">Sign in to Kori</h2>
          <button
            type="button"
            className="ko-dialog__close"
            aria-label="Close sign in"
            disabled={busy}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="ko-social-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => void social("google")}
          >
            <img
              src="/assets/onboarding/shared/google.svg"
              alt=""
            />
            Google
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void social("linkedin_oidc")}
          >
            <img
              src="/assets/onboarding/shared/linkedin.svg"
              alt=""
            />
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </label>

        <label className="ko-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
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
      </section>
    </div>
  );
}
