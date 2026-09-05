export type HomepageStats = {
  watchVenues: number;
  playVenues: number;
  events: number;
  guides: number;
};

export const EMPTY_HOMEPAGE_STATS: HomepageStats = {
  watchVenues: 0,
  playVenues: 0,
  events: 0,
  guides: 0,
};

/** Same Watch/Play rules as directory search in `venues.ts`. */
export const HOMEPAGE_STATS_QUERY = `{
  "watchVenues": count(*[_type == "venue" && count(broadcasts) > 0]),
  "playVenues": count(*[_type == "venue" && count(sports) > 0]),
  "events": count(*[_type == "event"]),
  "screenings": count(*[_type == "venue"].upcoming_screenings[]),
  "guides": count(*[_type == "guide"])
}`;

type HomepageStatsRow = {
  watchVenues?: unknown;
  playVenues?: unknown;
  events?: unknown;
  screenings?: unknown;
  guides?: unknown;
};

function asCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

export function normalizeHomepageStats(
  row: HomepageStatsRow | null | undefined,
): HomepageStats {
  if (!row) return { ...EMPTY_HOMEPAGE_STATS };
  return {
    watchVenues: asCount(row.watchVenues),
    playVenues: asCount(row.playVenues),
    events: asCount(row.events) + asCount(row.screenings),
    guides: asCount(row.guides),
  };
}

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

/**
 * Live inventory for the homepage tiles.
 * Watch = venues with broadcasts, Play = venues with sports.
 * Events = CMS event docs plus venue upcoming_screenings.
 * Guides replaces the unused "Active players" marketing figure.
 */
export async function getHomepageStats(): Promise<HomepageStats> {
  if (!isSanityConfigured()) return { ...EMPTY_HOMEPAGE_STATS };

  try {
    const { sanityClient } = await import("@/sanity/client");
    const row = await sanityClient.fetch<HomepageStatsRow>(HOMEPAGE_STATS_QUERY);
    return normalizeHomepageStats(row);
  } catch (error) {
    console.error("[homepage] stats fetch failed", error);
    return { ...EMPTY_HOMEPAGE_STATS };
  }
}
