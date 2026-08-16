export type WatchLocation = {
  id: string;
  slug: string;
  title: string;
  type?: string | null;
  parentSlug?: string | null;
  parentTitle?: string | null;
};

export type WatchVenue = {
  id: string;
  slug: string;
  name: string;
};

export type WatchVenueResults = {
  venues: WatchVenue[];
  /** True when suburb had no exact matches and city-level venues are shown. */
  usedCityFallback: boolean;
  suburbTitle: string | null;
  cityTitle: string | null;
};

export type WatchSport = {
  id: string;
  slug: string;
  name: string;
};

export type WatchSeries = {
  id: string;
  slug: string;
  name: string;
  /** Parent sport slug when the series references a sport in Sanity. */
  sportSlug?: string | null;
};

/** `/watch` or `/watch/[sport]` — not enough segments for sport + location. */
export type WatchLandingRoute = {
  kind: "landing";
};

/** `/watch/[sport]` — load list of locations for this sport. */
export type WatchLocationRoute = {
  kind: "location";
  sportSlug: string;
};

/** `/watch/[sport]/[location]` — load listings for this pair. */
export type WatchDetailRoute = {
  kind: "detail";
  sportSlug: string;
  locationSlug: string;
};

export type WatchRouteResolution =
  | WatchLandingRoute
  | WatchLocationRoute
  | WatchDetailRoute;

export function resolveWatchRoute(
  route: string[] | undefined,
): WatchRouteResolution {
  const segments = route ?? [];
  const sportSlug = segments[0];
  const locationSlug = segments[1];

  if (!sportSlug) {
    return { kind: "landing" };
  }

  if (!locationSlug) {
    return { kind: "location", sportSlug };
  }

  return { kind: "detail", sportSlug, locationSlug };
}
