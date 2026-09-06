/**
 * Signed-in hub information architecture (#143).
 * Playtomic-style 5-tab bottom nav — one active panel, sport dropdown.
 */

import { ALL_SPORTS_SLUG } from "./catalog.ts";
import { intentPath } from "../intent/paths.ts";

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

export const HUB_TAB_IDS = [
  "home",
  "play",
  "discover",
  "people",
  "you",
] as const;

export type HubTabId = (typeof HUB_TAB_IDS)[number];

export const HUB_DEFAULT_TAB: HubTabId = "home";

export const HUB_TABS: { id: HubTabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "play", label: "Play" },
  { id: "discover", label: "Discover" },
  { id: "people", label: "People" },
  { id: "you", label: "You" },
];

export const HUB_SPORT_SCOPED_TABS: HubTabId[] = [
  "home",
  "play",
  "discover",
];

export const HUB_START_ACTION_TABS: HubTabId[] = ["home", "play"];

export type HubDiscoverSegment = "play" | "watch";

export const HUB_DISCOVER_SEGMENTS: {
  id: HubDiscoverSegment;
  label: string;
}[] = [
  { id: "play", label: "Play" },
  { id: "watch", label: "Watch" },
];

export const HUB_FOR_YOU_EMPTY_CTAS = [
  { href: HUB_BROWSE_FIXTURES_HREF, label: "Browse fixtures" },
  {
    href: HUB_FIND_VENUES_HREF,
    label: "Find venues",
    tab: "discover" as const,
  },
] as const;

export const HUB_PLAY_EMPTY_CTAS = [
  { href: HUB_START_MATCH_HREF, label: "Start a match" },
] as const;

export type HubDiscoverShortcut = {
  href: string;
  label: string;
  description: string;
  segment: HubDiscoverSegment;
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

export function hubDiscoverShortcuts(
  segment: HubDiscoverSegment,
  active: string,
): HubDiscoverShortcut[] {
  if (segment === "play") {
    return [
      {
        href: HUB_FIND_VENUES_HREF,
        label: "Venues",
        description: "Courts, clubs, and courses near you.",
        segment: "play",
      },
      {
        href: hubPlayHref(active),
        label: "Play nearby",
        description: "Sport-scoped places to play — not the full directory.",
        segment: "play",
      },
    ];
  }

  return [
    {
      href: HUB_BROWSE_FIXTURES_HREF,
      label: "Fixtures",
      description: "Upcoming games and screenings.",
      segment: "watch",
    },
    {
      href: hubWatchHref(active),
      label: "Watch live",
      description: "Bars and fan zones with screens.",
      segment: "watch",
    },
    {
      href: HUB_GUIDES_HREF,
      label: "Guides",
      description: "Local tips for fans and players.",
      segment: "watch",
    },
  ];
}

export function takeHubPreview<T>(
  items: readonly T[],
  limit: number,
): T[] {
  return items.slice(0, Math.max(0, limit));
}

export function hubConnectedCount(
  providers: ReadonlyArray<{ status: string }>,
): number {
  return providers.filter((provider) => provider.status === "connected")
    .length;
}
