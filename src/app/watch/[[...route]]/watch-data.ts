import { sanityClient } from "@/sanity/client";
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

export async function getVenuesByLocationAndSport(
  location: string,
  sport: string,
) {
  if (!location || !sport) return [];

  // Watch = venue broadcasts (sports this venue screens).
  const venues = await sanityClient.fetch<WatchVenue[]>(
    `*[_type == "venue" && 
        $sport in broadcasts[]->slug.current && 
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

/**
 * Exact suburb/location match first; if empty and a parent city exists,
 * return city-level venues for a graceful nearby fallback.
 */
export async function getVenuesByLocationAndSportWithFallback(
  locationSlug: string,
  sportSlug: string,
  location: WatchLocation | null,
): Promise<WatchVenueResults> {
  const parentSlug = location?.parentSlug ?? null;
  const isSuburb =
    location?.type === "suburb" || Boolean(parentSlug);

  // Prefer strict suburb match so empty suburb never silently widens.
  const exactQuery = isSuburb
    ? `*[_type == "venue" && 
        $sport in broadcasts[]->slug.current && 
        location->slug.current == $location
        ] {
            "id": _id,
            "slug": slug.current,
            "name": name,
        }`
    : null;

  const exact = exactQuery
    ? await sanityClient.fetch<WatchVenue[]>(exactQuery, {
        location: locationSlug,
        sport: sportSlug,
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

  const locations = await sanityClient.fetch<WatchLocation[]>(
    `*[_type == "location" && type == "suburb" && (
        count(*[_type == "venue" &&
            $sportSlug in broadcasts[]->slug.current &&
            (
                location->_id == ^._id ||
                location->parent->_id == ^._id
            )
        ]) > 0
    )] | order(title asc) {
        "id": _id,
        "slug": slug.current,
        "title": title,
    }`,
    { sportSlug },
  );
  return locations;
}
