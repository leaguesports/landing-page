import { sanityClient } from "@/sanity/client";
import {
  mapVenueRow,
  VENUE_PROJECTION,
  type VenueDetail,
  type VenueRow,
} from "./venueQuery";

export type {
  Venue,
  VenueDetail,
  VenueRow,
  VenueScreening,
} from "./venueQuery";
export { mapVenueRow, resolveVenueImage, VENUE_PROJECTION } from "./venueQuery";

export async function listVenues() {
  const venues = await sanityClient.fetch<VenueRow[]>(`
    *[_type == "venue"] | order(_createdAt desc) {
      ${VENUE_PROJECTION}
    }
    `);

  return venues.map(mapVenueRow).filter((v): v is VenueDetail => v !== null);
}

export async function getVenueBySlug(
  slug: string,
): Promise<VenueDetail | null> {
  if (!slug) return null;

  const row = await sanityClient.fetch<VenueRow | null>(
    `*[_type == "venue" && slug.current == $slug][0] {
      ${VENUE_PROJECTION}
    }`,
    { slug },
  );

  if (!row) return null;
  return mapVenueRow(row);
}
