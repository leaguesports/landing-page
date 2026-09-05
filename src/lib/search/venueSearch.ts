import {
  CITY_DIRECTORY,
  SEARCH_SPORTS,
  type IntentMode,
} from "../../data/cities.ts";
import { toSlug } from "../../data/suburbs.ts";

export type VenueSearchIntent = IntentMode;

export type ParsedVenueSearch = {
  intent: VenueSearchIntent | null;
  sportSlug: string | null;
  sportName: string | null;
  locationSlug: string | null;
  locationLabel: string | null;
  locationKind: "city" | "suburb" | null;
  citySlug: string | null;
};

const SPORT_ALIASES: Record<string, string> = {
  soccer: "soccer",
  football: "soccer",
  "association football": "soccer",
  padel: "padel",
  paddle: "padel",
  golf: "golf",
  rugby: "rugby",
  cricket: "cricket",
  tennis: "tennis",
  squash: "squash",
};

type Place = {
  name: string;
  slug: string;
  kind: "city" | "suburb";
  citySlug: string;
};

function allPlaces(): Place[] {
  const places: Place[] = [];
  for (const city of CITY_DIRECTORY) {
    places.push({
      name: city.name,
      slug: city.slug,
      kind: "city",
      citySlug: city.slug,
    });
    for (const suburb of city.suburbs) {
      places.push({
        name: suburb.name,
        slug: suburb.slug,
        kind: "suburb",
        citySlug: city.slug,
      });
    }
  }
  return places;
}

function matchLongest(
  haystack: string,
  candidates: { needle: string; value: string }[],
): string | null {
  const sorted = [...candidates].sort(
    (a, b) => b.needle.length - a.needle.length,
  );
  for (const candidate of sorted) {
    if (!candidate.needle) continue;
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(candidate.needle)}([^a-z0-9]|$)`,
      "i",
    );
    if (pattern.test(haystack)) return candidate.value;
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function detectIntent(
  query: string,
  fallback: VenueSearchIntent,
): VenueSearchIntent {
  const watchAt = query.search(/\bwatch\b/i);
  const playAt = query.search(/\bplay\b/i);
  if (watchAt >= 0 && (playAt < 0 || watchAt < playAt)) return "watch";
  if (playAt >= 0) return "play";
  return fallback;
}

function detectSport(query: string): { slug: string; name: string } | null {
  const aliasNeedles = Object.keys(SPORT_ALIASES).map((needle) => ({
    needle,
    value: SPORT_ALIASES[needle],
  }));
  const aliasSlug = matchLongest(query, aliasNeedles);

  const catalogNeedles = SEARCH_SPORTS.map((sport) => ({
    needle: sport.name.toLowerCase(),
    value: sport.slug,
  }));
  const catalogSlug = matchLongest(query, catalogNeedles);

  const slug = aliasSlug ?? catalogSlug;
  if (!slug) return null;

  const sport =
    SEARCH_SPORTS.find((item) => item.slug === slug) ??
    SEARCH_SPORTS.find((item) => SPORT_ALIASES[item.name.toLowerCase()] === slug);

  return {
    slug,
    name: sport?.name ?? slug.replace(/-/g, " "),
  };
}

function detectPlace(query: string): Place | null {
  const places = allPlaces();
  const needles = places.flatMap((place) => [
    { needle: place.name.toLowerCase(), value: place.slug },
    { needle: place.slug.replace(/-/g, " "), value: place.slug },
    { needle: place.slug, value: place.slug },
  ]);
  const slug = matchLongest(query, needles);
  if (!slug) {
    const inPlace = query.match(/\b(?:in|at|near)\s+([a-z0-9][a-z0-9\s'-]+)$/i);
    if (inPlace?.[1]) {
      const guessed = toSlug(inPlace[1]);
      if (guessed) {
        return {
          name: inPlace[1].trim(),
          slug: guessed,
          kind: "suburb",
          citySlug: guessed,
        };
      }
    }
    return null;
  }
  return places.find((place) => place.slug === slug) ?? null;
}

export function parseVenueSearch(
  query: string,
  fallbackIntent: VenueSearchIntent = "watch",
): ParsedVenueSearch {
  const normalized = query.trim().replace(/\s+/g, " ");
  const intent = detectIntent(normalized, fallbackIntent);
  const sport = detectSport(normalized);
  const place = detectPlace(normalized);

  return {
    intent,
    sportSlug: sport?.slug ?? null,
    sportName: sport?.name ?? null,
    locationSlug: place?.slug ?? null,
    locationLabel: place?.name ?? null,
    locationKind: place?.kind ?? null,
    citySlug: place?.citySlug ?? null,
  };
}

export function buildVenueDirectoryPath(parsed: ParsedVenueSearch): string {
  const params = new URLSearchParams();
  if (parsed.intent) params.set("intent", parsed.intent);
  if (parsed.sportSlug) params.set("sport", parsed.sportSlug);
  if (parsed.locationSlug) params.set("location", parsed.locationSlug);
  return `/venues?${params.toString()}`;
}

export function venueSearchSummary(parsed: ParsedVenueSearch): string {
  const sport = parsed.sportName ?? parsed.sportSlug;
  const place = parsed.locationLabel ?? parsed.locationSlug;
  const verb =
    parsed.intent === "play"
      ? "Play"
      : parsed.intent === "watch"
        ? "Watch"
        : "Find";
  if (sport && place) return `${verb} ${sport} in ${place}`;
  if (sport) return `${verb} ${sport}`;
  if (place) return `${verb} in ${place}`;
  if (parsed.intent === "play") return "Play venues";
  if (parsed.intent === "watch") return "Watch venues";
  return "All venues";
}

export function parseVenueSearchParams(input: {
  intent?: string | string[] | undefined;
  sport?: string | string[] | undefined;
  location?: string | string[] | undefined;
}): ParsedVenueSearch {
  const intentRaw = firstParam(input.intent);
  const intent: VenueSearchIntent | null =
    intentRaw === "play" || intentRaw === "watch" ? intentRaw : null;
  const sportSlug = firstParam(input.sport);
  const locationSlug = firstParam(input.location);
  const sport = sportSlug
    ? SEARCH_SPORTS.find((item) => item.slug === sportSlug)
    : undefined;
  const place = locationSlug
    ? allPlaces().find((item) => item.slug === locationSlug)
    : undefined;

  return {
    intent,
    sportSlug: sportSlug || null,
    sportName: sport?.name ?? (sportSlug ? sportSlug.replace(/-/g, " ") : null),
    locationSlug: locationSlug || null,
    locationLabel:
      place?.name ?? (locationSlug ? locationSlug.replace(/-/g, " ") : null),
    locationKind: place?.kind ?? null,
    citySlug: place?.citySlug ?? null,
  };
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

export function hasActiveVenueFilters(parsed: ParsedVenueSearch): boolean {
  return Boolean(parsed.intent || parsed.sportSlug || parsed.locationSlug);
}
