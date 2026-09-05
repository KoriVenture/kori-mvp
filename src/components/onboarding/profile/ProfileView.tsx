import type { ReactNode } from "react";

type Profile = {
  email?: string | null;
  email_verified?: boolean | null;
  legal_first_name?: string | null;
  legal_last_name?: string | null;
  professional_title?: string | null;
  organization?: string | null;
  biography?: string | null;
  city?: string | null;
  country?: string | null;
  timezone?: string | null;
  photo_path?: string | null;
};

type InvestorProfile = {
  investor_type?: string | null;
  contribution_areas?: string[] | null;
  ask_me_about?: string | null;
  preferred_regions?: string[] | null;
  investment_stages?: string[] | null;
  preferred_ticket_sizes?: string[] | null;
  preferred_instruments?: string[] | null;
  investment_horizon?: string | null;
  investment_thesis?: string | null;
  investor_classification?: string | null;
  experience?: string | null;
  onboarding_status?: string | null;
};

type Startup = {
  display_name?: string | null;
  legal_name?: string | null;
  sector?: string | null;
};

function profilePhotoUrl(path: string | null | undefined) {
  if (!path) return "/assets/onboarding/investor/profile-photo.png";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "/assets/onboarding/investor/profile-photo.png";

  return `${base}/storage/v1/object/public/profile-photos/${path}`;
}

function firstNonEmpty(values: Array<string | null | undefined>, fallback: string) {
  return values.find((value) => value && value.trim())?.trim() || fallback;
}

function roleName(role: "investor" | "founder" | "admin") {
  if (role === "investor") return "Investor";
  if (role === "founder") return "Founder";
  return "Administrator";
}

function ProfileCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="profile-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ProfileView({
  role,
  profile,
  investor,
  startup,
}: {
  role: "investor" | "founder" | "admin";
  profile: Profile;
  investor?: InvestorProfile | null;
  startup?: Startup | null;
}) {
  const name =
    [profile.legal_first_name, profile.legal_last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Kori member";

  const headline = firstNonEmpty(
    [
      profile.professional_title && profile.organization
        ? `${profile.professional_title} · ${profile.organization}`
        : null,
      profile.professional_title,
      profile.organization,
      roleName(role),
    ],
    roleName(role),
  );

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const contextLine = [location, profile.timezone].filter(Boolean).join(" · ");

  const expertise =
    role === "investor" && investor?.contribution_areas?.length
      ? investor.contribution_areas
      : role === "founder" && startup?.sector
        ? [startup.sector]
        : [];

  const thesis =
    role === "investor"
      ? investor?.investment_thesis ||
        "Add your investment thesis to explain what you look for and how you evaluate opportunities."
      : role === "founder"
        ? startup
          ? `${startup.display_name || startup.legal_name || "Startup"}${startup.sector ? ` · ${startup.sector}` : ""}`
          : "Add your startup profile to give collaborators more context."
        : "Administrative profile.";

  const regions =
    role === "investor" && investor?.preferred_regions?.length
      ? investor.preferred_regions.join(", ")
      : "Not configured";

  const classification =
    role === "investor" && investor?.investor_classification
      ? investor.investor_classification
      : "Not configured";
  const dashboardHref =
    role === "founder"
      ? "/dashboard?role=founder"
      : "/dashboard?role=investor";

  return (
    <main className="kori-onboarding profile-page">
      <aside className="profile-nav">
        <img src="/assets/onboarding/shared/kori-logo.svg" alt="Kori" />
        <nav aria-label="Profile navigation">
          <a href={dashboardHref}>Home</a>
          <a className="active" href={`${dashboardHref}#discover`}>Discover</a>
          <a href={`${dashboardHref}#deals`}>Deals</a>
          <a href={`${dashboardHref}#communities`}>Communities</a>
          <a href={`${dashboardHref}#portfolio`}>Portfolio</a>
          <a href={`${dashboardHref}#wallet`}>Wallet</a>
          <a href={`${dashboardHref}#messages`}>Messages</a>
        </nav>
        <a className="profile-nav-back" href={dashboardHref}>
          ← Back to dashboard
        </a>
      </aside>

      <section className="profile-content">
        <div className="profile-cover">
          <img src="/assets/onboarding/investor/profile-cover.png" alt="" />
        </div>

        <header className="profile-identity">
          <img src={profilePhotoUrl(profile.photo_path)} alt={name} />
          <div>
            <h1>{name}</h1>
            <p>{headline}</p>
            <span>{contextLine || "Location not added"}</span>
          </div>
          <div className="profile-actions" aria-label="Profile actions">
            <button type="button" title="Connections are not enabled in this MVP">
              Connect
            </button>
            <button type="button" title="Messaging is not enabled in this MVP">
              Message
            </button>
          </div>
        </header>

        <p className="profile-bio">
          {profile.biography ||
            "Add your professional biography to help trusted collaborators understand your experience."}
        </p>

        <div className="stats" aria-label="Profile activity statistics">
          <div>
            <b>0</b>
            <span>Investments</span>
          </div>
          <div>
            <b>0</b>
            <span>Collective Diligences</span>
          </div>
          <div>
            <b>0</b>
            <span>Communities</span>
          </div>
          <div>
            <b>0</b>
            <span>Mutual Connections</span>
          </div>
        </div>

        <div className="profile-grid">
          <div>
            <ProfileCard
              title={
                role === "investor"
                  ? "Investment Thesis & Expertise"
                  : role === "founder"
                    ? "Startup & Expertise"
                    : "Profile"
              }
            >
              <div className="chips profile-chips">
                {expertise.length ? (
                  expertise.map((item) => (
                    <span className="selected" key={item}>
                      {item}
                    </span>
                  ))
                ) : (
                  <span>No expertise added</span>
                )}
              </div>
              <blockquote>“{thesis}”</blockquote>
            </ProfileCard>

            <ProfileCard title={role === "founder" ? "Startup" : "Selected Portfolio"}>
              {role === "founder" && startup ? (
                <>
                  <div className="portfolio-row">
                    <i>{(startup.display_name || startup.legal_name || "K").slice(0, 1).toUpperCase()}</i>
                    <span>
                      <b>{startup.display_name || startup.legal_name || "Startup"}</b>
                      <small>{startup.sector || "Sector not added"}</small>
                    </span>
                    <em>Founder</em>
                  </div>
                  <div className="portfolio-row profile-placeholder-row">
                    <i>—</i>
                    <span>
                      <b>No additional company record</b>
                      <small>Onboarding-only MVP</small>
                    </span>
                    <em>—</em>
                  </div>
                  <div className="portfolio-row profile-placeholder-row">
                    <i>—</i>
                    <span>
                      <b>No additional company record</b>
                      <small>Onboarding-only MVP</small>
                    </span>
                    <em>—</em>
                  </div>
                </>
              ) : (
                <>
                  {[1, 2, 3].map((index) => (
                    <div className="portfolio-row profile-placeholder-row" key={index}>
                      <i>—</i>
                      <span>
                        <b>No investment recorded</b>
                        <small>Portfolio activity is not enabled in this MVP</small>
                      </span>
                      <em>—</em>
                    </div>
                  ))}
                </>
              )}
            </ProfileCard>

            <ProfileCard title="Contributions to Collective Intelligence">
              {[1, 2, 3, 4].map((index) => (
                <div className="contribution profile-placeholder-row" key={index}>
                  <b>No contribution recorded</b>
                  <span>—</span>
                  <p>Collective diligence activity is not enabled in this MVP.</p>
                </div>
              ))}
            </ProfileCard>
          </div>

          <aside>
            <ProfileCard title="Mutual Context">
              <div className="profile-context-list">
                <p>0 Mutual Connections</p>
                <p>0 Shared Communities</p>
                <p>0 Deals you both follow</p>
              </div>
            </ProfileCard>

            <ProfileCard title="Kori Trust Passport">
              <div className="profile-trust-list">
                <p>
                  <span className={profile.email_verified ? "ok" : "deferred"}>
                    {profile.email_verified ? "✓" : "•"}
                  </span>
                  Email {profile.email_verified ? "Verified" : "Pending"}
                </p>
                <p><span className="neutral">•</span> Role {roleName(role)}</p>
                <p><span className="neutral">•</span> Classification {classification}</p>
                <p><span className="neutral">•</span> Funding Not connected</p>
              </div>
            </ProfileCard>

            <ProfileCard title="Collaboration Preferences">
              {[
                ["Co-investing", "Not configured"],
                ["Leading a syndicate", "Not configured"],
                ["Reviewing deals", "Not configured"],
                ["Mentoring founders", "Not configured"],
                ["Regional expertise", regions],
              ].map(([label, value]) => (
                <div className="preference" key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
            </ProfileCard>
          </aside>
        </div>
      </section>
    </main>
  );
}
