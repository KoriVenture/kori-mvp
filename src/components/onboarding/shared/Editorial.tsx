export function Editorial({ founder = false }: { founder?: boolean }) {
  return (
    <aside className="ko-editorial">
      <header className="ko-editorial__header">
        <img
          className="ko-editorial__logo"
          src="/assets/onboarding/shared/kori-logo.svg"
          alt="Kori"
        />
        <span className="ko-support">
          <img src="/assets/onboarding/shared/help-circle.svg" alt="" /> Support
        </span>
      </header>
      <section className="ko-editorial__middle">
        <div className="ko-network" aria-hidden="true">
          <div className="ko-network__avatars">
            {[1, 2, 3].map((number) => (
              <img
                key={number}
                src={`/assets/onboarding/investor/avatar-${number}.png`}
                alt=""
              />
            ))}
          </div>
          <span className="ko-network__chip ko-network__chip--a">
            {founder ? "Founder Network" : "Fintech Corridor"}
          </span>
          <span className="ko-network__node ko-network__node--a" />
          <span className="ko-network__node ko-network__node--b" />
          <span className="ko-network__line ko-network__line--1" />
          <span className="ko-network__line ko-network__line--2" />
        </div>
        <div className="ko-editorial__story">
          <h2>
            {founder ? (
              <>
                Build with context.
                <br />
                Grow with aligned capital.
              </>
            ) : (
              <>
                Invest with context.
                <br />
                Build conviction together.
              </>
            )}
          </h2>
          <p>
            {founder
              ? "Create your founder and startup profile in a trusted, evidence-led environment."
              : "Join a trusted network where global capital meets verified domain expertise and collective market evidence."}
          </p>
        </div>
      </section>
      <section className="ko-evidence">
        <p className="ko-evidence__label">Verified Evidence</p>
        <div className="ko-evidence__cards">
          <article>
            <strong>Regional</strong>
            <span>Lagos - Nairobi trade corr.</span>
          </article>
          <article>
            <strong>Security</strong>
            <span>Private by design</span>
          </article>
        </div>
      </section>
    </aside>
  );
}
