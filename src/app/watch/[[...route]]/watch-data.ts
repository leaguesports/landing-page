import { sanityClient } from "@/sanity/client";
import type {
  WatchLocation,
  WatchSeries,
  WatchSport,
  WatchVenue,
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
