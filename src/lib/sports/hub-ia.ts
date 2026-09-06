/**
 * Signed-in hub information architecture (#141).
 * Three vertical sections only — no tab bar, no Tools grid on `/`.
 */

export const HUB_START_MATCH_HREF = "/padel/new" as const;
export const HUB_START_GOLF_HREF = "/golf/new" as const;
export const HUB_BROWSE_FIXTURES_HREF = "/events" as const;
export const HUB_FIND_VENUES_HREF = "/venues" as const;
export const HUB_TRAINING_HREF = "/training" as const;
export const HUB_INTEGRATIONS_HREF = "/integrations" as const;

export const HUB_RECENT_LOCK_LIMIT = 5;
export const HUB_BADGE_STRIP_LIMIT = 3;
export const HUB_PEOPLE_PREVIEW_LIMIT = 5;

export const HUB_FOR_YOU_EMPTY_CTAS = [
  { href: HUB_BROWSE_FIXTURES_HREF, label: "Browse fixtures" },
  { href: HUB_FIND_VENUES_HREF, label: "Find venues" },
] as const;

export function takeHubPreview<T>(
  items: readonly T[],
  limit: number,
): T[] {
  return items.slice(0, Math.max(0, limit));
}

export function hubConnectedCount(
  providers: ReadonlyArray<{ status: string }>,
): number {
  return providers.filter((provider) => provider.status === "connected")
    .length;
}
