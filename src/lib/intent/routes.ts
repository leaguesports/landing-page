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

export type IntentRouteResolution =
  | IntentLandingRoute
  | IntentBrowseRoute
  | IntentDetailRoute;

export function resolveIntentRoute(
  route: string[] | undefined,
): IntentRouteResolution {
  const segments = (route ?? []).filter(Boolean);
  const activitySlug = segments[0]?.trim().toLowerCase();
  const locationSlug = segments[1]?.trim().toLowerCase();

  if (!activitySlug) return { kind: "landing" };
  if (!locationSlug) return { kind: "browse", activitySlug };
  return { kind: "detail", activitySlug, locationSlug };
}
