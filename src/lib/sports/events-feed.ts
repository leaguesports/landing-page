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

/**
 * Event-level kickoff: new `startDateTime`, legacy `startsAt`, then F1.
 */
export const EVENT_KICKOFF_GROQ =
  "coalesce(startDateTime, startsAt, f1Details.dateTime)";

/** Metro title/slug for city filter — city ref, else location parent, else location. */
export const EVENTS_VENUE_CITY_PROJECTION = `"city": coalesce(address.city->title, location->parent->title, location->title),
  "citySlug": coalesce(address.city->slug.current, location->parent->slug.current, location->slug.current)`;

export type FixtureVenue = {
  name: string;
  slug: string;
  city?: string | null;
  citySlug?: string | null;
};

export type FixtureFaq = {
  question: string;
  answer: string;
};

export type FixtureTeam = {
  name: string;
};

export type FixtureHostVenue = {
  name: string;
  slug: string;
  city?: string | null;
  citySlug?: string | null;
};

export type FixtureRelatedGuide = {
  title: string;
  slug: string;
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
  competition?: string | null;
  broadcastInfo?: string | null;
  teams?: FixtureTeam[];
  hostVenue?: FixtureHostVenue | null;
  seoIntro?: string | null;
  localAngle?: string | null;
  faqs?: FixtureFaq[];
  relatedGuide?: FixtureRelatedGuide | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  updatedAt?: string | null;
  /** CMS event `slug.current` when this row came from (or merged with) an event doc. */
  cmsSlug?: string | null;
};

export type EventsScreeningVenueRow = {
  name?: unknown;
  slug?: unknown;
  city?: unknown;
  citySlug?: unknown;
  broadcasts?: Array<{ name?: unknown; slug?: unknown }> | null;
  upcoming_screenings?: Array<{
    title?: unknown;
    startsAt?: unknown;
    fixtureSlug?: unknown;
  }> | null;
};

export type EventsCmsEventRow = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  series?: unknown;
  sport?: unknown;
  dateTime?: unknown;
  startsAt?: unknown;
  startDateTime?: unknown;
  featured?: unknown;
  track?: unknown;
  competition?: unknown;
  broadcastInfo?: unknown;
  teams?: unknown;
  hostVenue?: unknown;
  seoIntro?: unknown;
  localAngle?: unknown;
  faqs?: unknown;
  relatedGuide?: unknown;
  seoTitle?: unknown;
  seoDescription?: unknown;
  updatedAt?: unknown;
};

/** Shared projection for CMS event docs — hub list, day lookup, and slug lookup. */
export const EVENT_CMS_PROJECTION = `"id": _id,
  title,
  "slug": slug.current,
  series,
  sport,
  featured,
  competition,
  broadcastInfo,
  "dateTime": ${EVENT_KICKOFF_GROQ},
  "startDateTime": startDateTime,
  "startsAt": startsAt,
  "track": f1Details.track,
  "updatedAt": _updatedAt,
  seoTitle,
  seoDescription,
  seoIntro,
  localAngle,
  "faqs": faqs[]{ question, answer },
  "teams": teams[]{ name },
  "hostVenue": hostVenue->{
    name,
    "slug": slug.current,
    ${EVENTS_VENUE_CITY_PROJECTION}
  },
  "relatedGuide": relatedGuide->{
    title,
    "slug": slug.current
  }`;

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
  "nextKickoff": math::min(upcoming_screenings[
    defined(startsAt) && startsAt >= $notBefore
  ].startsAt),
  "upcoming_screenings": upcoming_screenings[
    defined(startsAt) && startsAt >= $notBefore
  ] | order(startsAt asc) [0...16]{ title, startsAt, fixtureSlug }
} | order(nextKickoff asc) [0...40]`;

/**
 * Upcoming CMS events only (not the oldest historical slice).
 * Kickoff is `startDateTime`, legacy `startsAt`, or F1 `f1Details.dateTime`.
 * `$notBefore` is an ISO timestamp (now minus grace).
 */
export const EVENTS_CMS_QUERY = `*[
  _type == "event" &&
  defined(${EVENT_KICKOFF_GROQ}) &&
  ${EVENT_KICKOFF_GROQ} >= $notBefore
] | order(${EVENT_KICKOFF_GROQ} asc) [0...24] {
  ${EVENT_CMS_PROJECTION}
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
  "nextKickoff": math::min(upcoming_screenings[
    defined(startsAt) && startsAt >= $dayStart && startsAt < $dayEnd
  ].startsAt),
  "upcoming_screenings": upcoming_screenings[
    defined(startsAt) && startsAt >= $dayStart && startsAt < $dayEnd
  ] | order(startsAt asc) [0...16]{ title, startsAt, fixtureSlug }
} | order(nextKickoff asc) [0...40]`;

/** Day-scoped CMS events for /events/[slug] lookups. */
export const EVENTS_CMS_ON_DAY_QUERY = `*[
  _type == "event" &&
  defined(${EVENT_KICKOFF_GROQ}) &&
  ${EVENT_KICKOFF_GROQ} >= $dayStart &&
  ${EVENT_KICKOFF_GROQ} < $dayEnd
] | order(${EVENT_KICKOFF_GROQ} asc) [0...24] {
  ${EVENT_CMS_PROJECTION}
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

function parseTeams(value: unknown): FixtureTeam[] {
  if (!Array.isArray(value)) return [];
  const teams: FixtureTeam[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const name = asString((item as { name?: unknown }).name);
    if (!name) continue;
    teams.push({ name });
  }
  return teams;
}

function parseFaqs(value: unknown): FixtureFaq[] {
  if (!Array.isArray(value)) return [];
  const faqs: FixtureFaq[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as { question?: unknown; answer?: unknown };
    const question = asString(row.question);
    const answer = asString(row.answer);
    if (!question || !answer) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}

function parseHostVenue(value: unknown): FixtureHostVenue | null {
  if (!value || typeof value !== "object") return null;
  const row = value as {
    name?: unknown;
    slug?: unknown;
    city?: unknown;
    citySlug?: unknown;
  };
  const name = asString(row.name);
  const slug = asString(row.slug);
  if (!name || !slug) return null;
  return {
    name,
    slug,
    city: asString(row.city) || null,
    citySlug: asString(row.citySlug) || null,
  };
}

function parseRelatedGuide(value: unknown): FixtureRelatedGuide | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { title?: unknown; slug?: unknown };
  const title = asString(row.title);
  const slug = asString(row.slug);
  if (!title || !slug) return null;
  return { title, slug };
}

type FixtureSeoFields = {
  competition: string | null;
  broadcastInfo: string | null;
  teams: FixtureTeam[];
  hostVenue: FixtureHostVenue | null;
  seoIntro: string | null;
  localAngle: string | null;
  faqs: FixtureFaq[];
  relatedGuide: FixtureRelatedGuide | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string | null;
};

const EMPTY_SEO: FixtureSeoFields = {
  competition: null,
  broadcastInfo: null,
  teams: [],
  hostVenue: null,
  seoIntro: null,
  localAngle: null,
  faqs: [],
  relatedGuide: null,
  seoTitle: null,
  seoDescription: null,
  updatedAt: null,
};

function seoFromCmsRow(row: EventsCmsEventRow): FixtureSeoFields {
  return {
    competition: asString(row.competition) || null,
    broadcastInfo: asString(row.broadcastInfo) || null,
    teams: parseTeams(row.teams),
    hostVenue: parseHostVenue(row.hostVenue),
    seoIntro: asString(row.seoIntro) || null,
    localAngle: asString(row.localAngle) || null,
    faqs: parseFaqs(row.faqs),
    relatedGuide: parseRelatedGuide(row.relatedGuide),
    seoTitle: asString(row.seoTitle) || null,
    seoDescription: asString(row.seoDescription) || null,
    updatedAt: asIso(row.updatedAt),
  };
}

function applySeo(
  target: FixtureSeoFields,
  seo: FixtureSeoFields,
): void {
  if (seo.competition) target.competition = seo.competition;
  if (seo.broadcastInfo) target.broadcastInfo = seo.broadcastInfo;
  if (seo.teams.length > 0) target.teams = seo.teams;
  if (seo.hostVenue) target.hostVenue = seo.hostVenue;
  if (seo.seoIntro) target.seoIntro = seo.seoIntro;
  if (seo.localAngle) target.localAngle = seo.localAngle;
  if (seo.faqs.length > 0) target.faqs = seo.faqs;
  if (seo.relatedGuide) target.relatedGuide = seo.relatedGuide;
  if (seo.seoTitle) target.seoTitle = seo.seoTitle;
  if (seo.seoDescription) target.seoDescription = seo.seoDescription;
  if (seo.updatedAt) target.updatedAt = seo.updatedAt;
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
  slugIsExplicit: boolean;
  title: string;
  sportSlug: string | null;
  startsAt: string | null;
  venues: Map<string, FixtureVenue>;
  series: string | null;
  eventPageHref: string | null;
  hasScreening: boolean;
  hasEvent: boolean;
  featured: boolean;
  cmsSlug: string | null;
} & FixtureSeoFields;

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
    competition: row.competition,
    broadcastInfo: row.broadcastInfo,
    teams: row.teams,
    hostVenue: row.hostVenue,
    seoIntro: row.seoIntro,
    localAngle: row.localAngle,
    faqs: row.faqs,
    relatedGuide: row.relatedGuide,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    updatedAt: row.updatedAt,
    cmsSlug: row.cmsSlug,
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
      const explicitSlug = asString(screening.fixtureSlug).toLowerCase();
      const existing = byKey.get(key);
      if (existing) {
        existing.venues.set(
          venueSlug,
          venueFromRow(venueName, venueSlug, venue),
        );
        existing.hasScreening = true;
        if (!existing.sportSlug && sportSlug) existing.sportSlug = sportSlug;
        if (explicitSlug && !existing.slugIsExplicit) {
          existing.slug = explicitSlug;
          existing.slugIsExplicit = true;
        }
        // Same calendar-day key — keep the shared kickoff (prefer earlier).
        if (startsAt) {
          if (!existing.startsAt || startsAt < existing.startsAt) {
            existing.startsAt = startsAt;
            if (!existing.slugIsExplicit) {
              existing.slug = fixtureSlugFromTitle(title, startsAt);
            }
          }
        }
        continue;
      }

      byKey.set(key, {
        slug: explicitSlug || fixtureSlugFromTitle(title, startsAt),
        slugIsExplicit: Boolean(explicitSlug),
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
        cmsSlug: null,
        ...EMPTY_SEO,
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
    const startsAt =
      asIso(row.startDateTime) ?? asIso(row.dateTime) ?? asIso(row.startsAt);
    if (
      !options.includePast &&
      startsAt &&
      new Date(startsAt).getTime() < nowMs - UPCOMING_GRACE_MS
    ) {
      continue;
    }

    const sportSlug =
      resolveSportSlug(asString(row.sport), sports) ??
      resolveSportSlug(series, sports) ??
      inferSportSlug(`${series} ${title}`, sports);
    // Slug from title+day so screenings of the same fixture merge on the same URL.
    const slug = fixtureSlugFromTitle(title, startsAt);
    const seo = seoFromCmsRow(row);

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
      cmsSlug: eventSlug || null,
      ...seo,
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
      const created: MutableFixture = {
        slug: item.slug,
        slugIsExplicit: false,
        title: item.title,
        sportSlug: item.sportSlug,
        startsAt: item.startsAt,
        venues: new Map(item.venues.map((v) => [v.slug, v])),
        series: item.series ?? null,
        eventPageHref: item.eventPageHref ?? null,
        hasScreening: from === "screening" || item.kind === "both",
        hasEvent: from === "event" || item.kind === "both",
        featured: Boolean(item.featured),
        cmsSlug: item.cmsSlug ?? null,
        ...EMPTY_SEO,
      };
      applySeo(created, {
        competition: item.competition ?? null,
        broadcastInfo: item.broadcastInfo ?? null,
        teams: item.teams ?? [],
        hostVenue: item.hostVenue ?? null,
        seoIntro: item.seoIntro ?? null,
        localAngle: item.localAngle ?? null,
        faqs: item.faqs ?? [],
        relatedGuide: item.relatedGuide ?? null,
        seoTitle: item.seoTitle ?? null,
        seoDescription: item.seoDescription ?? null,
        updatedAt: item.updatedAt ?? null,
      });
      byKey.set(key, created);
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
    if (item.cmsSlug) existing.cmsSlug = item.cmsSlug;
    applySeo(existing, {
      competition: item.competition ?? null,
      broadcastInfo: item.broadcastInfo ?? null,
      teams: item.teams ?? [],
      hostVenue: item.hostVenue ?? null,
      seoIntro: item.seoIntro ?? null,
      localAngle: item.localAngle ?? null,
      faqs: item.faqs ?? [],
      relatedGuide: item.relatedGuide ?? null,
      seoTitle: item.seoTitle ?? null,
      seoDescription: item.seoDescription ?? null,
      updatedAt: item.updatedAt ?? null,
    });
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

/** Public slugs a screening `fixtureSlug` can attach to. */
export function fixturePublicSlugSet(fixture: UpcomingFixture): Set<string> {
  const slugs = new Set<string>();
  const canonical = fixture.slug.trim().toLowerCase();
  if (canonical) slugs.add(canonical);
  const { baseSlug } = parseFixtureSlug(canonical);
  if (baseSlug) slugs.add(baseSlug);
  const titleSlug = fixtureSlugFromTitle(fixture.title);
  if (titleSlug) slugs.add(titleSlug);
  const cms = (fixture.cmsSlug ?? "").trim().toLowerCase();
  if (cms) slugs.add(cms);
  return slugs;
}

/**
 * When a screening sets `fixtureSlug` to an event's public slug, put that
 * venue on the fixture even if titles do not match.
 */
export function attachScreeningVenuesByFixtureSlug(
  fixtures: UpcomingFixture[],
  screeningVenues: EventsScreeningVenueRow[],
): UpcomingFixture[] {
  const attachments: Array<{ needle: string; venue: FixtureVenue }> = [];
  for (const venue of screeningVenues) {
    const venueName = asString(venue.name) || "Venue";
    const venueSlug = asString(venue.slug);
    if (!venueSlug) continue;
    for (const screening of venue.upcoming_screenings ?? []) {
      const needle = asString(screening.fixtureSlug).toLowerCase();
      if (!needle) continue;
      attachments.push({
        needle,
        venue: venueFromRow(venueName, venueSlug, venue),
      });
    }
  }
  if (attachments.length === 0) return fixtures;

  return fixtures.map((fixture) => {
    const aliases = fixturePublicSlugSet(fixture);
    const have = new Set(fixture.venues.map((item) => item.slug));
    const extra: FixtureVenue[] = [];
    for (const { needle, venue } of attachments) {
      if (!aliases.has(needle)) continue;
      if (have.has(venue.slug)) continue;
      have.add(venue.slug);
      extra.push(venue);
    }
    if (extra.length === 0) return fixture;
    return {
      ...fixture,
      venues: [...fixture.venues, ...extra].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      kind: fixture.kind === "event" ? "both" : fixture.kind,
    };
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
  const attached = attachScreeningVenuesByFixtureSlug(merged, screeningVenues);
  const sorted = sortUpcomingFixtures(attached, now);
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
  if (fixture.sportSlug) {
    return `/watch/${encodeURIComponent(fixture.sportSlug)}`;
  }
  return "/watch";
}
