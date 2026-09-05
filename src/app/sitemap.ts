import { CITY_DIRECTORY } from "@/data/cities";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export const maxDuration = 60;

type SitemapVenue = {
  id: string;
  slug: string;
  updatedAt: string | null;
  location: {
    slug: string | null;
  } | null;
  broadcasts:
    | {
        slug: string | null;
      }[]
    | null;
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
      url: `${baseUrl}/watch`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/venues`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
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
        url: `${baseUrl}/watch/${city.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.95,
      },
      {
        url: `${baseUrl}/play/${city.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.95,
      },
    ],
  );

  return [...staticRoutes, ...cityHubRoutes];
}

async function getVenues(): Promise<SitemapVenue[]> {
  if (!isSanityConfigured()) return [];

  try {
    const { sanityClient } = await import("@/sanity/client");
    // Watch directory URLs are built from venue `broadcasts` (not `sports`).
    const venues = await sanityClient.fetch<SitemapVenue[]>(`
      *[_type == "venue"] {
        "id": _id,
        "slug": slug.current,
        "updatedAt": _updatedAt,
        "location": {
          "slug": location->slug.current,
        },
        "broadcasts": coalesce(
          broadcasts[]-> {
            "slug": slug.current,
          },
          []
        )
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const now = new Date();
  const fallback = staticAndCityRoutes(baseUrl, now);

  try {
    const [venues, guides] = await Promise.all([getVenues(), getGuides()]);

    const venueRoutes: MetadataRoute.Sitemap = [];
    const locationSports = new Map<string, string[]>();

    for (const venue of venues) {
      if (!isSlug(venue.slug)) continue;

      venueRoutes.push({
        url: `${baseUrl}/venues/${venue.slug}`,
        lastModified: toLastModified(venue.updatedAt),
        changeFrequency: "daily",
        priority: 0.9,
      });

      const locationSlug = venue.location?.slug;
      if (!isSlug(locationSlug)) continue;

      const broadcasts = Array.isArray(venue.broadcasts) ? venue.broadcasts : [];
      for (const broadcast of broadcasts) {
        const sportSlug = broadcast?.slug;
        if (!isSlug(sportSlug)) continue;

        if (!locationSports.has(locationSlug)) {
          locationSports.set(locationSlug, []);
        }
        locationSports.get(locationSlug)?.push(sportSlug);
      }
    }

    const locationRoutes: MetadataRoute.Sitemap = [];

    for (const [location, sports] of locationSports.entries()) {
      const uniqueSports = [...new Set(sports)];
      for (const sport of uniqueSports) {
        locationRoutes.push({
          url: `${baseUrl}/watch/${sport}/${location}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 1,
        });
      }
    }

    const guideRoutes: MetadataRoute.Sitemap = guides
      .filter((guide) => isSlug(guide.slug))
      .map((guide) => ({
        url: `${baseUrl}/guides/${guide.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...fallback, ...locationRoutes, ...guideRoutes, ...venueRoutes];
  } catch (error) {
    console.error("[sitemap] generation failed", error);
    return fallback;
  }
}
