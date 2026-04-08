import { sanityClient } from "@/sanity/client";
import type { PlayLocation, PlaySport, PlayVenue } from "./types";

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://leaguesports.co.za";
}

export async function getLocationBySlug(slug: string) {
  if (!slug) return null;

  const location = await sanityClient.fetch<PlayLocation>(
    `*[_type == "location" && slug.current == $slug][0] {
          "id": _id,
          "slug": slug.current,
          "title": title,
          }`,
    { slug },
  );

  return location;
}

export async function getSportBySlug(slug: string) {
  if (!slug) return null;

  const sport = await sanityClient.fetch<PlaySport>(
    `*[_type == "sport" && slug.current == $slug][0] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`,
    { slug },
  );

  return sport;
}

export async function getVenuesByLocationAndSport(
  location: string,
  sport: string,
) {
  if (!location || !sport) return [];

  const venues = await sanityClient.fetch<PlayVenue[]>(
    `*[_type == "venue" && 
        $sport in sports[]->slug.current && 
        (
            location->slug.current == $location || 
            location->parent->slug.current == $location
        )
        ] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`,
    { location, sport },
  );

  return venues;
}
