export function Completion({ founder = false }: { founder?: boolean }) {
  const rows = founder
    ? [["Account secured", "Complete"], ["Founder profile", "Complete"], ["Startup profile", "Complete"], ["Blockchain role", "Startup"]]
    : [["Account secured", "Complete"], ["Investor profile", "Complete"], ["Email verification", "Complete"], ["Investment eligibility", "Self-declared"]];
  const dashboardHref = founder ? "/dashboard?role=founder" : "/dashboard?role=investor";
  return <main className="completion"><div className="completion-line" /><span className="completion-mark"><img src="/assets/onboarding/investor/completion-mark.svg" alt="" /></span><div className="completion-copy"><h1>Your Kori profile is ready.</h1><p>Your onboarding information has been saved. Open the Testnet workspace to participate in the live deal lifecycle.</p></div><section className="checklist">{rows.map(([label, status]) => <div key={label}><span>{label}</span><b>{status}</b></div>)}</section><a className="completion-button" href={dashboardHref}>Open deal workspace →</a></main>;
}
