import {
  defaultLocale,
  isSupportedLocale,
  type SupportedLocale,
} from "@kori/i18n";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const legacyDestinations: Record<string, string> = {
  "/index.html": "",
  "/success-stories.html": "/stories",
  "/capital-map.html": "/capital-map",
  "/fund-manager-dashboard.html": "/dashboard/fund-manager",
  "/angel-investor-dashboard.html": "/dashboard/angel-investor",
  "/startup-founder-dashboard.html": "/dashboard/startup-founder",
  "/kori_smart_contract_simulator.html": "/simulator",
};

function preferredLocale(request: NextRequest): SupportedLocale {
  const storedLocale = request.cookies.get("NEXT_LOCALE")?.value;

  if (isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  const preferences = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((entry, index) => {
      const [language, qualityValue] = entry.trim().split(";q=");
      return {
        index,
        language: language?.toLowerCase().split("-")[0],
        quality: qualityValue ? Number(qualityValue) : 1,
      };
    })
    .filter(
      (entry) =>
        Number.isFinite(entry.quality) && isSupportedLocale(entry.language),
    )
    .sort(
      (left, right) =>
        right.quality - left.quality || left.index - right.index,
    );

  const negotiatedLocale = preferences[0]?.language;

  return isSupportedLocale(negotiatedLocale)
    ? negotiatedLocale
    : defaultLocale;
}

export default function proxy(request: NextRequest) {
  const legacyDestination = legacyDestinations[request.nextUrl.pathname];

  if (legacyDestination !== undefined) {
    const locale = preferredLocale(request);
    const destination = new URL(`/${locale}${legacyDestination}`, request.url);
    return NextResponse.redirect(destination, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    "/index.html",
    "/success-stories.html",
    "/capital-map.html",
    "/fund-manager-dashboard.html",
    "/angel-investor-dashboard.html",
    "/startup-founder-dashboard.html",
    "/kori_smart_contract_simulator.html",
  ],
};
