import { describe, expect, it } from "vitest";

import {
  defaultLocale,
  isSupportedLocale,
  localeDisplayNames,
  localeMetadata,
  supportedLocales,
} from "./index";

describe("locale contract", () => {
  it("recognizes only the three supported interface locales", () => {
    expect(supportedLocales).toEqual(["en", "fr", "es"]);
    expect(defaultLocale).toBe("en");
    expect(supportedLocales.every(isSupportedLocale)).toBe(true);
    expect(isSupportedLocale("de")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
  });

  it("provides native labels and HTML metadata for each locale", () => {
    expect(localeDisplayNames).toEqual({
      en: "English",
      fr: "Français",
      es: "Español",
    });
    expect(localeMetadata.fr).toEqual({
      displayName: "Français",
      htmlLang: "fr",
      direction: "ltr",
    });
  });
});
