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
export const EVENTS_VENUE_CITY_PROJECTION = `\"city\": coalesce(address.city->title, location->parent->title, location->title),\n  \"citySlug\": coalesce(address.city->slug.current, location->parent->slug.current, location->slug.current)`;

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
  "nextKickoff": math::min(upcoming_screenings[
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
  "nextKickoff": math::min(upcoming_screenings[
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
