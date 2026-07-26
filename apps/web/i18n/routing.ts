import { defaultLocale, supportedLocales } from "@kori/i18n";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: supportedLocales,
  defaultLocale,
  localePrefix: "always",
});
