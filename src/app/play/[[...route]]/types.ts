export type PlayLocation = {
  id: string;
  slug: string;
  title: string;
};

export type PlayVenue = {
  id: string;
  slug: string;
  name: string;
};

export type PlaySport = {
  id: string;
  slug: string;
  name: string;
};

/** `/play` or `/play/[sport]` — not enough segments for sport + location. */
export type PlayHubRoute = {
  kind: "hub";
  /** Present when URL is `/play/[sport]` only. */
  sportSlug?: string;
};

/** `/play/[sport]/[location]` — load listings for this pair. */
export type PlayDetailRoute = {
  kind: "detail";
  sportSlug: string;
  locationSlug: string;
};

export type PlayRouteResolution = PlayHubRoute | PlayDetailRoute;

export function resolvePlayRoute(
  route: string[] | undefined,
): PlayRouteResolution {
  const segments = route ?? [];
  const sportSlug = segments[0];
  const locationSlug = segments[1];

  if (!sportSlug) {
    return { kind: "hub", sportSlug };
  }

  if (!locationSlug) {
    return { kind: "hub", sportSlug };
  }

  return { kind: "detail", sportSlug, locationSlug };
}
