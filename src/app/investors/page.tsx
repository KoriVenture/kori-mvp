import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "For investors · Kori",
  description:
    "Kori helps investors discover under-connected founders, combine market expertise and move capital with greater accountability.",
  alternates: { canonical: "/investors" },
  openGraph: {
    title: "For investors · Kori",
    description:
      "Expand your investment universe without leaving context, evidence or trust behind.",
    url: "/investors",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "For investors · Kori",
    description:
      "Expand your investment universe without leaving context, evidence or trust behind.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function InvestorsPage() {
  return (
    <SiteFrame active="investors">
      <section className="page-hero light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="inner">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-cyan" />
            For investors
          </span>
          <h1 className="anim-text-up d1">
            Your network shouldn&apos;t define your{" "}
            <span className="warm">investment universe.</span>
          </h1>
          <p className="lead anim-text-up d2">
            Kori gives investors a better operating layer for finding
            under-connected founders, building conviction across local and
            global knowledge, and moving capital with more accountability.
          </p>
          <div className="ctas anim-text-up d3">
            <a className="btn" href="/onboarding/investor">
              Join as an investor
            </a>
            <a className="textlink" href="/how-kori-works">
              See how Kori works
            </a>
          </div>
        </div>
      </section>

      <section
        className="room compact dark-room bg-plum"
        data-bg="#5F5974"
        data-dark="1"
      >
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow">
              <i className="dot-lilac" />
              Investor priorities
            </span>
            <h2 className="big">
              A more complete path from <em>signal to capital.</em>
            </h2>
            <p className="lead">
              Your next opportunity is not always next to your current network.
              The challenge is not a lack of ambition, it is a lack of access
              to the right intelligence, the right people, and the right
              operating structure.
            </p>
            <p className="lead">
              Kori helps investors move from scattered market signals to a
              governed investment decision. It brings more intelligence into
              the room before capital is deployed and keeps the capital story
              visible after the cheque is written.
            </p>
          </div>

          <div className="flowbox anim-text-up d1">
            <span className="eyebrow">
              <i className="dot-orange" />
              Investor priorities
            </span>
            <p className="arrow">Know more before you commit.</p>
            <p className="note">
              Kori creates a decision architecture for discovery, diligence,
              collective investment, and live portfolio intelligence.
            </p>
          </div>

          <div className="fsteps">
            <div className="fstep anim-text-up d1">
              <span className="n">01</span>
              <span className="w">Find</span>
            </div>
            <div className="fstep anim-text-up d2">
              <span className="n">02</span>
              <span className="w">Decide</span>
            </div>
            <div className="fstep anim-text-up d3">
              <span className="n">03</span>
              <span className="w">Track</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="room compact light-room bg-sand"
        data-bg="#E8E0D5"
        data-dark="0"
      >
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow">
              <i className="dot-orange" />
              What Kori solves
            </span>
            <h2 className="big">
              The operating problems <em>Kori solves.</em>
            </h2>
          </div>

          <div className="grid3">
            <div className="gapcard anim-text-up d1">
              <span className="tick">01</span>
              <h3 className="mt-12">Access</h3>
              <p>
                Discover founders, markets and investor communities beyond your
                existing network. Kori helps you build more than a list of warm
                introductions, it expands the map of where opportunity can come
                from.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">02</span>
              <h3 className="mt-12">Context</h3>
              <p>
                Get local expertise before deploying capital somewhere
                unfamiliar. Kori structures operator, market and founder
                intelligence so emerging markets are less opaque and less
                dependent on one perspective.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">03</span>
              <h3 className="mt-12">Conviction</h3>
              <p>
                Combine financial, market, technical, governance and
                local-context diligence. Instead of chasing fragments across
                conversations, Kori brings a decision record into one shared
                operating environment.
              </p>
            </div>
            <div className="gapcard anim-text-up d1">
              <span className="tick">04</span>
              <h3 className="mt-12">Execution</h3>
              <p>
                Move from discovery to diligence to SPV to investment without
                stitching together five tools. Kori aligns investor interest,
                operational proof, governance, and deal movement into a single
                flow.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">05</span>
              <h3 className="mt-12">Accountability</h3>
              <p>
                Track what happens after the cheque is written. Kori keeps the
                investment record visible after commitment, so portfolio
                movement can be monitored against milestones and operating
                realities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="endband bg-midnight"
        data-bg="#030C12"
        data-dark="1"
      >
        <div className="inner">
          <div className="anim-text-up">
            <span className="eyebrow">
              <i className="dot-cyan" />
              Join as an investor
            </span>
            <h2 className="mt-14">
              Join the next wave <em>of aligned capital.</em>
            </h2>
            <p>Bring a wider investment universe into view.</p>
          </div>
          <div className="acts anim-text-up d2">
            <a className="btn bold" href="/onboarding/investor">
              Join as an investor
            </a>
            <a className="textlink" href="/how-kori-works">
              See how Kori works
            </a>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
