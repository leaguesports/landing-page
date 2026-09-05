import { CITY_DIRECTORY } from "../../data/cities.ts";

export type EventsCityCode = "cpt" | "jhb" | "dbn";

export type EventsCityFilter = {
  code: EventsCityCode;
  label: string;
  directorySlug: string;
};

/** Shareable `/events?city=` values for the three SA metros. */
export const EVENTS_CITY_FILTERS: EventsCityFilter[] = [
  { code: "cpt", label: "Cape Town", directorySlug: "cape-town" },
  { code: "jhb", label: "Johannesburg", directorySlug: "johannesburg" },
  { code: "dbn", label: "Durban", directorySlug: "durban" },
];

const DIRECTORY_SLUG_TO_CODE: Record<string, EventsCityCode> = {
  "cape-town": "cpt",
  johannesburg: "jhb",
  durban: "dbn",
};

function normalizeCityToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildMetroTokens(): Record<EventsCityCode, Set<string>> {
  const tokens: Record<EventsCityCode, Set<string>> = {
    cpt: new Set(["cpt", "cape-town", "capetown"]),
    jhb: new Set(["jhb", "johannesburg", "joburg", "jozi"]),
    dbn: new Set(["dbn", "durban"]),
  };

  for (const city of CITY_DIRECTORY) {
    const code = DIRECTORY_SLUG_TO_CODE[city.slug];
    if (!code) continue;
    tokens[code].add(city.slug);
    tokens[code].add(normalizeCityToken(city.name));
    for (const suburb of city.suburbs) {
      tokens[code].add(suburb.slug);
      tokens[code].add(normalizeCityToken(suburb.name));
    }
  }

  return tokens;
}

const METRO_TOKENS = buildMetroTokens();

export function eventsCityLabel(code: EventsCityCode | null): string | null {
  if (!code) return null;
  return EVENTS_CITY_FILTERS.find((item) => item.code === code)?.label ?? null;
}

/**
 * Map `?city=cpt` (and cape-town / joburg aliases) to a metro code.
 * Unknown values fall back to All cities.
 */
export function parseEventsCityParam(
  raw: string | string[] | null | undefined,
): EventsCityCode | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const token = normalizeCityToken(value);
  if (!token) return null;

  for (const filter of EVENTS_CITY_FILTERS) {
    if (METRO_TOKENS[filter.code].has(token)) return filter.code;
  }
  return null;
}

export function venueMatchesEventsCity(
  venue: { city?: string | null; citySlug?: string | null },
  city: EventsCityCode,
): boolean {
  const tokens = [venue.city, venue.citySlug]
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => normalizeCityToken(item));
  return tokens.some((token) => METRO_TOKENS[city].has(token));
}

/**
 * City filter keeps fixtures with a venue in that metro, plus CMS-only
 * rows that have no screening venues (national calendar fixtures).
 */
export function filterFixturesByCity<
  T extends {
    venues: Array<{ city?: string | null; citySlug?: string | null }>;
  },
>(fixtures: T[], city: EventsCityCode | null): T[] {
  if (!city) return fixtures;
  return fixtures.filter((fixture) => {
    if (fixture.venues.length === 0) return true;
    return fixture.venues.some((venue) => venueMatchesEventsCity(venue, city));
  });
}
