import { sanityClient } from "@/sanity/client";
import { sportSlugVariants, VENUE_IN_LOCATION } from "@/services/venueQuery";
import type {
  WatchLocation,
  WatchSeries,
  WatchSport,
  WatchVenue,
  WatchVenueResults,
} from "./watch-types";

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

  const location = await sanityClient.fetch<WatchLocation>(
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

  const sport = await sanityClient.fetch<WatchSport>(
    `*[_type == "sport" && slug.current == $slug][0] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`,
    { slug },
  );

  return sport;
}

async function getVenuesByLocationAndSport(
  location: string,
  sport: string,
) {
  if (!location || !sport) return [];

  // Watch = venue broadcasts (sports this venue screens).
  const sportSlugs = sportSlugVariants(sport);
  const venues = await sanityClient.fetch<WatchVenue[]>(
    `*[_type == "venue" && 
        count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0 && 
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
  location: WatchLocation | null,
): Promise<WatchVenueResults> {
  const parentSlug = location?.parentSlug ?? null;
  const isSuburb =
    location?.type === "suburb" || Boolean(parentSlug);

  const exactQuery = isSuburb
    ? `*[_type == "venue" && 
        count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0 && 
        ${VENUE_IN_LOCATION}
        ] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`
    : null;

  const exact = exactQuery
    ? await sanityClient.fetch<WatchVenue[]>(exactQuery, {
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

export async function getBroadcastSports() {
  const sports = await sanityClient.fetch<WatchSport[]>(
    `*[_type == "sport" &&
        count(*[_type == "venue" &&
            defined(broadcasts) &&
            ^._id in broadcasts[]._ref
        ]) > 0
    ] | order(name asc) {
        "id": _id,
        "name": name,
        "slug": slug.current,
    }`,
  );
  return sports;
}

export async function getBroadcastSeries() {
  const series = await sanityClient.fetch<WatchSeries[]>(
    `*[_type == "series" &&
        count(*[_type == "venue" &&
            defined(broadcasts) &&
            (
                ^._id in broadcasts[]._ref ||
                (defined(^.sport._ref) && ^.sport._ref in broadcasts[]._ref)
            )
        ]) > 0
    ] | order(name asc) {
            "id": _id,
            "name": name,
            "slug": slug.current,
            "sportSlug": sport->slug.current,
        }`,
  );
  return series;
}

/**
 * Returns a list of locations with venues that broadcast sports.
 */
export async function getWatchLocationsBySportSlug(sportSlug: string) {
  if (!sportSlug) return [];

  const sportSlugs = sportSlugVariants(sportSlug);
  const locations = await sanityClient.fetch<WatchLocation[]>(
    `*[_type == "location" && type == "suburb" && (
        count(*[_type == "venue" &&
            count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0 &&
            (
                location->_id == ^._id ||
                location->parent->_id == ^._id ||
                address.suburb._ref == ^._id ||
                address.city._ref == ^._id
            )
        ]) > 0
    )] | order(title asc) {
        "id": _id,
        "slug": slug.current,
        "title": title,
    }`,
    { sportSlugs },
  );
  return locations;
}
