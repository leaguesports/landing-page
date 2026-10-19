import { distanceKm, type GeoCoords } from "../geo/distance.ts";
import { matchesVenueNameQuery } from "../search/nameSearch.ts";
import type { VenueOption } from "./venue-options.ts";
import { findVenueBySlug } from "./quick-start-defaults.ts";

/** Same visible cap as the inline `VenuePicker` list. */
export const CAPTURE_VENUE_LIST_LIMIT = 24;

function venueDistanceKm(coords: GeoCoords, venue: VenueOption): number {
  if (venue.latitude == null || venue.longitude == null) {
    return Number.POSITIVE_INFINITY;
  }
  return distanceKm(coords, {
    latitude: venue.latitude,
    longitude: venue.longitude,
  });
}

/**
 * Courts for the capture picker: name filter, optional distance sort, then
 * the last captured court pinned first when it is still in that list.
 * Pinning happens before the cap so a stored court is not dropped for being far.
 */
export function orderCaptureVenues(
  venues: readonly VenueOption[],
  options: {
    query?: string;
    coords?: GeoCoords | null;
    pinnedSlug?: string | null;
    limit?: number;
  } = {},
): VenueOption[] {
  const query = options.query ?? "";
  let list = venues.filter((venue) =>
    matchesVenueNameQuery(
      {
        name: venue.name,
        slug: venue.slug,
        city: venue.city,
        suburb: venue.suburb,
      },
      query,
    ),
  );

  if (options.coords) {
    const coords = options.coords;
    list = [...list].sort(
      (a, b) => venueDistanceKm(coords, a) - venueDistanceKm(coords, b),
    );
  }

  const pinned = findVenueBySlug(list, options.pinnedSlug);
  if (pinned) {
    list = [pinned, ...list.filter((venue) => venue.id !== pinned.id)];
  }

  const limit = options.limit ?? CAPTURE_VENUE_LIST_LIMIT;
  return list.slice(0, limit);
}
