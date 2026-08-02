import { isSupportedLocale, type SupportedLocale } from "@kori/i18n";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "./messages";

export function resolveRequestLocale(
  value: string | undefined,
): SupportedLocale | null {
  return isSupportedLocale(value) ? value : null;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = resolveRequestLocale(await requestLocale);

  if (!locale) {
    notFound();
  }

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "UTC",
  };
});
