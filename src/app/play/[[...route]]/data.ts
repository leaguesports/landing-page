import { sanityClient } from "@/sanity/client";
import { sportSlugVariants, VENUE_IN_LOCATION } from "@/services/venueQuery";
import type {
  PlayLocation,
  PlaySport,
  PlayVenue,
  PlayVenueResults,
} from "./types";

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
          "type": type,
          "parentSlug": parent->slug.current,
          "parentTitle": parent->title,
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

  // Play = venue sports (sports hosted at this venue).
  const sportSlugs = sportSlugVariants(sport);
  const venues = await sanityClient.fetch<PlayVenue[]>(
    `*[_type == "venue" && 
        count((sports[]->slug.current)[@ in $sportSlugs]) > 0 && 
        ${VENUE_IN_LOCATION}
        ] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`,
    { location, sportSlugs },
  );

  return venues;
}

/**
 * Requested location slug first; if that is a suburb with no hits, fall back
 * to the parent city slug. VENUE_IN_LOCATION also has city/parent clauses,
 * which are no-ops when $location is a suburb slug.
 */
export async function getVenuesByLocationAndSportWithFallback(
  locationSlug: string,
  sportSlug: string,
  location: PlayLocation | null,
): Promise<PlayVenueResults> {
  const parentSlug = location?.parentSlug ?? null;
  const isSuburb =
    location?.type === "suburb" || Boolean(parentSlug);

  const exactQuery = isSuburb
    ? `*[_type == "venue" && 
        count((sports[]->slug.current)[@ in $sportSlugs]) > 0 && 
        ${VENUE_IN_LOCATION}
        ] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`
    : null;

  const exact = exactQuery
    ? await sanityClient.fetch<PlayVenue[]>(exactQuery, {
        location: locationSlug,
        sportSlugs: sportSlugVariants(sportSlug),
      })
    : await getVenuesByLocationAndSport(locationSlug, sportSlug);

  if (exact.length > 0 || !isSuburb || !parentSlug) {
    return {
      venues: exact,
      usedCityFallback: false,
      suburbTitle: isSuburb ? (location?.title ?? null) : null,
      cityTitle: location?.parentTitle ?? null,
    };
  }

  const nearby = await getVenuesByLocationAndSport(parentSlug, sportSlug);

  return {
    venues: nearby,
    usedCityFallback: nearby.length > 0,
    suburbTitle: location?.title ?? null,
    cityTitle: location?.parentTitle ?? parentSlug,
  };
}
