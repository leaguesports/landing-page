import { sanityClient } from "@/sanity/client";
import {
  mapVenueRow,
  VENUE_IN_LOCATION,
  VENUE_PROJECTION,
  type VenueDetail,
  type VenueRow,
} from "@/services/venueQuery";
import {
  activityDisplayName,
  activityQuerySlugs,
  buildIntentActivity,
  type IntentActivity,
} from "./activity.ts";
import type { IntentKind } from "./paths.ts";

export type IntentLocation = {
  id: string;
  slug: string;
  title: string;
  type?: string | null;
  parentSlug?: string | null;
  parentTitle?: string | null;
};

export type IntentVenueResults = {
  venues: VenueDetail[];
  usedCityFallback: boolean;
  suburbTitle: string | null;
  cityTitle: string | null;
};

export type IntentChoice = {
  id: string;
  slug: string;
  name: string;
  kind: "sport" | "series";
  sportSlug?: string | null;
};

async function fetchVenuesForIntent(
  intent: IntentKind,
  location: string,
  querySlugs: string[],
): Promise<VenueDetail[]> {
  if (!location || querySlugs.length === 0) return [];

  const rows = await sanityClient.fetch<VenueRow[]>(
    intent === "watch"
      ? `*[
          _type == "venue" &&
          count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0 &&
          ${VENUE_IN_LOCATION}
        ] | order(name asc) {
          ${VENUE_PROJECTION}
        }`
      : `*[
          _type == "venue" &&
          count((sports[]->slug.current)[@ in $sportSlugs]) > 0 &&
          ${VENUE_IN_LOCATION}
        ] | order(name asc) {
          ${VENUE_PROJECTION}
        }`,
    { location, sportSlugs: querySlugs },
  );

  return rows.map(mapVenueRow).filter((v): v is VenueDetail => v !== null);
}

export async function getLocationBySlug(
  slug: string,
): Promise<IntentLocation | null> {
  if (!slug) return null;

  return sanityClient.fetch<IntentLocation | null>(
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
}

export async function resolveActivityFromCms(
  slug: string,
): Promise<IntentActivity | null> {
  if (!slug) return null;

  const [series, sport] = await Promise.all([
    sanityClient.fetch<{
      slug: string;
      name: string;
      sportSlug: string | null;
    } | null>(
      `*[_type == "series" && slug.current == $slug][0] {
        "slug": slug.current,
        "name": name,
        "sportSlug": sport->slug.current,
      }`,
      { slug },
    ),
    sanityClient.fetch<{ slug: string; name: string } | null>(
      `*[_type == "sport" && slug.current == $slug][0] {
        "slug": slug.current,
        "name": name,
      }`,
      { slug },
    ),
  ]);

  if (series?.slug) {
    return buildIntentActivity({
      slug: series.slug,
      name: series.name,
      kind: "series",
      sportSlug: series.sportSlug,
    });
  }

  if (sport?.slug) {
    return buildIntentActivity({
      slug: sport.slug,
      name: sport.name,
      kind: "sport",
      sportSlug: sport.slug,
    });
  }

  // Known catalog / series alias without a CMS document yet.
  const querySlugs = activityQuerySlugs(slug);
  if (querySlugs.length === 0) return null;
  if (querySlugs.length === 1 && querySlugs[0] === slug) {
    // Unknown bare slug with no CMS match — still allow soft pages.
    return buildIntentActivity({ slug, name: activityDisplayName(slug) });
  }
  return buildIntentActivity({ slug, name: activityDisplayName(slug) });
}

export async function getVenuesByLocationAndActivityWithFallback(
  intent: IntentKind,
  locationSlug: string,
  activity: IntentActivity,
  location: IntentLocation | null,
): Promise<IntentVenueResults> {
  const parentSlug = location?.parentSlug ?? null;
  const isSuburb = location?.type === "suburb" || Boolean(parentSlug);
  const querySlugs = activity.querySlugs;

  const exact = await fetchVenuesForIntent(intent, locationSlug, querySlugs);

  if (exact.length > 0 || !isSuburb || !parentSlug) {
    return {
      venues: exact,
      usedCityFallback: false,
      suburbTitle: isSuburb ? (location?.title ?? null) : null,
      cityTitle: location?.parentTitle ?? null,
    };
  }

  const nearby = await fetchVenuesForIntent(intent, parentSlug, querySlugs);

  return {
    venues: nearby,
    usedCityFallback: nearby.length > 0,
    suburbTitle: location?.title ?? null,
    cityTitle: location?.parentTitle ?? parentSlug,
  };
}

export async function listWatchActivities(): Promise<IntentChoice[]> {
  const [sports, series] = await Promise.all([
    sanityClient.fetch<IntentChoice[]>(
      `*[_type == "sport" &&
        count(*[_type == "venue" && defined(broadcasts) && ^._id in broadcasts[]._ref]) > 0
      ] | order(name asc) {
        "id": _id,
        "name": name,
        "slug": slug.current,
        "kind": "sport",
        "sportSlug": slug.current,
      }`,
    ),
    sanityClient.fetch<IntentChoice[]>(
      `*[_type == "series" && defined(slug.current)] | order(name asc) {
        "id": _id,
        "name": name,
        "slug": slug.current,
        "kind": "series",
        "sportSlug": sport->slug.current,
      }`,
    ),
  ]);

  return [...(sports ?? []), ...(series ?? [])].filter((item) => item.slug);
}

export async function listPlaySports(): Promise<IntentChoice[]> {
  const sports = await sanityClient.fetch<IntentChoice[]>(
    `*[_type == "sport" &&
      count(*[_type == "venue" && defined(sports) && ^._id in sports[]._ref]) > 0
    ] | order(name asc) {
      "id": _id,
      "name": name,
      "slug": slug.current,
      "kind": "sport",
      "sportSlug": slug.current,
    }`,
  );
  return (sports ?? []).filter((item) => item.slug);
}

export async function listLocationsForActivity(
  intent: IntentKind,
  activity: IntentActivity,
): Promise<IntentLocation[]> {
  const sportSlugs = activity.querySlugs;
  if (sportSlugs.length === 0) return [];

  const refFilter =
    intent === "watch"
      ? `count((broadcasts[]->slug.current)[@ in $sportSlugs]) > 0`
      : `count((sports[]->slug.current)[@ in $sportSlugs]) > 0`;

  return sanityClient.fetch<IntentLocation[]>(
    `*[_type == "location" && type == "suburb" && (
      count(*[_type == "venue" &&
        ${refFilter} &&
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
      "type": type,
      "parentSlug": parent->slug.current,
      "parentTitle": parent->title,
    }`,
    { sportSlugs },
  );
}

/** Pairs with at least one matching venue — used by sitemap. */
export async function listIndexedIntentPairs(intent: IntentKind): Promise<
  {
    activitySlug: string;
    locationSlug: string;
    updatedAt: string | null;
  }[]
> {
  const field = intent === "watch" ? "broadcasts" : "sports";

  const rows = await sanityClient.fetch<
    {
      activitySlugs: (string | null)[] | null;
      locationSlug: string | null;
      updatedAt: string | null;
    }[]
  >(
    `*[_type == "venue" && count(${field}) > 0] {
      "updatedAt": _updatedAt,
      "locationSlug": coalesce(
        location->slug.current,
        address.suburb->slug.current,
        address.city->slug.current
      ),
      "activitySlugs": ${field}[]->slug.current
    }`,
  );

  const pairs = new Map<
    string,
    { activitySlug: string; locationSlug: string; updatedAt: string | null }
  >();

  for (const row of rows ?? []) {
    const locationSlug = row.locationSlug?.trim();
    if (!locationSlug) continue;
    for (const activitySlug of row.activitySlugs ?? []) {
      if (typeof activitySlug !== "string" || !activitySlug.trim()) continue;
      const key = `${activitySlug}::${locationSlug}`;
      const existing = pairs.get(key);
      if (
        !existing ||
        (row.updatedAt &&
          (!existing.updatedAt || row.updatedAt > existing.updatedAt))
      ) {
        pairs.set(key, {
          activitySlug,
          locationSlug,
          updatedAt: row.updatedAt,
        });
      }
    }
  }

  if (intent === "watch") {
    // Series URLs (e.g. /watch/f1/midrand) that map onto parent sport coverage.
    const series = await sanityClient.fetch<
      { slug: string; sportSlug: string | null }[]
    >(
      `*[_type == "series" && defined(slug.current)] {
        "slug": slug.current,
        "sportSlug": sport->slug.current,
      }`,
    );

    for (const item of series ?? []) {
      if (!item.slug || !item.sportSlug) continue;
      for (const pair of [...pairs.values()]) {
        if (pair.activitySlug !== item.sportSlug) continue;
        const key = `${item.slug}::${pair.locationSlug}`;
        if (!pairs.has(key)) {
          pairs.set(key, {
            activitySlug: item.slug,
            locationSlug: pair.locationSlug,
            updatedAt: pair.updatedAt,
          });
        }
      }
    }
  }

  return [...pairs.values()];
}
