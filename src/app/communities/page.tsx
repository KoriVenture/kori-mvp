import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "For communities · Kori",
  description:
    "Kori helps angel groups, diaspora networks and investment communities turn shared expertise into coordinated investment capacity.",
  alternates: { canonical: "/communities" },
  openGraph: {
    title: "For communities · Kori",
    description:
      "Turn collective expertise into a visible, accountable investment function.",
    url: "/communities",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "For communities · Kori",
    description:
      "Turn collective expertise into a visible, accountable investment function.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function CommunitiesPage() {
  return (
    <SiteFrame active="communities">
      <section className="page-hero light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="inner">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-teal" />
            For communities
          </span>
          <h1 className="anim-text-up d1">
            Turn your community&apos;s expertise into{" "}
            <span className="warm">investment capacity.</span>
          </h1>
          <p className="lead anim-text-up d2">
            Kori gives investor communities a structured way to create
            presence, bring members together, source opportunities, conduct
            diligence, form investment vehicles, and manage live investments.
          </p>
          <div className="ctas anim-text-up d3">
            <a className="btn" href="/join#network-form">
              Join as a community
            </a>
            <a className="textlink" href="/how-kori-works">
              See how Kori works
            </a>
          </div>
        </div>
      </section>

      <section
        className="room compact dark-room bg-cocoa"
        data-bg="#564C47"
        data-dark="1"
      >
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow">
              <i className="dot-peach" />
              The community flow
            </span>
            <h2 className="big">
              A community is more than <em>a list of people.</em>
            </h2>
            <p className="lead">
              Investor communities, from angel groups to diaspora networks,
              syndicates, clubs, emerging fund managers and professional
              communities, already hold knowledge, relationships, and judgement
              that can become capital capacity.
            </p>
            <p className="lead">
              Kori transforms that latent intelligence into an operating system
              for deal discovery, coordinated diligence, and governed
              investment decisions. Instead of operating as a disconnected
              network of email threads and spreadsheets, the community becomes
              a visible, accountable investment function.
            </p>
          </div>

          <div className="flowbox anim-text-up d1">
            <span className="eyebrow">
              <i className="dot-orange" />
              Kori community flow
            </span>
            <p className="arrow">Alignment → Intelligence → Capital</p>
            <p className="note">
              Kori helps communities create a persistent investment identity,
              coordinate decisions, and manage capital across a portfolio of
              opportunities.
            </p>
          </div>

          <div className="fsteps">
            <div className="fstep anim-text-up d1">
              <span className="n">01</span>
              <span className="w">Source</span>
            </div>
            <div className="fstep anim-text-up d2">
              <span className="n">02</span>
              <span className="w">Decide</span>
            </div>
            <div className="fstep anim-text-up d3">
              <span className="n">03</span>
              <span className="w">Manage</span>
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
              What a community can do
            </span>
            <h2 className="big">
              From shared intelligence to <em>coordinated investment.</em>
            </h2>
          </div>

          <div className="grid3">
            <div className="gapcard anim-text-up d1">
              <span className="tick">01</span>
              <h3 className="mt-12">Create presence</h3>
              <p>
                A community can establish a defined profile, operating style,
                and investment mandate inside Kori so founders and partners know
                what the group is looking for and how it evaluates
                opportunities.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">02</span>
              <h3 className="mt-12">Bring members together</h3>
              <p>
                Kori becomes the shared operating layer where members can
                organise, communicate, and review opportunity signals across
                the same decision context rather than through isolated
                channels.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">03</span>
              <h3 className="mt-12">Source opportunities</h3>
              <p>
                The community can source and classify opportunities that sit
                beyond each member&apos;s individual network. This allows
                collective intelligence to widen the field of discovery instead
                of narrowing it to familiar profiles.
              </p>
            </div>
            <div className="gapcard anim-text-up d1">
              <span className="tick">04</span>
              <h3 className="mt-12">Conduct diligence</h3>
              <p>
                Kori supports coordinated diligence across financial,
                commercial, founder, governance, local market, legal and
                technical questions. Evidence can be assembled and shared in a
                consistent way.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">05</span>
              <h3 className="mt-12">Form investment vehicles</h3>
              <p>
                Once a group identifies a strategy or target opportunity, Kori
                helps them structure a collective investment path through an
                SPV or other governed vehicle to bring capital together.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">06</span>
              <h3 className="mt-12">Manage investments</h3>
              <p>
                After commitment, communities can track company progress,
                milestone delivery, capital releases, investor reporting and
                portfolio-wide intelligence through one accountable system.
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
              <i className="dot-teal" />
              Join as a community
            </span>
            <h2 className="mt-14">
              Turn expertise <em>into capacity.</em>
            </h2>
            <p>Bring your community into a more structured capital system.</p>
          </div>
          <div className="acts anim-text-up d2">
            <a className="btn bold" href="/join#network-form">
              Join as a community
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
