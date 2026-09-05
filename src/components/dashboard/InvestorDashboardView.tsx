import { DealFundingPanel } from "@/components/stellar/DealFundingPanel";

type DashboardProfile = {
  legal_first_name?: string | null;
  legal_last_name?: string | null;
  photo_path?: string | null;
};

type DashboardInvestor = {
  investor_type?: string | null;
};

function profilePhotoUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  return `${base}/storage/v1/object/public/profile-photos/${path}`;
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      className="dashboard-status-icon"
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
    >
      <path
        d="M9.9996 3L4.50015 8.4996L2.0004 5.99978"
        stroke="#049C9F"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden
      className="dashboard-status-icon"
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
    >
      <path
        d="M6 2.99976V6L8.00016 7.00008M11.0004 6C11.0004 8.76164 8.76164 11.0004 6 11.0004C3.23836 11.0004 0.9996 8.76164 0.9996 6C0.9996 3.23836 3.23836 0.9996 6 0.9996C8.76164 0.9996 11.0004 3.23836 11.0004 6Z"
        stroke="#FF9815"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Visual shell transcribed from:
 * KoriVenture/Figma_fronted
 * branch: create_investor_account_flo
 * path: imports/index.tsx
 * component: AppMockup (ProductExperience)
 *
 * The records below are Figma fixture content only. They are not written to
 * Supabase and must not be interpreted as live portfolio, diligence, KYC,
 * wallet, SPV, or financial records.
 */
export function InvestorDashboardView({
  profile,
  investor,
}: {
  profile: DashboardProfile;
  investor: DashboardInvestor | null;
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

  return (
    <main className="kori-onboarding investor-dashboard-page">
      <section className="investor-dashboard" aria-label="Kori investor dashboard">
        <header className="investor-dashboard-topbar">
          <div className="dashboard-interface-label">
            <span className="dashboard-window-dot dashboard-window-dot--red" />
            <span className="dashboard-window-dot dashboard-window-dot--yellow" />
            <span className="dashboard-window-dot dashboard-window-dot--green" />
            <span className="dashboard-window-divider" />
            <strong>KORI INTERFACE v1.2</strong>
          </div>

          <nav className="dashboard-tabs" aria-label="Investor workspace">
            <a href="#discover">Discover</a>
            <a className="active" href="#diligence">Diligence</a>
            <a href="#invest">Invest</a>
            <a href="#monitor">Monitor</a>
          </nav>

          <div className="dashboard-account">
            <span>Bal: $2,840,000</span>
            <a
              className="dashboard-account-avatar"
              href="/profile?role=investor"
              aria-label={name ? `${name} profile` : "Investor profile"}
              title={investor?.investor_type || "Investor"}
            >
              {photo ? <img src={photo} alt="" /> : initials}
            </a>
          </div>
        </header>

        <div className="investor-dashboard-body">
          <aside className="dashboard-sidebar">
            <section id="discover" className="dashboard-sidebar-section">
              <h2>ACTIVE OPPORTUNITIES</h2>
              <a className="dashboard-opportunity active" href="#diligence">
                Logistic Transport Kigali
              </a>
              <a className="dashboard-opportunity" href="#diligence">
                Solar Grid Kingston
              </a>
              <a className="dashboard-opportunity" href="#diligence">
                Agro-processing Accra
              </a>
            </section>

            <section className="dashboard-sidebar-section">
              <h2>DILIGENCE ROOMS</h2>
              <p>• Technical Feasibility</p>
              <p className="active-room">• Off-take Agreement</p>
              <p>• Sovereign Risk Audit</p>
            </section>
          </aside>

          <section id="diligence" className="dashboard-main">
            <header className="dashboard-room-header">
              <div>
                <h1>Off-take Agreement &amp; Proof of Revenue</h1>
                <p>ROOM ID: # Kigali-Transport-Diligence</p>
              </div>
              <span className="dashboard-verified-badge">89.4% VERIFIED</span>
            </header>

            <div className="dashboard-detail-grid">
              <section className="dashboard-panel">
                <h2>EVIDENCE LOG</h2>
                <div className="dashboard-evidence-list">
                  <div className="dashboard-evidence-row">
                    <span><CheckIcon />Bowmans Legal Verification</span>
                    <small>Document</small>
                  </div>
                  <div className="dashboard-evidence-row">
                    <span><CheckIcon />Kigali Commuter Count Audit</span>
                    <small>On-site GPS</small>
                  </div>
                  <div className="dashboard-evidence-row">
                    <span><ClockIcon />Central Bank Forex Risk Model</span>
                    <small>Financial</small>
                  </div>
                </div>
              </section>

              <section className="dashboard-panel">
                <h2>SPV PROGRESS</h2>
                <div className="dashboard-spv">
                  <div>
                    <span>Minimum Quorum</span>
                    <strong>$1.0M Achieved</strong>
                  </div>
                  <div>
                    <span>Target Allocation</span>
                    <strong>$1.5M Max</strong>
                  </div>
                  <div className="dashboard-commitments">
                    <div>
                      <span>Current Commitments</span>
                      <strong>82.6%</strong>
                    </div>
                    <div className="dashboard-progress-track">
                      <span />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <DealFundingPanel />
          </section>
        </div>
      </section>
    </main>
  );
}
