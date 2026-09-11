import { CITY_DIRECTORY } from "../../data/cities.ts";

export type EventsCityCode = "jhb" | "cpt" | "dbn" | "pta";

export type EventsCityFilter = {
  code: EventsCityCode;
  label: string;
  directorySlug: string;
};

/** Shareable `/events?city=` values — Joburg → CT → Durban / Pretoria. */
export const EVENTS_CITY_FILTERS: EventsCityFilter[] = [
  { code: "jhb", label: "Johannesburg", directorySlug: "johannesburg" },
  { code: "cpt", label: "Cape Town", directorySlug: "cape-town" },
  { code: "dbn", label: "Durban", directorySlug: "durban" },
  { code: "pta", label: "Pretoria", directorySlug: "pretoria" },
];

const DIRECTORY_SLUG_TO_CODE: Record<string, EventsCityCode> = {
  johannesburg: "jhb",
  "cape-town": "cpt",
  durban: "dbn",
  pretoria: "pta",
};

/** Metro names only — used to read a city from editorial copy without suburb false positives. */
const METRO_COPY_TOKENS: Record<EventsCityCode, string[]> = {
  jhb: ["johannesburg", "joburg", "jozi", "jhb"],
  cpt: ["cape town", "cape-town", "capetown", "cpt"],
  dbn: ["durban", "dbn"],
  pta: ["pretoria", "tshwane", "pta"],
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
    jhb: new Set(["jhb", "johannesburg", "joburg", "jozi"]),
    cpt: new Set(["cpt", "cape-town", "capetown"]),
    dbn: new Set(["dbn", "durban"]),
    pta: new Set(["pta", "pretoria", "tshwane"]),
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
 * First metro named in editorial copy (title, intro, FAQs).
 * Word-boundary match on city aliases only — not suburbs.
 */
export function detectEventsCityFromText(
  text: string | null | undefined,
): EventsCityCode | null {
  if (!text?.trim()) return null;
  const haystack = ` ${normalizeCityToken(text).replace(/-/g, " ")} `;

  let best: { code: EventsCityCode; index: number; length: number } | null =
    null;
  for (const filter of EVENTS_CITY_FILTERS) {
    for (const token of METRO_COPY_TOKENS[filter.code]) {
      const needle = token.replace(/-/g, " ").trim();
      if (!needle) continue;
      const index = haystack.indexOf(` ${needle} `);
      if (index === -1) continue;
      if (
        !best ||
        index < best.index ||
        (index === best.index && needle.length > best.length)
      ) {
        best = { code: filter.code, index, length: needle.length };
      }
    }
  }
  return best?.code ?? null;
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
