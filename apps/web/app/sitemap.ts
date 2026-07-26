import { supportedLocales } from "@kori/i18n";
import type { MetadataRoute } from "next";

const publicPaths = ["", "/stories", "/capital-map"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return supportedLocales.flatMap((locale) =>
    publicPaths.map((pathname) => ({
      url: `${origin}/${locale}${pathname}`,
      changeFrequency: pathname ? ("monthly" as const) : ("weekly" as const),
      priority: pathname ? 0.7 : 1,
    })),
  );
}
