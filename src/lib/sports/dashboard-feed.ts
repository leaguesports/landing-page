import { sanityClient } from "@/sanity/client";
import { listVenueFilterOptions } from "@/services/venues";
import {
  mergeHubSports,
  SPORT_CATALOG,
  type SportDefinition,
} from "./catalog";
import {
  eventToFeedItem,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
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
  formatHubWhen,
  guidesToFeedItems,
  HUB_EVENTS_QUERY,
  HUB_GUIDES_QUERY,
  HUB_SCREENINGS_QUERY,
  screeningsToFeedItems,
  sortHubFeed,
} from "./hub-feed";

export type HubDashboardData = {
  sports: SportDefinition[];
  feed: HubFeedItem[];
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

async function loadHubSports(): Promise<SportDefinition[]> {
  try {
    const { sports } = await listVenueFilterOptions();
    return mergeHubSports(SPORT_CATALOG, sports);
  } catch {
    return SPORT_CATALOG;
  }
}

/**
 * Editorial + fixture feed for the signed-in hub.
 * Failures degrade to catalog sports and an empty feed — never throw.
 */
export async function getDashboardHub(): Promise<HubDashboardData> {
  if (!isSanityConfigured()) return { ...EMPTY_HUB_DASHBOARD };

  try {
    const [sports, eventRows, screeningRows, guides] = await Promise.all([
      loadHubSports(),
      sanityClient.fetch<HubEventRow[]>(HUB_EVENTS_QUERY).catch(() => []),
      sanityClient
        .fetch<HubScreeningVenueRow[]>(HUB_SCREENINGS_QUERY)
        .catch(() => []),
      sanityClient.fetch<HubGuideRow[]>(HUB_GUIDES_QUERY).catch(() => []),
    ]);

    const events = (eventRows ?? [])
      .map((row) => eventToFeedItem(row, sports))
      .filter((item): item is HubFeedItem => item !== null);
    const screenings = screeningsToFeedItems(screeningRows ?? [], sports);
    const guideItems = guidesToFeedItems(guides ?? [], sports);

    return {
      sports,
      feed: sortHubFeed([...events, ...screenings, ...guideItems]),
    };
  } catch (error) {
    console.error("[hub] dashboard feed fetch failed", error);
    return { ...EMPTY_HUB_DASHBOARD };
  }
}
