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
