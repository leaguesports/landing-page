import { guideHref, isGuideSlug } from "../guides/slugs.ts";
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
  upcoming_screenings[]{ title, startsAt, fixtureSlug }
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
  upcoming_screenings[0...12]{ title, startsAt, fixtureSlug }
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
  upcoming_screenings?: Array<{
    title?: unknown;
    startsAt?: unknown;
    fixtureSlug?: unknown;
  }> | null;
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
