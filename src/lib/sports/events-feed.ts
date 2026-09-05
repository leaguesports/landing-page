import {
  eventHref,
  inferSportSlug,
  resolveSportSlug,
  SPORT_CATALOG,
  type SportDefinition,
} from "./catalog.ts";

export type FixtureVenue = {
  name: string;
  slug: string;
};

export type UpcomingFixture = {
  /** Stable slug for /events/[slug] */
  slug: string;
  title: string;
  sportSlug: string | null;
  startsAt: string | null;
  venues: FixtureVenue[];
  /** CMS event series when this row came from (or merged with) an event doc. */
  series?: string | null;
  eventPageHref?: string | null;
  kind: "screening" | "event" | "both";
};

export type EventsScreeningVenueRow = {
  name?: unknown;
  slug?: unknown;
  broadcasts?: Array<{ name?: unknown; slug?: unknown }> | null;
  upcoming_screenings?: Array<{ title?: unknown; startsAt?: unknown }> | null;
};

export type EventsCmsEventRow = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  series?: unknown;
  dateTime?: unknown;
  track?: unknown;
};

/** Pull upcoming screenings across venues for the public events hub. */
export const EVENTS_SCREENINGS_QUERY = `*[_type == "venue" && count(upcoming_screenings) > 0] | order(_updatedAt desc) [0...40] {
  name,
  "slug": slug.current,
  "broadcasts": broadcasts[]->{ name, "slug": slug.current },
  upcoming_screenings[0...16]{ title, startsAt }
}`;

/** CMS calendar events (F1 today; other series when editors add them). */
export const EVENTS_CMS_QUERY = `*[_type == "event"] | order(coalesce(f1Details.dateTime, _createdAt) asc) [0...24] {
  "id": _id,
  title,
  "slug": slug.current,
  series,
  "dateTime": f1Details.dateTime,
  "track": f1Details.track
}`;

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

/** URL-safe slug from a fixture title (e.g. Springboks vs All Blacks). */
export function fixtureSlugFromTitle(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "fixture";
}

/** Collapse titles so venues listing the same kickoff merge. */
export function normalizeFixtureKey(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'");
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
  };
}

function pickEarlier(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

/**
 * Group venue screenings by fixture title so “SA vs All Blacks” surfaces once
 * with every bar/fan zone screening it.
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
        new Date(startsAt).getTime() < nowMs - 3 * 60 * 60 * 1000
      ) {
        continue;
      }

      const key = normalizeFixtureKey(title);
      const sportSlug = inferSportSlug(title, sports) ?? broadcastSport;
      const existing = byKey.get(key);
      if (existing) {
        existing.venues.set(venueSlug, { name: venueName, slug: venueSlug });
        existing.startsAt = pickEarlier(existing.startsAt, startsAt);
        existing.hasScreening = true;
        if (!existing.sportSlug && sportSlug) existing.sportSlug = sportSlug;
        continue;
      }

      byKey.set(key, {
        slug: fixtureSlugFromTitle(title),
        title,
        sportSlug,
        startsAt,
        venues: new Map([[venueSlug, { name: venueName, slug: venueSlug }]]),
        series: null,
        eventPageHref: null,
        hasScreening: true,
        hasEvent: false,
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
    const startsAt = asIso(row.dateTime);
    if (
      !options.includePast &&
      startsAt &&
      new Date(startsAt).getTime() < nowMs - 6 * 60 * 60 * 1000
    ) {
      continue;
    }

    const sportSlug =
      resolveSportSlug(series, sports) ??
      inferSportSlug(`${series} ${title}`, sports);
    const slug = eventSlug || fixtureSlugFromTitle(title);

    out.push({
      slug,
      title,
      sportSlug,
      startsAt,
      venues: [],
      series: series || null,
      eventPageHref: eventHref(series, eventSlug || slug),
      kind: "event",
    });
  }

  return out;
}

/**
 * Merge screening-backed fixtures with CMS events.
 * Same normalized title → one row (venues + optional event page).
 * Prefer screening slug when both exist so /events/[slug] stays stable.
 */
export function mergeUpcomingFixtures(
  screenings: UpcomingFixture[],
  events: UpcomingFixture[],
): UpcomingFixture[] {
  const byKey = new Map<string, MutableFixture>();

  function upsert(item: UpcomingFixture, from: "screening" | "event") {
    const key = normalizeFixtureKey(item.title);
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
      });
      return;
    }

    for (const venue of item.venues) {
      existing.venues.set(venue.slug, venue);
    }
    existing.startsAt = pickEarlier(existing.startsAt, item.startsAt);
    if (!existing.sportSlug && item.sportSlug) {
      existing.sportSlug = item.sportSlug;
    }
    if (item.series) existing.series = item.series;
    if (item.eventPageHref) existing.eventPageHref = item.eventPageHref;
    if (
      from === "screening" ||
      item.kind === "screening" ||
      item.kind === "both"
    ) {
      existing.hasScreening = true;
      existing.slug = item.slug || existing.slug;
      existing.title = item.title || existing.title;
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
  options: { now?: Date; limit?: number } = {},
): UpcomingFixture[] {
  const now = options.now ?? new Date();
  const screenings = groupScreeningsIntoFixtures(screeningVenues, sports, {
    now,
  });
  const events = cmsEventsToFixtures(cmsEvents, sports, { now });
  const merged = mergeUpcomingFixtures(screenings, events);
  const sorted = sortUpcomingFixtures(merged, now);
  const limit = options.limit ?? 24;
  return sorted.slice(0, limit);
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
