export function CompletionStep({ firstName }: { firstName: string }) {
  return (
    <main className="kori-onboarding ko-completion">
      <div className="ko-completion__mark">
        <span className="ko-completion__line" />
        <span className="ko-knot">
          <img src="/assets/onboarding/investor/completion-mark.svg" alt="" />
        </span>
      </div>

      <div className="ko-completion__intro">
        <h1>Welcome to Kori, {firstName || "Investor"}.</h1>
        <p>
          Your investor account has been created. You can now explore the
          network, refine your investment profile, and discover opportunities
          aligned with your interests.
        </p>
      </div>

      <div className="ko-completion__columns">
        <section className="ko-checklist">
          <h2>ONBOARDING CHECKLIST</h2>
          <div><span>Account secured</span><b className="ok">● Complete</b></div>
          <div><span>Investor profile</span><b className="ok">● Complete</b></div>
          <div><span>Identity verification</span><b className="deferred">● Deferred</b></div>
          <div><span>Investment eligibility</span><b className="determined">● Determined</b></div>
          <div><span>Funding method</span><b className="pending">● Not connected</b></div>
        </section>

        <section className="ko-next-steps">
          <h2>SUGGESTED NEXT STEPS</h2>
          <a href="#network">
            <img src="/assets/onboarding/investor/users.svg" alt="" />
            <span>
              <strong>Meet the network</strong>
              <small>Find investors, regional fund managers, and technical experts with complementary knowledge.</small>
            </span>
            <img src="/assets/onboarding/investor/arrow-right.svg" alt="" />
          </a>
          <div>
            <img src="/assets/onboarding/investor/wallet.svg" alt="" />
            <span>
              <strong>Prepare to invest</strong>
              <small>Funding and investment execution remain separate future capabilities.</small>
            </span>
            <img src="/assets/onboarding/investor/arrow-right.svg" alt="" />
          </div>
        </section>
      </div>

      <a className="ko-profile-button" href="/profile?role=investor">
        My profile
      </a>

      <footer className="ko-completion__footer">
        <span>Kori</span><i /><small>Collective intelligence moves capital.</small>
      </footer>
    </main>
  );
}
