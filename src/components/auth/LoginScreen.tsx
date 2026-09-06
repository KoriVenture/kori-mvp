import { EditorialPanel } from "@/components/onboarding/shared/EditorialPanel";
import { SignInForm } from "@/components/onboarding/shared/SignInForm";

export function LoginScreen() {
  return (
    <main className="kori-onboarding ko-page ko-screen--login">
      <EditorialPanel variant="network-basic" />

      <section className="ko-form-panel">
        <header className="ko-topline">
          <span>Existing Kori account</span>
          <span>
            New here? <a className="ko-link ko-link--coral" href="/onboarding/investor">Investor</a>
            {" · "}
            <a className="ko-link ko-link--coral" href="/onboarding/founder">Founder</a>
          </span>
        </header>

        <div className="ko-form ko-login-form">
          <div className="ko-intro">
            <h1>Welcome back to Kori.</h1>
            <p>
              Sign in to resume your profile and open the Stellar Testnet deal
              workspace.
            </p>
          </div>

          <SignInForm redirectTo="/dashboard" />
        </div>

        <p className="ko-platform-note">Secure Platform · Stellar Testnet demo</p>
      </section>
    </main>
  );
}
