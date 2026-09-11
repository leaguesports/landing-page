/**
 * Playtomic-style sport dashboard — compact shortcuts, clubs, and reminders.
 * `/play/[sport]` owns this surface; Change sport still returns to `/play`.
 */

import { CITY_DIRECTORY } from "../../data/cities.ts";
import { intentPath } from "../intent/paths.ts";
import { venueDirectoryHref } from "../search/venueSearch.ts";
import { inferSportSlug, type SportDefinition } from "../sports/catalog.ts";
import {
  HUB_GUIDES_HREF,
  HUB_QUICK_START,
  HUB_TOURNAMENTS_HREF,
  hubLobbyHrefForSport,
  hubOrganisedGameHref,
  hubPlayDashboardActions,
  type HubPlayDashboardAction,
} from "../sports/hub-ia.ts";
import { formatHubWhen } from "../sports/hub-feed.ts";
import type {
  OrganisedGame,
  OrganisedGamesSnapshot,
} from "../organised-games/organised-games.ts";

export type PlayClubSource = {
  _id: string;
  name: string;
  slug: string;
  hero_image?: unknown;
  rating?: number | null;
  address: {
    suburb?: string | null;
    city?: string | null;
  };
};

export const PLAY_DASHBOARD_CLUBS_LIMIT = 6;
export const PLAY_DASHBOARD_CLUBS_FETCH_LIMIT = 24;
export const PLAY_DASHBOARD_GUIDES_LIMIT = 3;

export const PLAY_DASHBOARD_SHORTCUT_IDS = [
  "book",
  "learn",
  "compete",
  "match",
] as const;

export type PlayDashboardShortcutId =
  (typeof PLAY_DASHBOARD_SHORTCUT_IDS)[number];

export type PlayDashboardShortcutTone = "emerald" | "amber" | "sky" | "lime";

export type PlayDashboardShortcut = {
  id: PlayDashboardShortcutId;
  title: string;
  href: string;
  tone: PlayDashboardShortcutTone;
};

export type PlayDashboardClub = {
  id: string;
  name: string;
  slug: string;
  href: string;
  place: string;
  rating: number | null;
  imageSrc: string;
};

export type PlayDashboardPlaceChip = {
  slug: string;
  name: string;
  href: string;
};

export type PlayDashboardGuide = {
  slug: string;
  title: string;
  href: string;
  description: string;
};

export type PlayDashboardReminder = {
  title: string;
  description: string;
  href: string;
};

export function playDashboardClubsExploreHref(sportSlug: string): string {
  const trimmed = sportSlug.trim().toLowerCase();
  return trimmed
    ? venueDirectoryHref({ sport: trimmed })
    : venueDirectoryHref({});
}

export function playDashboardShortcuts(
  sport: Pick<SportDefinition, "slug" | "noun">,
): PlayDashboardShortcut[] {
  return [
    {
      id: "book",
      title: `Book a ${sport.noun}`,
      href: playDashboardClubsExploreHref(sport.slug),
      tone: "emerald",
    },
    {
      id: "learn",
      title: "Learn",
      href: HUB_GUIDES_HREF,
      tone: "amber",
    },
    {
      id: "compete",
      title: "Compete",
      href: HUB_TOURNAMENTS_HREF,
      tone: "sky",
    },
    {
      id: "match",
      title: "Find a match",
      href: hubLobbyHrefForSport(sport.slug),
      tone: "lime",
    },
  ];
}

export function playDashboardPlaceChips(
  sportSlug: string,
): PlayDashboardPlaceChip[] {
  const trimmed = sportSlug.trim().toLowerCase();
  if (!trimmed) return [];
  return CITY_DIRECTORY.map((city) => ({
    slug: city.slug,
    name: city.name,
    href: intentPath("play", trimmed, city.slug),
  }));
}

export function pickPlayDashboardClubs<T extends PlayClubSource>(
  venues: readonly T[],
  limit = PLAY_DASHBOARD_CLUBS_LIMIT,
): T[] {
  const cap = Math.max(0, Math.floor(limit));
  return [...venues]
    .sort((a, b) => {
      const imageDelta = Number(Boolean(b.hero_image)) - Number(Boolean(a.hero_image));
      if (imageDelta !== 0) return imageDelta;
      const ratingDelta = (b.rating ?? -1) - (a.rating ?? -1);
      if (ratingDelta !== 0) return ratingDelta;
      return a.name.localeCompare(b.name);
    })
    .slice(0, cap);
}

export function toPlayDashboardClub(
  venue: PlayClubSource,
  imageSrc: string,
): PlayDashboardClub {
  const place = [venue.address.suburb, venue.address.city]
    .filter(Boolean)
    .join(", ");
  return {
    id: venue._id,
    name: venue.name,
    slug: venue.slug,
    href: `/venues/${encodeURIComponent(venue.slug)}`,
    place,
    rating: venue.rating ?? null,
    imageSrc,
  };
}

export function filterOrganisedGamesForSport(
  snapshot: OrganisedGamesSnapshot,
  sportSlug: string,
): OrganisedGamesSnapshot {
  const sport = sportSlug.trim().toLowerCase();
  return {
    hosted: snapshot.hosted.filter((game) => game.sport === sport),
    invited: snapshot.invited.filter((game) => game.sport === sport),
  };
}

function soonestOrganisedGame(
  snapshot: OrganisedGamesSnapshot,
): OrganisedGame | null {
  const games = [...snapshot.hosted, ...snapshot.invited];
  if (games.length === 0) return null;
  return games.reduce((soonest, game) =>
    game.startsAt < soonest.startsAt ? game : soonest,
  );
}

export function playDashboardReminder(
  snapshot: OrganisedGamesSnapshot,
  sport: Pick<SportDefinition, "name" | "noun">,
  nowIso: string,
): PlayDashboardReminder {
  const upcoming = soonestOrganisedGame(snapshot);
  if (upcoming) {
    const when = formatHubWhen(upcoming.startsAt, new Date(nowIso));
    return {
      title: "Don't forget",
      description: when
        ? `Upcoming ${sport.name.toLowerCase()} · ${when}`
        : `You have an upcoming ${sport.name.toLowerCase()} game.`,
      href: hubOrganisedGameHref(upcoming.id),
    };
  }

  return {
    title: "Don't forget",
    description: HUB_QUICK_START.description,
    href: HUB_QUICK_START.href,
  };
}

export function playDashboardGuides(
  guides: ReadonlyArray<{
    slug: string;
    title: string;
    description?: string | null;
  }>,
  sportSlug: string,
  limit = PLAY_DASHBOARD_GUIDES_LIMIT,
): PlayDashboardGuide[] {
  const sport = sportSlug.trim().toLowerCase();
  const cap = Math.max(0, Math.floor(limit));
  return guides
    .filter((guide) => inferSportSlug(`${guide.title} ${guide.description ?? ""}`) === sport)
    .slice(0, cap)
    .map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      href: `/guides/${guide.slug}`,
      description: guide.description?.trim() || `Local tips for ${sport}.`,
    }));
}

/** Scorecard + organise actions — not the discovery shortcuts. */
export function playDashboardPlayActions(
  sportSlug: string,
): HubPlayDashboardAction[] {
  return hubPlayDashboardActions(sportSlug).filter(
    (action) => action.group === "play" || action.id === "organise",
  );
}

export function playDashboardMoreActions(
  sportSlug: string,
): HubPlayDashboardAction[] {
  return hubPlayDashboardActions(sportSlug).filter(
    (action) =>
      action.group !== "play" &&
      action.id !== "organise" &&
      action.id !== "handicap" &&
      action.id !== "lobby" &&
      action.id !== "tournaments",
  );
}
