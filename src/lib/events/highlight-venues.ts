import type { FeaturedHomeVenue } from "../venues/featured-home.ts";

/** How many screening venues an event page highlights. The rest stay on Watch. */
export const FIXTURE_VENUE_HIGHLIGHT_LIMIT = 4;

export function withFeaturedVenueCards(
  venues: readonly { slug: string; name: string; city?: string | null }[],
  fetched: readonly FeaturedHomeVenue[],
  sport?: { slug: string; name: string } | null,
): FeaturedHomeVenue[] {
  const bySlug = new Map(fetched.map((card) => [card.slug, card]));
  const sportChip = sport?.slug && sport.name ? [{ slug: sport.slug, name: sport.name }] : [];
  return venues.map((venue) => {
    const found = bySlug.get(venue.slug);
    if (found) {
      if (found.sports.length > 0 || sportChip.length === 0) return found;
      return { ...found, sports: sportChip };
    }
    return {
      slug: venue.slug,
      name: venue.name,
      place: venue.city?.trim() || null,
      sports: sportChip,
      imageUrl: "",
      imageAlt: venue.name,
    };
  });
}

export function highlightFixtureVenues<T extends { slug: string; name: string }>(
  venues: readonly T[],
  hostSlug?: string | null,
  limit = FIXTURE_VENUE_HIGHLIGHT_LIMIT,
): T[] {
  const host = hostSlug?.trim().toLowerCase() ?? "";
  return [...venues]
    .sort((a, b) => {
      const aHost = host && a.slug.toLowerCase() === host ? 0 : 1;
      const bHost = host && b.slug.toLowerCase() === host ? 0 : 1;
      if (aHost !== bHost) return aHost - bHost;
      return a.name.localeCompare(b.name, "en");
    })
    .slice(0, Math.max(0, limit));
}
