import {
  activitySupportsIntent,
  buildIntentActivity,
} from "./activity.ts";
import type { IntentKind } from "./paths.ts";

/** Venue row used to build sitemap intent pairs without a Sanity round-trip. */
export type IntentPairVenueRow = {
  activitySlugs?: (string | null)[] | null;
  locationSlug?: string | null;
  parentSlug?: string | null;
  suburbSlug?: string | null;
  citySlug?: string | null;
  updatedAt?: string | null;
};

export type IntentPairSeriesRow = {
  slug?: string | null;
  sportSlug?: string | null;
};

export type IndexedIntentPair = {
  activitySlug: string;
  locationSlug: string;
  updatedAt: string | null;
};

function trimSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  return slug ? slug : null;
}

/**
 * Location slugs a venue actually matches on intent pages.
 * Mirrors VENUE_IN_LOCATION: suburb, city, location, and location parent.
 * Do not invent directory cities the CMS never referenced — those 404 or noindex.
 */
export function locationSlugsFromIntentVenueRow(
  row: IntentPairVenueRow,
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const candidate of [
    row.locationSlug,
    row.parentSlug,
    row.suburbSlug,
    row.citySlug,
  ]) {
    const slug = trimSlug(candidate);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
  }
  return slugs;
}

function upsertPair(
  pairs: Map<string, IndexedIntentPair>,
  activitySlug: string,
  locationSlug: string,
  updatedAt: string | null,
): void {
  const key = `${activitySlug}::${locationSlug}`;
  const existing = pairs.get(key);
  if (
    !existing ||
    (updatedAt && (!existing.updatedAt || updatedAt > existing.updatedAt))
  ) {
    pairs.set(key, { activitySlug, locationSlug, updatedAt });
  }
}

function activityIndexedForIntent(
  activitySlug: string,
  intent: IntentKind,
): boolean {
  return activitySupportsIntent(
    buildIntentActivity({ slug: activitySlug }),
    intent,
  );
}

/**
 * Build /{intent}/{activity}/{location} pairs from venue coverage.
 *
 * PR #131 only kept the coalesce(location, suburb, city) slug, so city
 * landings like /play/golf/johannesburg were dropped when venues sat on
 * suburbs. Intent pages still match parent/city via VENUE_IN_LOCATION and
 * canonicalize suburb fallbacks to that city URL — those cities must be
 * in the sitemap.
 */
export function collectIndexedIntentPairs(
  intent: IntentKind,
  rows: IntentPairVenueRow[],
  series: IntentPairSeriesRow[] = [],
): IndexedIntentPair[] {
  const pairs = new Map<string, IndexedIntentPair>();

  for (const row of rows) {
    const locationSlugs = locationSlugsFromIntentVenueRow(row);
    if (locationSlugs.length === 0) continue;
    const updatedAt =
      typeof row.updatedAt === "string" && row.updatedAt.trim()
        ? row.updatedAt
        : null;

    for (const rawActivity of row.activitySlugs ?? []) {
      const activitySlug = trimSlug(rawActivity);
      if (!activitySlug) continue;
      if (!activityIndexedForIntent(activitySlug, intent)) continue;
      for (const locationSlug of locationSlugs) {
        upsertPair(pairs, activitySlug, locationSlug, updatedAt);
      }
    }
  }

  if (intent === "watch") {
    for (const item of series) {
      const seriesSlug = trimSlug(item.slug);
      const sportSlug = trimSlug(item.sportSlug);
      if (!seriesSlug || !sportSlug) continue;
      if (!activityIndexedForIntent(seriesSlug, intent)) continue;
      for (const pair of [...pairs.values()]) {
        if (pair.activitySlug !== sportSlug) continue;
        upsertPair(pairs, seriesSlug, pair.locationSlug, pair.updatedAt);
      }
    }
  }

  return [...pairs.values()];
}
