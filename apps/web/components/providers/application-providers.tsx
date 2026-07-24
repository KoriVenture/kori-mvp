"use client";

import type { SupportedLocale } from "@kori/i18n";
import { Toaster } from "@kori/ui/components/sonner";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

import { ThemeProvider } from "./theme-provider";

type ApplicationProvidersProps = {
  children: ReactNode;
  locale: SupportedLocale;
  messages: ComponentProps<typeof NextIntlClientProvider>["messages"];
};

export function ApplicationProviders({
  children,
  locale,
  messages,
}: ApplicationProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        storageKey="kori-theme"
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
