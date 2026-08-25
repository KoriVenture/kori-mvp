export function Completion({ founder = false }: { founder?: boolean }) {
  const rows = founder
    ? [["Account secured", "Complete"], ["Founder profile", "Complete"], ["Startup profile", "Complete"], ["Startup documents", "Complete"]]
    : [["Account secured", "Complete"], ["Investor profile", "Complete"], ["Identity verification", "Deferred for MVP"], ["Investment eligibility", "Self-declared"]];
  const profileHref = founder ? "/profile?role=founder" : "/profile?role=investor";
  return <main className="completion"><div className="completion-line" /><span className="completion-mark"><img src="/assets/onboarding/investor/completion-mark.svg" alt="" /></span><div className="completion-copy"><h1>Your Kori profile is ready.</h1><p>Your onboarding information has been saved. Kori is an MVP demonstration and does not handle real funds or provide financial advice.</p></div><section className="checklist">{rows.map(([label, status]) => <div key={label}><span>{label}</span><b>{status}</b></div>)}</section><a className="completion-button" href={profileHref}>My profile →</a></main>;
}
