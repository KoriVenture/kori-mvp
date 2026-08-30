type Profile = {
  legal_first_name?: string | null;
  legal_last_name?: string | null;
  professional_title?: string | null;
  organization?: string | null;
  biography?: string | null;
  city?: string | null;
  country?: string | null;
  photo_path?: string | null;
};

type Startup = {
  display_name?: string | null;
  legal_name?: string | null;
  sector?: string | null;
};

function profilePhotoUrl(path: string | null | undefined) {
  if (!path) return "/assets/onboarding/investor/profile-photo.png";
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_SUPABASE_URL;
  if (!base) return "/assets/onboarding/investor/profile-photo.png";

  return `${base}/storage/v1/object/public/profile-photos/${path}`;
}

export function ProfileView({
  role,
  profile,
  startup,
}: {
  role: "investor" | "founder" | "admin";
  profile: Profile;
  startup?: Startup | null;
}) {
  const name =
    [profile.legal_first_name, profile.legal_last_name]
      .filter(Boolean)
      .join(" ") || "Kori member";

  return (
    <main className="kori-onboarding profile-page">
      <aside className="profile-nav">
        <img
          src="/assets/onboarding/shared/kori-logo.svg"
          alt="Kori"
        />
        <nav>
          <a href="/">Home</a>
          <b>My profile</b>
        </nav>
      </aside>

      <section className="profile-content">
        <div className="profile-cover">
          <img
            src="/assets/onboarding/investor/profile-cover.png"
            alt=""
          />
        </div>

        <header className="profile-identity">
          <img src={profilePhotoUrl(profile.photo_path)} alt="" />
          <div>
            <h1>{name}</h1>
            <p>
              {profile.professional_title || role}
              {profile.organization ? ` · ${profile.organization}` : ""}
            </p>
            <span>
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </span>
          </div>
        </header>

        <p className="profile-bio">
          {profile.biography ||
            "Add your professional biography to help trusted collaborators understand your experience."}
        </p>

        <div className="profile-grid">
          <div>
            <article className="profile-card">
              <h2>
                {role === "founder"
                  ? "Startup profile"
                  : "Investment profile"}
              </h2>
              {startup ? (
                <p>
                  <b>{startup.display_name || startup.legal_name}</b>
                  <br />
                  {startup.sector}
                </p>
              ) : (
                <p>No additional profile information has been added yet.</p>
              )}
            </article>
            <article className="profile-card">
              <h2>Activity</h2>
              <p>
                No portfolio, diligence, community, wallet, or capital activity
                is available in this onboarding-only MVP.
              </p>
            </article>
          </div>
          <aside>
            <article className="profile-card">
              <h2>Account</h2>
              <p>Role: {role}</p>
              {role === "admin" ? (
                <p>
                  Admin access is manually provisioned. There is no public
                  Admin onboarding.
                </p>
              ) : null}
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
