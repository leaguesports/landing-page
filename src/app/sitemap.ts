import { CITY_DIRECTORY } from "@/data/cities";
import { intentPath } from "@/lib/intent/paths";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const maxDuration = 60;

type SitemapVenue = {
  id: string;
  slug: string;
  updatedAt: string | null;
};

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

function isSlug(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !value.includes(" ");
}

function toLastModified(value: string | null | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function staticAndCityRoutes(baseUrl: string, now: Date): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/watch`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/communities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/athletes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const cityHubRoutes: MetadataRoute.Sitemap = CITY_DIRECTORY.flatMap(
    (city) => [
      {
        url: `${baseUrl}/venues?intent=watch&location=${city.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
      {
        url: `${baseUrl}/venues?intent=play&location=${city.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
    ],
  );

  return [...staticRoutes, ...cityHubRoutes];
}

async function getVenues(): Promise<SitemapVenue[]> {
  if (!isSanityConfigured()) return [];

  try {
    const { sanityClient } = await import("@/sanity/client");
    const venues = await sanityClient.fetch<SitemapVenue[]>(`
      *[_type == "venue"] {
        "id": _id,
        "slug": slug.current,
        "updatedAt": _updatedAt
      }
    `);

    return Array.isArray(venues) ? venues : [];
  } catch (error) {
    console.error("[sitemap] venue fetch failed", error);
    return [];
  }
}

async function getGuides(): Promise<{ slug: string }[]> {
  if (!isSanityConfigured()) return [];

  try {
    const { listGuides } = await import("./guides/[[...route]]/actions");
    const rows = await listGuides();
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("[sitemap] guide fetch failed", error);
    return [];
  }
}

async function getIntentRoutes(
  baseUrl: string,
  now: Date,
): Promise<MetadataRoute.Sitemap> {
  if (!isSanityConfigured()) return [];

  try {
    const { listIndexedIntentPairs } = await import("@/lib/intent/data");
    const [watchPairs, playPairs] = await Promise.all([
      listIndexedIntentPairs("watch"),
      listIndexedIntentPairs("play"),
    ]);

    const routes: MetadataRoute.Sitemap = [];

    for (const pair of watchPairs) {
      if (!isSlug(pair.activitySlug) || !isSlug(pair.locationSlug)) continue;
      routes.push({
        url: `${baseUrl}${intentPath("watch", pair.activitySlug, pair.locationSlug)}`,
        lastModified: toLastModified(pair.updatedAt) || now,
        changeFrequency: "daily",
        priority: 1,
      });
    }

    for (const pair of playPairs) {
      if (!isSlug(pair.activitySlug) || !isSlug(pair.locationSlug)) continue;
      routes.push({
        url: `${baseUrl}${intentPath("play", pair.activitySlug, pair.locationSlug)}`,
        lastModified: toLastModified(pair.updatedAt) || now,
        changeFrequency: "daily",
        priority: 1,
      });
    }

    return routes;
  } catch (error) {
    console.error("[sitemap] intent route fetch failed", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const now = new Date();
  const fallback = staticAndCityRoutes(baseUrl, now);

  try {
    const [venues, guides, intentRoutes] = await Promise.all([
      getVenues(),
      getGuides(),
      getIntentRoutes(baseUrl, now),
    ]);

    const venueRoutes: MetadataRoute.Sitemap = venues
      .filter((venue) => isSlug(venue.slug))
      .map((venue) => ({
        url: `${baseUrl}/venues/${venue.slug}`,
        lastModified: toLastModified(venue.updatedAt),
        changeFrequency: "daily" as const,
        priority: 0.9,
      }));

    const guideRoutes: MetadataRoute.Sitemap = guides
      .filter((guide) => isSlug(guide.slug))
      .map((guide) => ({
        url: `${baseUrl}/guides/${guide.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...fallback, ...intentRoutes, ...guideRoutes, ...venueRoutes];
  } catch (error) {
    console.error("[sitemap] generation failed", error);
    return fallback;
  }
}
