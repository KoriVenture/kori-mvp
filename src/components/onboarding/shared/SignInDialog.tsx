"use client";

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { SignInForm } from "./SignInForm";

export function SignInDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
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

        <SignInForm onBusyChange={setBusy} />
      </section>
    </div>
  );
}
