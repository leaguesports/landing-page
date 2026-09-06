import { guideHref } from "../guides/slugs.ts";
import {
  eventHref,
  inferSportSlug,
  normalizeSportSlug,
  resolveSportSlug,
  SPORT_CATALOG,
  toHubSportSlug,
  type SportDefinition,
} from "./catalog.ts";
import type { UpcomingFixture } from "./events-feed.ts";

export type HubFeedKind = "event" | "screening" | "guide";

export type HubFeedItem = {
  id: string;
  kind: HubFeedKind;
  /** Null when the CMS row cannot be tagged — All feed only. */
  sportSlug: string | null;
  title: string;
  subtitle: string;
  href: string;
  startsAt: string | null;
  /** Present on screening items — used to surface followed venues on the hub. */
  venueSlug?: string | null;
  /** True when this row came from the user's followed-fixture calendar (#106). */
  followedFixture?: boolean;
};

export const HUB_EVENTS_QUERY = `*[_type == "event"] | order(coalesce(f1Details.dateTime, _createdAt) asc) [0...12] {
  "id": _id,
  title,
  "slug": slug.current,
  series,
  "dateTime": f1Details.dateTime,
  "track": f1Details.track
}`;

export const HUB_SCREENINGS_QUERY = `*[_type == "venue" && count(upcoming_screenings) > 0] | order(_updatedAt desc) [0...8] {
  name,
  "slug": slug.current,
  "broadcasts": broadcasts[]->{ name, "slug": slug.current },
  upcoming_screenings[]{ title, startsAt }
}`;

/** Cap followed-venue GROQ params — keeps CDN query strings bounded. */
export const MAX_FOLLOWED_VENUE_SLUGS = 24;

/** Cap followed-fixture resolution — hub calendar strip stays bounded. */
export const MAX_FOLLOWED_FIXTURE_SLUGS = 24;

/** Cap preference-matched fixtures injected into the For you feed. */
export const MAX_PREFERRED_FIXTURE_SLUGS = 12;

/** Screenings for specific followed venue slugs (hub return-visit payoff). */
export const HUB_FOLLOWED_SCREENINGS_QUERY = `*[_type == "venue" && slug.current in $slugs && count(upcoming_screenings) > 0] | order(_updatedAt desc) [0...24] {
  name,
  "slug": slug.current,
  "broadcasts": broadcasts[]->{ name, "slug": slug.current },
  upcoming_screenings[0...12]{ title, startsAt }
}`;

export const HUB_GUIDES_QUERY = `*[_type == "guide" && defined(slug.current) && slug.current != ""] | order(_createdAt desc) [0...6] {
  _id,
  _createdAt,
  title,
  description,
  keywords,
  "slug": slug.current
}`;

export type HubEventRow = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  series?: unknown;
  dateTime?: unknown;
  track?: unknown;
};

export type HubScreeningVenueRow = {
  name?: unknown;
  slug?: unknown;
  broadcasts?: Array<{ name?: unknown; slug?: unknown }> | null;
  upcoming_screenings?: Array<{ title?: unknown; startsAt?: unknown }> | null;
};

export type HubGuideRow = {
  _id?: unknown;
  _createdAt?: unknown;
  title?: unknown;
  description?: unknown;
  keywords?: unknown;
  slug?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asIso(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function eventToFeedItem(
  row: HubEventRow,
  sports: SportDefinition[] = SPORT_CATALOG,
): HubFeedItem | null {
  const id = asString(row.id);
  const title = asString(row.title);
  if (!id || !title) return null;
  const series = asString(row.series);
  const slug = asString(row.slug);
  const sportSlug =
    resolveSportSlug(series, sports) ??
    inferSportSlug(`${series} ${title}`, sports);
  const track = asString(row.track);
  const startsAt = asIso(row.dateTime);
  return {
    id: `event-${id}`,
    kind: "event",
    sportSlug,
    title,
    subtitle: track || series || "Upcoming event",
    href: eventHref(series, slug),
    startsAt,
  };
}

export function screeningsToFeedItems(
  venues: HubScreeningVenueRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
  limit = 8,
  options: { preferSoonest?: boolean; now?: Date } = {},
): HubFeedItem[] {
  const items: HubFeedItem[] = [];

  for (const venue of venues) {
    const venueName = asString(venue.name) || "Venue";
    const venueSlug = asString(venue.slug);
    const href = venueSlug ? `/venues/${venueSlug}` : "/venues";
    const broadcastSport =
      venue.broadcasts
        ?.map((broadcast) => resolveSportSlug(asString(broadcast.slug), sports))
        .find((slug): slug is string => Boolean(slug)) ?? null;

    for (const screening of venue.upcoming_screenings ?? []) {
      const title = asString(screening.title);
      if (!title) continue;
      const sportSlug =
        inferSportSlug(title, sports) ?? broadcastSport;
      items.push({
        id: `screening-${venueSlug || venueName}-${title}-${asString(screening.startsAt)}`,
        kind: "screening",
        sportSlug,
        title,
        subtitle: venueName,
        href,
        startsAt: asIso(screening.startsAt),
        venueSlug: venueSlug || null,
      });
    }
  }

  const ordered = options.preferSoonest
    ? sortHubFeed(items, options.now)
    : items;
  return ordered.slice(0, limit);
}

/** Dedupe + cap follow slugs before binding `$slugs` in GROQ. */
export function uniqueFollowedVenueSlugs(
  slugs: Iterable<string> | null | undefined,
  max = MAX_FOLLOWED_VENUE_SLUGS,
): string[] {
  if (!slugs) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of slugs) {
    if (out.length >= max) break;
    const slug = typeof raw === "string" ? raw.trim() : "";
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

/** Dedupe + lowercase + cap fixture follow slugs for calendar resolution. */
export function uniqueFollowedFixtureSlugs(
  slugs: Iterable<string> | null | undefined,
  max = MAX_FOLLOWED_FIXTURE_SLUGS,
): string[] {
  if (!slugs) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of slugs) {
    if (out.length >= max) break;
    const slug =
      typeof raw === "string" ? raw.trim().toLowerCase() : "";
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

/** Normalize preference / follow sport slugs onto hub parents. */
export function normalizePreferredSportSlugs(
  sports: Iterable<string> | null | undefined,
): string[] {
  if (!sports) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of sports) {
    const normalized = normalizeSportSlug(raw);
    if (!normalized) continue;
    const slug = toHubSportSlug(normalized) ?? normalized;
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

function fixtureMatchesPreferredSports(
  fixture: UpcomingFixture,
  preferred: ReadonlySet<string>,
): boolean {
  if (preferred.size === 0) return false;
  const sport = fixture.sportSlug;
  if (!sport) return false;
  const hub = toHubSportSlug(sport) ?? normalizeSportSlug(sport);
  return Boolean(hub) && preferred.has(hub);
}

/**
 * Map a public UpcomingFixture onto a hub feed row.
 * Always links to `/events/[slug]` so follow/unfollow stays one hop away.
 * Followed rows get a distinct id + flag for the calendar strip; preference
 * matches use a plain fixture id so they land in the general For you feed.
 */
export function fixtureToFeedItem(
  fixture: UpcomingFixture,
  options: { followed?: boolean } = {},
): HubFeedItem | null {
  const slug = fixture.slug.trim();
  const title = fixture.title.trim();
  if (!slug || !title) return null;

  const followed = options.followed ?? true;
  const venueCount = fixture.venues.length;
  const subtitle =
    venueCount > 0
      ? `${venueCount} venue${venueCount === 1 ? "" : "s"} screening`
      : fixture.series?.trim() ||
        (followed ? "Fixture you're following" : "Matches your sports");

  return {
    id: followed ? `followed-fixture-${slug}` : `fixture-${slug}`,
    kind: "event",
    sportSlug: fixture.sportSlug,
    title,
    subtitle,
    href: `/events/${encodeURIComponent(slug)}`,
    startsAt: fixture.startsAt,
    ...(followed ? { followedFixture: true as const } : {}),
  };
}

export function fixturesToFollowedFeedItems(
  fixtures: UpcomingFixture[],
  options: { now?: Date; limit?: number } = {},
): HubFeedItem[] {
  const limit = options.limit ?? MAX_FOLLOWED_FIXTURE_SLUGS;
  const items = fixtures
    .map((fixture) => fixtureToFeedItem(fixture, { followed: true }))
    .filter((item): item is HubFeedItem => item !== null);
  return sortHubFeed(items, options.now).slice(0, limit);
}

/**
 * Upcoming fixtures whose sport is in the user's preferences — injected into
 * the For you feed so onboarding sports pay off without per-fixture follows.
 * Skips slugs already shown in the followed-fixtures calendar strip.
 */
export function fixturesToPreferredFeedItems(
  fixtures: UpcomingFixture[],
  preferredSports: Iterable<string> | null | undefined,
  options: {
    now?: Date;
    limit?: number;
    excludeSlugs?: Iterable<string> | null;
  } = {},
): HubFeedItem[] {
  const preferred = new Set(normalizePreferredSportSlugs(preferredSports));
  if (preferred.size === 0) return [];

  const excluded = new Set(uniqueFollowedFixtureSlugs(options.excludeSlugs));
  const limit = options.limit ?? MAX_PREFERRED_FIXTURE_SLUGS;
  const items = fixtures
    .filter((fixture) => {
      const slug = fixture.slug.trim().toLowerCase();
      if (!slug || excluded.has(slug)) return false;
      return fixtureMatchesPreferredSports(fixture, preferred);
    })
    .map((fixture) => fixtureToFeedItem(fixture, { followed: false }))
    .filter((item): item is HubFeedItem => item !== null);

  return sortHubFeed(items, options.now).slice(0, limit);
}

/** Screenings (and any items tagged with venueSlug) for venues the user follows. */
export function filterFeedByVenueSlugs(
  items: HubFeedItem[],
  venueSlugs: Iterable<string>,
): HubFeedItem[] {
  const allowed = new Set(
    [...venueSlugs].map((slug) => slug.trim()).filter(Boolean),
  );
  if (allowed.size === 0) return [];
  return items.filter(
    (item) => item.venueSlug && allowed.has(item.venueSlug),
  );
}

/** Dedupe by id, preferring earlier entries (e.g. followed screenings first). */
export function mergeHubFeedItems(
  ...groups: HubFeedItem[][]
): HubFeedItem[] {
  const seen = new Set<string>();
  const out: HubFeedItem[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

export function guidesToFeedItems(
  guides: HubGuideRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
): HubFeedItem[] {
  return guides.flatMap((guide) => {
    const slug = asString(guide.slug);
    const title = asString(guide.title);
    if (!slug || !title) return [];
    const keywords = Array.isArray(guide.keywords)
      ? guide.keywords.filter((word): word is string => typeof word === "string")
      : [];
    const blob = [title, asString(guide.description), ...keywords].join(" ");
    return [
      {
        id: `guide-${asString(guide._id) || slug}`,
        kind: "guide" as const,
        sportSlug: inferSportSlug(blob, sports),
        title,
        subtitle: "Guide",
        href: guideHref(slug),
        startsAt: null,
      },
    ];
  });
}

export function sortHubFeed(
  items: HubFeedItem[],
  now: Date = new Date(),
): HubFeedItem[] {
  const nowMs = now.getTime();

  function rank(item: HubFeedItem): [number, number] {
    if (!item.startsAt) return [1, nowMs];
    const time = new Date(item.startsAt).getTime();
    if (Number.isNaN(time)) return [1, nowMs];
    if (time >= nowMs) return [0, time];
    return [2, -time];
  }

  return [...items].sort((a, b) => {
    const [aBucket, aTime] = rank(a);
    const [bBucket, bTime] = rank(b);
    if (aBucket !== bBucket) return aBucket - bBucket;
    return aTime - bTime;
  });
}

/**
 * Like sortHubFeed, but within each time bucket elevates items whose sport
 * matches the user's preferences (All-focus personalization).
 */
export function sortHubFeedPreferringSports(
  items: HubFeedItem[],
  preferredSports: Iterable<string> | null | undefined,
  now: Date = new Date(),
): HubFeedItem[] {
  const preferred = new Set(normalizePreferredSportSlugs(preferredSports));
  if (preferred.size === 0) return sortHubFeed(items, now);

  const nowMs = now.getTime();

  function timeRank(item: HubFeedItem): [number, number] {
    if (!item.startsAt) return [1, nowMs];
    const time = new Date(item.startsAt).getTime();
    if (Number.isNaN(time)) return [1, nowMs];
    if (time >= nowMs) return [0, time];
    return [2, -time];
  }

  function isPreferred(item: HubFeedItem): boolean {
    if (!item.sportSlug) return false;
    const hub =
      toHubSportSlug(item.sportSlug) ?? normalizeSportSlug(item.sportSlug);
    return Boolean(hub) && preferred.has(hub);
  }

  return [...items].sort((a, b) => {
    const [aBucket, aTime] = timeRank(a);
    const [bBucket, bTime] = timeRank(b);
    if (aBucket !== bBucket) return aBucket - bBucket;
    const aPref = isPreferred(a) ? 0 : 1;
    const bPref = isPreferred(b) ? 0 : 1;
    if (aPref !== bPref) return aPref - bPref;
    return aTime - bTime;
  });
}

export function formatHubWhen(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;

  const diffMs = parsed.getTime() - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const time = parsed.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const date = parsed.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  if (diffMs >= 0 && diffMs < dayMs) return `Today · ${time}`;
  if (diffMs >= dayMs && diffMs < 2 * dayMs) return `Tomorrow · ${time}`;
  return `${date} · ${time}`;
}
