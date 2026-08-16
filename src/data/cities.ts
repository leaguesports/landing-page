import { toSlug } from "@/data/suburbs";

export type CityDirectory = {
  name: string;
  slug: string;
  suburbs: { name: string; slug: string }[];
};

export const CITY_DIRECTORY: CityDirectory[] = [
  {
    name: "Cape Town",
    slug: "cape-town",
    suburbs: [
      { name: "Sea Point", slug: "sea-point" },
      { name: "Claremont", slug: "claremont" },
      { name: "Green Point", slug: "green-point" },
      { name: "Newlands", slug: "newlands" },
      { name: "Camps Bay", slug: "camps-bay" },
      { name: "Rondebosch", slug: "rondebosch" },
      { name: "Woodstock", slug: "woodstock" },
    ],
  },
  {
    name: "Johannesburg",
    slug: "johannesburg",
    suburbs: [
      { name: "Sandton", slug: "sandton" },
      { name: "Rosebank", slug: "rosebank" },
      { name: "Illovo", slug: "illovo" },
      { name: "Parkhurst", slug: "parkhurst" },
      { name: "Fourways", slug: "fourways" },
      { name: "Randburg", slug: "randburg" },
      { name: "Greenside", slug: "greenside" },
    ],
  },
  {
    name: "Durban",
    slug: "durban",
    suburbs: [
      { name: "Umhlanga", slug: "umhlanga" },
      { name: "Ballito", slug: "ballito" },
      { name: "Morningside", slug: "morningside" },
      { name: "Berea", slug: "berea" },
    ],
  },
  {
    name: "Pretoria",
    slug: "pretoria",
    suburbs: [
      { name: "Menlyn", slug: "menlyn" },
      { name: "Hazelwood", slug: "hazelwood" },
      { name: "Brooklyn", slug: "brooklyn" },
      { name: "Centurion", slug: "centurion" },
    ],
  },
];

export type SearchSuggestionKind = "city" | "suburb" | "sport";

export type SearchSuggestion = {
  id: string;
  label: string;
  kind: SearchSuggestionKind;
  citySlug?: string;
  suburbSlug?: string;
  sportSlug?: string;
};

/** Sports used for play-mode autocomplete & routing. */
export const SEARCH_SPORTS = [
  { name: "Padel", slug: "padel" },
  { name: "Golf", slug: "golf" },
  { name: "Rugby", slug: "rugby" },
  { name: "Soccer", slug: "soccer" },
  { name: "Cricket", slug: "cricket" },
  { name: "Tennis", slug: "tennis" },
  { name: "Squash", slug: "squash" },
] as const;

function buildSuggestions(): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];

  for (const city of CITY_DIRECTORY) {
    suggestions.push({
      id: `city-${city.slug}`,
      label: city.name,
      kind: "city",
      citySlug: city.slug,
    });

    for (const suburb of city.suburbs) {
      suggestions.push({
        id: `suburb-${city.slug}-${suburb.slug}`,
        label: suburb.name,
        kind: "suburb",
        citySlug: city.slug,
        suburbSlug: suburb.slug,
      });
    }
  }

  for (const sport of SEARCH_SPORTS) {
    suggestions.push({
      id: `sport-${sport.slug}`,
      label: sport.name,
      kind: "sport",
      sportSlug: sport.slug,
    });
  }

  return suggestions;
}

export const SEARCH_SUGGESTIONS = buildSuggestions();

export function filterSuggestions(
  query: string,
  limit = 8,
): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return SEARCH_SUGGESTIONS.slice(0, limit);

  return SEARCH_SUGGESTIONS.filter((s) =>
    s.label.toLowerCase().includes(q),
  ).slice(0, limit);
}

export type IntentMode = "watch" | "play";

/**
 * Build silo path from free-text + optional structured suggestion.
 * Watch: /watch/[city]/[suburb] · Play: /play/[city]/[sport]
 */
export function buildSearchPath(
  intent: IntentMode,
  query: string,
  suggestion?: SearchSuggestion | null,
): string {
  if (suggestion) {
    if (intent === "watch") {
      if (suggestion.kind === "suburb" && suggestion.citySlug && suggestion.suburbSlug) {
        return `/watch/${suggestion.citySlug}/${suggestion.suburbSlug}`;
      }
      if (suggestion.kind === "city" && suggestion.citySlug) {
        return `/watch/${suggestion.citySlug}`;
      }
      if (suggestion.kind === "sport" && suggestion.sportSlug) {
        return `/watch/${suggestion.sportSlug}`;
      }
    } else {
      if (suggestion.kind === "sport" && suggestion.sportSlug) {
        const cityFromQuery = matchCityInQuery(query);
        if (cityFromQuery) {
          return `/play/${cityFromQuery}/${suggestion.sportSlug}`;
        }
        return `/play/${suggestion.sportSlug}`;
      }
      if (suggestion.kind === "city" && suggestion.citySlug) {
        const sportFromQuery = matchSportInQuery(query);
        if (sportFromQuery) {
          return `/play/${suggestion.citySlug}/${sportFromQuery}`;
        }
        return `/play/${suggestion.citySlug}`;
      }
      if (suggestion.kind === "suburb" && suggestion.citySlug) {
        const sportFromQuery = matchSportInQuery(query);
        if (sportFromQuery) {
          return `/play/${suggestion.citySlug}/${sportFromQuery}`;
        }
        return `/play/${suggestion.citySlug}`;
      }
    }
  }

  const city = matchCityInQuery(query);
  const suburb = matchSuburbInQuery(query);
  const sport = matchSportInQuery(query);

  if (intent === "watch") {
    if (city && suburb) return `/watch/${city}/${suburb}`;
    if (city) return `/watch/${city}`;
    if (suburb) {
      const parent = CITY_DIRECTORY.find((c) =>
        c.suburbs.some((s) => s.slug === suburb),
      );
      if (parent) return `/watch/${parent.slug}/${suburb}`;
    }
    const slug = toSlug(query.trim()) || "johannesburg";
    return `/watch/${slug}`;
  }

  if (city && sport) return `/play/${city}/${sport}`;
  if (city) return `/play/${city}`;
  if (sport) return `/play/${sport}`;
  const slug = toSlug(query.trim()) || "johannesburg";
  return `/play/${slug}`;
}

function matchCityInQuery(query: string): string | null {
  const q = query.toLowerCase();
  for (const city of CITY_DIRECTORY) {
    if (q.includes(city.name.toLowerCase()) || q.includes(city.slug)) {
      return city.slug;
    }
  }
  return null;
}

function matchSuburbInQuery(query: string): string | null {
  const q = query.toLowerCase();
  for (const city of CITY_DIRECTORY) {
    for (const suburb of city.suburbs) {
      if (q.includes(suburb.name.toLowerCase()) || q.includes(suburb.slug)) {
        return suburb.slug;
      }
    }
  }
  return null;
}

function matchSportInQuery(query: string): string | null {
  const q = query.toLowerCase();
  for (const sport of SEARCH_SPORTS) {
    if (q.includes(sport.name.toLowerCase()) || q.includes(sport.slug)) {
      return sport.slug;
    }
  }
  return null;
}
