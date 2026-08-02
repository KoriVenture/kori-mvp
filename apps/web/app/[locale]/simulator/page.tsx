import { isSupportedLocale } from "@kori/i18n";
import { Button } from "@kori/ui/components/button";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { KoriLogo } from "@/components/brand/kori-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SimulatorClient } from "@/components/simulator/simulator-client";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Link } from "@/i18n/navigation";

type SimulatorPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: SimulatorPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "simulator.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
    alternates: { canonical: `/${locale}/simulator` },
  };
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("simulator");

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-[var(--kori-bg-primary)]">
        <div className="mx-auto flex min-h-18 max-w-[100rem] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <Link href="/" aria-label={t("back")}>
            <KoriLogo priority />
          </Link>
          <div className="order-3 w-full text-center sm:order-2 sm:w-auto sm:text-left">
            <h1 className="font-display text-lg">{t("title")}</h1>
            <p className="mt-0.5 text-[0.625rem] tracking-[0.06em] text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="order-2 flex items-center gap-1 sm:order-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button
              render={<Link href="/" />}
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
            >
              {t("back")}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <SimulatorClient />
      </div>
    </main>
  );
}
