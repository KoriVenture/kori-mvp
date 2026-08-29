type Variant =
  | "network-basic"
  | "network-alignment"
  | "eligibility"
  | "review";

type EditorialCopy = {
  title: [string, string];
  paragraph: string;
  chipA: string;
  chipB?: string;
  footer: string;
  cardA: [string, string];
  cardB: [string, string];
};

const copy: Record<Variant, EditorialCopy> = {
  "network-basic": {
    title: ["Invest with context.", "Build conviction together."],
    paragraph:
      "Join a trusted network where global capital meets verified domain expertise and collective market evidence.",
    chipA: "Fintech Corridor",
    footer: "VERIFIED EVIDENCE",
    cardA: ["REGIONAL", "Lagos - Nairobi trade corr."],
    cardB: ["CO-INVESTORS", "12 Active syndicates"],
  },
  "network-alignment": {
    title: ["Invest with context.", "Build conviction together."],
    paragraph:
      "Join a trusted network where global capital meets verified domain expertise and collective market evidence.",
    chipA: "Fintech Corridor",
    chipB: "West Africa · 88% Alignment",
    footer: "VERIFIED EVIDENCE",
    cardA: ["REGIONAL", "Lagos - Nairobi trade corr."],
    cardB: ["CO-INVESTORS", "12 Active syndicates"],
  },
  eligibility: {
    title: ["Rigorous criteria.", "Frictionless process."],
    paragraph:
      "Kori supports structured eligibility review without unnecessary complexity.",
    chipA: "Collective Diligence",
    chipB: "SECURE ELIGIBILITY",
    footer: "ACCOUNT SAFEGUARDS",
    cardA: ["SECURITY", "Security controls enabled"],
    cardB: ["COMPLIANCE", "Review in progress"],
  },
  review: {
    title: ["Rigorous criteria.", "Frictionless process."],
    paragraph:
      "Review your information and agreements before completing your Kori investor profile.",
    chipA: "Collective Diligence",
    chipB: "REVIEW & SIGN",
    footer: "FINAL ACCOUNT REVIEW",
    cardA: ["SECURITY", "Security controls enabled"],
    cardB: ["COMPLIANCE", "Information submitted"],
  },
};

export function EditorialPanel({
  variant = "network-basic",
}: {
  variant?: Variant;
}) {
  const c = copy[variant];

  return (
    <aside className="ko-editorial">
      <header className="ko-editorial__header">
        <img
          className="ko-editorial__logo"
          src="/assets/onboarding/shared/kori-logo.svg"
          alt="Kori"
        />
        <span className="ko-support">
          <img
            src="/assets/onboarding/shared/help-circle.svg"
            alt=""
          />
          Support
        </span>
      </header>

      <div className="ko-editorial__middle">
        <div className="ko-network" aria-hidden="true">
          <div className="ko-network__avatars">
            {[1, 2, 3].map((index) => (
              <img
                key={index}
                src={`/assets/onboarding/investor/avatar-${index}.png`}
                alt=""
              />
            ))}
          </div>

          <span className="ko-network__chip ko-network__chip--a">
            {c.chipA}
          </span>
          {c.chipB ? (
            <span className="ko-network__chip ko-network__chip--b">
              {c.chipB}
            </span>
          ) : null}

          <span className="ko-network__line ko-network__line--1" />
          <span className="ko-network__line ko-network__line--2" />
          <span className="ko-network__line ko-network__line--3" />
          <span className="ko-network__line ko-network__line--4" />
          <span className="ko-network__node ko-network__node--a" />
          <span className="ko-network__node ko-network__node--b" />
        </div>

        <div className="ko-editorial__story">
          <h2>
            {c.title[0]}
            <br />
            {c.title[1]}
          </h2>
          <p>{c.paragraph}</p>
        </div>
      </div>

      <footer className="ko-evidence">
        <span className="ko-evidence__label">{c.footer}</span>
        <div className="ko-evidence__cards">
          <article>
            <strong>{c.cardA[0]}</strong>
            <span>{c.cardA[1]}</span>
          </article>
          <article>
            <strong>{c.cardB[0]}</strong>
            <span>{c.cardB[1]}</span>
          </article>
        </div>
      </footer>
    </aside>
  );
}
