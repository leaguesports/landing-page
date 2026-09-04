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
} from "./hub-feed";

export type HubDashboardData = {
  sports: SportDefinition[];
  feed: HubFeedItem[];
};

export type GetDashboardHubOptions = {
  /** Sanity venue slugs the signed-in user follows — merged into the feed. */
  followedVenueSlugs?: string[];
};

export const EMPTY_HUB_DASHBOARD: HubDashboardData = {
  sports: SPORT_CATALOG,
  feed: [],
};

function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_DATASET,
  );
}

function uniqueSlugs(slugs: string[] | undefined): string[] {
  if (!slugs?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of slugs) {
    const slug = raw.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

/**
 * Editorial + fixture feed for the signed-in hub.
 * Failures degrade to catalog sports and an empty feed — never throw.
 */
export async function getDashboardHub(
  options: GetDashboardHubOptions = {},
): Promise<HubDashboardData> {
  if (!isSanityConfigured()) return { ...EMPTY_HUB_DASHBOARD };

  const followedSlugs = uniqueSlugs(options.followedVenueSlugs);

  try {
    const [{ sanityClient }, { listVenueFilterOptions }] = await Promise.all([
      import("@/sanity/client"),
      import("@/services/venues"),
    ]);

    const [sports, eventRows, screeningRows, followedScreeningRows, guides] =
      await Promise.all([
        listVenueFilterOptions()
          .then((opts) => mergeHubSports(SPORT_CATALOG, opts.sports))
          .catch(() => SPORT_CATALOG),
        sanityClient.fetch<HubEventRow[]>(HUB_EVENTS_QUERY).catch(() => []),
        sanityClient
          .fetch<HubScreeningVenueRow[]>(HUB_SCREENINGS_QUERY)
          .catch(() => []),
        followedSlugs.length > 0
          ? sanityClient
              .fetch<HubScreeningVenueRow[]>(HUB_FOLLOWED_SCREENINGS_QUERY, {
                slugs: followedSlugs,
              })
              .catch(() => [])
          : Promise.resolve([] as HubScreeningVenueRow[]),
        sanityClient.fetch<HubGuideRow[]>(HUB_GUIDES_QUERY).catch(() => []),
      ]);

    const events = (eventRows ?? [])
      .map((row) => eventToFeedItem(row, sports))
      .filter((item): item is HubFeedItem => item !== null);
    const followedScreenings = screeningsToFeedItems(
      followedScreeningRows ?? [],
      sports,
      24,
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
