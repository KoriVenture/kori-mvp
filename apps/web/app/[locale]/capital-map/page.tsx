import { isSupportedLocale } from "@kori/i18n";
import { buttonVariants } from "@kori/ui/components/button";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CountryFlag } from "@/components/marketing/country-flag";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import {
  capitalMapStats,
  type CountryRecord,
  investorCountries,
  recipientCountries,
} from "@/content/capital-map";
import { Link } from "@/i18n/navigation";

type CapitalMapPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CapitalMapPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "capital-map.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: `/${locale}/capital-map` },
  };
}

async function CountryPanel({
  countries,
  locale,
  recipient = false,
}: {
  countries: readonly CountryRecord[];
  locale: string;
  recipient?: boolean;
}) {
  const t = await getTranslations("capital-map");
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const total = countries.at(-1)?.displayedTotal;

  return (
    <section className="rounded-[8px] border border-border bg-secondary p-5 md:p-8">
      <h2
        className={`font-interface text-[0.8125rem] tracking-[0.1em] uppercase ${
          recipient
            ? "text-success dark:text-success-foreground"
            : "text-primary"
        }`}
      >
        {t(recipient ? "panels.recipientsTitle" : "panels.investorsTitle")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(
          recipient
            ? "panels.recipientsDescription"
            : "panels.investorsDescription",
        )}
      </p>
      <div className="mt-7">
        {countries.map((country) => {
          const localizedName = names.of(country.code) ?? country.name;
          return (
            <div
              key={country.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-border py-4 last:border-b-0"
            >
              <CountryFlag
                flag={country.flag}
                label={t("flagLabel", { country: localizedName })}
              />
              <div>
                <h3 className="text-sm">{localizedName}</h3>
                <p className="mt-1 text-xs leading-[1.55] text-muted-foreground">
                  {t(`details.${country.id}`)}
                </p>
              </div>
              <p
                className={`font-data text-sm ${
                  recipient
                    ? "text-success dark:text-success-foreground"
                    : "text-primary"
                }`}
              >
                {country.amount}
              </p>
              <div className="col-start-2 col-end-4 h-1 overflow-hidden rounded-full bg-border">
                <span
                  className={`block h-full ${
                    recipient ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${country.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
        <span className="font-interface text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
          {t(recipient ? "panels.totalReceived" : "panels.totalInvested")}
        </span>
        <span
          className={`font-data text-lg ${
            recipient
              ? "text-success dark:text-success-foreground"
              : "text-primary"
          }`}
        >
          {total}
        </span>
      </div>
    </section>
  );
}

export default async function CapitalMapPage({ params }: CapitalMapPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, landing] = await Promise.all([
    getTranslations("capital-map"),
    getTranslations("landing"),
  ]);

  return (
    <main className="bg-background text-foreground">
      <MarketingHeader />
      <section className="kori-public-hero relative overflow-hidden px-6 pt-[11.25rem] pb-25 text-center md:px-8 xl:px-[3.75rem]">
        <p className="font-interface text-[0.6875rem] font-extralight tracking-[0.4em] text-primary uppercase">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mx-auto mt-7 max-w-4xl font-editorial text-[clamp(2.25rem,5vw,4rem)] leading-[1.15] font-light">
          {t.rich("hero.title", {
            highlight: (chunks) => <em className="text-primary">{chunks}</em>,
          })}
        </h1>
        <p className="mx-auto mt-6 max-w-[38rem] text-[0.9375rem] leading-[1.8] text-muted-foreground">
          {t("hero.description")}
        </p>
      </section>

      <section className="hairline-grid border-y border-border sm:grid-cols-2 lg:grid-cols-5">
        {capitalMapStats.map((stat) => (
          <div key={stat.id} className="px-5 py-8 text-center">
            <p
              className={`font-editorial text-[2.25rem] leading-none font-light ${
                stat.tone === "gold"
                  ? "text-primary"
                  : stat.tone === "teal"
                    ? "text-success dark:text-success-foreground"
                    : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
            <h2 className="mt-3 font-interface text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
              {t(`stats.${stat.id}`)}
            </h2>
          </div>
        ))}
      </section>

      <section className="grid gap-6 px-6 py-15 md:px-8 md:py-20 min-[860px]:grid-cols-2 xl:px-[3.75rem] xl:py-[7.5rem]">
        <CountryPanel countries={investorCountries} locale={locale} />
        <CountryPanel
          countries={recipientCountries}
          locale={locale}
          recipient
        />
      </section>

      <section className="px-6 py-20 text-center md:px-8 md:py-25 xl:px-[3.75rem] xl:py-32">
        <h2 className="font-editorial text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.1] font-light">
          {t.rich("cta.title", {
            highlight: (chunks) => <em className="text-primary">{chunks}</em>,
          })}
        </h2>
        <p className="mx-auto mt-5 max-w-[32rem] text-[0.9375rem] leading-[1.7] text-muted-foreground">
          {t("cta.description")}
        </p>
        <Link
          href="/#register"
          className={buttonVariants({
            variant: "gold",
            size: "lg",
            className: "mt-8 px-9 tracking-[0.2em]",
          })}
        >
          {t("cta.action")}
        </Link>
      </section>

      <MarketingFooter
        homeLabel={landing("navigation.home")}
        tagline={landing("footer.tagline")}
        copyright={landing("footer.copyright")}
      />
    </main>
  );
}
