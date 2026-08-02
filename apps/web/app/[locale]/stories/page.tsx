import { isSupportedLocale } from "@kori/i18n";
import { buttonVariants } from "@kori/ui/components/button";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { StoryCaseStudy } from "@/components/marketing/story-case-study";
import { stories } from "@/content/stories";
import { Link } from "@/i18n/navigation";

type StoriesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: StoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "stories.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: `/${locale}/stories` },
  };
}

export default async function StoriesPage({ params }: StoriesPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, landing] = await Promise.all([
    getTranslations("stories"),
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

      {stories.map((story, index) => (
        <div key={story.id}>
          {index > 0 ? (
            <div className="mx-auto h-px max-w-[75rem] bg-border" />
          ) : null}
          <StoryCaseStudy story={story} />
        </div>
      ))}

      <section className="kori-waitlist relative overflow-hidden px-6 py-20 text-center md:px-8 md:py-25 xl:px-[3.75rem] xl:py-32">
        <h2 className="font-editorial text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.1] font-light">
          {t.rich("cta.title", {
            highlight: (chunks) => <em className="text-primary">{chunks}</em>,
          })}
        </h2>
        <p className="mx-auto mt-5 max-w-[32rem] text-[0.9375rem] leading-[1.7] text-muted-foreground">
          {t("cta.description")}
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/#register"
            className={buttonVariants({
              variant: "gold",
              size: "lg",
              className: "px-9 tracking-[0.2em]",
            })}
          >
            {t("cta.primary")}
          </Link>
          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "border-border px-9 tracking-[0.2em]",
            })}
          >
            {t("cta.secondary")}
          </Link>
        </div>
      </section>

      <MarketingFooter
        homeLabel={landing("navigation.home")}
        tagline={landing("footer.tagline")}
        copyright={landing("footer.copyright")}
      />
    </main>
  );
}
