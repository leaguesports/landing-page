/**
 * Signed-in hub information architecture (#145 / #150).
 * 4-tab bottom nav — one active panel, sport dropdown, page search.
 * Play = pick a playable sport, then start that sport's create flow.
 */

import { ALL_SPORTS_SLUG, type SportDefinition } from "./catalog.ts";
import { intentPath } from "../intent/paths.ts";
import { parseVenueSearch } from "../search/venueSearch.ts";

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

export type HubPlayStartSpec = {
  href: string;
  label: string;
  description: string;
};

/**
 * Playable create-flow map. Later sports (darts/pool) plug in here —
 * catalog `play` capability alone is not enough (watch-only stays out).
 */
export const HUB_PLAY_START_BY_SLUG: Readonly<
  Record<string, HubPlayStartSpec>
> = {
  padel: {
    href: HUB_START_MATCH_HREF,
    label: "Start a match",
    description: "Live scorecard for a four-ball.",
  },
  golf: {
    href: HUB_START_GOLF_HREF,
    label: "Start a round",
    description: "Hole-by-hole scorecard for your group.",
  },
};

export type HubPlaySportOption = {
  slug: string;
  name: string;
  startHref: string;
  startLabel: string;
  description: string;
  /** Live/unlocked scorecard href when a clean signal exists; otherwise omitted. */
  continueHref: string | null;
};

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
  return intentPath("play", active);
}

export function hubWatchHref(active: string): string {
  if (active === ALL_SPORTS_SLUG) return HUB_WATCH_HREF;
  return intentPath("watch", active);
}

export function hubPlayStartHref(slug: string): string | null {
  return HUB_PLAY_START_BY_SLUG[slug]?.href ?? null;
}

export function isHubPlayableSport(sport: SportDefinition): boolean {
  return (
    sport.capabilities.includes("play") &&
    hubPlayStartHref(sport.slug) !== null
  );
}

export function hubPlayableSports(
  sports: readonly SportDefinition[],
): SportDefinition[] {
  return sports.filter(isHubPlayableSport);
}

/**
 * Continue only when a caller passes a real live/unlocked href for that sport.
 * Hub history is locked results — do not invent a continue from it.
 */
export function hubPlayContinueHref(
  slug: string,
  continueBySlug?: Readonly<Record<string, string>> | null,
): string | null {
  if (!hubPlayStartHref(slug)) return null;
  const href = continueBySlug?.[slug]?.trim();
  return href ? href : null;
}

export function hubPlaySportOptions(
  sports: readonly SportDefinition[],
  active: string,
  continueBySlug?: Readonly<Record<string, string>> | null,
): HubPlaySportOption[] {
  const playable = hubPlayableSports(sports);
  const scoped =
    active === ALL_SPORTS_SLUG
      ? playable
      : playable.filter((sport) => sport.slug === active);

  return scoped.flatMap((sport) => {
    const spec = HUB_PLAY_START_BY_SLUG[sport.slug];
    if (!spec) return [];
    return [
      {
        slug: sport.slug,
        name: sport.name,
        startHref: spec.href,
        startLabel: spec.label,
        description: spec.description,
        continueHref: hubPlayContinueHref(sport.slug, continueBySlug),
      },
    ];
  });
}

export function hubPlayNearbyHref(active: string): string {
  return hubPlayHref(active);
}

/**
 * Empty-state nearby link. Never emit `/play/{sport}` for sports that
 * do not support play (watch-only like motorsport).
 */
export function hubPlayEmptyNearbyHref(
  active: string,
  sports: readonly SportDefinition[],
): string {
  if (active === ALL_SPORTS_SLUG) return HUB_PLAY_HREF;
  const sport = sports.find((item) => item.slug === active);
  if (sport?.capabilities.includes("play")) return hubPlayHref(active);
  return HUB_FIND_VENUES_HREF;
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
