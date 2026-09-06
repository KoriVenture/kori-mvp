export function Completion({
  founder = false,
  firstName = "",
}: {
  founder?: boolean;
  firstName?: string;
}) {
  const dashboardHref = founder
    ? "/dashboard?role=founder"
    : "/dashboard?role=investor";
  const rows = founder
    ? [
        ["Email verified", "Complete", "ok"],
        ["Founder profile", "Complete", "ok"],
        ["Startup profile", "Complete", "ok"],
        ["Startup documents", "Recorded", "determined"],
        ["Wallet role", "Deal specific", "pending"],
      ]
    : [
        ["Account secured", "Complete", "ok"],
        ["Investor profile", "Complete", "ok"],
        ["Email verification", "Complete", "ok"],
        ["Investment eligibility", "Self-declared", "determined"],
      ];

  return (
    <main className="kori-onboarding ko-completion">
      <div className="ko-completion__mark">
        <span className="ko-completion__line" />
        <span className="ko-knot">
          <img src="/assets/onboarding/investor/completion-mark.svg" alt="" />
        </span>
      </div>

      <div className="ko-completion__intro">
        <h1>
          Welcome to Kori, {firstName || (founder ? "Founder" : "Investor")}.
        </h1>
        <p>
          Your onboarding information is saved. Open the deal workspace and
          connect the Stellar wallet assigned to your role for the selected SPV.
        </p>
      </div>

      <div className="ko-completion__columns">
        <section className="ko-checklist">
          <h2>ONBOARDING CHECKLIST</h2>
          {rows.map(([label, status, className]) => (
            <div key={label}>
              <span>{label}</span>
              <b className={className}>● {status}</b>
            </div>
          ))}
        </section>

        <section className="ko-next-steps">
          <h2>NEXT STEP</h2>
          <a href={dashboardHref}>
            <img src="/assets/onboarding/investor/wallet.svg" alt="" />
            <span>
              <strong>Open the Stellar workspace</strong>
              <small>
                Select a Testnet SPV, connect Freighter, and follow its scenario
                guide.
              </small>
            </span>
            <img src="/assets/onboarding/investor/arrow-right.svg" alt="" />
          </a>
        </section>
      </div>

      <a className="ko-profile-button" href={dashboardHref}>
        Open deal workspace
      </a>

      <footer className="ko-completion__footer">
        <span>Kori</span>
        <i />
        <small>Collective intelligence moves capital.</small>
      </footer>
    </main>
  );
}
