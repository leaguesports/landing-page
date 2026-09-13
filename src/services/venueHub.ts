import { sanityClient } from "@/sanity/client";
import {
  VENUE_HUB_RECOMMENDED_LIMIT,
  capVenueHubSearchResults,
  venueHubMatchTerm,
  type VenueHubSearchHit,
} from "@/lib/venues/hub";
import {
  VENUE_IN_LOCATION,
  VENUE_PROJECTION,
  mapVenueRow,
  type VenueDetail,
  type VenueRow,
} from "./venueQuery";

export const VENUE_HUB_SEARCH_QUERY = `*[
  _type == "venue"
  && defined(slug.current)
  && defined(name)
  && (
    name match $term
    || slug.current match $term
  )
] | order(name asc) [0...10] {
  _id,
  name,
  "slug": slug.current,
  "city": coalesce(address.city->title, address.suburb->title, location->parent->title, location->title)
}`;

export const VENUE_HUB_RECOMMENDED_QUERY = `*[
  _type == "venue"
  && defined(slug.current)
  && defined(name)
  && ($location == "" || ${VENUE_IN_LOCATION})
] | order(coalesce(rating, 0) desc, name asc) [0...6] {
  ${VENUE_PROJECTION}
}`;

export const VENUE_HUB_CITIES_BY_SLUG_QUERY = `*[
  _type == "venue"
  && slug.current in $slugs
] [0...12] {
  "slug": slug.current,
  "citySlug": coalesce(
    address.city->slug.current,
    location->parent->slug.current,
    location->slug.current
  )
}`;

type SearchRow = {
  _id?: unknown;
  name?: unknown;
  slug?: unknown;
  city?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toSearchHit(row: SearchRow): VenueHubSearchHit | null {
  const cmsId = asString(row._id);
  const name = asString(row.name);
  const slug = asString(row.slug);
  if (!cmsId || !name || !slug) return null;
  return {
    cmsId,
    name,
    slug,
    city: asString(row.city) || null,
  };
}

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

/** Name/slug typeahead — capped GROQ, never the full catalog. */
export async function searchVenuesByName(
  query: string,
): Promise<VenueHubSearchHit[]> {
  const term = venueHubMatchTerm(query);
  if (!term || !isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<SearchRow[]>(VENUE_HUB_SEARCH_QUERY, {
      term,
    });
    return capVenueHubSearchResults(
      (rows ?? [])
        .map(toSearchHit)
        .filter((item): item is VenueHubSearchHit => item !== null),
    );
  } catch (error) {
    console.error("[venues-hub] name search failed", error);
    return [];
  }
}

export async function getRecommendedVenues(options: {
  locationSlug?: string | null;
  limit?: number;
} = {}): Promise<VenueDetail[]> {
  if (!isSanityConfigured()) return [];

  const location = options.locationSlug?.trim() || "";
  const limit = options.limit ?? VENUE_HUB_RECOMMENDED_LIMIT;

  try {
    const rows = await sanityClient.fetch<VenueRow[]>(
      VENUE_HUB_RECOMMENDED_QUERY,
      { location },
    );
    return (rows ?? [])
      .map(mapVenueRow)
      .filter((venue): venue is VenueDetail => venue !== null)
      .slice(0, limit);
  } catch (error) {
    console.error("[venues-hub] recommended fetch failed", error);
    return [];
  }
}

export async function getVenueCitiesBySlugs(
  slugs: string[],
): Promise<Array<{ slug: string; citySlug: string | null }>> {
  const unique = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (unique.length === 0 || !isSanityConfigured()) return [];

  try {
    const rows = await sanityClient.fetch<
      Array<{ slug?: unknown; citySlug?: unknown }>
    >(VENUE_HUB_CITIES_BY_SLUG_QUERY, { slugs: unique.slice(0, 12) });
    return (rows ?? [])
      .map((row) => {
        const slug = asString(row.slug);
        if (!slug) return null;
        return { slug, citySlug: asString(row.citySlug) || null };
      })
      .filter((item): item is { slug: string; citySlug: string | null } =>
        Boolean(item),
      );
  } catch (error) {
    console.error("[venues-hub] followed city lookup failed", error);
    return [];
  }
}
