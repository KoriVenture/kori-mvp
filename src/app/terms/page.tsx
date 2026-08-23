import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "Terms · Kori",
  description: "Website terms information for Kori.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms · Kori",
    description: "Website terms information for Kori.",
    url: "/terms",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms · Kori",
    description: "Website terms information for Kori.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function TermsPage() {
  return (
    <SiteFrame active="terms">
      <section
        className="room compact light-room privacy-room"
        data-bg="#F7F3EC"
        data-dark="0"
      >
        <div className="roomwrap">
          <div className="legal anim-text-up">
            <span className="eyebrow color-ink-soft">
              <i className="dot-coral" />
              Terms
            </span>
            <h1 className="huge legal-huge">Website terms</h1>
            <span className="status">Draft for review before production launch</span>

            <h2>Informational purpose</h2>
            <p>
              This website describes Kori&apos;s intended product direction. It
              does not constitute an offer to sell securities, investment
              advice, a recommendation or a promise that any feature,
              opportunity or investment vehicle is available.
            </p>

            <h2>No investment relationship</h2>
            <p>
              Viewing this website does not create an investor, client,
              advisory or fiduciary relationship with Kori.
            </p>

            <h2>Before launch</h2>
            <p>
              Final terms should identify the operating legal entity, governing
              law, intellectual-property terms, permitted use, disclaimers,
              liability limits and the terms governing any application or
              platform account.
            </p>

            <p className="legal-guidance">
              <em>This draft is operational guidance, not final legal advice.</em>
            </p>
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
              Terms
            </span>
            <h2 className="mt-14">
              Collective intelligence <em>moves capital.</em>
            </h2>
            <p>Return to the network.</p>
          </div>
          <div className="acts anim-text-up d2">
            <a className="btn bold" href="/">
              Return home
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
