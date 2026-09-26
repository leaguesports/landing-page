export type IntentLandingRoute = { kind: "landing" };

export type IntentBrowseRoute = {
  kind: "browse";
  activitySlug: string;
};

export type IntentDetailRoute = {
  kind: "detail";
  activitySlug: string;
  locationSlug: string;
};

export type IntentNotFoundRoute = { kind: "not-found" };

export type IntentRouteResolution =
  | IntentLandingRoute
  | IntentBrowseRoute
  | IntentDetailRoute
  | IntentNotFoundRoute;

/**
 * `/watch/{city}` is a city hub. A CMS city, or a parentless location that
 * is not a suburb/province. Suburbs stay on `/watch/{sport}/{suburb}`.
 */
export function isWatchCityHubLocation(
  location:
    | { type?: string | null; parentSlug?: string | null }
    | null
    | undefined,
): boolean {
  if (!location) return false;
  const type = (location.type ?? "").trim().toLowerCase();
  if (type === "city") return true;
  if (type === "suburb" || type === "province" || type === "region") return false;
  return !(location.parentSlug ?? "").trim();
}

export function resolveIntentRoute(
  route: string[] | undefined,
): IntentRouteResolution {
  const segments = (route ?? []).filter(Boolean);
  if (segments.length > 2) return { kind: "not-found" };

  const activitySlug = segments[0]?.trim().toLowerCase();
  const locationSlug = segments[1]?.trim().toLowerCase();

  if (!activitySlug) return { kind: "landing" };
  if (!locationSlug) return { kind: "browse", activitySlug };
  return { kind: "detail", activitySlug, locationSlug };
}
