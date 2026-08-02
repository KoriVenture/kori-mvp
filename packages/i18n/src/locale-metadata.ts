import type { SupportedLocale } from "./locales";

export type LocaleMetadata = {
  displayName: string;
  htmlLang: string;
  direction: "ltr" | "rtl";
};

export const localeMetadata = {
  en: { displayName: "English", htmlLang: "en", direction: "ltr" },
  fr: { displayName: "Français", htmlLang: "fr", direction: "ltr" },
  es: { displayName: "Español", htmlLang: "es", direction: "ltr" },
} as const satisfies Record<SupportedLocale, LocaleMetadata>;

export const localeDisplayNames = {
  en: localeMetadata.en.displayName,
  fr: localeMetadata.fr.displayName,
  es: localeMetadata.es.displayName,
} as const satisfies Record<SupportedLocale, string>;
