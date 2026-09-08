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
