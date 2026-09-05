import {
  eventHref,
  inferSportSlug,
  resolveSportSlug,
  SPORT_CATALOG,
  type SportDefinition,
} from "./catalog.ts";

/** Kickoff calendar day for grouping/slugs — SA local date. */
export const FIXTURE_TIMEZONE = "Africa/Johannesburg";

/** Keep fixtures visible for a short window after kickoff. */
export const UPCOMING_GRACE_MS = 6 * 60 * 60 * 1000;

/** Event-level kickoff, falling back to legacy F1 `f1Details.dateTime`. */
export const EVENT_KICKOFF_GROQ = "coalesce(startsAt, f1Details.dateTime)";

/** Metro title/slug for city filter — city ref, else location parent, else location. */
export const EVENTS_VENUE_CITY_PROJECTION = `"city": coalesce(address.city->title, location->parent->title, location->title),
  "citySlug": coalesce(address.city->slug.current, location->parent->slug.current, location->slug.current)`;

export type FixtureVenue = {
  name: string;
  slug: string;
  city?: string | null;
  citySlug?: string | null;
};

export type UpcomingFixture = {
  /** Stable slug for /events/[slug] — title slug + SA calendar day when known. */
  slug: string;
  title: string;
  sportSlug: string | null;
  startsAt: string | null;
  venues: FixtureVenue[];
  /** CMS event series when this row came from (or merged with) an event doc. */
  series?: string | null;
  eventPageHref?: string | null;
  kind: "screening" | "event" | "both";
  /** Editorial flag from CMS. Absent/null is not featured. */
  featured?: boolean;
};

export type EventsScreeningVenueRow = {
  name?: unknown;
  slug?: unknown;
  city?: unknown;
  citySlug?: unknown;
  broadcasts?: Array<{ name?: unknown; slug?: unknown }> | null;
  upcoming_screenings?: Array<{ title?: unknown; startsAt?: unknown }> | null;
};

export type EventsCmsEventRow = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  series?: unknown;
  dateTime?: unknown;
  startsAt?: unknown;
  featured?: unknown;
  track?: unknown;
};

/**
 * Venues with upcoming screenings, ordered by next kickoff — not document age.
 * `$notBefore` is an ISO timestamp (now minus grace).
 */
export const EVENTS_SCREENINGS_QUERY = `*[
  _type == "venue" &&
  count(upcoming_screenings[defined(startsAt) && startsAt >= $notBefore]) > 0
] {
  name,
  "slug": slug.current,
  ${EVENTS_VENUE_CITY_PROJECTION},
  "broadcasts": broadcasts[]->{ name, "slug": slug.current },
  "nextKickoff": min(upcoming_screenings[
    defined(startsAt) && startsAt >= $notBefore
  ].startsAt),
  "upcoming_screenings": upcoming_screenings[
    defined(startsAt) && startsAt >= $notBefore
  ] | order(startsAt asc) [0...16]{ title, startsAt }
} | order(nextKickoff asc) [0...40]`;

/**
 * Upcoming CMS events only (not the oldest historical slice).
 * Kickoff is event-level `startsAt` or legacy F1 `f1Details.dateTime`.
 * `$notBefore` is an ISO timestamp (now minus grace).
 */
export const EVENTS_CMS_QUERY = `*[
  _type == "event" &&
  defined(${EVENT_KICKOFF_GROQ}) &&
  ${EVENT_KICKOFF_GROQ} >= $notBefore
] | order(${EVENT_KICKOFF_GROQ} asc) [0...24] {
  "id": _id,
  title,
  "slug": slug.current,
  series,
  featured,
  "dateTime": ${EVENT_KICKOFF_GROQ},
  "track": f1Details.track
}`;

/** Day-scoped venue screenings for /events/[slug] lookups. */
export const EVENTS_SCREENINGS_ON_DAY_QUERY = `*[
  _type == "venue" &&
  count(upcoming_screenings[
    defined(startsAt) && startsAt >= $dayStart && startsAt < $dayEnd
  ]) > 0
] {
  name,
  "slug": slug.current,
  ${EVENTS_VENUE_CITY_PROJECTION},
  "broadcasts": broadcasts[]->{ name, "slug": slug.current },
  "nextKickoff": min(upcoming_screenings[
    defined(startsAt) && startsAt >= $dayStart && startsAt < $dayEnd
  ].startsAt),
  "upcoming_screenings": upcoming_screenings[
    defined(startsAt) && startsAt >= $dayStart && startsAt < $dayEnd
  ] | order(startsAt asc) [0...16]{ title, startsAt }
} | order(nextKickoff asc) [0...40]`;

/** Day-scoped CMS events for /events/[slug] lookups. */
export const EVENTS_CMS_ON_DAY_QUERY = `*[
  _type == "event" &&
  defined(${EVENT_KICKOFF_GROQ}) &&
  ${EVENT_KICKOFF_GROQ} >= $dayStart &&
  ${EVENT_KICKOFF_GROQ} < $dayEnd
] | order(${EVENT_KICKOFF_GROQ} asc) [0...24] {
  "id": _id,
  title,
  "slug": slug.current,
  series,
  featured,
  "dateTime": ${EVENT_KICKOFF_GROQ},
  "track": f1Details.track
}`;

export function upcomingNotBeforeIso(now: Date = new Date()): string {
  return new Date(now.getTime() - UPCOMING_GRACE_MS).toISOString();
}

/**
 * SA local calendar day (YYYY-MM-DD) for a kickoff instant.
 * SAST is UTC+2 year-round.
 */
export function fixtureCalendarDay(
  iso: string | null | undefined,
): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FIXTURE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

/** UTC bounds for a YYYY-MM-DD calendar day in Africa/Johannesburg. */
export function saDayBounds(day: string): {
  dayStart: string;
  dayEnd: string;
} {
  const start = new Date(`${day}T00:00:00+02:00`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid SA calendar day: ${day}`);
  }
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { dayStart: start.toISOString(), dayEnd: end.toISOString() };
}

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

function asFeatured(value: unknown): boolean {
  return value === true;
}

/**
 * Shared title canonicalization for merge keys and URL slugs.
 * Punctuation variants ("All Blacks" vs "All-Blacks") collapse to one token
 * so they cannot fork into two feed rows that share one /events/[slug].
 */
export function canonicalizeFixtureTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function slugifyTitle(title: string): string {
  const slug = canonicalizeFixtureTitle(title).replace(/\s+/g, "-").slice(0, 64);
  return slug || "fixture";
}

/**
 * URL slug from title + SA calendar day when kickoff is known.
 * Same canonical title (+ day) as normalizeFixtureKey — key and slug stay aligned.
 */
export function fixtureSlugFromTitle(
  title: string,
  startsAt: string | null = null,
): string {
  const base = slugifyTitle(title);
  const day = fixtureCalendarDay(startsAt);
  return day ? `${base}-${day}` : base;
}

/** Grouping key: same canonical title as the slug + SA calendar day (when known). */
export function normalizeFixtureKey(
  title: string,
  startsAt: string | null = null,
): string {
  const titleKey = canonicalizeFixtureTitle(title);
  const day = fixtureCalendarDay(startsAt);
  return day ? `${titleKey}|${day}` : titleKey;
}

/** Split `/events/[slug]` into title slug + optional YYYY-MM-DD suffix. */
export function parseFixtureSlug(slug: string): {
  baseSlug: string;
  day: string | null;
} {
  const trimmed = slug.trim().toLowerCase();
  const match = trimmed.match(/^(.*)-(\d{4}-\d{2}-\d{2})$/);
  if (match?.[1] && match[2]) {
    return { baseSlug: match[1], day: match[2] };
  }
  return { baseSlug: trimmed, day: null };
}

export function formatFixtureWhen(
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
    timeZone: FIXTURE_TIMEZONE,
  });
  const date = parsed.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: FIXTURE_TIMEZONE,
  });

  if (diffMs >= 0 && diffMs < dayMs) return `Today · ${time}`;
  if (diffMs >= dayMs && diffMs < 2 * dayMs) return `Tomorrow · ${time}`;
  return `${date} · ${time}`;
}

type MutableFixture = {
  slug: string;
  title: string;
  sportSlug: string | null;
  startsAt: string | null;
  venues: Map<string, FixtureVenue>;
  series: string | null;
  eventPageHref: string | null;
  hasScreening: boolean;
  hasEvent: boolean;
  featured: boolean;
};

function toUpcoming(row: MutableFixture): UpcomingFixture {
  const venues = [...row.venues.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const kind: UpcomingFixture["kind"] =
    row.hasScreening && row.hasEvent
      ? "both"
      : row.hasEvent
        ? "event"
        : "screening";

  return {
    slug: row.slug,
    title: row.title,
    sportSlug: row.sportSlug,
    startsAt: row.startsAt,
    venues,
    series: row.series,
    eventPageHref: row.eventPageHref,
    kind,
    featured: row.featured,
  };
}

function venueFromRow(
  venueName: string,
  venueSlug: string,
  row: EventsScreeningVenueRow,
): FixtureVenue {
  const city = asString(row.city) || null;
  const citySlug = asString(row.citySlug) || null;
  return { name: venueName, slug: venueSlug, city, citySlug };
}

/**
 * Group venue screenings by title + SA calendar day so the same kickoff
 * merges across bars, while recurring fixtures stay distinct.
 */
export function groupScreeningsIntoFixtures(
  venues: EventsScreeningVenueRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
  options: { now?: Date; includePast?: boolean } = {},
): UpcomingFixture[] {
  const nowMs = (options.now ?? new Date()).getTime();
  const byKey = new Map<string, MutableFixture>();

  for (const venue of venues) {
    const venueName = asString(venue.name) || "Venue";
    const venueSlug = asString(venue.slug);
    if (!venueSlug) continue;

    const broadcastSport =
      venue.broadcasts
        ?.map((broadcast) => resolveSportSlug(asString(broadcast.slug), sports))
        .find((slug): slug is string => Boolean(slug)) ?? null;

    for (const screening of venue.upcoming_screenings ?? []) {
      const title = asString(screening.title);
      if (!title) continue;
      const startsAt = asIso(screening.startsAt);
      if (
        !options.includePast &&
        startsAt &&
        new Date(startsAt).getTime() < nowMs - UPCOMING_GRACE_MS
      ) {
        continue;
      }

      const key = normalizeFixtureKey(title, startsAt);
      const sportSlug = inferSportSlug(title, sports) ?? broadcastSport;
      const existing = byKey.get(key);
      if (existing) {
        existing.venues.set(
          venueSlug,
          venueFromRow(venueName, venueSlug, venue),
        );
        existing.hasScreening = true;
        if (!existing.sportSlug && sportSlug) existing.sportSlug = sportSlug;
        // Same calendar-day key — keep the shared kickoff (prefer earlier).
        if (startsAt) {
          if (!existing.startsAt || startsAt < existing.startsAt) {
            existing.startsAt = startsAt;
            existing.slug = fixtureSlugFromTitle(title, startsAt);
          }
        }
        continue;
      }

      byKey.set(key, {
        slug: fixtureSlugFromTitle(title, startsAt),
        title,
        sportSlug,
        startsAt,
        venues: new Map([
          [venueSlug, venueFromRow(venueName, venueSlug, venue)],
        ]),
        series: null,
        eventPageHref: null,
        hasScreening: true,
        hasEvent: false,
        featured: false,
      });
    }
  }

  return [...byKey.values()].map(toUpcoming);
}

/** Map CMS event docs into fixture rows (motorsport calendar, future series). */
export function cmsEventsToFixtures(
  rows: EventsCmsEventRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
  options: { now?: Date; includePast?: boolean } = {},
): UpcomingFixture[] {
  const nowMs = (options.now ?? new Date()).getTime();
  const out: UpcomingFixture[] = [];

  for (const row of rows) {
    const title = asString(row.title);
    const eventSlug = asString(row.slug);
    if (!title) continue;
    const series = asString(row.series);
    const startsAt = asIso(row.dateTime) ?? asIso(row.startsAt);
    if (
      !options.includePast &&
      startsAt &&
      new Date(startsAt).getTime() < nowMs - UPCOMING_GRACE_MS
    ) {
      continue;
    }

    const sportSlug =
      resolveSportSlug(series, sports) ??
      inferSportSlug(`${series} ${title}`, sports);
    // Slug from title+day so screenings of the same fixture merge on the same URL.
    const slug = fixtureSlugFromTitle(title, startsAt);

    out.push({
      slug,
      title,
      sportSlug,
      startsAt,
      venues: [],
      series: series || null,
      eventPageHref: eventHref(series, eventSlug || slugifyTitle(title)),
      kind: "event",
      featured: asFeatured(row.featured),
    });
  }

  return out;
}

/**
 * Merge screening-backed fixtures with CMS events.
 * Same title + SA calendar day → one row (venues + optional event page).
 */
export function mergeUpcomingFixtures(
  screenings: UpcomingFixture[],
  events: UpcomingFixture[],
): UpcomingFixture[] {
  const byKey = new Map<string, MutableFixture>();

  function upsert(item: UpcomingFixture, from: "screening" | "event") {
    const key = normalizeFixtureKey(item.title, item.startsAt);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        slug: item.slug,
        title: item.title,
        sportSlug: item.sportSlug,
        startsAt: item.startsAt,
        venues: new Map(item.venues.map((v) => [v.slug, v])),
        series: item.series ?? null,
        eventPageHref: item.eventPageHref ?? null,
        hasScreening: from === "screening" || item.kind === "both",
        hasEvent: from === "event" || item.kind === "both",
        featured: Boolean(item.featured),
      });
      return;
    }

    for (const venue of item.venues) {
      existing.venues.set(venue.slug, venue);
    }
    if (item.startsAt) {
      if (!existing.startsAt || item.startsAt < existing.startsAt) {
        existing.startsAt = item.startsAt;
      }
    }
    // Keep title+day slug (both sides should already match).
    existing.slug = fixtureSlugFromTitle(
      existing.title || item.title,
      existing.startsAt,
    );
    if (!existing.sportSlug && item.sportSlug) {
      existing.sportSlug = item.sportSlug;
    }
    if (item.series) existing.series = item.series;
    if (item.eventPageHref) existing.eventPageHref = item.eventPageHref;
    if (item.featured) existing.featured = true;
    if (
      from === "screening" ||
      item.kind === "screening" ||
      item.kind === "both"
    ) {
      existing.hasScreening = true;
      if (item.title) existing.title = item.title;
    }
    if (from === "event" || item.kind === "event" || item.kind === "both") {
      existing.hasEvent = true;
    }
  }

  for (const item of screenings) upsert(item, "screening");
  for (const item of events) upsert(item, "event");

  return [...byKey.values()].map(toUpcoming);
}

export function sortUpcomingFixtures(
  items: UpcomingFixture[],
  now: Date = new Date(),
): UpcomingFixture[] {
  const nowMs = now.getTime();

  function rank(item: UpcomingFixture): [number, number] {
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
    if (aTime !== bTime) return aTime - bTime;
    return b.venues.length - a.venues.length;
  });
}

export function buildUpcomingFixtures(
  screeningVenues: EventsScreeningVenueRow[],
  cmsEvents: EventsCmsEventRow[],
  sports: SportDefinition[] = SPORT_CATALOG,
  options: { now?: Date; limit?: number; includePast?: boolean } = {},
): UpcomingFixture[] {
  const now = options.now ?? new Date();
  const screenings = groupScreeningsIntoFixtures(screeningVenues, sports, {
    now,
    includePast: options.includePast,
  });
  const events = cmsEventsToFixtures(cmsEvents, sports, {
    now,
    includePast: options.includePast,
  });
  const merged = mergeUpcomingFixtures(screenings, events);
  const sorted = sortUpcomingFixtures(merged, now);
  const limit = options.limit ?? 24;
  return sorted.slice(0, limit);
}

/**
 * Editorial featured fixture for homepage / events hero.
 * Only a CMS `featured === true` row with a future (or grace) kickoff.
 * Does not invent a featured moment from the soonest upcoming list.
 */
export function selectFeaturedFixture(
  fixtures: UpcomingFixture[],
  now: Date = new Date(),
): UpcomingFixture | null {
  const nowMs = now.getTime();
  const flagged = fixtures.filter((item) => {
    if (!item.featured) return false;
    if (!item.startsAt) return false;
    const time = new Date(item.startsAt).getTime();
    if (Number.isNaN(time)) return false;
    return time >= nowMs - UPCOMING_GRACE_MS;
  });
  if (flagged.length === 0) return null;
  return sortUpcomingFixtures(flagged, now)[0] ?? null;
}

export function findFixtureBySlug(
  fixtures: UpcomingFixture[],
  slug: string,
): UpcomingFixture | null {
  const needle = slug.trim().toLowerCase();
  if (!needle) return null;
  return fixtures.find((item) => item.slug === needle) ?? null;
}

export function fixtureWatchHref(fixture: UpcomingFixture): string {
  if (fixture.venues.length > 0) return `/events/${fixture.slug}`;
  if (fixture.eventPageHref) return fixture.eventPageHref;
  if (fixture.sportSlug) return `/watch/${fixture.sportSlug}`;
  return "/watch";
}
