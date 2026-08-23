import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "Our story · Kori",
  description:
    "Kori is building the investment infrastructure that helps expertise, trust and capital travel across borders.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Our story · Kori",
    description:
      "Why Kori had to exist: infrastructure for people to go further together.",
    url: "/about",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero-v3.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our story · Kori",
    description:
      "Why Kori had to exist: infrastructure for people to go further together.",
    images: ["https://koriventure.co/assets/about-hero-v3.jpg"],
  },
};

export default function AboutPage() {
  return (
    <SiteFrame active="about">
      <section className="page-hero light-room" data-bg="#F7F3EC" data-dark="0">
        <div className="inner">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-coral" />
            01 · Our story
          </span>
          <h1 className="anim-text-up d1">
            Capital has always moved through relationships.
            <br />
            <span className="warm">We&apos;re building better ones.</span>
          </h1>
          <p className="lead anim-text-up d2">
            Kori was born from a simple observation: extraordinary founders,
            expertise and capital exist everywhere, but they rarely meet on
            equal terms. We&apos;re building the infrastructure to invest
            beyond the limits of existing networks, without leaving trust
            behind.
          </p>
          <span className="hand anim-text-up d3 mt-20 color-ink-soft font-25">
            go where your capital couldn&apos;t go alone.
          </span>
          <div className="ctas anim-text-up d3">
            <a className="btn" href="/join">
              Join the network
            </a>
            <a className="textlink" href="/how-kori-works">
              See how Kori works
            </a>
          </div>
        </div>
      </section>

      <section
        className="room dark-room card-theme-forest"
        data-bg="#0B3332"
        data-dark="1"
      >
        <div className="roomwrap">
          <span className="eyebrow anim-text-up">
            <i className="dot-teal" />
            02 · The origin
          </span>
          <h2 className="big anim-text-up d1 mb-44">
            Kori started with <em>a contradiction.</em>
          </h2>

          <div className="split">
            <figure className="portrait anim-text-up d1">
              <figcaption>Fadjiah Collin-Mazile / Founder &amp; CEO</figcaption>
            </figure>

            <div className="card anim-text-up d2 max-none">
              <span className="eyebrow">
                <i className="dot-peach" />
                Meet the founder
              </span>
              <h3 className="about-founder-heading">
                Building the platform she wished existed as an investor.
              </h3>
              <p className="lead">
                Fadjiah&apos;s work across technology, investment and
                international ecosystems exposed both sides of the same
                problem: investors seeking credible access to unfamiliar
                markets, and ambitious founders whose opportunities rarely
                travel far enough.
              </p>
              <p className="path">
                Technology → Data → Digital Assets → Angel Investing → Global
                Ecosystems → Kori
              </p>
              <span className="hand color-teal-light">
                “I don&apos;t want geography to determine whose ideas we get to
                believe in.”
              </span>
            </div>
          </div>

          <div className="grid3 mt-44">
            <div className="gapcard anim-text-up d1">
              <span className="tick">Discovery</span>
              <p className="mt-12">
                International angel communities showed Fadjiah that investing
                could be a way to learn, form relationships and discover
                unfamiliar markets.
              </p>
            </div>
            <div className="gapcard anim-text-up d2">
              <span className="tick">Friction</span>
              <p className="mt-12">
                They also revealed the friction: fragmented tools, closed
                networks and financial corridors that made cross-border
                participation unnecessarily difficult.
              </p>
            </div>
            <div className="gapcard anim-text-up d3">
              <span className="tick">The gap</span>
              <p className="mt-12">
                Across African markets the talent, companies and opportunities
                were already there. What was missing was the infrastructure
                connecting them to global capital and expertise.
              </p>
            </div>
          </div>

          <blockquote className="pull anim-text-up">
            “The problem wasn&apos;t a lack of opportunity. It was the
            infrastructure required to trust it, understand it and invest in
            it.”
            <cite>
              Fadjiah Collin-Mazile
              <br />
              Founder &amp; CEO, Kori
            </cite>
          </blockquote>
        </div>
      </section>

      <section
        className="room dark-room card-theme-plum"
        data-bg="#5F5974"
        data-dark="1"
      >
        <div className="roomwrap">
          <span className="eyebrow anim-text-up">
            <i className="dot-lilac" />
            03 · The team
          </span>
          <h2 className="big anim-text-up d1">
            Built by people who understand the infrastructure{" "}
            <em>underneath trust.</em>
          </h2>
          <p className="team-q anim-text-up d2">
            Different disciplines. One problem: how do you make investing across
            networks more trustworthy?
          </p>

          <div
            className="people"
            data-team-carousel
            aria-label="Kori team"
          >
            <article className="person anim-text-up d1 is-active">
              <img
                src="/assets/ailiza-color-pencil.png"
                alt="Ailiza Coronel, Art Director and Designer"
                width="900"
                height="900"
                loading="lazy"
              />
              <button
                className="person-toggle"
                type="button"
                aria-expanded="true"
                aria-controls="team-ailiza"
                aria-label="Show Ailiza Coronel's profile"
              />
              <div className="who" id="team-ailiza">
                <h3>Ailiza Coronel</h3>
                <p className="role-line">Art Director &amp; Designer</p>
                <p className="exp">Design · Visual Identity · UI/UX</p>
                <p className="bio">
                  Shapes Kori&apos;s visual identity and brand strategy.
                </p>
                <a
                  className="li"
                  href="https://www.linkedin.com/in/ailiza/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ailiza Coronel on LinkedIn"
                >
                  LinkedIn ↗
                </a>
              </div>
            </article>

            <article className="person anim-text-up d2">
              <img
                src="/assets/lionel-color-pencil.png"
                alt="Lionel Limol, Blockchain and Backend Lead"
                width="900"
                height="900"
                loading="lazy"
              />
              <button
                className="person-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="team-lionel"
                aria-label="Show Lionel Limol's profile"
              />
              <div className="who" id="team-lionel">
                <h3>Lionel Limol</h3>
                <p className="role-line">Blockchain &amp; Backend Lead</p>
                <p className="exp">
                  Blockchain Infrastructure · Smart Contracts · Backend Systems
                </p>
                <p className="bio">
                  Builds Kori&apos;s investment, governance and settlement
                  infrastructure.
                </p>
                <a
                  className="li"
                  href="https://www.linkedin.com/in/lionellimol/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Lionel Limol on LinkedIn"
                >
                  LinkedIn ↗
                </a>
              </div>
            </article>

            <article className="person anim-text-up d3">
              <img
                src="/assets/brice-color-pencil.png"
                alt="Brice Mfirmin, AI Strategist and Software Engineer"
                width="900"
                height="900"
                loading="lazy"
              />
              <button
                className="person-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="team-brice"
                aria-label="Show Brice Mfirmin's profile"
              />
              <div className="who" id="team-brice">
                <h3>Brice Mfirmin</h3>
                <p className="role-line">
                  AI Strategist &amp; Software Engineer
                </p>
                <p className="exp">
                  AI · Multi-Agent Systems · Software Engineering
                </p>
                <p className="bio">
                  Turns fragmented diligence into structured investment
                  evidence.
                </p>
                <a
                  className="li"
                  href="https://www.linkedin.com/in/brice-mimifir/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Brice Mfirmin on LinkedIn"
                >
                  LinkedIn ↗
                </a>
              </div>
            </article>

            <article className="person anim-text-up d4">
              <img
                src="/assets/tunde-color-pencil.png"
                alt="Tunde Ogunremi, UI/UX Architect"
                width="900"
                height="900"
                loading="lazy"
              />
              <button
                className="person-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="team-tunde"
                aria-label="Show Tunde Ogunremi's profile"
              />
              <div className="who" id="team-tunde">
                <h3>Tunde Ogunremi</h3>
                <p className="role-line">UI/UX Architect</p>
                <p className="exp">
                  Experience Architecture · User Flows · Interface Design
                </p>
                <p className="bio">
                  Designs Kori&apos;s end-to-end experience, turning complex
                  investment workflows into intuitive user journeys.
                </p>
                <a
                  className="li"
                  href="https://www.linkedin.com/in/tundeogunremi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tunde Ogunremi on LinkedIn"
                >
                  LinkedIn ↗
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="room light-room" data-bg="#E8E0D5" data-dark="0">
        <div className="roomwrap">
          <span className="eyebrow anim-text-up color-ink-soft">
            <i className="dot-orange" />
            04 · The realization
          </span>
          <div className="statements">
            <p className="anim-text-up d1">Talent is distributed.</p>
            <p className="anim-text-up d2">Expertise is distributed.</p>
            <p className="anim-text-up d3">Capital is distributed.</p>
            <p className="access anim-text-up d4">Access isn&apos;t.</p>
          </div>
          <div className="realization-copy anim-text-up">
            <p>
              The next generation of private investing won&apos;t be built only
              around who you already know. It will be built around networks of
              people who collectively know enough to go further.
            </p>
            <strong>Kori exists to make those networks investable.</strong>
          </div>
          <span className="hand anim-text-up mt-22 color-ink-soft font-25">
            collective intelligence moves capital.
          </span>
        </div>
      </section>

      <section
        className="room dark-room card-theme-cocoa"
        data-bg="#564C47"
        data-dark="1"
      >
        <div className="roomwrap">
          <span className="eyebrow anim-text-up">
            <i className="dot-peach" />
            05 · What we believe
          </span>
          <h2 className="big anim-text-up d1">
            Investment can be bigger than <em>access to capital.</em>
          </h2>
          <div className="beliefs">
            <div className="belief anim-text-up d1">
              <span className="n">01</span>
              <h3>
                Your network should expand your possibilities, not define their
                limits.
              </h3>
              <p>
                Great opportunities shouldn&apos;t become inaccessible because
                they sit outside your geography or social circle.
              </p>
            </div>
            <div className="belief anim-text-up d2">
              <span className="n">02</span>
              <h3>Expertise is infrastructure.</h3>
              <p>
                Local knowledge, lived experience, technical expertise and
                investor judgment all contribute to better decisions.
              </p>
            </div>
            <div className="belief anim-text-up d3">
              <span className="n">03</span>
              <h3>Trust should be designed.</h3>
              <p>
                Technology, governance, transparency and aligned incentives can
                make cross-border trust stronger.
              </p>
            </div>
            <div className="belief anim-text-up d4">
              <span className="n">04</span>
              <h3>Capital should move with evidence.</h3>
              <p>
                Capital can move progressively as execution creates greater
                certainty.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="room dark-room"
        data-bg="#030C12"
        data-dark="1"
      >
        <div className="roomwrap center-room">
          <span className="eyebrow anim-text-up">
            <i className="dot-cyan" />
            06 · The network is the product
          </span>
          <h2 className="big anim-text-up d1 center-h2-20">
            Kori isn&apos;t building another investment platform.{" "}
            <span className="warm">
              We&apos;re building a network that can invest.
            </span>
          </h2>
          <div className="roles anim-text-up d2 center-roles">
            <span className="role">Founders</span>
            <span className="role">Angel investors</span>
            <span className="role">Operators</span>
            <span className="role">Diaspora investors</span>
            <span className="role">Local experts</span>
            <span className="role">Fund managers</span>
          </div>
          <div className="anim-text-up d3 center-copy-56">
            <p className="lead lead-center-zero">
              One investor cannot know every industry, understand every market
              or evaluate every opportunity.{" "}
              <strong className="color-ivory">But a network might.</strong>
            </p>
            <p className="lead lead-center-14">
              Kori turns distributed knowledge into collective conviction, and
              collective conviction into coordinated capital.
            </p>
          </div>
        </div>
      </section>

      <section
        className="room short dark-room"
        data-bg="#030C12"
        data-dark="1"
      >
        <div className="roomwrap center-room">
          <span className="eyebrow anim-text-up">
            <i className="dot-orange" />
            07 · The ambition
          </span>
          <h2 className="big anim-text-up d1 center-h2-18">
            What if the world&apos;s expertise could{" "}
            <em>invest together?</em>
          </h2>
          <div className="worldlines anim-text-up d2" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="anim-text-up d2 center-copy-58">
            <p className="lead lead-center-zero">
              Our ambition is to make investing across borders feel less like
              stepping into the unknown and more like entering a network of
              people who understand the terrain. Not by removing risk, but by
              making knowledge, accountability and trust travel with capital.
            </p>
          </div>
          <p className="anim-text-up d3 about-ambition-final">
            Opportunity is global.
            <br />
            Investment infrastructure should be too.
          </p>
        </div>
      </section>

      <section className="finale" data-bg="#030C12" data-dark="1">
        <span className="eyebrow anim-text-up mb-18">
          <i className="dot-coral" />
          08 · Go further, together
        </span>
        <h2 className="anim-text-up d1">
          Your expertise can take someone else&apos;s capital further.
          <br />
          <span className="own">Theirs can do the same for yours.</span>
        </h2>
        <p className="lead anim-text-up d2">
          Join a network of investors, founders and experts building a more
          connected way to invest.
        </p>
        <span className="hand anim-text-up d2">go further, together</span>
        <div className="ctas anim-text-up d3">
          <a className="btn bold" href="/join">
            Join the network
          </a>
          <a className="textlink" href="/how-kori-works">
            Explore how Kori works
          </a>
        </div>
      </section>
    </SiteFrame>
  );
}
