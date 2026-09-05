import { DealLifecycleWorkspace } from "@/components/stellar/DealLifecycleWorkspace";

type DashboardProfile = {
  legal_first_name?: string | null;
  legal_last_name?: string | null;
  photo_path?: string | null;
};

type DashboardInvestor = {
  investor_type?: string | null;
};

type DashboardPersona = "Investor" | "Fund Manager" | "Startup Founder";

function profilePhotoUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/profile-photos/${path}` : null;
}

export function InvestorDashboardView({
  profile,
  investor,
  persona,
  profileRole = "investor",
}: {
  profile: DashboardProfile;
  investor: DashboardInvestor | null;
  persona?: DashboardPersona;
  profileRole?: "investor" | "founder";
}) {
  const name = [profile.legal_first_name, profile.legal_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const photo = profilePhotoUrl(profile.photo_path);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "K";
  const activePersona =
    persona ??
    (investor?.investor_type === "fund_manager" ? "Fund Manager" : "Investor");

  return (
    <main className="kori-onboarding investor-dashboard-page">
      <section className="investor-dashboard" aria-label="Kori Stellar workspace">
        <header className="investor-dashboard-topbar">
          <div className="dashboard-interface-label">
            <span className="dashboard-window-dot dashboard-window-dot--red" />
            <span className="dashboard-window-dot dashboard-window-dot--yellow" />
            <span className="dashboard-window-dot dashboard-window-dot--green" />
            <span className="dashboard-window-divider" />
            <strong>KORI · STELLAR TESTNET</strong>
          </div>

          <nav className="dashboard-tabs" aria-label="Deal workflow">
            <a href="#funding">Fund</a>
            <a href="#evidence">Evidence</a>
            <a href="#approval">Approve</a>
            <a href="#release">Release</a>
            <a href="#refund">Refund</a>
          </nav>

          <div className="dashboard-account">
            <span>{activePersona}</span>
            <a
              className="dashboard-account-avatar"
              href={`/profile?role=${profileRole}`}
              aria-label={name ? `${name} profile` : "Kori profile"}
              title={activePersona}
            >
              {photo ? <img src={photo} alt="" /> : initials}
            </a>
          </div>
        </header>
        <DealLifecycleWorkspace />
      </section>
    </main>
  );
}
