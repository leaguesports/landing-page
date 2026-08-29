import { CITY_DIRECTORY, SEARCH_SPORTS } from "@/data/cities";
import {
  sportSlugVariants,
  type VenueSearchIntent,
} from "@/lib/search/venueSearch";
import { sanityClient } from "@/sanity/client";
import {
  mapVenueRow,
  VENUE_IN_LOCATION,
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
export {
  mapVenueRow,
  resolveVenueImage,
  VENUE_IN_LOCATION,
  VENUE_PROJECTION,
} from "./venueQuery";

export type VenueSearchFilters = {
  intent?: VenueSearchIntent | null;
  sportSlug?: string | null;
  locationSlug?: string | null;
};

export type VenueFilterOption = {
  name: string;
  slug: string;
  kind?: string;
};

export async function listVenues() {
  return searchVenues();
}

/**
 * Directory search against Sanity.
 * Watch = broadcasts, Play = sports, location = address + location ref.
 */
export async function searchVenues(
  filters: VenueSearchFilters = {},
): Promise<VenueDetail[]> {
  const intent =
    filters.intent === "play" || filters.intent === "watch"
      ? filters.intent
      : "";
  const sportSlugs = sportSlugVariants(filters.sportSlug);
  const location = filters.locationSlug?.trim() || "";

  const venues = await sanityClient.fetch<VenueRow[]>(
    `*[
      _type == "venue"
      && (
        count($sportSlugs) == 0 || (
          (
            $intent == "play" &&
            count((sports[]->slug.current)[@ in $sportSlugs]) > 0
          ) ||
          (
            $intent == "watch" &&
            count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0
          ) ||
          (
            $intent == "" && (
              count((sports[]->slug.current)[@ in $sportSlugs]) > 0 ||
              count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0
            )
          )
        )
      )
      && ($location == "" || ${VENUE_IN_LOCATION})
      && ($intent != "watch" || count(broadcasts) > 0)
      && ($intent != "play" || count(sports) > 0)
    ] | order(_createdAt desc) {
      ${VENUE_PROJECTION}
    }`,
    { intent, sportSlugs, location },
  );

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

export async function listVenueFilterOptions(): Promise<{
  sports: VenueFilterOption[];
  locations: VenueFilterOption[];
}> {
  const staticSports: VenueFilterOption[] = SEARCH_SPORTS.map((sport) => ({
    name: sport.name,
    slug: sport.slug,
    kind: "sport",
  }));
  const staticLocations: VenueFilterOption[] = CITY_DIRECTORY.flatMap(
    (city) => [
      { name: city.name, slug: city.slug, kind: "city" as const },
      ...city.suburbs.map((suburb) => ({
        name: suburb.name,
        slug: suburb.slug,
        kind: "suburb" as const,
      })),
    ],
  );

  try {
    const [sports, locations] = await Promise.all([
      sanityClient.fetch<VenueFilterOption[]>(
        `*[_type == "sport" && defined(slug.current)] | order(name asc) {
          name,
          "slug": slug.current,
          "kind": "sport"
        }`,
      ),
      sanityClient.fetch<VenueFilterOption[]>(
        `*[_type == "location" && defined(slug.current)] | order(title asc) {
          "name": title,
          "slug": slug.current,
          "kind": type
        }`,
      ),
    ]);

    return {
      sports: mergeOptions(staticSports, sports),
      locations: mergeOptions(staticLocations, locations),
    };
  } catch {
    return { sports: staticSports, locations: staticLocations };
  }
}

function mergeOptions(
  fallback: VenueFilterOption[],
  live: VenueFilterOption[] | null | undefined,
): VenueFilterOption[] {
  const map = new Map<string, VenueFilterOption>();
  for (const option of [...fallback, ...(live ?? [])]) {
    if (!option?.slug) continue;
    map.set(option.slug, {
      name: option.name || option.slug,
      slug: option.slug,
      kind: option.kind,
    });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
