import { scoreboardHeroImage } from "./gallery.ts";

/** How many photo venues the home row will show. */
export const FEATURED_HOME_VENUE_LIMIT = 8;

/** Fewer than this and the row stays off the page. */
export const FEATURED_HOME_VENUE_MIN = 3;

export type FeaturedHomeVenue = {
  slug: string;
  name: string;
  place: string | null;
  sports: { slug: string; name: string }[];
  imageUrl: string;
  imageAlt: string;
};

type PhotoVenue = {
  slug: string;
  hero_image?: Parameters<typeof scoreboardHeroImage>[0]["hero_image"];
  gallery?: Parameters<typeof scoreboardHeroImage>[0]["gallery"];
};

/**
 * Venues with a real photo of the place: `hero_image`, otherwise the first
 * gallery image. Sport catalog artwork does not qualify.
 * Preserves the caller's order. Returns nothing when fewer than three qualify.
 */
export function selectFeaturedHomeVenues<T extends PhotoVenue>(venues: T[]): T[] {
  const seen = new Set<string>();
  const qualified: T[] = [];
  for (const venue of venues) {
    const slug = venue.slug.trim().toLowerCase();
    if (!slug || seen.has(slug)) continue;
    if (!scoreboardHeroImage(venue)) continue;
    seen.add(slug);
    qualified.push(venue);
    if (qualified.length >= FEATURED_HOME_VENUE_LIMIT) break;
  }
  if (qualified.length < FEATURED_HOME_VENUE_MIN) return [];
  return qualified;
}
