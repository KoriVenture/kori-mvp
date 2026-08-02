import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/en/dashboard/",
        "/fr/dashboard/",
        "/es/dashboard/",
        "/en/simulator",
        "/fr/simulator",
        "/es/simulator",
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sitemap.xml`,
  };
}
