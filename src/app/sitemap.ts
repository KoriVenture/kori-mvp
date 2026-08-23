import type { MetadataRoute } from "next";

const lastModified = new Date("2026-08-19T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://koriventure.co/",
      lastModified,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://koriventure.co/how-kori-works",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://koriventure.co/join",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://koriventure.co/founders",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://koriventure.co/investors",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://koriventure.co/communities",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://koriventure.co/collective-intelligence",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://koriventure.co/about",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://koriventure.co/privacy",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://koriventure.co/terms",
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
