import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "How Kori works",
  description:
    "See how Kori turns distributed expertise into shared diligence, collective investment and accountable capital deployment.",
  alternates: { canonical: "/how-kori-works" },
  openGraph: {
    title: "How Kori works",
    description:
      "From opportunity to evidence, collective commitment and visible execution.",
    url: "/how-kori-works",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/how-kori-works-hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Kori works",
    description:
      "From opportunity to evidence, collective commitment and visible execution.",
    images: ["https://koriventure.co/assets/how-kori-works-hero.png"],
  },
};

export default function HowKoriWorksPage() {
  return (
    <SiteFrame active="how-kori-works">
      <section className="page-hero light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="inner">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-orange" />
            How Kori works
          </span>
          <h1 className="anim-text-up d1">
            From scattered intelligence to{" "}
            <span className="warm">governed capital movement.</span>
          </h1>
          <p className="lead anim-text-up d2">
            Kori brings expert intelligence, community insight, and investment
            context into one operating layer so capital can move with
            visibility, discipline, and accountability.
          </p>
        </div>
        <figure className="how-hero-image anim-text-up d3">
          <img
            src="/assets/how-kori-works-hero.png"
            alt="A diverse group of investors and operators connected across global markets and industries"
            width="1680"
            height="941"
            fetchPriority="high"
          />
        </figure>
      </section>

      <section className="room compact dark-room bg-forest" data-bg="#0B3332" data-dark="1">
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow"><i className="dot-teal" />The operating view</span>
            <h2 className="big">Capital movement made visible, structured <em>and accountable.</em></h2>
            <p className="lead">
              Investment communities already hold intelligence: people know
              founders, markets, sectors, operating realities, and commercial
              relationships. What they do not always have is a common decision
              system that makes that intelligence useful before and after
              capital is committed.
            </p>
            <p className="lead">
              Kori translates scattered knowledge into a shared operating view.
              It creates the records, signals, and governance needed to move
              from opportunity to diligence to commitment and then to
              measurable execution.
            </p>
          </div>
          <div className="flowbox anim-text-up d1">
            <span className="eyebrow"><i className="dot-orange" />The decision trace</span>
            <p className="arrow">Signal → Diligence → Commitment → Release</p>
            <p className="note">
              Kori creates a decision trace that lets operators, investors, and
              communities move from raw information to governed execution
              without losing context.
            </p>
          </div>
          <div className="fsteps">
            <div className="fstep anim-text-up d1"><span className="n">01</span><span className="w">Signal</span></div>
            <div className="fstep anim-text-up d2"><span className="n">02</span><span className="w">Decide</span></div>
            <div className="fstep anim-text-up d3"><span className="n">03</span><span className="w">Release</span></div>
          </div>
        </div>
      </section>

      <section className="room compact dark-room bg-plum" data-bg="#5F5974" data-dark="1">
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow"><i className="dot-lilac" />The intelligence layer</span>
            <h2 className="big">A multi-agent model for <em>better human decisions.</em></h2>
            <p className="lead">
              Kori&apos;s intelligence layer is built around a multi-agent
              operating model that collects, interprets, and cross-checks
              signals across the business context before investors make a
              commitment.
            </p>
            <p className="lead">
              The system does not rely on a single automated model to decide
              what matters. It combines software agents, human judgement,
              investor communities, and local operating knowledge to convert
              raw information into a shared investment assessment.
            </p>
          </div>
          <div className="flowbox anim-text-up d1">
            <span className="eyebrow"><i className="dot-orange" />The analytical frame</span>
            <p className="arrow">Financial → Market → Technology → Local context → Governance</p>
            <p className="note">
              Signals are structured into a visible analytical frame so
              investors can understand what the opportunity looks like, what is
              uncertain, and what execution assumptions still need to hold.
            </p>
          </div>
          <div className="fsteps">
            <div className="fstep anim-text-up d1"><span className="n">01</span><span className="w">Collect</span></div>
            <div className="fstep anim-text-up d2"><span className="n">02</span><span className="w">Cross-check</span></div>
            <div className="fstep anim-text-up d3"><span className="n">03</span><span className="w">Assess</span></div>
          </div>
        </div>
      </section>

      <section className="room compact light-room bg-sand" data-bg="#E8E0D5" data-dark="0">
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow"><i className="dot-orange" />The five domains</span>
            <h2 className="big">What Kori considers before <em>a thesis is formed.</em></h2>
            <p className="lead">
              Those domains become a structured investment assessment rather
              than a black-box AI score. Kori attaches each signal to the
              operating environment that produced it and makes its reasoning
              visible to investors, founders, and communities.
            </p>
          </div>
          <div className="grid3">
            <div className="gapcard anim-text-up d1"><span className="tick">01</span><h3 className="mt-12">Financial</h3><p>Unit economics, runway, financial assumptions, cost structure, and revenue quality are assessed to understand what the company can defend and scale.</p></div>
            <div className="gapcard anim-text-up d2"><span className="tick">02</span><h3 className="mt-12">Market</h3><p>Market size, competition, customer behaviour, market access, and regulatory context show whether the opportunity has room to grow and whether it can be defended.</p></div>
            <div className="gapcard anim-text-up d3"><span className="tick">03</span><h3 className="mt-12">Technology</h3><p>Architecture, security, scalability, system resilience, technical readiness, and product complexity determine whether the operating platform can sustain the plan.</p></div>
            <div className="gapcard anim-text-up d1"><span className="tick">04</span><h3 className="mt-12">Local context</h3><p>Market realities, founder reputation, distribution environment, local operating constraints, customer trust, and commercial pathways reveal how execution may actually work in practice.</p></div>
            <div className="gapcard anim-text-up d2"><span className="tick">05</span><h3 className="mt-12">Governance</h3><p>Ownership, decision rights, control structures, accountability, and governance discipline tell investors whether capital can be deployed and monitored responsibly.</p></div>
          </div>
        </div>
      </section>

      <section className="room compact dark-room bg-cocoa" data-bg="#564C47" data-dark="1">
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow"><i className="dot-peach" />The Kori pathway</span>
            <h2 className="big">Seven steps from discovery <em>to a living record.</em></h2>
          </div>
          <div className="grid3">
            <div className="gapcard anim-text-up d1"><span className="tick">01</span><h3 className="mt-12">Discover</h3><p>Kori surfaces opportunities outside an investor&apos;s immediate network and places each signal in a shared market and operating context.</p></div>
            <div className="gapcard anim-text-up d2"><span className="tick">02</span><h3 className="mt-12">Build conviction together</h3><p>Investors, specialists, operators, founders and local experts contribute structured evidence to one inspectable decision record.</p></div>
            <div className="gapcard anim-text-up d3"><span className="tick">03</span><h3 className="mt-12">Invest collectively</h3><p>Aligned participants coordinate around one opportunity and, where appropriate, a governed investment vehicle or SPV.</p></div>
            <div className="gapcard anim-text-up d1"><span className="tick">04</span><h3 className="mt-12">Capital is secured</h3><p>Investor intent becomes a recorded commitment with explicit governance, participation and transaction terms.</p></div>
            <div className="gapcard anim-text-up d2"><span className="tick">05</span><h3 className="mt-12">Milestones are verified</h3><p>Founders report against agreed milestones so stakeholders can distinguish operating progress from assumptions that need to be revisited.</p></div>
            <div className="gapcard anim-text-up d3"><span className="tick">06</span><h3 className="mt-12">Capital is progressively deployed</h3><p>Where the investment structure calls for it, release decisions follow agreed governance rules and verified operating evidence.</p></div>
            <div className="gapcard anim-text-up d1"><span className="tick">07</span><h3 className="mt-12">Stay informed</h3><p>A living record of company activity, milestone status and investor decisions keeps context visible after capital is committed.</p></div>
          </div>
        </div>
      </section>

      <section className="room compact dark-room bg-midnight-card" data-bg="#030C12" data-dark="1">
        <div className="roomwrap">
          <div className="anim-text-up max-840">
            <span className="eyebrow"><i className="dot-coral" />Milestone release</span>
            <h2 className="big">Capital shouldn&apos;t move faster <em>than certainty.</em></h2>
            <p className="lead">
              Unreleased capital stays held while milestones M1 through M4 move
              through verification and governance. The final transaction
              structure determines which settlement, approval and record-keeping
              technologies are appropriate. Kori&apos;s principle stays
              constant: commitments, decisions and evidence should stay visible
              to the people responsible for them.
            </p>
          </div>
          <div className="grid3 grid-four">
            <div className="gapcard anim-text-up d1"><span className="tick">01</span><h3 className="mt-12">Commit</h3><p>Investors make a recorded commitment to an opportunity. The capital is held securely and remains visible before deployment.</p></div>
            <div className="gapcard anim-text-up d2"><span className="tick">02</span><h3 className="mt-12">Structure</h3><p>The commitment is organised through the appropriate SPV or investment vehicle, with clear governance, participation, and transaction terms.</p></div>
            <div className="gapcard anim-text-up d3"><span className="tick">03</span><h3 className="mt-12">Verify</h3><p>The company reports against agreed milestones. Evidence is reviewed, questions are resolved, and the responsible participants approve each release decision.</p></div>
            <div className="gapcard anim-text-up d1"><span className="tick">04</span><h3 className="mt-12">Release</h3><p>Capital is released progressively after each milestone is verified. The sequence stays consistent: evidence, approval, then release.</p></div>
          </div>
        </div>
      </section>

      <section className="endband bg-midnight" data-bg="#030C12" data-dark="1">
        <div className="inner">
          <div className="anim-text-up">
            <span className="eyebrow"><i className="dot-orange" />Request access</span>
            <h2 className="mt-14">Bring intelligence <em>into motion.</em></h2>
            <p>Join the capital intelligence network.</p>
          </div>
          <div className="acts anim-text-up d2">
            <a className="btn bold" href="/join">Request access</a>
            <a className="textlink" href="/collective-intelligence">Read the thesis</a>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}
