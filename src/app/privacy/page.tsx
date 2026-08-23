import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata: Metadata = {
  title: "Privacy · Kori",
  description: "Privacy information for the Kori website.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy · Kori",
    description: "Privacy information for the Kori website.",
    url: "/privacy",
    type: "website",
    siteName: "Kori",
    locale: "en_CA",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy · Kori",
    description: "Privacy information for the Kori website.",
    images: ["https://koriventure.co/assets/about-hero.jpg"],
  },
};

export default function PrivacyPage() {
  return (
    <SiteFrame active="privacy">
      <section
        className="room compact light-room privacy-room"
        data-bg="#F7F3EC"
        data-dark="0"
      >
        <div className="roomwrap">
          <div className="legal anim-text-up">
            <span className="eyebrow color-ink-soft">
              <i className="dot-coral" />
              Privacy
            </span>
            <h1 className="huge legal-huge">Privacy notice</h1>
            <span className="status">Draft for review before production launch</span>

            <h2>Current website</h2>
            <p>
              This website collects information that you submit through the
              network interest form. It also uses Vercel Web Analytics to
              measure site usage and improve the visitor experience.
            </p>

            <h2>Before data collection begins</h2>
            <p>
              Kori should publish a final privacy notice identifying the
              operating legal entity, contact channel, categories of data
              collected, purposes and legal bases, service providers,
              international transfers, retention periods and individual rights.
            </p>

            <h2>External services</h2>
            <p>
              The site requests web fonts from Google, stores network-interest
              submissions with Supabase and uses Vercel Web Analytics. Visitors
              who follow LinkedIn links leave this website and become subject to
              LinkedIn&apos;s policies.
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
              Privacy
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
