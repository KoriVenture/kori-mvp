"use client";

import { passkey, serializeCredential } from "@auth0/nextjs-auth0/client";
import { useState } from "react";

import {
  securityReauthUrl,
  type PublicRole,
} from "@/lib/onboarding/auth-links";

export type AuthSecurityState = {
  email: string | null;
  emailVerified: boolean;
};

export function AuthSecurityStep({
  role,
  auth,
}: {
  role: PublicRole;
  auth: AuthSecurityState;
}) {
  const [passkeyMessage, setPasskeyMessage] = useState("");
  const [passkeyBusy, setPasskeyBusy] = useState(false);

  async function addPasskey() {
    setPasskeyMessage("");
    setPasskeyBusy(true);

    try {
      if (
        typeof PublicKeyCredential === "undefined" ||
        typeof PublicKeyCredential.parseCreationOptionsFromJSON !== "function"
      ) {
        throw new Error(
          "This browser does not support the required passkey API.",
        );
      }

      const challenge = await passkey.enrollmentChallenge();
      const publicKey =
        PublicKeyCredential.parseCreationOptionsFromJSON(
          challenge.authnParamsPublicKey as PublicKeyCredentialCreationOptionsJSON,
        );
      const credential = await navigator.credentials.create({ publicKey });

      if (!(credential instanceof PublicKeyCredential)) {
        throw new Error("Passkey creation was cancelled.");
      }

      await passkey.enrollmentVerify({
        authenticationMethodId: challenge.authenticationMethodId,
        authSession: challenge.authSession,
        authResponse: serializeCredential(credential),
      });

      setPasskeyMessage("Passkey added successfully.");
    } catch (error) {
      setPasskeyMessage(
        error instanceof Error ? error.message : "Unable to add passkey.",
      );
    } finally {
      setPasskeyBusy(false);
    }
  }

  return (
    <>
      <section className="form-section">
        <h3>Email one-time code</h3>

        <div className="notice">
          <b>
            {auth.emailVerified
              ? "Email verified"
              : "Email verification required"}
          </b>
          <p>{auth.email || "Authenticated email"}</p>
          <p>The signup OTP is generated and verified by Auth0.</p>
        </div>
      </section>

      <section className="form-section">
        <h3>Passkey</h3>
        <p>Add a phishing-resistant passkey to this Auth0 account.</p>

        <button
          type="button"
          className="secondary-button full"
          disabled={!auth.emailVerified || passkeyBusy}
          onClick={addPasskey}
        >
          {passkeyBusy ? "Adding passkey…" : "Add a passkey"}
        </button>

        {passkeyMessage && <p role="status">{passkeyMessage}</p>}
      </section>

      <section className="form-section">
        <h3>Authenticator App</h3>
        <p>
          TOTP enrollment and challenges are enforced by the Auth0 MFA policy
          when enabled.
        </p>

        <a className="secondary-button full" href={securityReauthUrl(role)}>
          Open secure MFA flow
        </a>
      </section>

      <section className="form-section">
        <h3>SMS Backup</h3>
        <p>
          SMS enrollment and challenges are managed by Auth0 when the factor is
          available and enabled.
        </p>
      </section>
    </>
  );
}
