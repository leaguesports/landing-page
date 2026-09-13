import { CITY_DIRECTORY } from "../../data/cities.ts";
import { activityQuerySlugs } from "../intent/activity.ts";
import { intentPath } from "../intent/paths.ts";
import { SPORT_CATALOG } from "../sports/catalog.ts";
import { UPCOMING_GRACE_MS, type UpcomingFixture } from "../sports/events-feed.ts";

/** Minimum characters before /venues name search runs. */
export const VENUE_HUB_SEARCH_MIN = 2;

/** Typeahead cap — never a catalog dump. */
export const VENUE_HUB_SEARCH_LIMIT = 10;

/** Venues with a screening in the next ~72h. */
export const VENUE_HUB_ON_NOW_LIMIT = 8;

/** How far ahead “on now / upcoming” looks. */
export const VENUE_HUB_ON_NOW_WINDOW_MS = 72 * 60 * 60 * 1000;

/** Scannable fixture tiles on the hub. */
export const VENUE_HUB_EVENT_TILE_LIMIT = 6;

/** Recommended venues — city heuristic or nationwide popular. */
export const VENUE_HUB_RECOMMENDED_LIMIT = 6;

/** Signed-in empty copy — reuse venue follow, no new favourite concept. */
export const VENUE_HUB_FAVOURITES_EMPTY = "Follow a venue to pin it here.";

export type VenueHubSearchHit = {
  cmsId: string;
  name: string;
  slug: string;
  city: string | null;
};

export type VenueHubOnNowCard = {
  venueName: string;
  venueSlug: string;
  city: string | null;
  fixtureTitle: string;
  fixtureSlug: string;
  startsAt: string;
  sportSlug: string | null;
};

export type VenueHubDirectoryGroup = "intent" | "cities" | "sports";

export type VenueHubDirectoryLink = {
  href: string;
  label: string;
  group: VenueHubDirectoryGroup;
};

export type VenueHubFavouritesSection =
  | { visible: false }
  | { visible: true; empty: true; copy: string }
  | { visible: true; empty: false };

export function normalizeVenueHubQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Sanity `match` token for name/slug typeahead. Null below the minimum. */
export function venueHubMatchTerm(query: string): string | null {
  const normalized = normalizeVenueHubQuery(query);
  if (normalized.length < VENUE_HUB_SEARCH_MIN) return null;
  const token = normalized
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (token.length < VENUE_HUB_SEARCH_MIN) return null;
  return `${token}*`;
}

export function capVenueHubSearchResults<T>(rows: T[]): T[] {
  return rows.slice(0, VENUE_HUB_SEARCH_LIMIT);
}

export function fixtureMatchesHubSport(
  fixture: Pick<UpcomingFixture, "sportSlug">,
  sportSlug: string | null | undefined,
): boolean {
  if (!sportSlug?.trim()) return true;
  const variants = activityQuerySlugs(sportSlug).map((slug) => slug.toLowerCase());
  if (variants.length === 0) return true;
  const current = fixture.sportSlug?.trim().toLowerCase();
  return Boolean(current && variants.includes(current));
}

export function filterHubEventTiles(
  fixtures: UpcomingFixture[],
  sportSlug: string | null | undefined,
  limit: number = VENUE_HUB_EVENT_TILE_LIMIT,
): UpcomingFixture[] {
  return fixtures
    .filter((fixture) => fixtureMatchesHubSport(fixture, sportSlug))
    .slice(0, limit);
}

function fixtureStartMs(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
}

/**
 * Unique venues screening something in the next 48–72h.
 * Earliest fixture per venue; capped so the hub never lists the catalog.
 */
export function buildOnNowCards(
  fixtures: UpcomingFixture[],
  now: Date = new Date(),
  options: { windowMs?: number; limit?: number } = {},
): VenueHubOnNowCard[] {
  const windowMs = options.windowMs ?? VENUE_HUB_ON_NOW_WINDOW_MS;
  const limit = options.limit ?? VENUE_HUB_ON_NOW_LIMIT;
  const nowMs = now.getTime();
  const until = nowMs + windowMs;
  const byVenue = new Map<string, VenueHubOnNowCard>();

  for (const fixture of fixtures) {
    const start = fixtureStartMs(fixture.startsAt);
    if (start === null) continue;
    if (start < nowMs - UPCOMING_GRACE_MS || start > until) continue;
    if (!fixture.startsAt) continue;

    for (const venue of fixture.venues) {
      const slug = venue.slug?.trim();
      const name = venue.name?.trim();
      if (!slug || !name) continue;

      const existing = byVenue.get(slug);
      const next: VenueHubOnNowCard = {
        venueName: name,
        venueSlug: slug,
        city: venue.city?.trim() || null,
        fixtureTitle: fixture.title,
        fixtureSlug: fixture.slug,
        startsAt: fixture.startsAt,
        sportSlug: fixture.sportSlug,
      };
      if (!existing) {
        byVenue.set(slug, next);
        continue;
      }
      const existingStart = fixtureStartMs(existing.startsAt);
      if (existingStart === null || start < existingStart) {
        byVenue.set(slug, next);
      }
    }
  }

  return [...byVenue.values()]
    .sort((a, b) => {
      const aStart = fixtureStartMs(a.startsAt) ?? Number.POSITIVE_INFINITY;
      const bStart = fixtureStartMs(b.startsAt) ?? Number.POSITIVE_INFINITY;
      return aStart - bStart;
    })
    .slice(0, limit);
}

export function resolveRecommendedCity(input: {
  locationSlug?: string | null;
  citySlug?: string | null;
  followedVenueCities?: Array<{ citySlug?: string | null }>;
}): string | null {
  const fromQuery = input.locationSlug?.trim() || input.citySlug?.trim() || "";
  if (fromQuery) return fromQuery;

  const counts = new Map<string, number>();
  for (const row of input.followedVenueCities ?? []) {
    const slug = row.citySlug?.trim();
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [slug, count] of counts) {
    if (count > bestCount) {
      best = slug;
      bestCount = count;
    }
  }
  return best;
}

export function favouritesSection(input: {
  signedIn: boolean;
  followedCount: number;
}): VenueHubFavouritesSection {
  if (!input.signedIn) return { visible: false };
  if (input.followedCount <= 0) {
    return {
      visible: true,
      empty: true,
      copy: VENUE_HUB_FAVOURITES_EMPTY,
    };
  }
  return { visible: true, empty: false };
}

/**
 * Footer directory links — existing SEO Watch / Play / Cities / Sports routes only.
 * Never `/venues` catalog query strings and never an inline venue list.
 */
export function venueHubDirectoryLinks(): VenueHubDirectoryLink[] {
  const links: VenueHubDirectoryLink[] = [
    { href: "/watch", label: "Watch", group: "intent" },
    { href: "/play", label: "Play", group: "intent" },
  ];

  for (const city of CITY_DIRECTORY) {
    links.push({
      href: intentPath("watch", "rugby", city.slug),
      label: city.name,
      group: "cities",
    });
  }

  for (const sport of SPORT_CATALOG) {
    if (sport.capabilities.includes("watch")) {
      links.push({
        href: intentPath("watch", sport.slug),
        label: sport.name,
        group: "sports",
      });
      continue;
    }
    if (sport.capabilities.includes("play")) {
      links.push({
        href: intentPath("play", sport.slug),
        label: sport.name,
        group: "sports",
      });
    }
  }

  return links;
}

export function isVenueHubDirectoryHref(href: string): boolean {
  return href === "/watch" || href === "/play" || href.startsWith("/watch/") || href.startsWith("/play/");
}
