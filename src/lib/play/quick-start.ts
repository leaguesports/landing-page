/**
 * Location-based Quick Start — resolve where / what / who before opening
 * a live create flow. Pure helpers; GPS and Sanity I/O stay at the edges.
 */

import { distanceKm, type GeoCoords } from "../geo/distance.ts";
import type { Friend } from "../friends/friends.ts";
import {
  venueQuickStartActivities,
  type VenueQuickStartActivity,
  type VenueQuickStartInput,
} from "../venues/quick-start.ts";

export const HUB_QUICK_START_HREF = "/play/quick" as const;

export const QUICK_START_PLAYERS_KEY = "leaguesports:quick-start-players";

/** Soft radius — beyond this we still show the nearest court, but warn. */
export const QUICK_START_NEAR_KM = 5;

/** Hard drop — ignore venues farther than this when any closer option exists. */
export const QUICK_START_MAX_KM = 40;

export type QuickStartVenue = VenueQuickStartInput & {
  id: string;
  name: string;
  suburb: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export type QuickStartSuggestedPlayer = {
  id: string;
  displayName: string;
  handle?: string;
  avatarUrl?: string | null;
  userId: string | null;
  isGuest: boolean;
};

export type RankedQuickStartVenue = {
  venue: QuickStartVenue;
  distanceKm: number;
  activities: VenueQuickStartActivity[];
};

export type QuickStartResolution = {
  venue: QuickStartVenue;
  distanceKm: number;
  activity: VenueQuickStartActivity;
  activities: VenueQuickStartActivity[];
  /** True when the nearest playable venue is beyond QUICK_START_NEAR_KM. */
  far: boolean;
};

export type QuickStartPlayerSeed = {
  sportSlug: string;
  venueSlug: string;
  players: QuickStartSuggestedPlayer[];
  savedAt: string;
};

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function hasQuickStartCoordinates(
  venue: Pick<QuickStartVenue, "latitude" | "longitude">,
): boolean {
  return (
    typeof venue.latitude === "number" &&
    Number.isFinite(venue.latitude) &&
    typeof venue.longitude === "number" &&
    Number.isFinite(venue.longitude)
  );
}

/**
 * Rank playable venues by Haversine distance. Skips venues without coords
 * or without a live Quick Start activity (padel / golf / darts).
 */
export function rankQuickStartVenues(
  venues: readonly QuickStartVenue[],
  coords: GeoCoords,
  opts?: { maxKm?: number },
): RankedQuickStartVenue[] {
  const maxKm = opts?.maxKm ?? QUICK_START_MAX_KM;
  const ranked: RankedQuickStartVenue[] = [];

  for (const venue of venues) {
    if (!hasQuickStartCoordinates(venue)) continue;
    const activities = venueQuickStartActivities(venue);
    if (activities.length === 0) continue;

    const dist = distanceKm(coords, {
      latitude: venue.latitude as number,
      longitude: venue.longitude as number,
    });
    if (!Number.isFinite(dist) || dist > maxKm) continue;

    ranked.push({ venue, distanceKm: dist, activities });
  }

  return ranked.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Pick the sport activity for a venue.
 * Preference order: explicit override → hub active sport → preferred sports → first activity.
 */
export function pickQuickStartActivity(
  activities: readonly VenueQuickStartActivity[],
  opts?: {
    preferredSports?: readonly string[] | null;
    activeSport?: string | null;
    overrideSport?: string | null;
  },
): VenueQuickStartActivity | null {
  if (activities.length === 0) return null;

  const override = opts?.overrideSport?.trim().toLowerCase();
  if (override) {
    const match = activities.find((a) => a.sportSlug === override);
    if (match) return match;
  }

  const active = opts?.activeSport?.trim().toLowerCase();
  if (active && active !== "all") {
    const match = activities.find((a) => a.sportSlug === active);
    if (match) return match;
  }

  const preferred = (opts?.preferredSports ?? [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  for (const slug of preferred) {
    const match = activities.find((a) => a.sportSlug === slug);
    if (match) return match;
  }

  return activities[0] ?? null;
}

/**
 * Resolve where + what from GPS. Caller supplies preferred sports / active hub sport.
 */
export function resolveQuickStart(
  venues: readonly QuickStartVenue[],
  coords: GeoCoords,
  opts?: {
    preferredSports?: readonly string[] | null;
    activeSport?: string | null;
    overrideSport?: string | null;
    overrideVenueSlug?: string | null;
    maxKm?: number;
  },
): QuickStartResolution | null {
  const ranked = rankQuickStartVenues(venues, coords, { maxKm: opts?.maxKm });
  if (ranked.length === 0) return null;

  const overrideSlug = opts?.overrideVenueSlug?.trim().toLowerCase();
  const picked =
    (overrideSlug
      ? ranked.find((row) => row.venue.slug.toLowerCase() === overrideSlug)
      : null) ?? ranked[0];
  if (!picked) return null;

  const activity = pickQuickStartActivity(picked.activities, opts);
  if (!activity) return null;

  return {
    venue: picked.venue,
    distanceKm: picked.distanceKm,
    activity,
    activities: picked.activities,
    far: picked.distanceKm > QUICK_START_NEAR_KM,
  };
}

/**
 * How many co-players to suggest (excluding self) for a sport's create flow.
 * Padel seats three others; golf/darts leave room for a small group.
 */
export function quickStartCompanionLimit(sportSlug: string): number {
  const slug = sportSlug.trim().toLowerCase();
  if (slug === "padel") return 3;
  if (slug === "darts") return 1;
  if (slug === "golf") return 3;
  return 3;
}

/**
 * Who — accepted friends first (people you actually play with). Guests / geo
 * of friends are out of scope; recent players can fill remaining slots.
 */
export function suggestQuickStartPlayers(opts: {
  sportSlug: string;
  friends?: readonly Friend[] | null;
  recent?: readonly QuickStartSuggestedPlayer[] | null;
  excludeUserIds?: readonly string[] | null;
  limit?: number;
}): QuickStartSuggestedPlayer[] {
  const limit = opts.limit ?? quickStartCompanionLimit(opts.sportSlug);
  if (limit <= 0) return [];

  const excluded = new Set(
    (opts.excludeUserIds ?? [])
      .map((id) => id.trim().toLowerCase())
      .filter(Boolean),
  );

  const out: QuickStartSuggestedPlayer[] = [];
  const seen = new Set<string>();

  function push(player: QuickStartSuggestedPlayer) {
    if (out.length >= limit) return;
    const key = (player.userId ?? player.displayName).trim().toLowerCase();
    if (!key || seen.has(key)) return;
    if (player.userId && excluded.has(player.userId.toLowerCase())) return;
    seen.add(key);
    out.push(player);
  }

  for (const friend of opts.friends ?? []) {
    push({
      id: friend.id,
      displayName: friend.displayName,
      handle: friend.handle,
      avatarUrl: friend.avatarUrl,
      userId: friend.id,
      isGuest: false,
    });
  }

  for (const recent of opts.recent ?? []) {
    push(recent);
  }

  return out;
}

export function buildQuickStartPlayerSeed(
  resolution: QuickStartResolution,
  players: readonly QuickStartSuggestedPlayer[],
): QuickStartPlayerSeed {
  return {
    sportSlug: resolution.activity.sportSlug,
    venueSlug: resolution.venue.slug,
    players: [...players],
    savedAt: new Date().toISOString(),
  };
}

export function writeQuickStartPlayerSeed(seed: QuickStartPlayerSeed): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUICK_START_PLAYERS_KEY, JSON.stringify(seed));
  } catch {
    // ignore quota / private mode
  }
}

export function readQuickStartPlayerSeed(): QuickStartPlayerSeed | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(QUICK_START_PLAYERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuickStartPlayerSeed;
    if (
      !parsed ||
      typeof parsed.sportSlug !== "string" ||
      typeof parsed.venueSlug !== "string" ||
      !Array.isArray(parsed.players)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearQuickStartPlayerSeed(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QUICK_START_PLAYERS_KEY);
  } catch {
    // ignore
  }
}

/**
 * Consume a seed only when it matches the create-flow sport + venue.
 * Clears storage after a successful read so a later visit does not re-seat.
 */
export function consumeQuickStartPlayerSeed(
  sportSlug: string,
  venueSlug: string | null | undefined,
): QuickStartSuggestedPlayer[] {
  const seed = readQuickStartPlayerSeed();
  if (!seed) return [];
  const sport = sportSlug.trim().toLowerCase();
  const venue = venueSlug?.trim().toLowerCase() ?? "";
  if (seed.sportSlug.toLowerCase() !== sport) return [];
  if (!venue || seed.venueSlug.toLowerCase() !== venue) return [];
  clearQuickStartPlayerSeed();
  return seed.players.filter(
    (player) =>
      typeof player?.id === "string" &&
      typeof player?.displayName === "string" &&
      player.displayName.trim(),
  );
}
