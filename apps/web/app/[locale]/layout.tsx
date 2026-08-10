import {
  isSupportedLocale,
  localeMetadata,
  supportedLocales,
} from "@kori/i18n";
import { Analytics } from "@vercel/analytics/next";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { ApplicationProviders } from "@/components/providers/application-providers";

import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const metadata = localeMetadata[locale];

  return (
    <html
      lang={metadata.htmlLang}
      dir={metadata.direction}
      suppressHydrationWarning
      className={fontVariables}
    >
      <body>
        <ApplicationProviders locale={locale} messages={messages}>
          {children}
        </ApplicationProviders>
        <Analytics />
      </body>
    </html>
  );
}
