import type { Metadata } from "next";
import Script from "next/script";
import { SiteFrame } from "@/components/SiteFrame";

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

              <form className="network-form" id="network-form" noValidate>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="first-name">
                      First name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      aria-describedby="first-name-error"
                    />
                    <p
                      className="field-error"
                      id="first-name-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="last-name">
                      Last name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="last-name"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      aria-describedby="last-name-error"
                    />
                    <p
                      className="field-error"
                      id="last-name-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">
                      Email address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      aria-describedby="email-helper email-error"
                    />
                    <p className="field-helper" id="email-helper">
                      Use the address where Kori should contact you.
                    </p>
                    <p
                      className="field-error"
                      id="email-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="role">
                      I am joining as <span aria-hidden="true">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      aria-describedby="role-error"
                      defaultValue=""
                    >
                      <option value="">Select your role</option>
                      <option value="founder">Founder</option>
                      <option value="investor">Investor</option>
                      <option value="community">Community lead</option>
                      <option value="expert">Expert or operator</option>
                      <option value="partner">Ecosystem partner</option>
                      <option value="other">Other</option>
                    </select>
                    <p
                      className="field-error"
                      id="role-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="country">
                      Country <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      autoComplete="country-name"
                      required
                      aria-describedby="country-error"
                    />
                    <p
                      className="field-error"
                      id="country-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field form-field--wide">
                    <label htmlFor="linkedin">
                      LinkedIn profile <span className="optional">Optional</span>
                    </label>
                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      inputMode="url"
                      placeholder="https://www.linkedin.com/in/…"
                      aria-describedby="linkedin-error"
                    />
                    <p
                      className="field-error"
                      id="linkedin-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field form-field--wide">
                    <label htmlFor="interest">
                      What brings you to Kori?{" "}
                      <span className="optional">Optional</span>
                    </label>
                    <textarea
                      id="interest"
                      name="interest"
                      rows={6}
                      maxLength={800}
                      aria-describedby="interest-helper interest-error"
                    />
                    <div className="textarea-meta">
                      <p className="field-helper" id="interest-helper">
                        Tell us what you want to invest in, build, understand or
                        contribute.
                      </p>
                      <span id="interest-count">0 / 800</span>
                    </div>
                    <p
                      className="field-error"
                      id="interest-error"
                      aria-live="polite"
                    />
                  </div>

                  <div className="form-field form-field--wide consent-field">
                    <label>
                      <input
                        id="consent"
                        name="consent"
                        type="checkbox"
                        required
                        aria-describedby="consent-error"
                      />
                      <span>
                        I agree that Kori may use these details to respond to my
                        expression of interest.{" "}
                        <span aria-hidden="true">*</span>
                      </span>
                    </label>
                    <p
                      className="field-error"
                      id="consent-error"
                      aria-live="polite"
                    />
                  </div>
                </div>

                <div className="form-submit-row">
                  <p>Your information is securely submitted to Kori.</p>
                  <button className="button" type="submit">
                    Submit interest →
                  </button>
                </div>

                <div
                  className="form-status"
                  id="form-status"
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                />
              </form>
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

      <Script src="/join-form.js" strategy="afterInteractive" />
    </>
  );
}
