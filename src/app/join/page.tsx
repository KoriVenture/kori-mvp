import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";
import { JoinNetworkForm } from "@/components/join/JoinNetworkForm";

export const metadata: Metadata = {
  title: "Join the network · Kori",
  description: "Choose how you want to participate in the Kori network.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Join the network · Kori",
    description:
      "A place for founders, investors, communities and experts to express interest in Kori.",
    url: "/join",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the network · Kori",
    description:
      "A place for founders, investors, communities and experts to express interest in Kori.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function JoinPage() {
  return (
    <>
      <SiteFrame>
        <section
          className="page-hero light-room"
          data-bg="#F7F3EC"
          data-dark="0"
        >
          <div className="inner">
            <span className="eyebrow anim-text-up color-ink-soft">
              <i className="dot-coral" />
              Early participation
            </span>
            <h1 className="anim-text-up d1">
              Find your place in the <span className="warm">Kori network.</span>
            </h1>
            <p className="lead anim-text-up d2">
              Kori is preparing its first participation pathways. Choose the
              perspective closest to yours and see what the network is being
              built to support.
            </p>
          </div>
        </section>

        <section
          className="room compact light-room bg-ivory"
          data-bg="#F7F3EC"
          data-dark="0"
          aria-labelledby="network-form-title"
        >
          <div className="roomwrap">
            <div className="formwrap">
              <div className="form-intro anim-text-up">
                <span className="eyebrow color-ink-soft">
                  <i className="dot-teal" />
                  Express your interest
                </span>
                <h2 id="network-form-title">
                  Tell us where you fit in the network.
                </h2>
                <p>
                  Share enough context for Kori to understand your perspective.
                  Fields marked with an asterisk are required.
                </p>
              </div>

              <JoinNetworkForm />
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
                Not sure which pathway fits
              </span>
              <h2 className="mt-14">
                Collective intelligence <em>moves capital.</em>
              </h2>
              <p>Start with how Kori works, or read the thesis behind it.</p>
            </div>
            <div className="acts anim-text-up d2">
              <a className="btn bold" href="/how-kori-works">
                How Kori works
              </a>
              <a className="textlink" href="/collective-intelligence">
                Read the thesis
              </a>
            </div>
          </div>
        </section>
      </SiteFrame>
    </>
  );
}
