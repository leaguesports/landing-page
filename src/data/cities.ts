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

  const stop = new Set([
    "the",
    "and",
    "in",
    "at",
    "near",
    "watch",
    "play",
    "for",
    "to",
  ]);
  const tokens = q
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !stop.has(token));

  return SEARCH_SUGGESTIONS.filter((s) => {
    const label = s.label.toLowerCase();
    if (label.includes(q)) return true;
    return tokens.some((token) => label.includes(token));
  }).slice(0, limit);
}

export type IntentMode = "watch" | "play";
