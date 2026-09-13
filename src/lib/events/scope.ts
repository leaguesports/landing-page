/**
 * Events list IA — sport scope, date groups, and inbound hrefs (#223).
 * List lives at `/events` with `?sport=` (fixture detail owns `/events/[slug]`).
 */

import {
  ALL_SPORTS_SLUG,
  resolveSportSlug,
  SPORT_CATALOG,
  toHubSportSlug,
  type SportDefinition,
} from "../sports/catalog.ts";
import {
  eventsCityLabel,
  type EventsCityCode,
} from "../sports/events-city.ts";
import { fixtureCalendarDay } from "../sports/events-feed.ts";

export const EVENTS_LIST_HREF = "/events" as const;

export const EVENTS_DATE_GROUP_IDS = ["today", "this-week", "later"] as const;
export type EventsDateGroupId = (typeof EVENTS_DATE_GROUP_IDS)[number];

export const EVENTS_DATE_GROUP_LABELS: Record<EventsDateGroupId, string> = {
  today: "Today",
  "this-week": "This week",
  later: "Later",
};

export type EventsListParams = {
  sport?: string | null;
  city?: EventsCityCode | null;
};

export type EventsDateGroup<T> = {
  id: EventsDateGroupId;
  label: string;
  fixtures: T[];
};

export type EventsSportChip = {
  slug: string | null;
  label: string;
  href: string;
  active: boolean;
};

export type EventsListCopy = {
  title: string;
  description: string;
  heading: string;
  sub: string;
};

function firstParam(
  raw: string | string[] | null | undefined,
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Map `?sport=rugby` (and football / F1 aliases) onto a catalog hub slug. */
export function parseEventsSportParam(
  raw: string | string[] | null | undefined,
  sports: readonly SportDefinition[] = SPORT_CATALOG,
): string | null {
  const value = firstParam(raw);
  if (!value) return null;
  const resolved = resolveSportSlug(value, [...sports]);
  if (!resolved) return null;
  return toHubSportSlug(resolved) ?? resolved;
}

export function eventsSportName(
  slug: string | null | undefined,
  sports: readonly SportDefinition[] = SPORT_CATALOG,
): string | null {
  if (!slug) return null;
  return sports.find((item) => item.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

/** Watch/calendar sports — the chips that own the Events list. */
export function eventsSportChipSports(
  sports: readonly SportDefinition[] = SPORT_CATALOG,
): SportDefinition[] {
  return sports.filter(
    (sport) =>
      sport.capabilities.includes("watch") ||
      sport.capabilities.includes("calendar"),
  );
}

export function eventsListHref(input: EventsListParams = {}): string {
  const params = new URLSearchParams();
  const sport = input.sport?.trim();
  if (sport && sport !== ALL_SPORTS_SLUG) params.set("sport", sport);
  if (input.city) params.set("city", input.city);
  const query = params.toString();
  return query ? `${EVENTS_LIST_HREF}?${query}` : EVENTS_LIST_HREF;
}

/**
 * Hub / Play dashboard / Discover → Events.
 * Sport context always re-scopes; All sports stays naked `/events`.
 */
export function hubEventsHref(active: string | null | undefined): string {
  const sport = parseEventsSportParam(active);
  return eventsListHref({ sport });
}

export function discoverEventsHref(
  activitySlug: string | null | undefined,
): string {
  return hubEventsHref(activitySlug);
}

export function filterFixturesBySport<
  T extends { sportSlug: string | null },
>(fixtures: T[], sport: string | null | undefined): T[] {
  if (!sport) return fixtures;
  return fixtures.filter((fixture) => fixtureMatchesEventsSport(fixture, sport));
}

export function fixtureMatchesEventsSport(
  fixture: { sportSlug: string | null },
  sport: string,
): boolean {
  const current = fixture.sportSlug?.trim();
  if (!current) return false;
  const hub = toHubSportSlug(current) ?? current;
  return hub === sport || current === sport;
}

function addSaCalendarDays(day: string, days: number): string {
  const noon = new Date(`${day}T12:00:00+02:00`);
  noon.setUTCDate(noon.getUTCDate() + days);
  return fixtureCalendarDay(noon.toISOString()) ?? day;
}

/** Sunday (inclusive) of the SA week that contains `day`. */
export function saWeekEndDay(day: string): string {
  const noon = new Date(`${day}T12:00:00+02:00`);
  const weekday = noon.getUTCDay();
  const add = (7 - weekday) % 7;
  return addSaCalendarDays(day, add);
}

export function fixtureDateGroupId(
  startsAt: string | null | undefined,
  now: Date = new Date(),
): EventsDateGroupId {
  const today = fixtureCalendarDay(now.toISOString());
  const day = fixtureCalendarDay(startsAt);
  if (!today || !day) return "later";
  if (day <= today) return "today";
  if (day <= saWeekEndDay(today)) return "this-week";
  return "later";
}

export function groupFixturesByDate<T extends { startsAt: string | null }>(
  fixtures: T[],
  now: Date = new Date(),
): EventsDateGroup<T>[] {
  const buckets: Record<EventsDateGroupId, T[]> = {
    today: [],
    "this-week": [],
    later: [],
  };
  for (const fixture of fixtures) {
    buckets[fixtureDateGroupId(fixture.startsAt, now)].push(fixture);
  }
  return EVENTS_DATE_GROUP_IDS.filter((id) => buckets[id].length > 0).map(
    (id) => ({
      id,
      label: EVENTS_DATE_GROUP_LABELS[id],
      fixtures: buckets[id],
    }),
  );
}

export function venuePlacesLabel(count: number): string | null {
  if (count <= 0) return null;
  return count === 1 ? "1 place" : `${count} places`;
}

export function eventsListCopy(input: {
  sport?: string | null;
  city?: EventsCityCode | null;
  sports?: readonly SportDefinition[];
}): EventsListCopy {
  const sportName = eventsSportName(input.sport ?? null, input.sports);
  const cityName = eventsCityLabel(input.city ?? null);
  if (sportName) {
    const cityBit = cityName
      ? ` Screenings in ${cityName}, plus national ${sportName.toLowerCase()} on the calendar.`
      : "";
    return {
      title: `${sportName} fixtures`,
      description: `Upcoming ${sportName.toLowerCase()} fixtures in South Africa — then find a bar or fan zone screening them.`,
      heading: `${sportName} fixtures`,
      sub: `What's on, then where to watch.${cityBit}`,
    };
  }
  const cityBit = cityName
    ? ` Screenings in ${cityName}, plus national fixtures on the calendar.`
    : "";
  return {
    title: "Big games & where to watch",
    description:
      "Find Springboks Tests, derbies, and other big South African fixtures — then see which bars and fan zones are screening them.",
    heading: "Fixtures",
    sub: `What's on, then where to watch.${cityBit}`,
  };
}

export function eventsSportChips(input: {
  sport?: string | null;
  city?: EventsCityCode | null;
  sports?: readonly SportDefinition[];
}): EventsSportChip[] {
  const city = input.city ?? null;
  const active = input.sport ?? null;
  const chips: EventsSportChip[] = [
    {
      slug: null,
      label: "All",
      href: eventsListHref({ city }),
      active: active === null,
    },
  ];
  for (const sport of eventsSportChipSports(input.sports)) {
    chips.push({
      slug: sport.slug,
      label: sport.name,
      href: eventsListHref({ sport: sport.slug, city }),
      active: active === sport.slug,
    });
  }
  return chips;
}

export function eventDetailListHref(sportSlug: string | null | undefined): string {
  return eventsListHref({ sport: parseEventsSportParam(sportSlug) });
}

export function eventMoreSportLabel(
  sportSlug: string | null | undefined,
  sports: readonly SportDefinition[] = SPORT_CATALOG,
): string {
  const name = eventsSportName(parseEventsSportParam(sportSlug), sports);
  return name ? `More ${name}` : "All events";
}
