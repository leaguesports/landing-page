/**
 * Shareable start URLs for venue QR / WhatsApp (#116).
 *
 * `/scorecard` is the stable public alias. It always lands on the live
 * guest start flow (`/padel/new`, `/golf/new`, or `/darts/new`) and never
 * requires an account. Venue is optional.
 */

export type ScorecardStartParams = {
  venue?: string | string[] | null;
  cmsId?: string | string[] | null;
  sport?: string | string[] | null;
  city?: string | string[] | null;
};

export function firstSearchParam(
  value: string | string[] | null | undefined,
): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

/** `?venue=` (slug or Sanity `_id`) with `?cmsId=` as an alias. */
export function venueQueryKey(params: {
  venue?: string | string[] | null;
  cmsId?: string | string[] | null;
}): string {
  return firstSearchParam(params.venue) || firstSearchParam(params.cmsId);
}

function startPathForSport(
  sport: string,
): "/golf/new" | "/darts/new" | "/padel/new" {
  if (sport === "golf") return "/golf/new";
  if (sport === "darts") return "/darts/new";
  return "/padel/new";
}

/**
 * Resolve `/scorecard` (and optional `sport` / `venue` / `cmsId`) to the
 * real start flow. Unknown sports fall back to padel.
 */
export function scorecardStartHref(params: ScorecardStartParams = {}): string {
  const sport = firstSearchParam(params.sport).toLowerCase();
  const venue = venueQueryKey(params);
  const city = firstSearchParam(params.city);
  const path = startPathForSport(sport);
  const qs = new URLSearchParams();
  if (venue) qs.set("venue", venue);
  if (sport) qs.set("sport", sport);
  if (city) qs.set("city", city);
  const serialized = qs.toString();
  return serialized ? `${path}?${serialized}` : path;
}
