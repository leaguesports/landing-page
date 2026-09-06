/**
 * Shareable start URLs for venue QR / WhatsApp (#116).
 *
 * `/scorecard` is the stable public alias. It always lands on the live
 * guest start flow (`/padel/new` or `/golf/new`) and never requires an
 * account. Venue is optional.
 */

export type ScorecardStartParams = {
  venue?: string | string[] | null;
  cmsId?: string | string[] | null;
  sport?: string | string[] | null;
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

function startPathForSport(sport: string): "/golf/new" | "/padel/new" {
  return sport === "golf" ? "/golf/new" : "/padel/new";
}

/**
 * Resolve `/scorecard` (and optional `sport` / `venue` / `cmsId`) to the
 * real start flow. Unknown sports fall back to padel.
 */
export function scorecardStartHref(params: ScorecardStartParams = {}): string {
  const sport = firstSearchParam(params.sport).toLowerCase();
  const venue = venueQueryKey(params);
  const path = startPathForSport(sport);
  if (!venue) return path;
  return `${path}?venue=${encodeURIComponent(venue)}`;
}
