import { getTranslations } from "next-intl/server";

import {
  contributors,
  landingStats,
  processSteps,
  solutionIndex,
  stancePairs,
} from "@/content/landing";
import { Link } from "@/i18n/navigation";

import { MarketingFooter } from "./marketing-footer";
import { MarketingHeader } from "./marketing-header";
import { RevealOnScroll } from "./reveal-on-scroll";
import { WaitlistForm } from "./waitlist-form";

// Display headlines below hero scale — the utilities layer overrides the
// 180px ceiling that .kori-mega sets for the wordmark line.
const sectionHeadline = "text-[clamp(2.375rem,5vw,4.625rem)]";

export async function LandingSections() {
  const [t, validation] = await Promise.all([
    getTranslations("landing"),
    getTranslations("validation"),
  ]);

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section
        id="hero"
        className="kori-light relative pt-[clamp(7rem,14vw,11rem)] pb-[clamp(4rem,10vw,9rem)]"
      >
        <div aria-hidden="true" className="kori-mark-bleed">
          <b />
          <b />
          <b />
          <b />
        </div>
        <div className="kori-container relative z-2">
          <span className="kori-eyebrow">{t("hero.eyebrow")}</span>
          <h1 className="kori-mega">
            {t.rich("hero.title", {
              highlight: (chunks) => <em>{chunks}</em>,
            })}
          </h1>
          <p className="kori-lede">{t("hero.description")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#waitlist" className="kori-btn kori-btn--wild">
              {t("hero.primaryAction")}
            </Link>
            <Link href="/#thesis" className="kori-btn kori-btn--ghost">
              {t("hero.secondaryAction")}
            </Link>
          </div>

          <dl className="kori-stance">
            {stancePairs.map((pair) => (
              <div key={pair} className="contents">
                <dt>{t(`hero.stance.${pair}.label`)}</dt>
                <dd>
                  {t.rich(`hero.stance.${pair}.value`, {
                    em: (chunks) => <em>{chunks}</em>,
                  })}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ MARKET PROOF ============ */}
      <section id="market-proof" className="kori-shear kori-sand">
        <div className="kori-container">
          <span className="kori-eyebrow">{t("marketProof.eyebrow")}</span>
          <div className="kori-grid mt-8 [row-gap:var(--s-7)]">
            {landingStats.map((stat, index) => (
              <RevealOnScroll
                key={stat.id}
                delay={(index + 1) as 1 | 2 | 3}
                className="kori-span-4 kori-stat--wild"
              >
                <span className="kori-stat__value">{stat.value}</span>
                <span className="kori-stat__label mt-1 block">
                  {t(`marketProof.stats.${stat.id}.label`)}
                </span>
                <p className="kori-stat__note">
                  {t(`marketProof.stats.${stat.id}.note`)}
                </p>
              </RevealOnScroll>
            ))}
          </div>
          <p className="font-data mt-12 text-[11px] tracking-[0.1em] text-[color:var(--kori-ink-faint)] uppercase">
            {t("marketProof.sources")}
          </p>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        id="how"
        className="kori-light py-[clamp(4rem,9vw,8rem)]"
      >
        <div className="kori-container kori-grid gap-y-10">
          <RevealOnScroll className="kori-span-5">
            <span className="kori-eyebrow">{t("how.eyebrow")}</span>
            <h2 className={`kori-mega ${sectionHeadline}`}>
              {t.rich("how.title", {
                highlight: (chunks) => <em>{chunks}</em>,
              })}
            </h2>
            <p className="kori-lede">{t("how.description")}</p>
          </RevealOnScroll>
          <div className="kori-span-7">
            <ol className="kori-process">
              {processSteps.map((step) => (
                <li key={step}>
                  <p className="kori-process__text">{t(`how.steps.${step}`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ THESIS ============ */}
      <section id="thesis" className="kori-shear kori-sand">
        <div className="kori-container">
          <span className="kori-eyebrow">{t("thesis.eyebrow")}</span>
          <div className="kori-grid">
            <div className="kori-span-7">
              <h2 className={`kori-mega ${sectionHeadline}`}>
                {t.rich("thesis.title", {
                  cool: (chunks) => <span className="cool">{chunks}</span>,
                })}
              </h2>
              <p className="kori-lede">{t("thesis.description")}</p>
            </div>
            <div className="kori-span-5">
              <p className="kori-pivot">
                {t.rich("thesis.pivot", {
                  em: (chunks) => <em>{chunks}</em>,
                })}
              </p>
            </div>
          </div>
          <ul className="kori-contributors">
            {contributors.map((contributor) => (
              <li key={contributor}>
                <b>{t(`thesis.contributors.${contributor}`)}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ SOLUTION + FEATURED OPPORTUNITY ============ */}
      <section id="opportunity" className="kori-light py-[clamp(4rem,9vw,8rem)]">
        <div className="kori-container kori-grid gap-y-12">
          <div className="kori-span-6">
            <span className="kori-eyebrow">{t("solution.eyebrow")}</span>
            <h2 className={`kori-mega ${sectionHeadline}`}>
              {t.rich("solution.title", {
                cool: (chunks) => <span className="cool">{chunks}</span>,
              })}
            </h2>
            <p>{t("solution.description")}</p>
            <p className="kori-accent my-8 max-w-[36ch] text-[clamp(1.25rem,2.4vw,1.875rem)]">
              {t("solution.accent")}
            </p>
            <div
              aria-hidden="true"
              className="kori-overprint relative mt-8 h-[280px]"
            >
              <span
                className="field field--orange"
                style={{ inset: "0 40% 34% 0" }}
              />
              <span
                className="field field--cyan"
                style={{ inset: "14% 12% 20% 26%" }}
              />
              <span
                className="field field--teal"
                style={{ inset: "34% 0 0 44%" }}
              />
            </div>
          </div>

          <div className="kori-span-6">
            <div className="kori-panel kori-panel--wild kori-dark">
              <span className="kori-eyebrow">{t("solution.panel.eyebrow")}</span>
              <h2 className="font-editorial text-[clamp(1.875rem,3.6vw,3.25rem)] leading-[1.02] tracking-[-0.03em]">
                {t("solution.panel.title")}
              </h2>
              <hr className="kori-rule--accent" />
              <p>{t("solution.panel.description")}</p>
              <ul className="kori-index-list my-8">
                {solutionIndex.map((entry) => (
                  <li key={entry}>{t(`solution.panel.index.${entry}`)}</li>
                ))}
              </ul>
              <Link
                href="/#waitlist"
                className="kori-btn kori-btn--primary"
              >
                {t("solution.panel.action")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA / WAITLIST ============ */}
      <section id="waitlist" className="kori-shear kori-shear--up kori-dark">
        <div className="kori-container">
          <RevealOnScroll>
            <span className="kori-eyebrow">{t("waitlist.eyebrow")}</span>
            <h2 className={`kori-mega ${sectionHeadline}`}>
              {t.rich("waitlist.title", {
                highlight: (chunks) => <em>{chunks}</em>,
              })}
            </h2>
            <hr className="kori-slash max-w-[22rem]" />
            <p className="kori-lede">{t("waitlist.description")}</p>
            <div className="mt-8 max-w-[30rem]">
              <WaitlistForm
                emailLabel={t("waitlist.emailLabel")}
                placeholder={t("waitlist.placeholder")}
                submit={t("waitlist.submit")}
                required={validation("required")}
                invalid={validation("email")}
                success={t("waitlist.success")}
                demoNotice={t("waitlist.demoNotice")}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {t("waitlist.note")}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <MarketingFooter
        homeLabel={t("navigation.home")}
        tagline={t("footer.tagline")}
        copyright={t("footer.copyright")}
      />
    </main>
  );
}
