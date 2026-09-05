export function Completion({ founder = false }: { founder?: boolean }) {
  const rows = founder
    ? [
        ["Account secured", "Complete"],
        ["Founder profile", "Complete"],
        ["Startup profile", "Complete"],
        ["Startup documents", "Complete"],
      ]
    : [
        ["Account secured", "Complete"],
        ["Investor profile", "Complete"],
        ["Identity verification", "Deferred for MVP"],
        ["Investment eligibility", "Self-declared"],
      ];
  const profileHref = founder
    ? "/profile?role=founder"
    : "/profile?role=investor";

  return (
    <main className="kori-onboarding ko-completion ko-founder-completion">
      <div className="ko-completion__line" />
      <span className="ko-knot">
        <img
          src="/assets/onboarding/investor/completion-mark.svg"
          alt=""
        />
      </span>
      <div className="ko-completion__intro">
        <h1>Your Kori profile is ready.</h1>
        <p>
          Your onboarding information has been saved. Kori is an MVP
          demonstration and does not handle real funds or provide financial
          advice.
        </p>
      </div>
      <section className="ko-checklist ko-founder-checklist">
        {rows.map(([label, status]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{status}</b>
          </div>
        ))}
      </section>
      <a className="ko-profile-button" href={profileHref}>
        My profile →
      </a>
    </main>
  );
}
