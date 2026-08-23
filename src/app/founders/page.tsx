import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "For founders · Kori",
  description:
    "Kori helps founders connect with aligned investors, structure diligence and maintain accountability after capital is committed.",
  alternates: { canonical: "/founders" },
  openGraph: {
    title: "For founders · Kori",
    description:
      "Raise from investors who bring knowledge, relationships and long-term alignment.",
    url: "/founders",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "For founders · Kori",
    description:
      "Raise from investors who bring knowledge, relationships and long-term alignment.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function FoundersPage() {
  return (
    <SiteFrame active="founders">
      <section className="page-hero light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="inner">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-coral" />
            For founders
          </span>
          <h1 className="anim-text-up d1">
            Raise from investors who bring{" "}
            <span className="warm">more than capital.</span>
          </h1>
          <p className="lead anim-text-up d2">
            Kori connects founders with aligned investors, intelligence
            networks, and operating partners who can help translate early
            momentum into capital and execution.
          </p>
          <div className="ctas anim-text-up d3">
            <a className="btn" href="/onboarding/founder">
              Raise on Kori
            </a>
            <a className="textlink" href="/how-kori-works">
              See how Kori works
            </a>
          </div>
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
              The founder flow
            </span>
            <h2 className="big">
              Build a smarter path from <em>signal to scale.</em>
            </h2>
            <p className="lead">
              Founders do not need another generic investor pipeline. They need
              a system that helps them discover the right investors, understand
              what those investors care about, and turn a network of attention
              into a credible growth story.
            </p>
            <p className="lead">
              Kori gives founders a structured way to expand their investor
              universe, coordinate diligence, and maintain continuity after
              capital is committed. The goal is not only to raise, it is to
              build the right investor relationship for the next stage of the
              company.
            </p>
          </div>

          <div className="flowbox anim-text-up d1">
            <span className="eyebrow">
              <i className="dot-orange" />
              Founder flow
            </span>
            <p className="arrow">
              Access → Diligence → Investment → Execution
            </p>
            <p className="note">
              From first signal to post-investment operating rhythm, Kori helps
              founders coordinate intelligence, investor confidence, and
              milestone execution.
            </p>
          </div>

          <div className="fsteps">
            <div className="fstep anim-text-up d1">
              <span className="n">01</span>
              <span className="w">Access</span>
            </div>
            <div className="fstep anim-text-up d2">
              <span className="n">02</span>
              <span className="w">Diligence</span>
            </div>
            <div className="fstep anim-text-up d3">
              <span className="n">03</span>
              <span className="w">Execution</span>
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
              What you get
            </span>
            <h2 className="big">
              From global visibility to a{" "}
              <em>long-term capital relationship.</em>
            </h2>
          </div>

          <div className="grid3">
            <div className="gapcard anim-text-up d1">
              <span className="tick">01</span>
              <h3 className="mt-12">Access global communities</h3>
              <p>
                Founders bring their company profile into Kori and begin to
                surface their opportunity to a wider network of aligned
                investor communities, operators, advisors, and capital
                partners.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">02</span>
              <h3 className="mt-12">Structured diligence</h3>
              <p>
                Kori helps organise the company&apos;s story, evidence,
                operating context, and market intelligence into a clear
                decision framework that investors can evaluate with better
                confidence.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">03</span>
              <h3 className="mt-12">Investment</h3>
              <p>
                Once the right partners are engaged, the investors and founders
                move through a governed, transparent path toward commitment and
                resource alignment.
              </p>
            </div>
            <div className="gapcard anim-text-up d1">
              <span className="tick">04</span>
              <h3 className="mt-12">Milestone execution</h3>
              <p>
                After capital flows, Kori provides a working rhythm for
                monitoring progress, sharing operating signals, and maintaining
                accountability across the investment period.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">05</span>
              <h3 className="mt-12">Long-term investor relationship</h3>
              <p>
                Founders and investors stay connected through a shared system
                for reporting, context, decision-making, and portfolio
                intelligence beyond the initial round.
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
              <i className="dot-coral" />
              Raise on Kori
            </span>
            <h2 className="mt-14">
              Bring your next round <em>into focus.</em>
            </h2>
            <p>Raise from investors who bring more than capital.</p>
          </div>
          <div className="acts anim-text-up d2">
            <a className="btn bold" href="/join#network-form">
              Raise on Kori
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
