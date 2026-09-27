import { eventsListHref } from "../events/scope.ts";
import type { EventsCityCode } from "../sports/events-city.ts";
import { guideVenueMarkInitial } from "../guides/venueMedia.ts";
import { activityDisplayName } from "./activity.ts";
import { intentPath } from "./paths.ts";
import { resolveSportSlug, SPORT_CATALOG } from "../sports/catalog.ts";
import {
  fixtureCalendarDay,
  FIXTURE_TIMEZONE,
  normalizeFixtureKey,
  type UpcomingFixture,
} from "../sports/events-feed.ts";
import {
  buildWatchFixtureFace,
  type WatchFixtureFace,
} from "./watch-fixture-card.ts";
import { mergeVenueUpcomingScreenings } from "../sports/events-path.ts";
import {
  formatWatchCalendarStamp,
  venueBroadcastSportSlugs,
} from "./watch-screenings.ts";

/**
 * Fanzo-direction watch hubs: fixture buckets, suburb ∩ fixture filtering,
 * watch cues, and honest distance labels. UI stays in LeagueSports chrome.
 */

export const WATCH_SPORT_ORDER = ["rugby", "soccer", "cricket", "motorsport"] as const;

const WATCH_CUE_ORDER = ["Screens", "Sound on", "Outdoor", "Fan park"] as const;
export type WatchCue = (typeof WATCH_CUE_ORDER)[number];

const SPORT_SLUGS = new Set([
  "rugby",
  "soccer",
  "football",
  "cricket",
  "motorsport",
  "golf",
  "padel",
  "tennis",
]);

const COMPETITION_LABELS: Record<string, string> = {
  urc: "URC",
  "united-rugby-championship": "URC",
  springboks: "Springboks",
  springbok: "Springboks",
  "six-nations": "Six Nations",
  "rugby-championship": "Rugby Championship",
  "currie-cup": "Currie Cup",
  psl: "PSL",
  "premier-soccer-league": "PSL",
  "premier-league": "Premier League",
  "dstv-premiership": "DStv Premiership",
  "betway-premiership": "Betway Premiership",
  proteas: "Proteas",
  sa20: "SA20",
  "sa-20": "SA20",
  f1: "Formula 1",
  "formula-1": "Formula 1",
  "formula 1": "Formula 1",
};

/** Approximate city centres for the labelled fallback. Not a GPS claim. */
const CITY_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  johannesburg: { latitude: -26.2041, longitude: 28.0473 },
  "cape-town": { latitude: -33.9249, longitude: 18.4241 },
  durban: { latitude: -29.8587, longitude: 31.0218 },
  pretoria: { latitude: -25.7479, longitude: 28.2293 },
};

const CITY_EVENT_CODE: Record<string, EventsCityCode> = {
  johannesburg: "jhb",
  "cape-town": "cpt",
  durban: "dbn",
  pretoria: "pta",
};

export type WatchHubBucketId = "today" | "weekend" | "later";
