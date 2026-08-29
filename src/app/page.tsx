import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "Kori · Collective intelligence moves capital",
  description:
    "Kori is collective investment infrastructure connecting distributed expertise, trusted networks and accountable capital across borders.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kori · Collective intelligence moves capital",
    description:
      "Investment infrastructure for communities of expertise, beginning across African and Caribbean markets.",
    url: "/",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kori · Collective intelligence moves capital",
    description:
      "Investment infrastructure for communities of expertise, beginning across African and Caribbean markets.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function HomePage() {
  return (
    <SiteFrame ghost>
      <section className="hero light-room" data-bg="#F7F3EC" data-dark="0">
        <span className="k anim-text-up">
          Collective investment infrastructure
        </span>
        <h1 className="anim-text-up d1">
          Collective intelligence <span className="warm">moves capital.</span>
        </h1>
        <p className="lead anim-text-up d2">
          Connecting distributed expertise, trusted networks and accountable
          capital across borders, beginning across African and Caribbean
          markets.
        </p>
        <span className="hand anim-text-up d3">
          go where your capital couldn&apos;t go alone.{" "}
          <b>invest beyond your network, with trust.</b>
        </span>
        <div className="ctas anim-text-up d3">
          <a className="btn" href="/join">
            Join the network
          </a>
          <a className="textlink" href="/collective-intelligence">
            Read the thesis
          </a>
        </div>
        <div className="hint">
          <div className="mouse">
            <div className="wheel" />
          </div>
          <span>The gap</span>
        </div>
      </section>

      <section className="room light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="roomwrap">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-coral" />
            The structural gap
          </span>
          <div className="gap3">
            <div className="gapcard anim-text-up d1">
              <span className="tick">01</span>
              <h3 className="mt-12">Knowledge is distributed</h3>
              <p>
                No single investor holds every piece of market, technical and
                local operating context.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">02</span>
              <h3 className="mt-12">Access is uneven</h3>
              <p>
                Strong opportunities remain difficult to evaluate when they sit
                beyond familiar networks.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">03</span>
              <h3 className="mt-12">Capital needs structure</h3>
              <p>
                Cross-border conviction needs shared evidence, governance and
                an accountable path to deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="room dark-room card-theme-forest"
        data-bg="#0B3332"
        data-dark="1"
      >
        <div className="roomwrap">
          <div className="card anim-text-up">
            <span className="eyebrow">
              <i className="dot-teal" />
              The solution
            </span>
            <h2 className="big">
              Capital becomes <em>architecture.</em>
            </h2>
            <p className="lead">
              Kori helps networks combine expertise, conduct shared diligence
              and coordinate capital through governed investment structures.
              Evidence stays visible from first signal through execution.
            </p>
            <span className="hand color-teal-light">
              prosperity emerges when knowledge flows together
            </span>
          </div>
        </div>
      </section>

      <section
        className="room dark-room card-theme-plum"
        data-bg="#5F5974"
        data-dark="1"
      >
        <div className="roomwrap">
          <div className="card anim-text-up">
            <span className="eyebrow">
              <i className="dot-lilac" />
              Featured opportunity / 06
            </span>
            <h2 className="big">
              The markets you understand <em>differently.</em>
            </h2>
            <p className="lead">
              Discover founders solving problems you care about, near you and
              across the world.
            </p>
            <div className="tagrow">
              <span>01 Expertise</span>
              <span>02 Network</span>
              <span>03 Discovery</span>
            </div>
            <span className="hand color-lilac mt-18">the people are the map</span>
          </div>
        </div>
      </section>

      <section
        className="room dark-room card-theme-cocoa"
        data-bg="#564C47"
        data-dark="1"
      >
        <div className="roomwrap">
          <div className="card wide anim-text-up">
            <span className="eyebrow">
              <i className="dot-peach" />
              How it works
            </span>
            <h2 className="big">
              Markets are understood <em>by people.</em>
            </h2>
            <p className="lead">
              Kori turns distributed expertise into shared investment
              decisions, and shared decisions into governed, milestone-based
              capital.
            </p>
            <div className="steps-grid">
              <div className="step"><span className="badge">1</span><h4>Contribute</h4><p>Experts contribute signals and evidence.</p></div>
              <div className="step"><span className="badge">2</span><h4>Evaluate</h4><p>Investors conduct shared diligence.</p></div>
              <div className="step"><span className="badge">3</span><h4>Structure</h4><p>The group forms a governed SPV.</p></div>
              <div className="step"><span className="badge">4</span><h4>Commit</h4><p>Investors commit through compliant onboarding.</p></div>
              <div className="step"><span className="badge">5</span><h4>Settle</h4><p>Capital settles across borders.</p></div>
              <div className="step"><span className="badge">6</span><h4>Release</h4><p>Funds are released against verified milestones.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="finale" data-bg="#030C12" data-dark="1">
        <h2 className="anim-text-up">
          Build the future.
          <br />
          <span className="own">Own it.</span>
        </h2>
        <p className="lead anim-text-up d1">
          Join the founders, investors, experts and communities shaping a more
          connected way to invest across borders.
        </p>
        <span className="hand anim-text-up d2">
          the network is already listening for you
        </span>
        <br />
        <a className="btn bold anim-text-up d3" href="/join">
          Join the network
        </a>
      </section>
    </SiteFrame>
  );
}
