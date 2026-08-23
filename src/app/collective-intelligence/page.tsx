import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "Collective intelligence · Kori",
  description: "Why Kori treats distributed expertise as investment infrastructure.",
  alternates: { canonical: "/collective-intelligence" },
  openGraph: {
    title: "Collective intelligence · Kori",
    description:
      "Different people hold different pieces of investment-relevant evidence. Kori gives those pieces a shared structure.",
    url: "/collective-intelligence",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collective intelligence · Kori",
    description:
      "Different people hold different pieces of investment-relevant evidence. Kori gives those pieces a shared structure.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function CollectiveIntelligencePage() {
  return (
    <SiteFrame>
      <section className="page-hero light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="inner">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-teal" />
            The Kori thesis
          </span>
          <h1 className="anim-text-up d1">
            Markets are understood <span className="warm">by people.</span>
          </h1>
          <p className="lead anim-text-up d2">
            Market knowledge is distributed. No single vantage point holds
            enough financial, technical, commercial and local context to
            understand every opportunity alone.
          </p>
        </div>
      </section>

      <section
        className="room compact dark-room bg-forest"
        data-bg="#0B3332"
        data-dark="1"
      >
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow">
              <i className="dot-teal" />
              The problem
            </span>
            <h2 className="big">
              Evidence exists. It rarely <em>arrives in one room.</em>
            </h2>
            <p className="lead">
              Sector experts understand the industry. Local operators
              understand the terrain. Founders understand the execution
              constraints. Investors understand risk and capital structure.
            </p>
            <p className="lead">
              Kori&apos;s role is not to replace those perspectives with one
              automated answer. It is to give their evidence a common decision
              structure.
            </p>
          </div>
        </div>
      </section>

      <section
        className="room compact dark-room bg-midnight"
        data-bg="#030C12"
        data-dark="1"
      >
        <div className="roomwrap center-room">
          <span className="eyebrow anim-text-up">
            <i className="dot-cyan" />
            The intelligence network
          </span>
          <h2 className="big anim-text-up d1 center-h2-20">
            Every voice holds <em>a different piece.</em>
          </h2>
          <div className="voices anim-text-up d2">
            <span>Sector experts</span>
            <span>Local operators</span>
            <span>Diaspora professionals</span>
            <span>Founders</span>
            <span>Investment communities</span>
            <span>Independent specialists</span>
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
              The principles
            </span>
            <h2 className="big">
              Three rules the <em>structure follows.</em>
            </h2>
          </div>
          <div className="grid3">
            <div className="gapcard anim-text-up d1">
              <span className="tick">01</span>
              <h3 className="mt-12">Evidence before confidence</h3>
              <p>
                Contributions should be attributable, inspectable and connected
                to the environment that produced them.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">02</span>
              <h3 className="mt-12">Context before scoring</h3>
              <p>
                A visible reasoning path is more useful than a black-box number
                that hides uncertainty.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">03</span>
              <h3 className="mt-12">Governance before movement</h3>
              <p>
                Shared conviction becomes investable only when decisions,
                responsibilities and capital rules are explicit.
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
              <i className="dot-orange" />
              See it in motion
            </span>
            <h2 className="mt-14">
              See intelligence <em>become action.</em>
            </h2>
            <p>Follow the path from signal to accountable capital.</p>
          </div>
          <div className="acts anim-text-up d2">
            <a className="btn bold" href="/how-kori-works">
              How Kori works
            </a>
            <a className="textlink" href="/join">
              Join the network
            </a>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
