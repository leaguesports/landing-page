import {
  mergeHubSports,
  SPORT_CATALOG,
  type SportDefinition,
} from "./catalog";
import {
  eventToFeedItem,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_FOLLOWED_SCREENINGS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  mergeHubFeedItems,
  screeningsToFeedItems,
  sortHubFeed,
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
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_FOLLOWED_SCREENINGS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  mergeHubFeedItems,
  screeningsToFeedItems,
  sortHubFeed,
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

/**
 * Editorial + fixture feed for the signed-in hub.
 * Failures degrade to catalog sports and an empty feed — never throw.
 *
 * Generic Sanity reads start immediately. The followed-venue query waits only
 * on `followedVenueSlugs` (when provided), not on the rest of the homepage.
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

    const [sports, eventRows, screeningRows, followedScreeningRows, guides] =
      await Promise.all([
        sportsPromise,
        eventsPromise,
        screeningsPromise,
        followedScreeningsPromise,
        guidesPromise,
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
      feed: sortHubFeed(
        mergeHubFeedItems(followedScreenings, [
          ...events,
          ...screenings,
          ...guideItems,
        ]),
      ),
    };
  } catch (error) {
    console.error("[hub] dashboard feed fetch failed", error);
    return { ...EMPTY_HUB_DASHBOARD };
  }
}
