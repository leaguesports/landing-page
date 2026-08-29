import { CITY_DIRECTORY } from "@/data/cities";
import { sanityClient } from "@/sanity/client";
import type { MetadataRoute } from "next";
import { listGuides } from "./guides/[[...route]]/actions";

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

async function getVenues() {
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

  return venues;
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://leaguesports.co.za";
}

function toLastModified(value: string | null | undefined): Date {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

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

  const venues = await getVenues();

  const venueRoutes: MetadataRoute.Sitemap = [];
  const locationSports = new Map<string, string[]>();

  for (const venue of venues) {
    if (!venue.slug) continue;

    venueRoutes.push({
      url: `${baseUrl}/venues/${venue.slug}`,
      lastModified: toLastModified(venue.updatedAt),
      changeFrequency: "daily",
      priority: 0.9,
    });

    const locationSlug = venue.location?.slug;
    if (!locationSlug) continue;

    const broadcasts = Array.isArray(venue.broadcasts) ? venue.broadcasts : [];
    for (const broadcast of broadcasts) {
      const sportSlug = broadcast?.slug;
      if (!sportSlug) continue;

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

  const guides = await listGuides();

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...cityHubRoutes,
    ...locationRoutes,
    ...guideRoutes,
    ...venueRoutes,
  ];
}
