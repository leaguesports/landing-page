/**
 * Shared venue-by-name search contract.
 * Used by `/venues` typeahead, `GET /api/venues/search`, onboarding, and
 * Play/Organise pickers so min-chars, GROQ tokens, ranking, and empty copy
 * stay consistent. Directory (sport/city) parsing lives in `venueSearch.ts`.
 */

export const VENUE_NAME_SEARCH_MIN = 2;

/** Max characters for leftover-regex, GROQ `$term`, and `/venues?q=`. */
export const VENUE_NAME_SEARCH_MAX = 80;

/** Debounce before hitting `GET /api/venues/search`. */
export const VENUE_NAME_SEARCH_DEBOUNCE_MS = 250;

/** Visible typeahead cap — never a catalog dump. */
export const VENUE_NAME_SEARCH_LIMIT = 10;

/** Sanity fetch window before ranking + cap. */
export const VENUE_NAME_SEARCH_FETCH_LIMIT = 36;

export const VENUE_NAME_SEARCH_EMPTY =
  "No venues matched that name. Try another spelling.";

export const VENUE_NAME_SEARCH_ERROR =
  "Couldn’t search venues right now. Try again.";

export function venueNameSearchHint(min: number = VENUE_NAME_SEARCH_MIN): string {
  return `Type at least ${min} characters to search by name.`;
}

export const VENUE_NAME_SEARCH_ALL_HREF = "/venues";

/**
 * GROQ haystack so “Name + city” queries match (e.g. The Grid Sandton)
 * instead of requiring every token to live on `name` alone.
 */
export const VENUE_NAME_SEARCH_HAYSTACK = `(
  name
  + " "
  + coalesce(address.city->title, "")
  + " "
  + coalesce(address.suburb->title, "")
  + " "
  + slug.current
)`;

export type VenueNameFields = {
  name: string;
  slug?: string | null;
  city?: string | null;
  suburb?: string | null;
};

export function clampVenueNameQuery(query: string): string {
  const collapsed = query.trim().replace(/\s+/g, " ");
  if (collapsed.length <= VENUE_NAME_SEARCH_MAX) return collapsed;
  return collapsed.slice(0, VENUE_NAME_SEARCH_MAX).trimEnd();
}

export function normalizeVenueNameQuery(query: string): string {
  return clampVenueNameQuery(query).toLowerCase();
}

function matchTokenBody(normalized: string): string {
  return normalized
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sanity `match` token with a trailing wildcard. Null below the minimum. */
export function venueNameMatchTerm(query: string): string | null {
  const normalized = normalizeVenueNameQuery(query);
  if (normalized.length < VENUE_NAME_SEARCH_MIN) return null;
  const token = matchTokenBody(normalized);
  if (token.length < VENUE_NAME_SEARCH_MIN) return null;
  return `${token}*`;
}

export function venueNameSearchShouldFetch(query: string): boolean {
  return venueNameMatchTerm(query) !== null;
}

export function venueNameSearchHref(query: string): string {
  const normalized = clampVenueNameQuery(query);
  if (!normalized) return VENUE_NAME_SEARCH_ALL_HREF;
  return `${VENUE_NAME_SEARCH_ALL_HREF}?q=${encodeURIComponent(normalized)}`;
}

export function venueNameHaystack(venue: VenueNameFields): string {
  return [venue.name, venue.slug, venue.city, venue.suburb]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function venueNameQueryTokens(query: string): string[] {
  const body = matchTokenBody(normalizeVenueNameQuery(query));
  if (!body) return [];
  return body.split(" ").filter((token) => token.length > 0);
}

/**
 * Client-side partial match: every query token must appear in name/slug/city.
 * Empty query matches everything (picker shows the hydrated list).
 */
export function matchesVenueNameQuery(
  venue: VenueNameFields,
  query: string,
): boolean {
  const tokens = venueNameQueryTokens(query);
  if (tokens.length === 0) {
    return normalizeVenueNameQuery(query).length === 0;
  }
  const haystack = venueNameHaystack(venue);
  return tokens.every((token) => haystack.includes(token));
}

export function venueNameMatchScore(
  venue: VenueNameFields,
  query: string,
): number {
  const normalized = normalizeVenueNameQuery(query);
  const name = venue.name.trim().toLowerCase();
  if (!normalized) return 4;
  if (name === normalized) return 0;
  if (name.startsWith(normalized)) return 1;
  if (name.includes(normalized)) return 2;
  if (matchesVenueNameQuery(venue, query)) return 3;
  return 4;
}

export function rankVenueNameHits<T extends VenueNameFields>(
  venues: T[],
  query: string,
): T[] {
  return [...venues].sort((a, b) => {
    const scoreDelta =
      venueNameMatchScore(a, query) - venueNameMatchScore(b, query);
    if (scoreDelta !== 0) return scoreDelta;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function capVenueNameSearchResults<T>(
  rows: T[],
  limit: number = VENUE_NAME_SEARCH_LIMIT,
): T[] {
  return rows.slice(0, limit);
}
