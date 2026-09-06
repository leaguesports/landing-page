import {
  mergeHubSports,
  SPORT_CATALOG,
  type SportDefinition,
} from "./catalog";
import type { UpcomingFixture } from "./events-feed";
import {
  eventToFeedItem,
  fixturesToPreferredFeedItems,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_FOLLOWED_SCREENINGS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  mergeHubFeedItems,
  normalizePreferredSportSlugs,
  screeningsToFeedItems,
  sortHubFeedPreferringSports,
  uniqueFollowedFixtureSlugs,
  uniqueFollowedVenueSlugs,
  type HubEventRow,
  type HubFeedItem,
  type HubGuideRow,
  type HubScreeningVenueRow,
} from "./hub-feed";

export type { HubFeedItem, HubFeedKind, HubGuideRow } from "./hub-feed";
export {
  eventToFeedItem,
  filterFeedByVenueSlugs,
  formatHubWhen,
  fixturesToPreferredFeedItems,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_FOLLOWED_SCREENINGS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  mergeHubFeedItems,
  normalizePreferredSportSlugs,
  screeningsToFeedItems,
  sortHubFeed,
  sortHubFeedPreferringSports,
  uniqueFollowedVenueSlugs,
} from "./hub-feed";

export type HubDashboardData = {
  sports: SportDefinition[];
  feed: HubFeedItem[];
};

export type GetDashboardHubOptions = {
  /**
   * Sanity venue slugs the signed-in user follows — merged into the feed.
   * Accept a Promise so callers can start this while Railway follow I/O is still in flight.
   */
  followedVenueSlugs?: string[] | Promise<string[]>;
  /**
   * Sport slugs from `/api/me/preferences` — upcoming fixtures matching these
   * are injected into the For you feed.
   */
  preferredSports?: string[] | Promise<string[]>;
  /**
   * Fixture slugs already shown in the followed-fixtures calendar strip —
   * skipped when injecting preference matches to avoid duplicates.
   */
  excludeFixtureSlugs?: string[] | Promise<string[]>;
  /**
   * Optional shared upcoming-fixtures promise so the hub can reuse the same
   * Sanity read as followed-fixture resolution.
   */
  upcomingFixtures?: UpcomingFixture[] | Promise<UpcomingFixture[]>;
};

export const EMPTY_HUB_DASHBOARD: HubDashboardData = {
  sports: SPORT_CATALOG,
  feed: [],
};

const FOLLOWED_SCREENING_FEED_LIMIT = 24;

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

async function loadPreferredFixtureItems(options: {
  preferredSports: string[];
  excludeFixtureSlugs: string[];
  upcomingFixtures?: UpcomingFixture[] | Promise<UpcomingFixture[]>;
}): Promise<HubFeedItem[]> {
  const preferred = normalizePreferredSportSlugs(options.preferredSports);
  if (preferred.length === 0) return [];

  try {
    const fixtures = options.upcomingFixtures
      ? await Promise.resolve(options.upcomingFixtures)
      : await import("@/services/events").then(({ getUpcomingFixtures }) =>
          getUpcomingFixtures({ limit: 24 }),
        );
    return fixturesToPreferredFeedItems(fixtures ?? [], preferred, {
      excludeSlugs: options.excludeFixtureSlugs,
    });
  } catch (error) {
    console.error("[hub] preferred fixtures fetch failed", error);
    return [];
  }
}

/**
 * Editorial + fixture feed for the signed-in hub.
 * Failures degrade to catalog sports and an empty feed — never throw.
 *
 * Generic Sanity reads start immediately. The followed-venue query waits only
 * on `followedVenueSlugs` (when provided), not on the rest of the homepage.
 * Preference-matched upcoming fixtures are merged ahead of generic editorial.
 */
export async function getDashboardHub(
  options: GetDashboardHubOptions = {},
): Promise<HubDashboardData> {
  if (!isSanityConfigured()) return { ...EMPTY_HUB_DASHBOARD };

  const followedSlugsPromise = Promise.resolve(
    options.followedVenueSlugs ?? [],
  )
    .then((slugs) => uniqueFollowedVenueSlugs(slugs))
    .catch(() => [] as string[]);

  const preferredSportsPromise = Promise.resolve(options.preferredSports ?? [])
    .then((sports) => normalizePreferredSportSlugs(sports))
    .catch(() => [] as string[]);

  const excludeFixtureSlugsPromise = Promise.resolve(
    options.excludeFixtureSlugs ?? [],
  )
    .then((slugs) => uniqueFollowedFixtureSlugs(slugs))
    .catch(() => [] as string[]);

  try {
    const [{ sanityClient }, { listVenueFilterOptions }] = await Promise.all([
      import("@/sanity/client"),
      import("@/services/venues"),
    ]);

    const sportsPromise = listVenueFilterOptions()
      .then((opts) => mergeHubSports(SPORT_CATALOG, opts.sports))
      .catch(() => SPORT_CATALOG);
    const eventsPromise = sanityClient
      .fetch<HubEventRow[]>(HUB_EVENTS_QUERY)
      .catch(() => [] as HubEventRow[]);
    const screeningsPromise = sanityClient
      .fetch<HubScreeningVenueRow[]>(HUB_SCREENINGS_QUERY)
      .catch(() => [] as HubScreeningVenueRow[]);
    const guidesPromise = sanityClient
      .fetch<HubGuideRow[]>(HUB_GUIDES_QUERY)
      .catch(() => [] as HubGuideRow[]);
    const followedScreeningsPromise = followedSlugsPromise.then((slugs) =>
      slugs.length > 0
        ? sanityClient
            .fetch<HubScreeningVenueRow[]>(HUB_FOLLOWED_SCREENINGS_QUERY, {
              slugs,
            })
            .catch(() => [] as HubScreeningVenueRow[])
        : ([] as HubScreeningVenueRow[]),
    );
    const preferredFixturesPromise = Promise.all([
      preferredSportsPromise,
      excludeFixtureSlugsPromise,
    ]).then(([preferredSports, excludeFixtureSlugs]) =>
      loadPreferredFixtureItems({
        preferredSports,
        excludeFixtureSlugs,
        upcomingFixtures: options.upcomingFixtures,
      }),
    );

    const [
      sports,
      eventRows,
      screeningRows,
      followedScreeningRows,
      guides,
      preferredFixtures,
      preferredSports,
    ] = await Promise.all([
      sportsPromise,
      eventsPromise,
      screeningsPromise,
      followedScreeningsPromise,
      guidesPromise,
      preferredFixturesPromise,
      preferredSportsPromise,
    ]);

    const events = (eventRows ?? [])
      .map((row) => eventToFeedItem(row, sports))
      .filter((item): item is HubFeedItem => item !== null);
    // Prefer soonest fixtures before capping so later venues are not dropped.
    const followedScreenings = screeningsToFeedItems(
      followedScreeningRows ?? [],
      sports,
      FOLLOWED_SCREENING_FEED_LIMIT,
      { preferSoonest: true },
    );
    const screenings = screeningsToFeedItems(screeningRows ?? [], sports);
    const guideItems = guidesToFeedItems(guides ?? [], sports);

    return {
      sports,
      feed: sortHubFeedPreferringSports(
        mergeHubFeedItems(followedScreenings, preferredFixtures, [
          ...events,
          ...screenings,
          ...guideItems,
        ]),
        preferredSports,
      ),
    };
  } catch (error) {
    console.error("[hub] dashboard feed fetch failed", error);
    return { ...EMPTY_HUB_DASHBOARD };
  }
}
