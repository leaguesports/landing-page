import { sanityClient } from "@/sanity/client";
import type { MetadataRoute } from "next";

type Venue = {
  id: string;
  slug: string;
  location: {
    slug: string;
  };
  broadcasts: {
    slug: string;
  }[];
};

async function getVenues() {
  const venues = await sanityClient.fetch<Venue[]>(`
    *[_type == "venue"] {
      "id": _id,
      "slug": slug.current,
      "location": {
        "slug": location->slug.current,
      },
      "broadcasts": broadcasts[]-> {
        "slug": slug.current,
      }
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/watch`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const venues = await getVenues();

  const locationSports = new Map<string, string[]>();

  for (const venue of venues) {
    for (const broadcast of venue.broadcasts) {
      if (!locationSports.has(venue.location.slug)) {
        locationSports.set(venue.location.slug, []);
      }
      locationSports.get(venue.location.slug)?.push(broadcast.slug);
    }
  }

  const locationRoutes: MetadataRoute.Sitemap = [];

  for (const [location, sports] of locationSports.entries()) {
    for (const sport of sports) {
      locationRoutes.push({
        url: `${baseUrl}/watch/${sport}/${location}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      });
    }
  }

  return [...staticRoutes, ...locationRoutes];
}
