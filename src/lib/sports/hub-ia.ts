/**
 * Signed-in hub information architecture (#145).
 * 4-tab bottom nav — one active panel, sport dropdown, page search.
 */

import {
  activitySupportsIntent,
  buildIntentActivity,
} from "../intent/activity.ts";
import { intentPath } from "../intent/paths.ts";
import { parseVenueSearch } from "../search/venueSearch.ts";
import { ALL_SPORTS_SLUG } from "./catalog.ts";

export const HUB_START_MATCH_HREF = "/padel/new" as const;
export const HUB_START_GOLF_HREF = "/golf/new" as const;
export const HUB_BROWSE_FIXTURES_HREF = "/events" as const;
export const HUB_FIND_VENUES_HREF = "/venues" as const;
export const HUB_PLAY_HREF = "/play" as const;
export const HUB_WATCH_HREF = "/watch" as const;
export const HUB_GUIDES_HREF = "/guides" as const;
export const HUB_TRAINING_HREF = "/training" as const;
export const HUB_INTEGRATIONS_HREF = "/integrations" as const;
export const HUB_PADEL_HISTORY_HREF = "/padel/history" as const;
export const HUB_GOLF_HISTORY_HREF = "/golf/history" as const;

export const HUB_RECENT_LOCK_LIMIT = 8;
export const HUB_BADGE_STRIP_LIMIT = 3;
export const HUB_PEOPLE_PREVIEW_LIMIT = 5;

export const HUB_SPORT_CONTROL = "dropdown" as const;
/** Start match/round live inside Play only — never a sticky bar above the nav. */
export const HUB_STICKY_START_ACTIONS = false;

export const HUB_TAB_IDS = ["home", "play", "people", "you"] as const;

export type HubTabId = (typeof HUB_TAB_IDS)[number];

export const HUB_DEFAULT_TAB: HubTabId = "home";

export const HUB_TABS: { id: HubTabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "play", label: "Play" },
  { id: "people", label: "People" },
  { id: "you", label: "You" },
];

export const HUB_SPORT_SCOPED_TABS: HubTabId[] = ["home", "play"];

export const HUB_START_ACTION_TABS: HubTabId[] = ["play"];

export const HUB_HISTORY_OWNER_TAB: HubTabId = "you";

export const HUB_FOR_YOU_EMPTY_CTAS = [
  { href: HUB_BROWSE_FIXTURES_HREF, label: "Browse fixtures" },
  { href: HUB_FIND_VENUES_HREF, label: "Find venues" },
] as const;

export const HUB_PLAY_INTENT_CTAS = [
  {
    href: HUB_START_MATCH_HREF,
    label: "Start a match",
    sport: "padel",
    description: "Lock a padel scorecard.",
  },
  {
    href: HUB_START_GOLF_HREF,
    label: "Start a round",
    sport: "golf",
    description: "Start a golf scorecard.",
  },
] as const;

export type HubPlayIntentCta = (typeof HUB_PLAY_INTENT_CTAS)[number];

export function isHubTabId(value: string): value is HubTabId {
  return (HUB_TAB_IDS as readonly string[]).includes(value);
}

export function hubShowsSportControl(tab: HubTabId): boolean {
  return HUB_SPORT_SCOPED_TABS.includes(tab);
}

export function hubShowsStartActions(tab: HubTabId): boolean {
  return HUB_START_ACTION_TABS.includes(tab);
}

export function hubOwnsRecentLocks(tab: HubTabId): boolean {
  return tab === HUB_HISTORY_OWNER_TAB;
}

export function hubPlayShowsPadel(active: string): boolean {
  return active === ALL_SPORTS_SLUG || active === "padel";
}

export function hubPlayShowsGolf(active: string): boolean {
  return active === ALL_SPORTS_SLUG || active === "golf";
}

export function hubPlayHref(active: string): string {
  if (active === ALL_SPORTS_SLUG) return HUB_PLAY_HREF;
  const activity = buildIntentActivity({ slug: active });
  if (!activitySupportsIntent(activity, "play")) return HUB_PLAY_HREF;
  return intentPath("play", active);
}

export function hubWatchHref(active: string): string {
  if (active === ALL_SPORTS_SLUG) return HUB_WATCH_HREF;
  const activity = buildIntentActivity({ slug: active });
  if (!activitySupportsIntent(activity, "watch")) return HUB_WATCH_HREF;
  return intentPath("watch", active);
}

export function hubPlayIntentCtas(active: string): HubPlayIntentCta[] {
  if (active === ALL_SPORTS_SLUG) return [...HUB_PLAY_INTENT_CTAS];
  return HUB_PLAY_INTENT_CTAS.filter((cta) => cta.sport === active);
}

export function hubPlayNearbyHref(active: string): string {
  return hubPlayHref(active);
}

/**
 * Hub search → existing venues / play / watch entry points.
 * Uses `/venues?q=` (same as site SearchAction); the directory already
 * parses `q` into sport/place/intent and redirects to SEO landings.
 */
export function hubSearchHref(query: string, activeSport: string): string {
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return activeSport === ALL_SPORTS_SLUG
      ? HUB_FIND_VENUES_HREF
      : hubPlayHref(activeSport);
  }

  let scoped = trimmed;
  if (activeSport !== ALL_SPORTS_SLUG) {
    const parsed = parseVenueSearch(trimmed, "play");
    if (!parsed.sportSlug) {
      scoped = `${activeSport.replace(/-/g, " ")} ${trimmed}`;
    }
  }

  return `${HUB_FIND_VENUES_HREF}?q=${encodeURIComponent(scoped)}`;
}

export function takeHubPreview<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, Math.max(0, limit));
}

export function hubConnectedCount(
  providers: ReadonlyArray<{ status: string }>,
): number {
  return providers.filter((provider) => provider.status === "connected")
    .length;
}
