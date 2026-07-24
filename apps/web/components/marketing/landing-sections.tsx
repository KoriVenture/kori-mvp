import { buttonVariants } from "@kori/ui/components/button";
import { SectionLabel } from "@kori/ui/patterns/section-label";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  landingRoles,
  landingStats,
  problemItems,
  processSteps,
  solutionPillars,
  whyNowSignals,
} from "@/content/landing";
import { Link } from "@/i18n/navigation";

import { MarketingFooter } from "./marketing-footer";
import { MarketingHeader } from "./marketing-header";
import { RevealOnScroll } from "./reveal-on-scroll";
import { WaitlistForm } from "./waitlist-form";

const audienceItemKeys = ["one", "two", "three", "four", "five"] as const;

export async function LandingSections() {
  const [t, validation] = await Promise.all([
    getTranslations("landing"),
    getTranslations("validation"),
  ]);

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <MarketingHeader />

      <section
        id="hero"
        className="kori-hero-grain relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-[8.75rem] pb-[6.25rem] text-center md:px-8 xl:px-[3.75rem]"
      >
        <div aria-hidden="true" className="kori-hero-glow" />
        <div aria-hidden="true" className="kori-hero-rings">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="relative z-1 mx-auto flex max-w-4xl flex-col items-center">
          <p className="mb-8 flex items-center gap-4 font-interface text-[0.6875rem] font-extralight tracking-[0.4em] text-primary uppercase before:h-px before:w-10 before:bg-primary/50 after:h-px after:w-10 after:bg-primary/50">
            {t("hero.eyebrow")}
          </p>
          <h1 className="text-kori-display">
            {t.rich("hero.title", {
              highlight: (chunks) => (
                <em className="font-light text-primary">{chunks}</em>
              ),
            })}
          </h1>
          <p className="mt-7 max-w-[35rem] text-[0.9375rem] leading-[1.8] text-muted-foreground">
            {t("hero.description")}
          </p>
          <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/#waitlist"
              className={buttonVariants({
                variant: "gold",
                size: "lg",
                className: "px-9 tracking-[0.2em]",
              })}
            >
              {t("hero.primaryAction")}
            </Link>
            <Link
              href="/#solution"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "border-border px-9 tracking-[0.2em] text-foreground hover:border-primary hover:text-primary",
              })}
            >
              {t("hero.secondaryAction")}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-9 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
          <span className="font-interface text-[0.5625rem] tracking-[0.3em] text-muted-foreground uppercase">
            {t("hero.scroll")}
          </span>
          <span className="kori-scroll-line" />
        </div>
      </section>

      <section
        aria-label={t("statistics.fundingGap.label")}
        className="hairline-grid border-y border-border md:grid-cols-3"
      >
        {landingStats.map((stat, index) => (
          <RevealOnScroll
            key={stat.id}
            delay={index === 0 ? 0 : index === 1 ? 2 : 3}
            className="px-6 py-8 md:px-8 md:py-11 xl:px-[3.75rem]"
          >
            <p className="font-editorial text-[3.25rem] leading-none font-light text-primary">
              {stat.value}
            </p>
            <h2 className="mt-2 font-interface text-[0.6875rem] font-light tracking-[0.15em] text-muted-foreground uppercase">
              {t(stat.labelKey)}
            </h2>
            <p className="mt-2 max-w-[16.25rem] text-[0.8125rem] leading-[1.6] text-muted-foreground">
              {t(stat.descriptionKey)}
            </p>
          </RevealOnScroll>
        ))}
      </section>

      <section
        id="register"
        className="bg-[var(--kori-section-alt)] px-6 py-20 text-center md:px-8 md:py-20 xl:px-[3.75rem] xl:py-[7.5rem]"
      >
        <RevealOnScroll>
          <p className="mb-7 font-interface text-[0.625rem] font-extralight tracking-[0.5em] text-primary uppercase">
            {t("profiles.eyebrow")}
          </p>
          <h2 className="text-kori-page-title mx-auto max-w-3xl">
            {t.rich("profiles.title", {
              highlight: (chunks) => <em className="text-primary">{chunks}</em>,
            })}
          </h2>
          <p className="mx-auto mt-4 max-w-[32.5rem] text-[0.9375rem] leading-[1.7] text-muted-foreground">
            {t("profiles.description")}
          </p>
        </RevealOnScroll>
        <div className="mx-auto mt-15 grid max-w-[60rem] gap-6 md:grid-cols-3">
          {landingRoles.map((role, index) => (
            <RevealOnScroll key={role.id} delay={(index + 1) as 1 | 2 | 3}>
              <article className="group h-full rounded-[4px] border border-border bg-[var(--kori-card-bg)] px-7 pt-10 pb-9 transition duration-300 hover:-translate-y-1 hover:border-primary">
                <span
                  aria-hidden="true"
                  className="text-[2rem] leading-none text-primary"
                >
                  {role.glyph}
                </span>
                <h3 className="mt-4 font-interface text-[0.9375rem] tracking-[0.08em]">
                  {t(role.titleKey)}
                </h3>
                <p className="mt-3 text-[0.8125rem] leading-[1.6] text-muted-foreground">
                  {t(role.descriptionKey)}
                </p>
                <Link
                  href={role.href}
                  className="mt-6 inline-flex items-center gap-2 font-interface text-[0.6875rem] tracking-[0.16em] text-primary uppercase"
                >
                  {t("profiles.start")}
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </article>
            </RevealOnScroll>
          ))}
        </div>
        <Link
          href="/stories"
          className="mt-12 inline-flex items-center gap-2 border-b border-primary/30 pb-1 font-interface text-xs tracking-[0.12em] text-primary uppercase hover:border-primary"
        >
          {t("profiles.stories")}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </section>

      <section
        id="problem"
        className="grid items-start gap-8 bg-[var(--kori-section-alt)] px-6 py-15 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-10 xl:gap-20 xl:px-[3.75rem] xl:py-[7.5rem]"
      >
        <RevealOnScroll className="lg:sticky lg:top-[8.75rem]">
          <SectionLabel>{t("problem.label")}</SectionLabel>
          <h2 className="text-kori-page-title">{t("problem.title")}</h2>
          <p className="mt-7 text-[0.9375rem] leading-[1.8] text-muted-foreground">
            {t("problem.description")}
          </p>
        </RevealOnScroll>
        <div className="hairline-grid">
          {problemItems.map((number, index) => (
            <RevealOnScroll
              key={number}
              delay={index as 0 | 1 | 2 | 3}
              className="border-l-2 border-l-transparent bg-[var(--kori-card-bg)] px-6 py-8 transition-colors hover:border-l-primary md:px-9"
            >
              <p className="font-editorial text-[2.5rem] leading-none font-light text-border">
                {number}
              </p>
              <h3 className="mt-3 font-interface text-sm tracking-[0.06em] uppercase">
                {t(`problem.items.${number}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">
                {t(`problem.items.${number}.description`)}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section
        id="solution"
        className="kori-solution relative overflow-hidden px-6 py-15 md:px-8 md:py-20 xl:px-[3.75rem] xl:py-[7.5rem]"
      >
        <div className="relative z-1 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <RevealOnScroll>
            <SectionLabel>{t("solution.label")}</SectionLabel>
            <h2 className="text-kori-page-title">
              {t.rich("solution.title", {
                highlight: (chunks) => (
                  <em className="text-primary">{chunks}</em>
                ),
              })}
            </h2>
            <blockquote className="mt-7 font-editorial text-xl leading-[1.6] font-light italic text-muted-foreground">
              {t("solution.quote")}
            </blockquote>
            <p className="mt-7 text-[0.9375rem] leading-[1.8] text-muted-foreground">
              {t("solution.description")}
            </p>
            <Link
              href="/#register"
              className={buttonVariants({
                variant: "gold",
                size: "lg",
                className: "mt-7 px-9 tracking-[0.2em]",
              })}
            >
              {t("solution.action")}
            </Link>
          </RevealOnScroll>
          <div>
            {solutionPillars.map((pillar, index) => (
              <RevealOnScroll
                key={pillar.id}
                delay={index as 0 | 1 | 2 | 3}
                className="flex gap-5 border-b border-border py-7 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-primary"
                >
                  {pillar.glyph}
                </span>
                <div>
                  <h3 className="font-interface text-[0.8125rem] tracking-[0.1em] uppercase">
                    {t(`solution.pillars.${pillar.id}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
                    {t(`solution.pillars.${pillar.id}.description`)}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how"
        className="bg-[var(--kori-section-alt)] px-6 py-15 md:px-8 md:py-20 xl:px-[3.75rem] xl:py-[7.5rem]"
      >
        <div className="mb-10 grid items-end gap-6 lg:mb-20 lg:grid-cols-2 lg:gap-20">
          <RevealOnScroll>
            <SectionLabel>{t("process.label")}</SectionLabel>
            <h2 className="text-kori-page-title">
              {t.rich("process.title", {
                highlight: (chunks) => (
                  <em className="text-primary">{chunks}</em>
                ),
              })}
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={2}>
            <p className="text-[0.9375rem] leading-[1.8] text-muted-foreground">
              {t("process.description")}
            </p>
          </RevealOnScroll>
        </div>
        <div className="hairline-grid md:grid-cols-3">
          {processSteps.map((step, index) => (
            <RevealOnScroll
              key={step.id}
              delay={(index === 0 ? 0 : index === 1 ? 2 : 4) as 0 | 2 | 4}
              className="relative bg-[var(--kori-section-alt)] px-6 py-8 md:px-10 md:py-12"
            >
              <span className="absolute top-6 right-6 rounded-[2px] border border-[var(--kori-teal-border)] px-2.5 py-1 font-interface text-[0.5625rem] tracking-[0.2em] text-success uppercase dark:text-success-foreground">
                {t(`process.steps.${step.id}.role`)}
              </span>
              <p className="font-editorial text-[4rem] leading-none font-light text-primary/15">
                {step.number}
              </p>
              <h3 className="mt-6 font-interface text-sm tracking-[0.1em] uppercase">
                {t(`process.steps.${step.id}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-[1.7] text-muted-foreground">
                {t(`process.steps.${step.id}.description`)}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section
        id="why"
        className="px-6 py-15 md:px-8 md:py-20 xl:px-[3.75rem] xl:py-[7.5rem]"
      >
        <div className="mx-auto max-w-[47.5rem] text-center">
          <RevealOnScroll>
            <span className="inline-flex rounded-[3px] border border-[var(--kori-teal-border)] px-3 py-1 font-interface text-[0.625rem] tracking-[0.16em] text-success uppercase dark:text-success-foreground">
              {t("whyNow.badge")}
            </span>
          </RevealOnScroll>
          <RevealOnScroll delay={1}>
            <blockquote className="mt-8 font-editorial text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.45] font-light italic">
              {t.rich("whyNow.quote", {
                highlight: (chunks) => (
                  <span className="text-primary">{chunks}</span>
                ),
              })}
            </blockquote>
          </RevealOnScroll>
          <RevealOnScroll delay={2}>
            <p className="mt-10 font-interface text-[0.6875rem] tracking-[0.25em] text-muted-foreground uppercase">
              {t("whyNow.attribution")}
            </p>
          </RevealOnScroll>
        </div>
        <div className="hairline-grid mt-20 md:grid-cols-2">
          {whyNowSignals.map((signal, index) => (
            <RevealOnScroll
              key={signal}
              delay={index as 0 | 1 | 2 | 3}
              className="px-6 py-8 md:px-10 md:py-9"
            >
              <span className="block size-2 rounded-full bg-primary" />
              <h3 className="mt-4 font-interface text-[0.8125rem] tracking-[0.08em] uppercase">
                {t(`whyNow.signals.${signal}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
                {t(`whyNow.signals.${signal}.description`)}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section id="investors" className="hairline-grid p-0 lg:grid-cols-2">
        {(["investors", "founders"] as const).map((audience) => (
          <article
            key={audience}
            className={`px-6 py-15 md:px-8 md:py-20 xl:px-[3.75rem] xl:py-[6.25rem] ${
              audience === "investors"
                ? "bg-[var(--kori-section-alt)]"
                : "bg-background"
            }`}
          >
            <p className="font-interface text-[0.625rem] font-extralight tracking-[0.4em] text-primary uppercase">
              {t(`audience.${audience}.eyebrow`)}
            </p>
            <p className="mt-5 border-b border-border pb-7 font-editorial text-[1.375rem] leading-[1.35] font-light">
              {t(`audience.${audience}.tagline`)}
              <em className="mt-1 block text-lg text-primary">
                {t(`audience.${audience}.emphasis`)}
              </em>
            </p>
            <h2 className="mt-7 font-editorial text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2] font-light">
              {t(`audience.${audience}.title`)}
            </h2>
            <p className="mt-6 text-[0.9375rem] leading-[1.8] text-muted-foreground">
              {t(`audience.${audience}.description`)}
            </p>
            <ul className="mt-10 grid gap-3">
              {audienceItemKeys.map((item) => (
                <li
                  key={item}
                  className="flex gap-3.5 text-sm leading-[1.6] text-muted-foreground before:mt-px before:text-primary before:content-['→']"
                >
                  {t(`audience.${audience}.items.${item}`)}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section
        id="waitlist"
        className="kori-waitlist relative overflow-hidden px-6 py-20 text-center md:px-8 md:py-25 xl:px-[3.75rem] xl:py-40"
      >
        <RevealOnScroll className="relative z-1">
          <p className="font-interface text-[0.625rem] font-extralight tracking-[0.5em] text-primary uppercase">
            {t("waitlist.eyebrow")}
          </p>
          <h2 className="mx-auto mt-7 max-w-3xl font-editorial text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.1] font-light">
            {t.rich("waitlist.title", {
              highlight: (chunks) => (
                <em className="block text-primary">{chunks}</em>
              ),
            })}
          </h2>
          <p className="mx-auto mt-5 mb-12 max-w-[26.25rem] text-[0.9375rem] leading-[1.7] text-muted-foreground">
            {t("waitlist.description")}
          </p>
          <WaitlistForm
            emailLabel={t("waitlist.emailLabel")}
            placeholder={t("waitlist.placeholder")}
            submit={t("waitlist.submit")}
            required={validation("required")}
            invalid={validation("email")}
            success={t("waitlist.success")}
            demoNotice={t("waitlist.demoNotice")}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            {t("waitlist.note")}
          </p>
        </RevealOnScroll>
      </section>

      <MarketingFooter
        homeLabel={t("navigation.home")}
        tagline={t("footer.tagline")}
        copyright={t("footer.copyright")}
      />
    </main>
  );
}
