"use client";

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  beginPhoneEnrollment,
  cancelMfaEnrollment,
  type PhoneEnrollment,
  type TotpEnrollment,
  verifyPhoneEnrollment,
  verifyTotpEnrollment,
} from "@/lib/auth/security";

type Method = "totp" | "sms";

export function SecurityEnrollmentDialog({
  method,
  totpEnrollment,
  onCancel,
  onComplete,
}: {
  method: Method | null;
  totpEnrollment: TotpEnrollment | null;
  onCancel: () => Promise<void> | void;
  onComplete: () => Promise<void>;
}) {
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneEnrollment, setPhoneEnrollment] =
    useState<PhoneEnrollment | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!method) return;

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
  }, [method]);

  if (!method) return null;

  async function cancel() {
    if (working) return;

    if (totpEnrollment?.factorId) {
      await cancelMfaEnrollment(
        totpEnrollment.factorId,
      );
    }

    if (phoneEnrollment?.factorId) {
      await cancelMfaEnrollment(
        phoneEnrollment.factorId,
      );
    }

    setCode("");
    setPhone("");
    setMessage("");
    setPhoneEnrollment(null);
    await onCancel();
  }

  function handleDialogKeyDown(
    event: KeyboardEvent<HTMLElement>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!working) void cancel();
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

  async function verifyTotp() {
    if (!totpEnrollment) return;

    setWorking(true);
    setMessage("");

    try {
      await verifyTotpEnrollment({
        factorId: totpEnrollment.factorId,
        code,
      });
      await onComplete();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify authenticator code.",
      );
      setWorking(false);
    }
  }

  async function sendSms() {
    setWorking(true);
    setMessage("");

    try {
      const enrollment =
        await beginPhoneEnrollment(phone);
      setPhoneEnrollment(enrollment);
      setCode("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to send SMS verification code.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function verifySms() {
    if (!phoneEnrollment) return;

    setWorking(true);
    setMessage("");

    try {
      await verifyPhoneEnrollment({
        factorId: phoneEnrollment.factorId,
        challengeId:
          phoneEnrollment.challengeId,
        code,
      });
      await onComplete();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify SMS code.",
      );
      setWorking(false);
    }
  }

  return (
    <div className="kori-onboarding ko-dialog-backdrop">
      <section
        ref={dialogRef}
        className="ko-dialog ko-security-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ko-security-dialog-title"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
      >
        <header className="ko-dialog__header">
          <h2 id="ko-security-dialog-title">
            {method === "totp"
              ? "Set up Authenticator App"
              : "Set up SMS Backup"}
          </h2>

          <button
            type="button"
            className="ko-dialog__close"
            aria-label="Close security setup"
            disabled={working}
            onClick={() => void cancel()}
          >
            ×
          </button>
        </header>

        {method === "totp" ? (
          <>
            {!totpEnrollment ? (
              <p className="ko-message" role="status">
                Unable to start authenticator setup.
              </p>
            ) : (
              <>
                <p className="ko-dialog__copy">
                  Scan this code with Google
                  Authenticator, 1Password, Authy,
                  or another TOTP authenticator.
                </p>

                <img
                  className="ko-totp-qr"
                  src={totpEnrollment.qrCode}
                  alt="Authenticator setup QR code"
                />

                <div className="ko-totp-secret">
                  <span>Manual setup key</span>
                  <code>
                    {totpEnrollment.secret}
                  </code>
                </div>

                <label className="ko-field">
                  <span>
                    Six-digit authenticator code
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                  />
                </label>

                <button
                  type="button"
                  className="ko-primary"
                  disabled={
                    working || code.length !== 6
                  }
                  onClick={() =>
                    void verifyTotp()
                  }
                >
                  {working
                    ? "Verifying…"
                    : "Verify authenticator"}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {!phoneEnrollment ? (
              <>
                <p className="ko-dialog__copy">
                  Enter a mobile number in
                  international format.
                </p>

                <label className="ko-field">
                  <span>Mobile phone</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 514 555 0123"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="ko-primary"
                  disabled={
                    working || !phone.trim()
                  }
                  onClick={() => void sendSms()}
                >
                  {working
                    ? "Sending…"
                    : "Send verification code"}
                </button>
              </>
            ) : (
              <>
                <p className="ko-dialog__copy">
                  Enter the six-digit code sent to{" "}
                  <strong>
                    {phoneEnrollment.phone}
                  </strong>
                  .
                </p>

                <label className="ko-field">
                  <span>SMS verification code</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                  />
                </label>

                <button
                  type="button"
                  className="ko-primary"
                  disabled={
                    working || code.length !== 6
                  }
                  onClick={() =>
                    void verifySms()
                  }
                >
                  {working
                    ? "Verifying…"
                    : "Verify SMS code"}
                </button>
              </>
            )}
          </>
        )}

        {message ? (
          <p className="ko-message" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="button"
          className="ko-secondary"
          disabled={working}
          onClick={() => void cancel()}
        >
          Cancel
        </button>
      </section>
    </div>
  );
}
